# 工作负载调度


## 实验准备

- **前置条件**：已完成 实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，按 `nano xxx.yaml` 创建即可，无需克隆外部仓库
- **工作目录**：本章实验在 `/root/k8slab/deployment` 下进行（如不存在先 `mkdir -p`）

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 使用 deployment 维护服务数量 | 副本/自愈/扩缩容 | 必做 |
| Lab 2 使用 deployment 实现滚动更新 | 滚动更新与回滚 | 必做 |
| Lab 3 StatefulSet | 稳定有序标识与 headless DNS | 必做 |
| Lab 4 StatefulSet 独立 PVC | volumeClaimTemplates：每副本独立存储 | 推荐 |
| Lab 5 使用 job 实现一次性作业 | 任务完成语义 | 必做 |
| Lab 6 使用 cronjob 实现定时作业 | 定时触发 | 必做 |
| Lab 7 使用 DaemonSet 运行守护进程应用 | 每节点一个 | 必做 |
| Lab 8 rollout 暂停与恢复 | pause/resume 合并修改 | 推荐 |

> ℹ️ 各 Lab 中的终端输出为参考示例（基于本手册约定的 192.168.0.x 环境），实际 Pod IP、节点分布、AGE 等会因环境不同而不同，关注输出**结构**而非具体数值。

## Lab 1 使用 deployment 维护服务数量

> **目标**：用 yaml 创建一个 Deployment（nginx），并练习副本数量维护。
> **验证概念**：Deployment 通过 **label selector** 管理一组 Pod 副本；修改 `replicas` 或 `kubectl scale` 可增减副本，Deployment 保证实际副本数与期望一致（自愈能力）。


使用以下命令生成deployment的原始配置

```bash
kubectl create deployment webserver --image=nginx --dry-run=client -o yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null # 删掉
  labels:
    app: webserver
  name: webserver
spec:
  replicas: 1 # 定义副本数量
  selector: # 通过lable定义所管理的pod
    matchLabels:
      app: webserver
  strategy: {} # 定义滚动升级的策略
  template: # 此处以下替换成pod yaml文件，注意缩进
    metadata:
      creationTimestamp: null
      labels:
        app: webserver # 使用相同的lable和deployment保持对仗工整
    spec:
      containers:
      - image: nginx
        name: nginx
        resources: {}
status: {} #删掉
```

将之前的pod的最简版本的 yaml 文件整合（copy）进来，注意缩进以及 Pod 的 `label` 和depolyment的 `lable` 保持一致（）

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: webserver
  name: webserver
spec:
  replicas: 1 # 定义副本数量
  selector: # 通过lable定义所管理的pod
    matchLabels:
      app: webserver
  strategy: {} # 定义滚动升级的策略
  template: # 此处以下替换成pod yaml文件，注意缩进
    metadata:
      creationTimestamp: null
      labels:
        app: webserver # 使用相同的lable和deployment保持对仗工整
    spec:
      containers:
      - image: nginx:1.25
        name: nginx
        resources: {}
```

> **配置要点**（Deployment 结构，后续 Lab 都基于它）：
> - `spec.replicas`：期望副本数（本实验 1 个）
> - `spec.selector.matchLabels`：Deployment 用它**选中自己要管理的 Pod**——`app: webserver`
> - `spec.template`：Pod 模板（定义"Pod 长什么样"），**template 里的 labels 必须与 selector 匹配**（都是 `app: webserver`），否则 Deployment 管不到它
> - `spec.strategy`：更新策略，空 `{}` 表示用默认的 RollingUpdate（Lab 2 会详细配置）
> - `creationTimestamp` / `status`：生成时自动带的字段，实际使用要**删掉**（由系统维护）

使用示例文件创建yaml文件

```bash
nano deployment.yaml
```

创建deployment

```bash
kubectl apply -f deployment.yaml
```

查看deployment列表

```bash
kubectl get deployment -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get deployment -o wide
NAME        READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES        SELECTOR
webserver   1/1     1            1           33s   nginx        nginx:1.25   app=webserver
```

> **观察点**：Deployment 表格的含义——`READY`（当前可用/期望副本）、`UP-TO-DATE`（已更新的副本）、`AVAILABLE`（可对外服务）；`SELECTOR` 列显示 `app=webserver`（Deployment 用它管理 Pod）。

查看 deployment 细节

```bash
kubectl describe deployment webserver
```


```bash
root@node1:~/k8slab/deployment# kubectl describe deployment webserver
Name:                   webserver
Selector:               app=webserver
Replicas:               1 desired | 1 updated | 1 total | 1 available | 0 unavailable
StrategyType:           RollingUpdate
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Containers:
   nginx:
    Image:        nginx:1.25
Conditions:
  Type           Status  Reason
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
NewReplicaSet:   webserver-6b7c64974d (1/1 replicas created)
Events:
  Normal  ScalingReplicaSet  58s  deployment-controller  Scaled up replica set webserver-6b7c64974d to 1
```

> **观察点**：describe deployment 的核心字段（输出已省略 Labels/Annotations/Mounts 等次要项）：
> - `Replicas` 行：`1 desired | 1 updated | 1 total | 1 available`——期望/已更新/总数/可用副本数，**四值相等表示健康**
> - `StrategyType: RollingUpdate` + `RollingUpdateStrategy`：更新策略与节奏（25% max unavailable/surge）
> - `Conditions`：`Available=True`（可用）、`Progressing=True`（进行中）
> - `NewReplicaSet`：当前由哪个 ReplicaSet 承载 Pod（滚动更新的版本标识）
> - `Events`：伸缩历史（Scaled up/down）

查看 deployment 的 yaml 定义（了解系统填充的默认字段）

```bash
kubectl get deployment -o yaml
```

```bash
root@node1:~/k8slab/deployment# kubectl get deployment -o yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: webserver
  name: webserver
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webserver
  strategy:
    type: RollingUpdate            # 默认策略
    rollingUpdate:
      maxSurge: 25%               # 默认值：可超量新建
      maxUnavailable: 25%        # 默认值：最多不可用
  template:
    metadata:
      labels:
        app: webserver
    spec:
      containers:
      - image: nginx:1.25
        imagePullPolicy: IfNotPresent
        name: nginx
        ...（其余默认字段省略：progressDeadlineSeconds/revisionHistoryLimit 等）
```

> **观察点**：对比你写的 webserver.yaml——系统为 `strategy` 填了默认的 RollingUpdate 配置（`maxSurge: 25%`、`maxUnavailable: 25%`），这是滚动更新的默认节奏；`imagePullPolicy` 因镜像带版本号（nginx:1.25）默认为 `IfNotPresent`（实验 02 Lab 4 讲过）。
查看pod

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get pod -o wide
NAME                         READY   STATUS    RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
nginx                        1/1     Running   0          4h57m   10.244.135.3    node3   <none>           <none>
webserver-6b7c64974d-4qrtz   1/1     Running   0          2m29s   10.244.104.20   node2   <none>           <none>
```

> **观察点**：`webserver-6b7c64974d-4qrtz` 是 Deployment 创建的 Pod——名称由「deployment 名 + ReplicaSet 哈希 + 随机后缀」组成。下一节将**手动删除这个 Pod**，验证 Deployment 会自动重建（自愈）。

删除某个pod

```bash
kubectl delete pod webserver-6b7c64974d-4qrtz
```

观测pod重建过程

```text
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl delete pod webserver-6b7c64974d-4qrtz
pod "webserver-6b7c64974d-4qrtz" deleted
root@node1:~/k8slab/deployment# kubectl get pod -o wide
NAME                         READY   STATUS    RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
nginx                        1/1     Running   0          4h58m   10.244.135.3    node3   <none>           <none>
webserver-6b7c64974d-77g4f   1/1     Running   0          10s     10.244.104.21   node2   <none>           <none>
```

> **观察点**：手动删掉 Pod 后，立即出现了一个**新 Pod**（`webserver-6b7c64974d-77g4f`，注意后缀变了）——**Deployment 检测到副本数低于期望值，自动重建了 Pod**。这就是"自愈能力"：Pod 挂了不慌，Deployment 会拉回期望状态。

编辑deployment，将副本数调整成5个

```bash
KUBE_EDITOR="nano" kubectl edit deployment webserver
```

```yaml
spec:
  progressDeadlineSeconds: 600
  replicas: 5 # 调整此处的副本数量
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      app: webserver
  strategy:
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
    type: RollingUpdate
```

观测pod横向扩展过程

```text
kubectl get pod
```

```bash
root@node1:~/k8slab/deployment# kubectl get pod -o wide
NAME                         READY   STATUS              RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
nginx                        1/1     Running             0          5h1m    10.244.135.3    node3   <none>           <none>
webserver-6b7c64974d-2t575   1/1     Running             0          9s      10.244.104.23   node2   <none>           <none>
webserver-6b7c64974d-77g4f   1/1     Running             0          2m27s   10.244.104.21   node2   <none>           <none>
webserver-6b7c64974d-cn9cc   0/1     ContainerCreating   0          9s      <none>          node3   <none>           <none>
webserver-6b7c64974d-cxd82   0/1     ContainerCreating   0          9s      <none>          node3   <none>           <none>
webserver-6b7c64974d-wwn2j   1/1     Running             0          9s      10.244.104.22   node2   <none>           <none>
root@node1:~/k8slab/deployment# kubectl get pod
NAME                         READY   STATUS    RESTARTS   AGE
nginx                        1/1     Running   0          5h1m
webserver-6b7c64974d-2t575   1/1     Running   0          41s
webserver-6b7c64974d-77g4f   1/1     Running   0          2m59s
webserver-6b7c64974d-cn9cc   1/1     Running   0          41s
webserver-6b7c64974d-cxd82   1/1     Running   0          41s
webserver-6b7c64974d-wwn2j   1/1     Running   0          41s
```

> **观察点**：`webserver-*` 的 Pod 变成 **5 个**（edit 将 replicas 改为 5 后，Deployment 自动补齐到 5）——再次验证 Deployment 以 `replicas` 为期望值持续管理副本数。所有 Pod 前缀相同（`webserver-6b7c64974d`），属于同一个 ReplicaSet。

使用命令进行收缩

```bash
kubectl scale deployment webserver --replicas=3
```

观测pod横向扩展过程（`-w` 持续监听，观察 scale 后新 Pod 的创建）

```bash
kubectl get pod -o wide -w
```

```bash
root@node1:~/k8slab/deployment# kubectl scale deployment webserver --replicas=3
deployment.apps/webserver scaled
root@node1:~/k8slab/deployment# kubectl get pod
NAME                         READY   STATUS    RESTARTS   AGE
nginx                        1/1     Running   0          5h2m
webserver-6b7c64974d-77g4f   1/1     Running   0          4m6s
webserver-6b7c64974d-cn9cc   1/1     Running   0          108s
webserver-6b7c64974d-cxd82   1/1     Running   0          108s
```

> **观察点**：`kubectl scale` 后 Pod 从 1 个变成 3 个——**Deployment 会自动创建/销毁 Pod 使实际副本数与期望一致**。注意 Pod 名前缀相同（`webserver-6b7c64974d-*`），这是 Deployment 管理的 ReplicaSet 生成的。

查看 deployment 伸缩历史

```bash
kubectl describe deployment webserver
```

```bash
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  8m34s  deployment-controller  Scaled up replica set webserver-6b7c64974d to 1
  Normal  ScalingReplicaSet  2m49s  deployment-controller  Scaled up replica set webserver-6b7c64974d to 5
  Normal  ScalingReplicaSet  64s    deployment-controller  Scaled down replica set webserver-6b7c64974d to 3
```

删除deployment

```bash
kubectl delete -f deployment.yaml
```

## Lab 2 使用 deployment 实现滚动更新

> **目标**：为 Deployment 配置滚动更新策略，并升级/回滚镜像版本。
> **验证概念**：`strategy.type: RollingUpdate`（滚动更新）与 `maxUnavailable`/`maxSurge` 控制更新节奏；`kubectl set image` 触发更新、`rollout` 系列命令管理发布历史与回滚。


使用示例文件创建yaml文件

```bash
nano webserver-strategy.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: webserver-strategy
  name: webserver-strategy
spec:
  replicas: 6
  selector:
    matchLabels:
      app: webserver-strategy
  strategy:
    type: RollingUpdate
    rollingUpdate:  # 滚动更新策略
      maxUnavailable: 2 # 先下线两个旧版本
      maxSurge: 0
  template:
    metadata:
      name: webserver
      namespace: default
      labels:
        app: webserver-strategy
    spec:
      containers:
      - image: nginx:1.25
        name: nginx
        resources: {}
```

> **配置要点**（滚动更新策略）：
> - `replicas: 6`：6 个副本（扩大副本数，让滚动更新过程更明显）
> - `strategy.type: RollingUpdate`：滚动更新（默认策略，逐个替换 Pod）
> - `rollingUpdate.maxUnavailable: 2`：更新时最多允许 2 个副本同时不可用
> - `rollingUpdate.maxSurge: 0`：更新时最多允许超出期望的副本数（0 = 不额外新建，先删旧的再建新的）
> - 这两个参数共同决定更新节奏：`maxSurge` 控制"多建几个新的"，`maxUnavailable` 控制"最多少几个旧的"（Lab 2 观察点会看到实际效果）

创建 deployment

```bash
kubectl apply -f webserver-strategy.yaml
```

查看 deployment 列表,关注 pod 节点数映像版本信息

```bash
kubectl get deployment -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get deployment -o wide
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES        SELECTOR
webserver-strategy   6/6     6            6           28s   nginx        nginx:1.25   app=webserver-strategy
```

> **观察点**：`READY 6/6`——期望 6 个副本全部就绪。这个 deployment 有 6 个副本，是下面滚动更新实验的起点（更新时要逐个替换 6 个 Pod）。

查看 deployment 细节，确定目前的 deployment 的滚动更新策略：`RollingUpdateStrategy`

```bash
kubectl describe deployment webserver-strategy
```

```bash
RollingUpdateStrategy:  2 max unavailable, 0 max surge
Pod Template:
  Labels:  app=webserver-strategy
  Containers:
   nginx:
    Image:        nginx:1.25
    Port:         <none>
    Host Port:    <none>
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
```

修改deployment配置，将映像版本提升到1.8

```bash
kubectl set image deployment webserver-strategy nginx=nginx:1.26
```

观察pod滚动升级过程

> `-w`（watch）参数让 kubectl **持续监听** Pod 变化并实时刷新输出（需 Ctrl+C 退出）。这是观察滚动更新过程的推荐方式。

```text
kubectl get pod -o wide -w
```

```bash
root@node1:~/k8slab/deployment# kubectl get pod -o wide -w
NAME                                  READY   STATUS              RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
nginx                                 1/1     Running             0          5h19m   10.244.135.3    node3   <none>           <none>
webserver-strategy-568bc9cf6b-rt4qg   1/1     Terminating         0          80s     10.244.135.22   node3   <none>           <none>
webserver-strategy-568bc9cf6b-zplmv   1/1     Terminating         0          76s     10.244.104.41   node2   <none>           <none>
webserver-strategy-5c5fcb9b54-2jl95   1/1     Running             0          4s      10.244.135.26   node3   <none>           <none>
webserver-strategy-5c5fcb9b54-46xxv   0/1     ContainerCreating   0          2s      <none>          node2   <none>           <none>
webserver-strategy-5c5fcb9b54-4djbg   0/1     ContainerCreating   0          1s      <none>          node3   <none>           <none>
webserver-strategy-5c5fcb9b54-4hdz8   1/1     Running             0          8s      10.244.135.25   node3   <none>           <none>
webserver-strategy-5c5fcb9b54-b4ptl   1/1     Running             0          5s      10.244.104.43   node2   <none>           <none>
webserver-strategy-5c5fcb9b54-ftqnf   1/1     Running             0          8s      10.244.104.42   node2   <none>           <none>
webserver-strategy-5c5fcb9b54-4djbg   0/1     ContainerCreating   0          2s      <none>          node3   <none>           <none>
webserver-strategy-568bc9cf6b-rt4qg   0/1     Terminating         0          81s     10.244.135.22   node3   <none>           <none>
webserver-strategy-568bc9cf6b-rt4qg   0/1     Terminating         0          81s     10.244.135.22   node3   <none>           <none>
webserver-strategy-568bc9cf6b-rt4qg   0/1     Terminating         0          81s     10.244.135.22   node3   <none>           <none>
webserver-strategy-568bc9cf6b-zplmv   0/1     Terminating         0          77s     <none>          node2   <none>           <none>
webserver-strategy-568bc9cf6b-zplmv   0/1     Terminating         0          77s     <none>          node2   <none>           <none>
webserver-strategy-568bc9cf6b-zplmv   0/1     Terminating         0          77s     <none>          node2   <none>           <none>
webserver-strategy-5c5fcb9b54-46xxv   1/1     Running             0          3s      10.244.104.44   node2   <none>           <none>
webserver-strategy-5c5fcb9b54-4djbg   1/1     Running             0          3s      10.244.135.27   node3   <none>           <none>
```

> **观察点**：看 `-w` 实时输出中的**状态迁移**——旧版本 Pod（前缀 `568bc9cf6b`）从 Running → **Terminating**（正在删除），新版本 Pod（前缀 `5c5fcb9b54`）从 **ContainerCreating → Running**（正在创建）。滚动更新就是"新的一批起来、旧的一批销毁"的交替过程。

查看deployment列表,重点关注映像版本信息

```bash
kubectl get deployment -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get deployment -o wide
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE    CONTAINERS   IMAGES      SELECTOR
webserver-strategy   6/6     6            6           5m7s   nginx        nginx:1.26   app=webserver-strategy
```

> **观察点**：`IMAGES` 列已从 `nginx:1.25` 变为 **`nginx:1.26`**——第一次 `set image` 升级完成，全部 6 个副本已是新版本。

修改deployment滚动升级配置，配置为以下设置

```yaml
nano webserver-strategy.yaml
      maxSurge: 2 #先上线两个
      maxUnavailable: 0
```

> **配置要点**：与初始配置（`maxUnavailable: 2 / maxSurge: 0`）正好相反——这次是 `maxSurge: 2 / maxUnavailable: 0`：**先新建 2 个新版本，全部就绪后才开始删旧版本**（0 个不可用）。两种策略对比：前者"先删后建"（省资源）、后者"先建后删"（无中断，但短暂占用更多资源）。

更新deployment

```bash
kubectl apply -f webserver-strategy.yaml
```

查看deployment细节，确定目前的deployment的滚动更新策略

```bash
kubectl describe deployment webserver-strategy
```

```bash
RollingUpdateStrategy:  0 max unavailable, 2 max surge
Pod Template:
  Labels:  app=webserver-strategy
  Containers:
   nginx:
    Image:        nginx:1.25
    Port:         <none>
    Host Port:    <none>
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
```

修改deployment配置，将映像版本提升到1.27

```text
kubectl set image deployment webserver-strategy nginx=nginx:1.27
```

观测pod滚动升级过程

```text
kubectl get pod -o wide -w
```

```bash
root@node1:~/k8slab/deployment# kubectl get pod -o wide -w
NAME                                  READY   STATUS              RESTARTS   AGE   IP              NODE
webserver-strategy-568bc9cf6b-87k54   1/1     Running             0          12s   10.244.135.35   node3
webserver-strategy-568bc9cf6b-f9rmk   1/1     Running             0          12s   10.244.104.52   node2
webserver-strategy-7c646cdb9b-67pwv   1/1     Running             0          5s    10.244.135.37   node3
webserver-strategy-7c646cdb9b-ccnpw   1/1     Running             0          3s    10.244.104.55   node2
webserver-strategy-7c646cdb9b-fkdpr   0/1     ContainerCreating   0          2s    <none>          node3
webserver-strategy-568bc9cf6b-lsx6w   1/1     Terminating         0          14s   10.244.104.51   node2
...（滚动过程中新旧版本 Pod 交替 Running/ContainerCreating/Terminating，持续到旧版本全部删除）
webserver-strategy-7c646cdb9b-*       6/6     Running             0          -      -               -
webserver-strategy-568bc9cf6b-*       0/6     Terminating         0          -      -               -
```

> **观察点**：滚动更新过程中，**新旧两套 Pod 并存**——前缀 `568bc9cf6b`（旧版本）逐渐 Terminating，`7c646cdb9b`（新版本）逐渐 Running。`maxSurge: 0` 的配置下先删旧的再建新的（或按 maxUnavailable 节奏交替）。

查看版本历史信息

```bash
kubectl rollout history deployment/webserver-strategy
```

```bash
root@node1:~/k8slab/deployment# kubectl rollout history deployment/webserver-strategy
deployment.apps/webserver-strategy
REVISION  CHANGE-CAUSE
2         <none>
3         <none>
4         <none>
```

> **观察点**：`rollout history` 列出所有发布版本（REVISION 2/3/4）。每次 `set image` 都会产生新 REVISION；用 `--revision=N` 查看某版本的具体配置（如下 revision=3 是 nginx:1.25、revision=2 是 nginx:1.26）。

查看历史版本

```bash
kubectl rollout history deployment/webserver-strategy  --revision=3
```

```bash
kubectl rollout history deployment/webserver-strategy  --revision=2
```

```bash
root@node1:~/k8slab/deployment# kubectl rollout history deployment/webserver-strategy --revision=3
deployment.apps/webserver-strategy with revision #3
Pod Template:
  Containers:
   nginx:
    Image:      nginx:1.25

root@node1:~/k8slab/deployment# kubectl rollout history deployment/webserver-strategy --revision=2
deployment.apps/webserver-strategy with revision #2
Pod Template:
  Containers:
   nginx:
    Image:      nginx:1.26
```

> **观察点**：`--revision=N` 查看某个历史版本的具体配置——revision 3 是 `nginx:1.25`、revision 2 是 `nginx:1.26`。结合刚才的升级过程：每次 set image 产生一个新 revision，回滚就是切回某个旧 revision 的配置。

回滚到ver 2版本

```bash
kubectl rollout undo deployment/webserver-strategy --to-revision=2
```

```bash
kubectl rollout undo deployment/webserver-strategy --to-revision=2
```

验证回滚结果

```text
kubectl get deployment -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get deployment -o wide
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES      SELECTOR
webserver-strategy   6/6     6            6           10m   nginx        nginx:1.26   app=webserver-strategy
```

> **观察点**：回滚后 IMAGES 列从 nginx:1.27 变回 **nginx:1.26**——`rollout undo` 成功回滚到指定版本。滚动更新的完整链路：`set image`（升级）→ `rollout history`（查版本）→ `rollout undo`（回滚）。

删除deployment

```bash
kubectl delete -f webserver-strategy.yaml
```


## Lab 3 StatefulSet

> **目标**：创建 StatefulSet 并观察有状态应用的特性。
> **验证概念**：StatefulSet 为每个 Pod 分配**稳定且有序**的标识（webserver-0/1/2）、稳定网络标识与持久化卷；适合数据库等有状态应用。


使用示例文件创建 yaml 文件

```bash
nano webserver.yaml
```

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  labels:
    app: webserver
  name: webserver
spec:
  serviceName: webserver
  replicas: 3
  selector:
    matchLabels:
      app: webserver
  template:
    metadata:
      name: webserver
      namespace: default
      labels:
        app: webserver
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        resources: {}
```

> **配置要点**（StatefulSet 与 Deployment 的关键差异）：
> - `serviceName: webserver`：**必填**——StatefulSet 依赖一个 headless Service 提供稳定网络标识（实验 04 讲 Service；无它则 Pod 无法获得稳定的 DNS 名）
> - `replicas: 3` + `selector` + `template`：与 Deployment 相同的三件套
> - **没有 `strategy`**：StatefulSet 用固定的 RollingUpdate 且**逆序逐个更新**（本 Lab 观察点会看到）
> - 其余结构与 Deployment 相同，但运行时行为不同：Pod 名称稳定有序（webserver-0/1/2）、标识可预测

创建StatefulSet

```bash
kubectl apply -f webserver.yaml
```

查看pod创建过程（`-w` 持续监听，观察 StatefulSet 依次创建 Pod）

```bash
kubectl get pod -o wide -w
```

```bash
root@node1:~/k8slab/deployment# kubectl get pod -o wide -w
NAME          READY   STATUS    RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
nginx         1/1     Running   0          5h39m   10.244.135.3    node3   <none>           <none>
webserver-0   1/1     Running   0          12s     10.244.104.3    node2   <none>           <none>
webserver-1   1/1     Running   0          10s     10.244.135.49   node3   <none>           <none>
webserver-2   1/1     Running   0          8s      10.244.104.4    node2   <none>           <none>
```

> **观察点**：StatefulSet 的 Pod 名称是**稳定且有序**的 `webserver-0`、`webserver-1`、`webserver-2`（从 0 开始编号、依次创建），与 Deployment 的随机后缀（`webserver-6b7c64974d-*`）不同。这是有状态应用的标识基础。

关注 pod 的名称和 ip 地址

查看 StatefulSet

```bash
kubectl get sts -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get sts -o wide
NAME        READY   AGE   CONTAINERS   IMAGES
webserver   3/3     78s   nginx        nginx:1.25
```

> **观察点**：`READY 3/3`——StatefulSet 的 3 个 Pod（webserver-0/1/2）全部就绪。STS 缩写即 StatefulSet。

查看 StatefulSet细节

```bash
kubectl describe sts webserver
```

```bash
root@node1:~/k8slab/deployment# kubectl describe sts webserver
Name:               webserver
Selector:           app=webserver
Replicas:           3 desired | 3 total
Update Strategy:    RollingUpdate
Pods Status:        3 Running / 0 Waiting / 0 Succeeded / 0 Failed
Pod Template:
  Containers:
   nginx:
    Image:        nginx:1.25
Events:
  Type    Reason            Age    From                    Message
  ----    ------            ----   ----                    -------
  Normal  SuccessfulCreate  2m53s  statefulset-controller  create Pod webserver-0 in StatefulSet webserver successful
  Normal  SuccessfulCreate  2m51s  statefulset-controller  create Pod webserver-1 in StatefulSet webserver successful
  Normal  SuccessfulCreate  2m49s  statefulset-controller  create Pod webserver-2 in StatefulSet webserver successful
```

> **观察点**（输出已省略 Labels/Mounts 等次要字段）：`Pods Status: 3 Running`（全部就绪）；Events 显示 Pod **按顺序创建**（webserver-0 → 1 → 2），这是 StatefulSet 有序部署的体现。
关注 `Update Strategy`

修改StatefulSet配置，将映像版本提升到1.27

```bash
kubectl set image sts webserver nginx=nginx:1.27
```

观测pod滚动升级过程（`-w` 持续监听，观察 StatefulSet 的更新顺序）

```bash
kubectl get pod -o wide -w
```

```bash
root@node1:~/k8slab/deployment# kubectl set image sts webserver nginx=nginx:1.27
statefulset.apps/webserver image updated
root@node1:~/k8slab/deployment# kubectl get pod -o wide -w
NAME          READY   STATUS              RESTARTS   AGE     IP             NODE    NOMINATED NODE   READINESS GATES
nginx         1/1     Running             0          5h43m   10.244.135.3   node3   <none>           <none>
webserver-0   1/1     Running             0          3m45s   10.244.104.3   node2   <none>           <none>
webserver-1   0/1     ContainerCreating   0          0s      <none>         node3   <none>           <none>
webserver-2   1/1     Running             0          3s      10.244.104.5   node2   <none>           <none>
webserver-1   0/1     ContainerCreating   0          1s      <none>         node3   <none>           <none>
webserver-1   1/1     Running             0          2s      10.244.135.50   node3   <none>           <none>
webserver-0   1/1     Terminating         0          3m47s   10.244.104.3    node2   <none>           <none>
webserver-0   1/1     Terminating         0          3m47s   10.244.104.3    node2   <none>           <none>
webserver-0   0/1     Terminating         0          3m48s   10.244.104.3    node2   <none>           <none>
webserver-0   0/1     Terminating         0          3m48s   10.244.104.3    node2   <none>           <none>
webserver-0   0/1     Terminating         0          3m48s   10.244.104.3    node2   <none>           <none>
webserver-0   0/1     Pending             0          0s      <none>          <none>   <none>           <none>
webserver-0   0/1     Pending             0          0s      <none>          node2    <none>           <none>
webserver-0   0/1     ContainerCreating   0          0s      <none>          node2    <none>           <none>
webserver-0   0/1     ContainerCreating   0          1s      <none>          node2    <none>           <none>
webserver-0   1/1     Running             0          2s      10.244.104.6    node2    <none>           <none>
```

> **观察点**：StatefulSet 的滚动更新与 Deployment 不同——**逆序逐个更新**（先 webserver-2 → 1 → 0，倒序），且**同一时刻只更新一个**（webserver-1 更新完才轮到 webserver-0），这是有状态应用"逐个替换"的保守策略。

删除StatefulSet

```bash
kubectl delete -f webserver.yaml
```

## Lab 4 StatefulSet 独立 PVC（volumeClaimTemplates）（推荐）

> **目标**：给 StatefulSet 配置 volumeClaimTemplates，验证"每个副本独立 PVC、删 Pod 数据保留"——StatefulSet 的核心价值（教材第 5 章 §5.3.3、第 18 章 MySQL 用 STS 的原因）。
> **验证概念**：**volumeClaimTemplates（卷声明模板）**让 StatefulSet 为每个副本**自动创建独立 PVC**（sts-data-0 → PVC data-sts-data-0）——数据与 Pod 绑定；删 Pod 重建后仍绑同一个 PVC（**数据不丢**）。对比 Deployment 的"副本共享卷"（教材 §5.3.5）。

创建带 volumeClaimTemplates 的 StatefulSet

```bash
nano sts-pvc.yaml
```

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: sts-data
spec:
  serviceName: sts-data-svc        # headless Service（稳定 DNS 名）
  replicas: 2
  selector:
    matchLabels:
      app: sts-data
  template:
    metadata:
      labels:
        app: sts-data
    spec:
      containers:
      - name: nginx
        image: nginx
        volumeMounts:
        - name: data
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:             # 关键：卷声明模板
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: local-path
      resources:
        requests:
          storage: 1Gi
```

> **配置要点**（volumeClaimTemplates，教材 §5.3.3）：
> - `volumeClaimTemplates` 是 **StatefulSet 专属字段**（Deployment 没有）——模板为每个副本生成独立 PVC：副本 `sts-data-0` → PVC `data-sts-data-0`
> - `storageClassName: local-path`——实验 08 Lab 4 装的动态供应（本 Lab 前置）
> - PVC 命名规则：**`<模板名>-<sts名>-<序号>`**

```bash
nano sts-svc.yaml
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: sts-data-svc
spec:
  clusterIP: None          # headless：稳定 DNS 名（教材 §5.3.2）
  selector:
    app: sts-data
  ports:
  - port: 80
```

创建并观察

```bash
kubectl apply -f sts-svc.yaml -f sts-pvc.yaml
kubectl get pvc | grep sts-data
```

```bash
root@node1:~/k8slab/deployment# kubectl get pvc | grep sts-data
NAME                 STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
data-sts-data-0      Bound    pvc-xxx  1Gi        RWO            local-path     30s
data-sts-data-1      Bound    pvc-xxx  1Gi        RWO            local-path     30s
```

> **观察点**（独立 PVC 的核心现象）：**每个副本一个独立 PVC**（`data-sts-data-0` / `data-sts-data-1`），都 Bound——"身份与数据绑定"（教材 §5.3.3）：Pod 序号固定、PVC 固定、**数据跟着副本走**。

验证"删 Pod 数据保留"

```bash
kubectl exec sts-data-0 -- sh -c "echo my-data > /usr/share/nginx/html/note.txt"
kubectl delete pod sts-data-0
sleep 20
kubectl get pod sts-data-0
kubectl exec sts-data-0 -- cat /usr/share/nginx/html/note.txt
```

```bash
root@node1:~/k8slab/deployment# kubectl get pod sts-data-0
NAME        READY   STATUS    RESTARTS   AGE
sts-data-0  1/1     Running   0          20s
root@node1:~/k8slab/deployment# kubectl exec sts-data-0 -- cat /usr/share/nginx/html/note.txt
my-data
```

> **观察点**（StatefulSet 持久化的完整闭环）：删掉 `sts-data-0` 后——**① 新 Pod 仍叫 `sts-data-0`**（稳定标识，教材 §5.3.2）；**② 数据 `my-data` 还在**（新 Pod 绑的还是原 PVC `data-sts-data-0`）。对比"Pod 无状态"：**有状态 = 身份 + 数据都绑定**——这就是教材第 18 章 MySQL 用 StatefulSet 的底层原因。

**清理**

```bash
kubectl delete -f sts-pvc.yaml -f sts-svc.yaml
kubectl delete pvc -l app=sts-data   # 兜底清理自动生成的 PVC
```

> 说明：先删 STS（连带 Pod），再删 PVC（数据才真正删除——确认不要数据再删）。
## Lab 5 使用 job 实现一次性作业

> **目标**：用 Job 运行一次性的计算任务（计算圆周率）。
> **验证概念**：Job 保证任务**成功完成**（Pod 退出码 0 即完成）；适合批处理/一次性任务。


使用示例文件创建yaml文件

```bash
nano job.yaml
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  template:
    spec:
      containers:
      - name: pi
        image: resouer/ubuntu-bc
        command: ["sh", "-c", "echo 'scale=1000; 4*a(1)' | bc -l "]
      restartPolicy: Never
  backoffLimit: 4
```

> **配置要点**（Job 特有字段，区别于 Deployment）：
> - `template.spec.containers[].command`：任务要执行的命令（这里是计算圆周率 1000 位）
> - `template.spec.restartPolicy: Never`：**必须设为 Never 或 OnFailure**（Job 的 Pod 完成后不重启；不允许 Always）
> - `backoffLimit: 4`：任务失败时最多重试 4 次
> - Job 是"跑完就结束"——Pod 退出码 0 即成功（对应 Lab 5 观察点里的 `Completed` 状态）

创建job

```bash
kubectl create -f job.yaml
```

观察对应的pod，几秒之后运算结束，pod会进入到completed状态

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get pod -o wide
NAME       READY   STATUS              RESTARTS   AGE   IP             NODE    NOMINATED NODE   READINESS GATES
nginx      1/1     Running             0          8h    10.244.135.3   node3   <none>           <none>
pi-dzfkn   0/1     ContainerCreating   0          16s   <none>         node2   <none>           <none>
root@node1:~/k8slab/deployment# kubectl get pod -o wide
NAME       READY   STATUS      RESTARTS   AGE   IP             NODE    NOMINATED NODE   READINESS GATES
nginx      1/1     Running     0          8h    10.244.135.3   node3   <none>           <none>
pi-dzfkn   0/1     Completed   0          31s   10.244.104.7   node2   <none>           <none>
```

> **观察点**：Job 的 Pod 状态从 `ContainerCreating` → **`Completed`**（任务执行完正常退出）。与常驻 Pod（Running）不同，Job 的 Pod 完成后不再重启，这正是"一次性任务"的特征。

查看运算结果

```bash
kubectl logs pi-dzfkn
```

```bash
root@node1:~/k8slab/deployment# kubectl logs pi-dzfkn
3.141592653589793238462643383279502884197169399375105820974944592307\
81640628620899862803482534211706798214808651328230664709384460955058\
...（圆周率 1000 位计算结果省略）
```

> **观察点**：`kubectl logs` 拿到 Job 任务的**执行结果**（圆周率计算值）——Job 的 Pod 退出后，结果保留在日志中可查。这是"一次性任务"的产物查看方式。
查看job对象

```bash
kubectl describe jobs/pi
```

```bash
root@node1:~/k8slab/deployment# kubectl describe jobs/pi
Name:             pi
Namespace:        default
Parallelism:      1
Completions:      1
Start Time:       Wed, 21 Dec 2022 18:01:52 +0800
Completed At:     Wed, 21 Dec 2022 18:02:15 +0800
Duration:         23s
Pods Statuses:    0 Active / 1 Succeeded / 0 Failed
Events:
  Type    Reason            Age   From            Message
  ----    ------            ----  ----            -------
  Normal  SuccessfulCreate  101s  job-controller  Created pod: pi-dzfkn
  Normal  Completed         78s   job-controller  Job completed
```

> **观察点**（输出已省略 Labels/Mounts 等次要字段）：`Pods Statuses: 0 Active / 1 Succeeded`——任务已成功；`Duration: 23s`（执行耗时）；Events 里 `Job completed` 表示整个 Job 完成。`Parallelism`/`Completions` 控制并发与完成数（本实验均为 1）。
查看 jobs

```bash
kubectl get jobs -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get jobs -o wide
NAME   COMPLETIONS   DURATION   AGE    CONTAINERS   IMAGES              SELECTOR
pi     1/1           23s        2m8s   pi           resouer/ubuntu-bc   controller-uid=b97fb100-b9cf-4112-b48f-cdd0ab8e1944
```

> **观察点**：`COMPLETIONS 1/1`——Job 期望完成 1 次、已完成 1 次；`DURATION 23s` 是任务耗时。SELECTOR 是 Job 自动生成的 `controller-uid`（用它管理自己的 Pod）。

删除job

```bash
kubectl delete -f job.yaml
```

## Lab 6 使用 cronjob 实现定时作业

> **目标**：用 CronJob 按 cron 表达式定时运行 Job。
> **验证概念**：CronJob 在指定时间点创建 Job（语法同 Linux crontab）；`schedule` 字段定义执行计划。


使用示例文件创建yaml文件

```bash
nano cronjob.yaml
```

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
spec:
  schedule: "*/1 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox
            args:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
          restartPolicy: OnFailure
```

> **配置要点**（CronJob = 定时器 + Job 模板）：
> - `schedule: "*/1 * * * *"`：cron 表达式（5 段：分 时 日 月 周），这里表示**每分钟**执行一次
> - `jobTemplate`：要定时创建的 **Job 的模板**（嵌套了两层 template——CronJob → Job → Pod）
> - `restartPolicy: OnFailure`：Job 内的 Pod 失败时重启（Job 实验用 Never，这里是定时任务用 OnFailure）
> - 应用场景：定时备份、定期清理、定时报表等

创建cornjob

```bash
kubectl create -f cronjob.yaml
```

如果遇到报错，使用以下命令查看当前k8s支持的版本号

```bash
 kubectl explain cronjob
```

如下图所示，当前cronjob的资源版本是batch/v1

```bash
root@node1:~/k8slab/deployment# kubectl explain cronjob
GROUP:      batch
KIND:       CronJob
VERSION:    v1

DESCRIPTION:
    CronJob represents the configuration of a single cron job.

FIELDS:
  spec   <CronJobSpec>
    Specification of the desired behavior of a cron job, including the schedule.
  ...（其余字段说明省略）
```

> **观察点**：`explain` 显示资源类型信息——`GROUP: batch` / `KIND: CronJob` / `VERSION: v1`（对应 yaml 的 `apiVersion: batch/v1`）；`spec` 字段里 `schedule` 定义执行计划。写 yaml 前用 `explain` 查字段是标准做法（实验 01 公共基础 §3）。
查看pods

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get pod -o wide
NAME                   READY   STATUS      RESTARTS   AGE   IP             NODE    NOMINATED NODE   READINESS GATES
hello-27860285-qzrtw   0/1     Completed   0          22s   10.244.104.8   node2   <none>           <none>
nginx                  1/1     Running     0          8h    10.244.135.3   node3   <none>           <none>
```

> **观察点**：`hello-27860285-qzrtw` 是 CronJob 触发的 Job 创建的 Pod，状态 `Completed`（任务已跑完）——定时任务的 Pod 不会常驻，执行完即退出，等待下次调度。

每隔一分钟执行一次查看jobs

```bash
kubectl get jobs -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get jobs -o wide
NAME             COMPLETIONS   DURATION   AGE    CONTAINERS   IMAGES    SELECTOR
hello-27860285   1/1           17s        3m3s   hello        busybox   controller-uid=e93d4b9b-a3a6-4bd3-bb79-3b6f8e64610a
hello-27860286   1/1           16s        2m3s   hello        busybox   controller-uid=e0364cec-3436-49f6-aa89-e55ae0b51c3b
hello-27860287   1/1           17s        63s    hello        busybox   controller-uid=a4f5dba3-d577-4581-b411-3b87f3092f0c
hello-27860288   0/1           3s         3s     hello        busybox   controller-uid=503bfd3e-653c-4b3e-a37e-6d7e88f5c795
```

> **观察点**：CronJob 按 `*/1 * * * *`（每分钟）自动创建 Job——每次调度产生一个 `hello-<时间戳>` Job，COMPLETIONS 显示 1/1（已完成）。可看到多个历史 Job 并存，体现"定时触发一次性任务"。

查看 cronjob

```bash
kubectl get cronjob hello
```

```bash
root@node1:~/k8slab/deployment# kubectl get cronjob hello
NAME    SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE
hello   */1 * * * *   False     0        41s             3m51s
```

> **观察点**：`SCHEDULE` 列显示 cron 表达式；`LAST SCHEDULE` 是上次触发时间；`ACTIVE` 为 0 表示当前没有正在运行的任务。

删除 cronjob

```bash
kubectl delete -f cronjob.yaml
```

## Lab 7 使用 DaemonSet 运行守护进程应用

> **目标**：用 DaemonSet 在每个节点上运行一个 Pod。
> **验证概念**：DaemonSet 保证**每个节点**（或符合 nodeSelector 的节点）恰好运行一个 Pod；适合日志采集、监控代理等守护应用。


使用以下范例，创建 deamonset yaml

```bash
nano katacoda-daemonsets.yaml
```

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    app: katacoda-daemonsets
  name: katacoda-daemonsets
spec:
  selector:
    matchLabels:
      app: katacoda-daemonsets
  template:
    metadata:
      labels:
        app: katacoda-daemonsets
    spec:
      containers:
      - image: katacoda/docker-http-server
        name: docker-http-server
        resources: {}
```

> **配置要点**（DaemonSet 与 Deployment 的差异）：
> - 结构看似与 Deployment 相同（selector + template），但**没有 `replicas`**——因为 DaemonSet 不由副本数驱动，而是**每个节点跑一个**
> - 新增节点会自动部署 Pod、删除节点会自动清理（守护进程特性）
> - 无 `strategy`：DaemonSet 更新是逐个节点滚动替换
> - 典型用途：日志采集（如 filebeat）、监控代理（如 node-exporter）、网络插件（如 calico-node，实验 01 装过）

启用 DaemonSet

```bash
kubectl apply -f katacoda-daemonsets.yaml
```

观察 pod

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/deployment# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-daemonsets-l79w6   1/1     Running   0          48s   10.244.104.15   node2   <none>           <none>
katacoda-daemonsets-qfw82   1/1     Running   0          48s   10.244.135.51   node3   <none>           <none>
nginx                       1/1     Running   0          8h    10.244.135.3    node3   <none>           <none>
```

> **观察点**：**每个 worker 节点（node2/node3）都运行了一个 `katacoda-daemonsets-*` Pod**，而 master（node1）暂时没有——因为 master 默认有 `control-plane` 污点（实验 04 会讲如何解除）。DaemonSet 与 Deployment 的关键区别：**不是按副本数分布，而是按"每节点一个"分布**。

删除 daemonsets

```bash
kubectl delete -f katacoda-daemonsets.yaml
```


## Lab 8 rollout 暂停与恢复（推荐）

> **目标**：用 `kubectl rollout pause/resume` 实现"多次修改合并成一次发布"。
> **验证概念**：**rollout pause**（教材 §5.2.5）暂停 Deployment 的滚动更新——暂停期间的多次修改**不会触发滚动**（revision 不变）；`resume` 后一次性生效——批量修改场景避免"改一次滚一次"。

```bash
kubectl create deployment pause-demo --image=nginx:1.27 --replicas=2

# 暂停
kubectl rollout pause deployment/pause-demo
kubectl rollout status deployment/pause-demo    # 显示 paused

# 暂停期间连续修改（不会触发滚动）
kubectl set image deployment/pause-demo nginx=nginx:1.28
kubectl scale deployment/pause-demo --replicas=3
kubectl get pods -o wide    # 仍是 1.27 的 2 个副本（修改被"挂起"）
kubectl rollout history deployment/pause-demo   # REVISION 仍为 1

# 恢复：一次性生效
kubectl rollout resume deployment/pause-demo
kubectl rollout status deployment/pause-demo
kubectl get pods -o wide    # 3 个副本，镜像 1.28
kubectl rollout history deployment/pause-demo   # REVISION 2
```

```bash
root@node1:~/k8slab/deployment# kubectl rollout pause deployment/pause-demo
deployment.apps/pause-demo paused
root@node1:~/k8slab/deployment# kubectl rollout history deployment/pause-demo
deployment.apps/pause-demo
REVISION  CHANGE-CAUSE
1         <none>
```

> **观察点**（pause 的核心语义）：暂停期间 `set image` + `scale` 都"挂起"（Pod 不变、REVISION 不变）；`resume` 后**一次滚动完成全部修改**（副本 3 + 镜像 1.28，REVISION 2）——**批量修改合并发布**（教材 §5.2.5）。

**清理**

```bash
kubectl delete deployment pause-demo
```
## 本章小结

本章通过 8 个实验，掌握了 Kubernetes 的工作负载类型（探针/钩子/资源限制见 实验 02 Lab 8-10）：

| 实验 | 验证的知识点 | 关键命令/概念 | 级别 |
|---|---|---|:---:|
| Lab 1 使用 deployment 维护服务数量 | Deployment 通过 label selector 管理 Pod 副本；自愈与扩缩容 | `kubectl scale`、`replicas`；READY/UP-TO-DATE/AVAILABLE | 必做 |
| Lab 2 使用 deployment 实现滚动更新 | RollingUpdate 策略（maxUnavailable/maxSurge）；升级与回滚 | `kubectl set image`、`rollout history/undo` | 必做 |
| Lab 3 StatefulSet | 有状态应用：稳定有序的 Pod 标识（webserver-0/1/2） | `kind: StatefulSet`、`kubectl get sts` | 必做 |
| Lab 4 StatefulSet 独立 PVC | volumeClaimTemplates：每副本独立存储；删 Pod 数据保留 | `volumeClaimTemplates`、PVC 命名 `<模板>-<sts>-<序号>` | 推荐 |
| Lab 5 使用 job 实现一次性作业 | Job 保证任务成功完成（Pod 状态 Completed） | `kind: Job`、`kubectl logs` | 必做 |
| Lab 6 使用 cronjob 实现定时作业 | CronJob 按 cron 表达式定时触发 Job | `schedule: */1 * * * *` | 必做 |
| Lab 7 使用 DaemonSet 运行守护进程应用 | 每个节点恰好运行一个 Pod | `kind: DaemonSet`、按节点分布而非副本数 | 必做 |
| Lab 8 rollout 暂停与恢复 | pause 期间修改挂起；resume 一次性生效 | `kubectl rollout pause/resume`、REVISION 合并 | 推荐 |

**核心认知**：
1. **Deployment 是无状态应用的默认选择**——管理副本、滚动更新、回滚、自愈，是最常用的工作负载
2. **四种工作负载的分工**：Deployment（无状态多副本）、StatefulSet（有状态有序）、Job/CronJob（一次性/定时任务）、DaemonSet（每节点守护）
3. **共同机制**：都通过 **label selector** 管理自己的 Pod（Pod 模板 template 定义了要管理的 Pod 长什么样）
4. **滚动更新的保障**：readinessProbe（实验 02 Lab 8）是滚动更新能"无损切换"的前提——新 Pod 就绪才接管流量
5. **下线也要优雅**：preStop 钩子 + terminationGracePeriodSeconds（实验 02 Lab 9）保证发布/排空时不丢请求——与 实验 04 drain 的优雅终止同一条链路

**与后续章节的衔接**：
- label/selector 管理机制 → 实验 04 资源调度（nodeSelector/亲和性）
- readinessProbe 就绪判断 → 实验 07 Service 如何把流量发给就绪的 Pod
- DaemonSet 的"每节点一个" → 实验 04 taint/toleration 控制节点调度
- 生命周期钩子/优雅终止 → 实验 04 drain、生产发布流程
