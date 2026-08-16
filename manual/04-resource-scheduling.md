# 集群资源调度


## 实验准备

- **前置条件**：已完成 实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，按 `nano xxx.yaml` 创建即可，无需克隆外部仓库
- **工作目录**：本章实验在 `/root/k8slab/schedule` 下进行（如不存在先 `mkdir -p`）

> ℹ️ 各 Lab 中的终端输出为参考示例（基于本手册约定的 192.168.0.x 环境），实际 Pod IP、节点分布、AGE 等会因环境不同而不同，关注输出**结构**而非具体数值。

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 labels 和 nodeSelector | 标签定向调度 | 必做 |
| Lab 2 节点亲和 / Pod 亲和反亲和 | 表达式与分散 | 必做 |
| Lab 3 taint 和 tolerations | 污点与容忍 | 必做 |
| Lab 4 drain 和 uncordon | 节点排空 | 必做 |
| Lab 5 PodDisruptionBudget | 驱逐保护 | 必做 |
| Lab 6 使 master 承载工作负载 | 内置污点 | 必做 |
| Lab 7 master 上的 DaemonSet | 污点 + 容忍组合 | 必做 |
| Lab 8 Pod 拓扑分布约束 | topologySpreadConstraints 均衡打散 | 推荐 |
| Lab 9 Pod 亲和聚合 | podAffinity 同地部署 | 推荐 |

```bash
root@node1:~/k8slab/schedule# pwd
/root/k8slab/schedule
```

## Lab 1 labels 和 nodeSelector

> **目标**：给节点打标签（labels），再用 `nodeSelector` 把负载**定向调度**到指定节点，并观察标签对已运行 Pod 的影响。
> **验证概念**：调度器只会把 Pod 放到**满足 `nodeSelector` 全部键值**的节点上；标签可以随时打/删，但**只影响"将要调度"的 Pod**——已运行的 Pod 不会因标签变化而迁移（除非重建/扩缩容）。

使用以下范例，创建实例文件

```bash
nano katacoda.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: katacoda
  name: katacoda
spec:
  replicas: 3
  selector:
    matchLabels:
      app: katacoda
  strategy: {}
  template:
    metadata:
      labels:
        app: katacoda
    spec:
      containers:
      - image: katacoda/docker-http-server
        name: docker-http-server
        resources: {}
```

> **配置要点**（katacoda.yaml 基础 Deployment）：
> - `replicas: 3`——3 个副本，先看它们**默认**被调度到哪些节点（对照组）
> - `selector.matchLabels: app: katacoda` + `template.metadata.labels`——Deployment 与 Pod 的标签匹配关系（实验 03 已学）
> - 此时**没有任何调度约束**——Pod 会均匀分布到所有可调度节点（下面观察：只分布在 node2/node3）

创建 deployment

```bash
kubectl apply -f katacoda.yaml
```

观察pod

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS              RESTARTS   AGE   IP             NODE    NOMINATED NODE   READINESS GATES
katacoda-56dbd65b59-4w942   0/1     ContainerCreating   0          9s    <none>         node3   <none>           <none>
katacoda-56dbd65b59-7qq8z   0/1     ContainerCreating   0          9s    <none>         node2   <none>           <none>
katacoda-56dbd65b59-jmtm6   0/1     ContainerCreating   0          9s    <none>         node2   <none>           <none>
nginx                       1/1     Running             0          26h   10.244.135.3   node3   <none>           <none>
```

> **观察点**：3 个 katacoda Pod 分布到 **node2/node3**（两个 worker）——**node1（master）上没有**。原因是 kubeadm 给 master 打了 `node-role.kubernetes.io/control-plane:NoSchedule` 污点（Lab 4 专门讲）。`nginx` Pod 是之前章节遗留的，与本实验无关。

master 节点不运行 katacoda 负载

给node3打标签

```bash
kubectl label node node3 proxy=enable
```

观察pod

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-56dbd65b59-4w942   1/1     Running   0          89s   10.244.135.56   node3   <none>           <none>
katacoda-56dbd65b59-7qq8z   1/1     Running   0          89s   10.244.104.31   node2   <none>           <none>
katacoda-56dbd65b59-jmtm6   1/1     Running   0          89s   10.244.104.29   node2   <none>           <none>
nginx                       1/1     Running   0          26h   10.244.135.3    node3   <none>           <none>
```

> **观察点**：给 node3 打标签后，Pod 列表**没有任何变化**——标签只是给节点加了个"记号"，**已运行的 Pod 不会因此被迁移**。要利用标签定向调度，必须让 Pod 声明 `nodeSelector`（下一步）。

pod的状态没有变化

使用以下范例，更新katacoda

```bash
nano katacoda3.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: katacoda
  name: katacoda
spec:
  replicas: 3
  selector:
    matchLabels:
      app: katacoda
  strategy: {}
  template:
    metadata:
      labels:
        app: katacoda
    spec:
      nodeSelector: # 根据标签匹配调度
        proxy: enable
      containers:
      - image: katacoda/docker-http-server
        name: docker-http-server
        resources: {}
```

> **配置要点**（katacoda3.yaml 新增的调度约束）：
> - `spec.template.spec.nodeSelector: {proxy: enable}`——**Pod 模板级**声明："我只接受带有 `proxy=enable` 标签的节点"
> - `nodeSelector` 与 `containers` 平级（都在 `spec.template.spec` 下）
> - 调度器匹配规则：节点必须**同时满足所有** nodeSelector 键值对（可写多个键）；一个都不满足 → Pod 永远 Pending

更新deployment

```bash
kubectl apply -f katacoda3.yaml
```

观察pod

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-6f88f95457-244g6   1/1     Running   0          56s   10.244.135.57   node3   <none>           <none>
katacoda-6f88f95457-76sfw   1/1     Running   0          38s   10.244.135.58   node3   <none>           <none>
katacoda-6f88f95457-z6r7z   1/1     Running   0          21s   10.244.135.59   node3   <none>           <none>
nginx                       1/1     Running   0          26h   10.244.135.3    node3   <none>           <none>
```

> **观察点**：apply 后 Deployment 的 Pod 名哈希从 `56dbd65b59` 变成 **`6f88f95457`**（新 ReplicaSet）——**nodeSelector 改变触发了滚动更新**，3 个 Pod 全部调度到 **node3**（唯一带 `proxy=enable` 标签的节点）；node2 上的旧 Pod 被终止替换。

node2 节点上的pod被终止了，所有的负载被转到node3上

查看node3节点详情

```bash
kubectl describe nodes node3
```

```bash
root@node1:~/k8slab/schedule# kubectl describe nodes node3
Name:               node3
Roles:              <none>
Labels:             beta.kubernetes.io/arch=amd64
                    beta.kubernetes.io/os=linux
                    kubernetes.io/arch=amd64
                    kubernetes.io/hostname=node3
                    kubernetes.io/os=linux
                    proxy=enable
Taints:             <none>
Unschedulable:      false
```

> **观察点**（describe node3，已精简无关字段）：
> - `Labels` 里出现了我们刚打的 **`proxy=enable`**（其他 `kubernetes.io/*`、`beta.kubernetes.io/*` 是节点系统自动生成的标签）
> - `Taints: <none>`、`Unschedulable: false`——节点可正常接收调度
> - 关键：nodeSelector 匹配的就是 Labels 里的键值——**标签是节点的"身份证"，nodeSelector 按它认人**

特别留意 labels 字段

删除node3的标签

```bash
kubectl label node node3 proxy-
```

再次查看node3节点详情

```bash
kubectl describe nodes node3
```

```bash
root@node1:~/k8slab/schedule# kubectl describe nodes node3
Name:               node3
Roles:              <none>
Labels:             beta.kubernetes.io/arch=amd64
                    beta.kubernetes.io/os=linux
                    kubernetes.io/arch=amd64
                    kubernetes.io/hostname=node3
                    kubernetes.io/os=linux
Taints:             <none>
Unschedulable:      false
```

> **观察点**：删标签（`proxy-` 表示删除该键）后，node3 的 Labels 里 **`proxy=enable` 消失了**——标签可以随时增删，这是节点调度的"可编程性"基础。

特别留意 labels 字段

再次观察 pod

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-6f88f95457-244g6   1/1     Running   0          3m17s   10.244.135.57   node3   <none>           <none>
katacoda-6f88f95457-76sfw   1/1     Running   0          2m59s   10.244.135.58   node3   <none>           <none>
katacoda-6f88f95457-z6r7z   1/1     Running   0          2m42s   10.244.135.59   node3   <none>           <none>
nginx                       1/1     Running   0          26h     10.244.135.3    node3   <none>           <none>
```

> **观察点**：node3 的标签删了，但 **3 个 Pod 还留在 node3 上**——标签变化只影响**将来要调度**的 Pod，已运行的 Pod 不会被驱逐（下节 scale 后就能看到"新 Pod 无处可去"）。

现有的 pod 还在，符合定义

扩展katacoda的副本数量

```bash
kubectl scale deployment katacoda --replicas=4
```

再次观察 pod

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE     IP              NODE     NOMINATED NODE   READINESS GATES
katacoda-6f88f95457-244g6   1/1     Running   0          3m58s   10.244.135.57   node3    <none>           <none>
katacoda-6f88f95457-76sfw   1/1     Running   0          3m40s   10.244.135.58   node3    <none>           <none>
katacoda-6f88f95457-ptcwx   0/1     Pending   0          8s      <none>          <none>   <none>           <none>
katacoda-6f88f95457-z6r7z   1/1     Running   0          3m23s   10.244.135.59   node3    <none>           <none>
nginx                       1/1     Running   0          26h     10.244.135.3    node3    <none>           <none>
```

> **观察点**：第 4 个副本 `ptcwx` **Pending**（NODE 为空）——当前**没有任何节点满足条件**：node1 有 master 污点（不容忍）、node2/node3 都没有 `proxy=enable` 标签（标签已删）。nodeSelector 匹配不上 = 永远调度不了。

现有的 pod 还在，但是新增的 pod 始终处于 pending 状态

查看pending的pod

```bash
kubectl describe pod katacoda-6f88f95457-ptcwx
```

```bash
Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  92s   default-scheduler  0/3 nodes are available: 1 node(s) had taint {node-role.kubernetes.io/control-plane: }, that the pod didn't tolerate, 2 node(s) didn't match Pod's node affinity/selector.
  Warning  FailedScheduling  10s   default-scheduler  0/3 nodes are available: 1 node(s) had taint {node-role.kubernetes.io/control-plane: }, that the pod didn't tolerate, 2 node(s) didn't match Pod's node affinity/selector.
```

> **观察点**（describe Pending Pod 的 Events 是最重要的排查手段）：
> - `FailedScheduling` 消息逐条列出**为什么 3 个节点都不行**：node1 有 `control-plane` 污点且 Pod 不容忍；node2/node3 **不匹配 nodeSelector**（`didn't match Pod's node affinity/selector`）
> - 结论：`0/3 nodes are available`——Pod 卡在 Pending 时，`describe` 的 Events 会直接告诉你怎么修

显示目前没有可用的 node `"2 node(s) didn't match Pod's node affinity/selector"`

**清理**

```bash
kubectl delete -f katacoda3.yaml
```

> 说明：katacoda3.yaml 删除了带 nodeSelector 的 Deployment（含 Pending 的副本一并清除）。

## Lab 2 节点亲和 nodeAffinity / Pod 亲和反亲和

> **目标**：用 `nodeAffinity`（节点亲和）实现比 nodeSelector 更灵活的节点选择，再看 `podAffinity/podAntiAffinity`（Pod 亲和/反亲和）控制 Pod 之间的部署关系（CKA 必考）。
> **验证概念**：nodeSelector 只能做"**必须满足**"的简单匹配；`nodeAffinity` 支持 `requiredDuringScheduling`（硬性要求，等同 nodeSelector 但语法更丰富）和 `preferredDuringScheduling`（**软偏好**——尽量满足，不满足也能调度）；`podAffinity` 让 Pod **和某些 Pod 靠在一起**（如缓存与计算同节点）、`podAntiAffinity` 让 Pod **互相远离**（如高可用副本分散在不同节点）。

> 实验前置：给 node2 打一个标签 `zone=east`、node3 打 `zone=west`，方便按区域测试（node1 无 zone 标签）：

```bash
kubectl label node node2 zone=east
kubectl label node node3 zone=west
```

使用示例文件创建 yaml 文件

```bash
nano affinity-pod.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: affinity-node
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:   # 硬性要求（调度时必须满足）
        nodeSelectorTerms:
        - matchExpressions:
          - key: zone                    # 节点必须带 zone 标签
            operator: In                 # 且值在列表中
            values: ["east", "west"]
      preferredDuringSchedulingIgnoredDuringExecution:  # 软偏好（尽量满足，不满足也能调度）
      - weight: 100
        preference:
          matchExpressions:
          - key: zone
            operator: In
            values: ["east"]             # 更希望是 east（node2）
  containers:
  - name: nginx
    image: nginx
```

> **配置要点**（nodeAffinity 两种匹配，对比 nodeSelector）：
> - `requiredDuringSchedulingIgnoredDuringExecution`——**硬性要求**：`matchExpressions` 里 `key: zone` + `operator: In` + `values: [east, west]`——节点必须有 `zone=east` 或 `zone=west` 标签才能调度（比 nodeSelector 强：支持 In/NotIn/Exists/DoesNotExist 等操作符）
> - `preferredDuringSchedulingIgnoredDuringExecution`——**软偏好**：`weight: 100` 加权，希望落在 `zone=east`（node2），但即使没有也会调度（只是排后面）
> - 名字里的 `IgnoredDuringExecution` 含义：**调度后节点标签变了也不驱逐**（"存量不动"原则，与 Lab 1 一致）

创建并查看调度结果

```bash
kubectl apply -f affinity-pod.yaml
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl apply -f affinity-pod.yaml
pod/affinity-node created
root@node1:~/k8slab/schedule# kubectl get pod -o wide
NAME            READY   STATUS    RESTARTS   AGE   IP              NODE
affinity-node   1/1     Running   0          12s   10.244.104.70   node2
```

> **观察点**：`affinity-node` 调度到 **node2**（`zone=east`）——硬性要求（east/west）和软偏好（优先 east）都满足，落在 node2。如果给 node2/node3 都删掉 zone 标签，硬性要求不满足会 **Pending**（和 Lab 1 的 nodeSelector 一样）。

**Pod 亲和/反亲和（podAffinity / podAntiAffinity）**

> 换一个场景：**让两个 Pod 尽量同节点**（亲和）或**副本分散到不同节点**（反亲和）——高可用部署的关键（如多副本跨节点，避免单点）：

```bash
nano anti-affinity.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ha-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ha-app
  template:
    metadata:
      labels:
        app: ha-app
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:   # 硬性：副本之间互斥
          - labelSelector:
              matchLabels:
                app: ha-app
            topologyKey: kubernetes.io/hostname   # 按"节点"维度互斥
      containers:
      - name: nginx
        image: nginx
```

> **配置要点**（podAntiAffinity 高可用模式）：
> - `podAntiAffinity`——**反亲和**：新 Pod 不愿意和"带相同标签的 Pod"待在同一个地方
> - `labelSelector.matchLabels: app: ha-app`——"相同标签"指什么（这里是自己这个 Deployment 的副本）
> - `topologyKey: kubernetes.io/hostname`——**在哪个维度上互斥**（hostname = 节点级）：3 个副本必须分布在 **3 个不同节点**上——这就是"多副本高可用"的标准写法

创建并查看分布

```bash
kubectl apply -f anti-affinity.yaml
kubectl get pod -o wide | grep ha-app
```

```bash
root@node1:~/k8slab/schedule# kubectl get pod -o wide | grep ha-app
ha-app-6f4c8d47f9-8zqk1   1/1     Running   0          15s   10.244.104.71   node2
ha-app-6f4c8d47f9-b7mxc   1/1     Running   0          15s   10.244.166.139  node1
ha-app-6f4c8d47f9-x2y4v   1/1     Running   0          15s   10.244.135.29   node3
```

> **观察点**：3 个副本分布在 **node1/node2/node3 三个不同节点**——podAntiAffinity 生效：每个节点最多一个副本。**对比**：Lab 1 的 katacoda 3 副本会挤在 2 个节点上（无约束）；这就是高可用与"随缘分布"的差别。`podAffinity`（亲和）写法完全相同，只是把 `podAntiAffinity` 换成 `podAffinity`——语义变成"尽量和指定 Pod 同节点"。

**清理**

```bash
kubectl delete -f anti-affinity.yaml
kubectl delete -f affinity-pod.yaml
kubectl label node node2 zone-
kubectl label node node3 zone-
```

> 说明：删除两个实验对象，并清掉 node2/node3 的 zone 标签（`zone-` 删除语法，Lab 1 学过），恢复初始状态。

## Lab 3 taint 和 tolerations

> **目标**：给节点打**污点（taint）**驱逐其上负载，再给 Pod 加**容忍（tolerations）**让指定负载能调度回污点节点。
> **验证概念**：taint 是节点侧的"拒绝标记"，tolerations 是 Pod 侧的"豁免许可"——两者成对出现。本 Lab 用 `NoExecute` 效果（**立刻驱逐**节点上所有不容忍的 Pod），与 Lab 1 的 nodeSelector（只影响新调度）形成对比。

再次运行 deployment

```bash
kubectl apply -f katacoda.yaml
```

查看 pod 列表

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pod -o wide
NAME                        READY   STATUS    RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-56dbd65b59-89cs9   1/1     Running   0          3m19s   10.244.104.32   node2   <none>           <none>
katacoda-56dbd65b59-bhjsm   1/1     Running   0          3m19s   10.244.104.30   node2   <none>           <none>
katacoda-56dbd65b59-w4tls   1/1     Running   0          3m19s   10.244.135.60   node3   <none>           <none>
nginx                       1/1     Running   0          26h     10.244.135.3    node3   <none>          <none>
```

> **观察点**：重新 apply 基础 Deployment（无 nodeSelector），3 个 Pod 分布在 **node2/node3**（对照组，和 Lab 1 一样）。下面拿 node3 做实验：给它打污点。

找到当前负载较高的节点，比如 node3

给 node3 打污点

```bash
kubectl taint node node3 aa=bb:NoExecute
```

查看节点taints

```bash
kubectl describe node node3
```

```bash
root@node1:~/k8slab/schedule# kubectl describe node node3
Name:               node3
Roles:              <none>
Labels:             beta.kubernetes.io/arch=amd64
                    beta.kubernetes.io/os=linux
                    kubernetes.io/arch=amd64
                    kubernetes.io/hostname=node3
                    kubernetes.io/os=linux
Taints:             aa=bb:NoExecute
Unschedulable:      false
```

> **观察点**（describe node3，已精简无关字段）：
> - `Taints: aa=bb:NoExecute`——污点格式 `key=value:effect`：key=`aa`、value=`bb`、效果=`NoExecute`
> - **三种 effect**：`NoSchedule`（拒绝新 Pod，不驱逐存量）、`NoExecute`（拒绝新 Pod **且立刻驱逐存量**）、`PreferNoSchedule`（尽量不调度，软约束）
> - `Unschedulable: false`——taint 不等于 cordon（drain 的标记），两者机制不同（Lab 3 讲 cordon）

查看pod列表

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pod -o wide
NAME                        READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-56dbd65b59-89cs9   1/1     Running   0          5m    10.244.104.32   node2   <none>           <none>
katacoda-56dbd65b59-bhjsm   1/1     Running   0          5m    10.244.104.30   node2   <none>           <none>
katacoda-56dbd65b59-nlzdq   1/1     Running   0          58s   10.244.104.35   node2   <none>           <none>
```

> **观察点**：`NoExecute` 生效——**node3 上原有的 katacoda Pod 被立刻驱逐**（IP `10.244.135.60` 那个不见了），Deployment 自动在 node2 上重建，3 个 Pod 全部跑到 node2（注意 `nlzdq` 是重建的新 Pod，AGE 只有 58s）。这验证了 taint 的"驱逐存量"能力（对比 Lab 1 标签删除不驱逐）。

可以看到3个pod全部运行在另一个节点

使用以下范例，增加容忍，更新deployment，

```bash
nano katacoda2.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: katacoda
  name: katacoda
spec:
  replicas: 3
  selector:
    matchLabels:
      app: katacoda
  strategy: {}
  template:
    metadata:
      labels:
        app: katacoda
    spec:
      tolerations:  #增加容忍
      - key: "aa"
        operator: "Equal"
        value: "bb"
        effect: "NoExecute"
      containers:
      - image: katacoda/docker-http-server
        name: docker-http-server
        resources: {}
```

> **配置要点**（katacoda2.yaml 新增的 tolerations）：
> - `spec.template.spec.tolerations`——**与 nodeSelector 平级**，声明"这个 Pod 能容忍哪些污点"
> - 四个字段**逐一对应**节点污点 `aa=bb:NoExecute`：`key: "aa"`、`operator: "Equal"`（值必须相等才匹配）、`value: "bb"`、`effect: "NoExecute"`
> - 匹配规则：Pod 的容忍**完整覆盖**节点污点时才能调度上去（key+effect 是硬条件，value 在 Equal 操作符下才需要一致）

更新配置

```bash
kubectl apply -f katacoda2.yaml
```

查看 pod 列表，确认 pod 在 node3 节点上重建

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-7fc9f5499d-8qb8g   1/1     Running   0          3m54s   10.244.135.61   node3   <none>           <none>
katacoda-7fc9f5499d-p2hzc   1/1     Running   0          3m20s   10.244.135.62   node3   <none>           <none>
katacoda-7fc9f5499d-vv8gn   1/1     Running   0          3m37s   10.244.104.33   node2   <none>           <none>
```

删除现有污点

```bash
kubectl taint node node3 aa-
```

查看pod列表

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-7fc9f5499d-8qb8g   1/1     Running   0          4m39s   10.244.135.61   node3   <none>           <none>
katacoda-7fc9f5499d-p2hzc   1/1     Running   0          4m5s    10.244.135.62   node3   <none>           <none>
katacoda-7fc9f5499d-vv8gn   1/1     Running   0          4m22s   10.244.104.33   node2   <none>           <none>
```

> **观察点**：删污点（`aa-` 表示删除 key 为 aa 的污点）后，**Pod 没有任何变化**——污点删除只影响"将来的调度"，不会把存量 Pod 挪来挪去（与打污点的驱逐相反，单向的）。

**清理**

```bash
kubectl delete -f katacoda2.yaml
```

> 说明：删除带 tolerations 的 Deployment，为 Lab 3 清场。

## Lab 4 drain 和 uncordon

> **目标**：用 `kubectl drain` 把节点**排空**（维护场景：停机前把负载全部迁走），再用 `uncordon` 恢复调度。
> **验证概念**：drain = **cordon（禁止新调度）+ 驱逐存量 Pod** 两步；DaemonSet 管理的 Pod 默认**不驱逐**（需 `--ignore-daemonsets`）；排空期间新负载进不来，uncordon 后恢复（新增 Pod 才会重新调度上去）。

尝试清空node2

```bash
kubectl drain node2
```

```bash
root@node1:~/k8slab/schedule# kubectl drain node2
node/node2 already cordoned
error: unable to drain node "node2" due to error:cannot delete DaemonSet-managed Pods (use --ignore-daemonsets to ignore): kube-system/calico-node-57snh, kube-system/kube-proxy-qkfvc, continuing command...
There are pending nodes to be drained:
 node2
cannot delete DaemonSet-managed Pods (use --ignore-daemonsets to ignore): kube-system/calico-node-57snh, kube-system/kube-proxy-qkfvc
```

> **观察点**（首次 drain 报错是教学重点）：
> - 第一行 `node/node2 already cordoned`——**drain 的第一步**（cordon）已执行：node2 已标记为不可调度
> - 报错原因：node2 上有 **DaemonSet 管理的 Pod**（`calico-node`、`kube-proxy`）——DaemonSet 的设计是"每节点必须有"，drain 默认不敢删它们，**停下来等确认**
> - 注意：cordon 已生效，但驱逐被中断——所以要带参数重试（下面）

查看报错

清空node2

```bash
kubectl drain node2  --ignore-daemonsets
```

> 若 node2 上有使用 emptyDir 的 Pod，drain 会要求追加 `--delete-emptydir-data` 确认删除临时数据（本实验的 katacoda Pod 无 emptyDir，不需要；遇到时按提示追加即可）。

```bash
root@node1:~/k8slab/schedule# kubectl drain node2  --ignore-daemonsets
node/node2 already cordoned
WARNING: ignoring DaemonSet-managed Pods: kube-system/calico-node-57snh, kube-system/kube-proxy-qkfvc
evicting pod default/katacoda-7fc9f5499d-vv8gn
pod/katacoda-7fc9f5499d-vv8gn evicted
node/node2 drained
```

> **观察点**（drain 成功）：
> - `WARNING: ignoring DaemonSet-managed Pods`——calico-node/kube-proxy 被**跳过**（不驱逐，它们要留在节点上保证网络/代理）
> - `evicting pod default/katacoda-7fc9f5499d-vv8gn` → `evicted`——普通的 katacoda Pod 被驱逐（输出已精简；若节点上还有其他普通负载也会逐个 evicting）
> - `node/node2 drained`——排空完成（如果集群里跑了 ingress-nginx 等其他负载，同样会被逐出）

查看节点信息

```bash
kubectl get node -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get node -o wide
NAME    STATUS                     ROLES                  AGE    VERSION   INTERNAL-IP     EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION      CONTAINER-RUNTIME
node1   Ready                      control-plane,master   243d   v1.36.2   192.168.0.11   <none>        Ubuntu 24.04.4 LTS   6.8.0-51-generic   containerd://2.2.1
node2   Ready,SchedulingDisabled   <none>                 243d   v1.36.2   192.168.0.12   <none>        Ubuntu 24.04.4 LTS   6.8.0-51-generic   containerd://2.2.1
node3   Ready                      <none>                 243d   v1.36.2   192.168.0.13   <none>        Ubuntu 24.04.4 LTS   6.8.0-51-generic   containerd://2.2.1
```

> **观察点**：node2 的 STATUS 变成 **`Ready,SchedulingDisabled`**——这就是 cordon 的效果：节点本身健康（Ready），但**拒绝接收新 Pod**。node1/node3 保持 `Ready`。

node2 的 status `Ready,SchedulingDisabled`

查看pod列表

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE    IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-7fc9f5499d-8qb8g   1/1     Running   0          14m    10.244.135.61   node3   <none>           <none>
katacoda-7fc9f5499d-p2c6b   1/1     Running   0          117s   10.244.135.63   node3   <none>           <none>
katacoda-7fc9f5499d-p2hzc   1/1     Running   0          13m    10.244.135.62   node3   <none>           <none>
```

> **观察点**：驱逐的 katacoda Pod 被 Deployment 自动**重建到 node3**（`p2c6b` 是重建的新 Pod，AGE 117s）——node2 上已没有 katacoda Pod，全部迁移完成。

pod全部被迁移到node3

扩展katacoda副本数

```bash
kubectl scale deployment katacoda --replicas=6
```

查看pod列表

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-7fc9f5499d-692v4   1/1     Running   0          110s    10.244.135.1    node3   <none>           <none>
katacoda-7fc9f5499d-7n4z7   1/1     Running   0          110s    10.244.135.4    node3   <none>           <none>
katacoda-7fc9f5499d-8qb8g   1/1     Running   0          16m     10.244.135.61   node3   <none>           <none>
katacoda-7fc9f5499d-hjsvq   1/1     Running   0          110s    10.244.135.2    node3   <none>           <none>
katacoda-7fc9f5499d-p2c6b   1/1     Running   0          4m28s   10.244.135.63   node3   <none>           <none>
katacoda-7fc9f5499d-p2hzc   1/1     Running   0          16m     10.244.135.62   node3   <none>           <none>
```

> **观察点**：扩到 6 副本后，新增的 3 个 Pod（`692v4/7n4z7/hjsvq`，AGE 110s）**全部落在 node3**——node2 处于 `SchedulingDisabled`，调度器根本不会考虑它（对比 Lab 1：那里是 nodeSelector 匹配不上，这里是节点被 cordon）。

新增负载全在 node3 上

恢复 node2 可调度

```bash
kubectl uncordon node2
```

扩展 katacoda 副本数

```bash
kubectl scale deployment katacoda --replicas=8
```

查看 pod 列表

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE     IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-7fc9f5499d-692v4   1/1     Running   0          3m36s   10.244.135.1    node3   <none>           <none>
katacoda-7fc9f5499d-7n4z7   1/1     Running   0          3m36s   10.244.135.4    node3   <none>           <none>
katacoda-7fc9f5499d-87dvp   1/1     Running   0          66s     10.244.104.38   node2   <none>           <none>
katacoda-7fc9f5499d-8qb8g   1/1     Running   0          18m     10.244.135.61   node3   <none>           <none>
katacoda-7fc9f5499d-hjsvq   1/1     Running   0          3m36s   10.244.135.2    node3   <none>           <none>
katacoda-7fc9f5499d-p2c6b   1/1     Running   0          6m14s   10.244.135.63   node3   <none>           <none>
katacoda-7fc9f5499d-p2hzc   1/1     Running   0          18m     10.244.135.62   node3   <none>           <none>
katacoda-7fc9f5499d-wn8mk   1/1     Running   0          66s     10.244.104.34   node2   <none>           <none>
```

> **观察点**：uncordon 后扩到 8 副本，新增的 2 个 Pod（`87dvp/wn8mk`，AGE 66s）**被调度到 node2**——node2 恢复可调度，调度器又开始"雨露均沾"。存量 Pod 仍然不动（只有新增的才会利用 node2）。

新增 pod 会调度到 node2 上

收缩 katacoda 副本数

```bash
kubectl scale deployment katacoda --replicas=4
```

查看 pod 列表

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-7fc9f5499d-87dvp   1/1     Running   0          98s   10.244.104.38   node2   <none>           <none>
katacoda-7fc9f5499d-8qb8g   1/1     Running   0          19m   10.244.135.61   node3   <none>           <none>
katacoda-7fc9f5499d-p2hzc   1/1     Running   0          18m   10.244.135.62   node3   <none>           <none>
katacoda-7fc9f5499d-wn8mk   1/1     Running   0          98s   10.244.104.34   node2   <none>           <none>
```

> **观察点**：缩到 4 副本后，剩 2 个在 node3、2 个在 node2——**负载重新均衡**。维护流程闭环：`drain（排空）→ 维护 → uncordon（恢复）`，期间业务无感知（Deployment 自动重建）。

实现 node 的负载平衡了

**清理**

```bash
kubectl delete -f katacoda2.yaml
```

> 说明：删除 katacoda Deployment，为 Lab 4 清场。

## Lab 5 PodDisruptionBudget（PDB）

> **目标**：创建 PDB 限制"自愿中断"（drain/升级节点等）时最多能同时下线多少个副本，验证 drain 被 PDB 拦截（CKA 必考）。
> **验证概念**：**PDB 是"高可用保险"**：声明某个应用**最多允许同时中断多少个/多少比例**的副本。节点维护（drain，Lab 4）或集群升级属于**自愿中断**——如果 drain 会导致可用副本数跌破 PDB 下限，**drain 会阻塞等待**，直到有办法维持可用性。**强制中断**（节点故障/崩溃）不受 PDB 约束。

创建演示 Deployment（3 副本）和 PDB

```bash
kubectl apply -f katacoda.yaml
```

```bash
nano pdb.yaml
```

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: katacoda-pdb
spec:
  minAvailable: 2            # 任何时候至少保持 2 个副本可用（也可写 maxUnavailable: 1）
  selector:                  # PDB 管哪些 Pod：标签选择器（与 Deployment 一致）
    matchLabels:
      app: katacoda
```

> **配置要点**（PDB 三要素）：
> - `minAvailable: 2`——**最少可用数**（等价写法 `maxUnavailable: 1`，二选一）：3 副本应用最多允许 1 个同时下线
> - `selector.matchLabels: app: katacoda`——**管哪些 Pod**（标签选择器，与 Deployment 的 selector 一致）
> - 生效对象：**自愿中断**（drain/升级/驱逐）；节点故障（非自愿）不受限制

创建并查看

```bash
kubectl apply -f pdb.yaml
kubectl get pdb
```

```bash
root@node1:~/k8slab/schedule# kubectl apply -f pdb.yaml
poddisruptionbudget.policy/v1/katacoda-pdb created
root@node1:~/k8slab/schedule# kubectl get pdb
NAME           MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS   AGE
katacoda-pdb   2               N/A               1                     6s
```

> **观察点**：`ALLOWED DISRUPTIONS: 1`——**当前最多允许中断 1 个副本**（3 副本 - minAvailable 2 = 1）。这个数字会随可用副本数变化（比如只剩 2 个可用时，ALLOWED 变 0，任何 drain 都会被阻塞）。

尝试 drain 节点（PDB 拦截演示）

```bash
kubectl drain node2 --ignore-daemonsets
```

```bash
root@node1:~/k8slab/schedule# kubectl drain node2 --ignore-daemonsets
node/node2 already cordoned
error: unable to drain node "node2", aborting command...
There are pending nodes to be drained:
node2
error: cannot evict pod as it would violate the pod's disruption budget.
The disruption budget katacoda-pdb needs 2 healthy pods and has 1 currently.
```

> **观察点**（PDB 拦截 drain，报错是教学重点）：
> - `cannot evict pod as it would violate the pod's disruption budget`——**驱逐会被 PDB 拒绝**：node2 上的 katacoda Pod 一旦被驱逐，可用副本只剩 2 个 → 等于 minAvailable 2 的临界，驱逐会让它跌破
> - 报错还给出预算现状：`katacoda-pdb needs 2 healthy pods and has 1 currently`——**当前可用 1 个？说明其他副本还没就绪或分布情况**，无论如何：**drain 停下等 PDB 允许**
> - 这正是 PDB 的价值：**节点维护时保证业务不"闪断"**——drain 会阻塞，直到 PDB 允许（如先扩容副本再 drain）

查看 PDB 详情确认状态

```bash
kubectl describe pdb katacoda-pdb
```

> **观察点**：describe 里的 `Status` 段：`current healthy: N`、`desired healthy: 2`、`disruptions allowed: 1`——**healthy 掉到 2 以下时 disruptions allowed 变 0**，drain 就完全走不动。生产习惯：重要服务都配 PDB，节点维护/升级前先看 `kubectl get pdb`。

**清理**

```bash
kubectl delete -f pdb.yaml
kubectl delete -f katacoda.yaml
kubectl uncordon node2
```

> 说明：删除 PDB 和 Deployment；上面 drain 中断在 cordon 状态，**记得 `uncordon node2` 恢复调度**（Lab 4 学的）。

## Lab 6 使 master 能够承载工作负载

> **目标**：删除 kubeadm 给 master 打的污点，让工作负载（普通 Deployment 和 DaemonSet）能调度到 master 上，再恢复污点对比差异。
> **验证概念**：kubeadm 默认给 master 打 `node-role.kubernetes.io/control-plane:NoSchedule`（**保护 master，不让业务负载抢占控制面资源**）；删掉污点后 master 参与调度（Lab 1 里"node1 不跑 katacoda"的原因就在这里）；DaemonSet 默认在**每个可调度节点**上各放一个 Pod。

查看 master taints

```bash
kubectl describe node node1
```

```bash
root@node1:~/k8slab/schedule# kubectl describe node node1
Name:               node1
Roles:              control-plane,master
Labels:             beta.kubernetes.io/arch=amd64
                    beta.kubernetes.io/os=linux
                    kubernetes.io/arch=amd64
                    kubernetes.io/hostname=node1
                    kubernetes.io/os=linux
                    node-role.kubernetes.io/control-plane=
                    node.kubernetes.io/exclude-from-external-load-balancers=
Taints:             node-role.kubernetes.io/control-plane:NoSchedule
Unschedulable:      false
```

> **观察点**（describe node1，已精简无关字段）：
> - `Roles: control-plane,master`、Labels 里有 `node-role.kubernetes.io/control-plane=`（**无值**的空标签）
> - `Taints: node-role.kubernetes.io/control-plane:NoSchedule`——**kubeadm 自动打的污点**：拒绝新 Pod（NoSchedule），这就是前 3 个 Lab 里"master 不跑业务 Pod"的根源
> - 对照 Lab 2 的 `aa=bb:NoExecute`：这里是**无 value** 的污点（key + effect 即可，value 可省略）

特别留意 node-role.kubernetes.io/control-plane

删除 master 污点，使其能承载工作负载

```bash
kubectl taint node node1 node-role.kubernetes.io/control-plane-
```

```bash
root@node1:~/k8slab/schedule# kubectl taint node node1 node-role.kubernetes.io/control-plane-
node/node1 untainted
```

> **观察点**：`node/node1 untainted`——污点删除成功（`<key>-` 语法，与 Lab 2 删 `aa-` 一致）。master 现在**可以接收新 Pod**。

运行 deployment

```bash
kubectl apply -f katacoda.yaml
```

查看 pod 列表，确认 pod 运行在三个节点上

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE   IP               NODE    NOMINATED NODE   READINESS GATES
katacoda-56dbd65b59-7ml5v   1/1     Running   0          18s   10.244.135.6     node3   <none>           <none>
katacoda-56dbd65b59-ccwvd   1/1     Running   0          18s   10.244.166.135   node1   <none>           <none>
katacoda-56dbd65b59-cg9b2   1/1     Running   0          18s   10.244.104.36    node2   <none>           <none>
```

> **观察点**：3 个副本**分布到三个节点**（node1/node2/node3 各 1）——master 的污点删掉后，调度器把它当成普通节点"雨露均沾"。对比 Lab 1：那时 katacoda 只跑 node2/node3。

**清理**

```bash
kubectl delete -f katacoda.yaml
```

> 说明：删除普通 Deployment，下面用 DaemonSet 做对照实验。

使用以下范例创建 deamonsets

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

> **配置要点**（katacoda-daemonsets.yaml 与 Deployment 的差异）：
> - `kind: DaemonSet`——**每节点一个**的工作负载类型（对比 Deployment 按副本数调度）
> - **没有 `replicas` 字段**——副本数由"集群中可调度节点数"决定，节点加入/退出自动增减
> - 结构其余部分（selector/template/containers）与 Deployment 几乎相同

运行 daemonset

```bash
kubectl apply -f katacoda-daemonsets.yaml
```

查看 pod 列表

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pod -o wide
NAME                        READY   STATUS    RESTARTS   AGE   IP               NODE    NOMINATED NODE   READINESS GATES
katacoda-daemonsets-4xvng   1/1     Running   0          55s   10.244.135.5     node3   <none>           <none>
katacoda-daemonsets-cdq7h   1/1     Running   0          55s   10.244.104.37    node2   <none>           <none>
katacoda-daemonsets-mdjr5   1/1     Running   0          55s   10.244.166.136   node1   <none>           <none>
```

> **观察点**：3 个 DaemonSet Pod 在 **node1/node2/node3 各 1 个**（master 污点已删，所以 node1 也有）——DaemonSet 的"每节点一个"特性。**对照**：如果 master 污点还在，node1 上就不会有（下面恢复污点验证）。

清理 daemonset

```bash
kubectl delete -f katacoda-daemonsets.yaml
```

查看 pod 列表

```bash
kubectl get pod -o wide
```

> **观察点**：daemonset 删除后 Pod 全部消失——曲终人散（DaemonSet 删除 = 它管理的所有 Pod 一并删除，这正是"每节点一个、由控制器统管"的体现）。

曲终人散

恢复 master 的 taint

```bash
kubectl taint node node1 node-role.kubernetes.io/control-plane:NoSchedule
```

再次运行 daemonset

```bash
kubectl apply -f katacoda-daemonsets.yaml
```

查看pod列表

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pod -o wide
NAME                        READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-daemonsets-pkx9w   1/1     Running   0          35s   10.244.104.40   node2   <none>           <none>
katacoda-daemonsets-q85wj   1/1     Running   0          35s   10.244.135.9    node3   <none>           <none>
```

> **观察点**：恢复 master 污点后重跑 DaemonSet，Pod 只出现在 **node2/node3**——node1 上**没有** DaemonSet Pod（`NoSchedule` 拒绝新 Pod）。对照刚才 3 节点各 1 个：**污点恢复 = master 退出调度**。

node1 上没有 deamonsets pod

## Lab 7 部署能够运行在master上的daemonset

> **目标**：给 DaemonSet 加上对 master 污点的**容忍（tolerations）**，让它在 master 污点存在时也能调度到 master 上。
> **验证概念**：Lab 4 的结尾演示了"master 有污点 → DaemonSet 不覆盖 master"。本 Lab 用 `operator: Exists` 的容忍**豁免**这个污点——注意与 Lab 2 的 `operator: Equal` 对比：这里 key 无值，用 Exists 只判断"污点 key 是否存在"。

使用以下范例，为 master 的 taint 增加容忍，确保 daemonset 能够在它上面运行，更新 deployment，

```bash
nano katacoda-daemonsets2.yaml
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
      tolerations: # 增加针对master的容忍
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
```

> **配置要点**（katacoda-daemonsets2.yaml 相对 Lab 4 的差异）：
> - 在 `spec.template.spec` 下新增 `tolerations`，**针对 master 污点** `node-role.kubernetes.io/control-plane:NoSchedule`
> - 关键区别：`operator: Exists`（**只看 key 是否存在**，不关心 value——master 污点恰好无 value，用 Equal 会匹配不上）＋ `effect: NoSchedule`
> - 生产案例：`calico-node`、`kube-proxy` 等系统 DaemonSet 都带类似容忍，才能覆盖 master（还记得 Lab 3 drain 时它们被 ignore 吗）

创建deployment

```bash
kubectl apply -f katacoda-daemonsets2.yaml
```

观察pod分布

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/schedule# kubectl get pod -o wide
NAME                        READY   STATUS        RESTARTS   AGE     IP               NODE    NOMINATED NODE   READINESS GATES
katacoda-daemonsets-pkx9w   1/1     Terminating   0          3m15s   10.244.104.40    node2   <none>           <none>
katacoda-daemonsets-q85wj   1/1     Running       0          3m15s   10.244.135.9     node3   <none>           <none>
katacoda-daemonsets-vkrpj   1/1     Running       0          18s     10.244.166.137   node1   <none>           <none>
```

> **观察点**：node1 上出现了 **`katacoda-daemonsets-vkrpj`**（IP `10.244.166.137`，AGE 18s）——容忍生效，DaemonSet 覆盖了 master！同时看到 `pkx9w` 处于 **Terminating**（旧 DaemonSet 的 Pod 被新版本替换，滚动中）。至此三节点全覆盖。

**清理**

```bash
kubectl delete -f katacoda-daemonsets2.yaml
```

> 说明：删除带容忍的 DaemonSet。注意本 Lab 结束后 **master 污点保持恢复状态**（`control-plane:NoSchedule`），集群回到标准配置。

## 备注：删除所有 master 污点

> 单节点学习环境（如附录 E 的单节点安装）想让 master 承载所有负载，可以一次性删除全部 master 污点（生产环境不建议）：

```bash
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

## Lab 8 Pod 拓扑分布约束（topologySpreadConstraints）（推荐）

> **目标**：用 topologySpreadConstraints 实现副本跨节点**均衡打散**（maxSkew 控制偏差）。
> **验证概念**：教材 §6.3.5——topologySpreadConstraints 按拓扑域（topologyKey）均匀分布，`maxSkew: 1` 表示"任何节点上的副本数差 ≤1"——比 podAntiAffinity 更强的均衡能力（跨可用区高可用标配）。

创建均衡分布的 Deployment

```bash
cat > spread-demo.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spread-demo
spec:
  replicas: 4
  selector:
    matchLabels:
      app: spread-demo
  template:
    metadata:
      labels:
        app: spread-demo
    spec:
      topologySpreadConstraints:
      - maxSkew: 1                        # 任意节点副本数差 ≤1
        topologyKey: kubernetes.io/hostname  # 以节点为拓扑域
        whenUnsatisfiable: ScheduleAnyway # 无法满足时尽量（软约束）
        labelSelector:
          matchLabels:
            app: spread-demo
      containers:
      - name: nginx
        image: nginx
EOF
kubectl apply -f spread-demo.yaml
kubectl get pods -o wide | grep spread-demo
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide | grep spread-demo
spread-demo-xxx1   1/1   Running   0   30s   10.244.x.x   node1
spread-demo-xxx2   1/1   Running   0   30s   10.244.x.x   node2
spread-demo-xxx3   1/1   Running   0   30s   10.244.x.x   node3
spread-demo-xxx4   1/1   Running   0   30s   10.244.x.x   node2
```

> **配置要点**（topologySpreadConstraints，教材 §6.3.5）：
> - `topologyKey: kubernetes.io/hostname`——以**节点**为拓扑域（跨 AZ 用 `topology.kubernetes.io/zone`）
> - `maxSkew: 1`——任意拓扑域之间的副本数差不超过 1
> - `whenUnsatisfiable: ScheduleAnyway`——软约束（无法满足也调度）；`DoNotSchedule` 是硬约束（可能 Pending）
> - 对比 podAntiAffinity（Lab 2）：后者是"避开已有同标签 Pod"，前者是"**按拓扑域算账均匀分布**"

> **观察点**：4 个副本在 3 个节点上的分布为 **2/1/1**（任意两个节点差 ≤1）——拓扑约束的"均衡账"生效；若副本数超过节点数（如 5 副本 3 节点），分布为 2/2/1（差 ≤1 仍满足）。

**清理**

```bash
kubectl delete deployment spread-demo
```

## Lab 9 Pod 亲和聚合（podAffinity）（推荐）

> **目标**：用 podAffinity 实现"计算 Pod 与缓存 Pod 同节点"（聚合部署）。
> **验证概念**：教材 §6.3.4 场景二——podAffinity 让新 Pod **尽量调度到有指定标签 Pod 的节点**（数据本地性：本地读缓存不跨节点）；与 Lab 2 的反亲和（分散）方向相反。

```bash
# ① 先部署"缓存"应用（标记 app=cache）
kubectl create deployment cache --image=nginx --replicas=1
kubectl label deployment cache app=cache --overwrite

# ② 部署"计算"应用：preferred 亲和（尽量与 cache 同节点）
cat > compute.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: compute
spec:
  replicas: 2
  selector:
    matchLabels:
      app: compute
  template:
    metadata:
      labels:
        app: compute
    spec:
      affinity:
        podAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchLabels:
                  app: cache
              topologyKey: kubernetes.io/hostname
      containers:
      - name: nginx
        image: nginx
EOF
kubectl apply -f compute.yaml
kubectl get pods -o wide | grep -E "cache|compute"
```

```bash
root@node1:~/k8slab/schedule# kubectl get pods -o wide | grep -E "cache|compute"
cache-xxx   1/1   Running   0   1m   10.244.x.x   node2
compute-xx1 1/1   Running   0   30s  10.244.x.x   node2    ← 与 cache 同节点
compute-xx2 1/1   Running   0   30s  10.244.x.x   node3
```

> **配置要点**（podAffinity，教材 §6.3.3）：
> - `podAffinityTerm.labelSelector` 匹配"目标 Pod 的标签"（app=cache）、`topologyKey` 定义"同处"（hostname=同节点）
> - `preferred...`（软）——尽量同节点，不满足也能调度（所以 compute-xx2 落在 node3 是"尽量"的体现）；`required`（硬）则必须同节点

> **观察点**：`compute-xx1` 与 `cache` 同节点（node2）——**聚合偏好生效**（本地读缓存）；`compute-xx2` 落在 node3 是因为 node2 放不下了（preferred 是打分加权，不是强制）。对照 Lab 2 的 podAntiAffinity：**反亲和是"分散防同挂"，亲和是"聚合求本地"**。

**清理**

```bash
kubectl delete deployment cache compute
```
## 本章小结

本章通过 9 个实验，掌握了 Kubernetes 调度器的"筛选机制"——**决定 Pod 能落在哪些节点上、Pod 之间怎么分布**：

| 实验 | 验证的知识点 | 关键概念 | 级别 |
|---|---|---|:---:|
| Lab 1 labels 和 nodeSelector | 节点打标签；`nodeSelector` 定向调度；标签删除只影响新 Pod | 节点标签、nodeSelector、Pending 排查 | 必做 |
| Lab 2 亲和（nodeAffinity/podAntiAffinity） | 硬性要求 vs 软偏好；副本跨节点高可用 | matchExpressions、required/preferred、topologyKey | 必做 |
| Lab 3 taint 和 tolerations | 节点污点驱逐存量 Pod（NoExecute）；Pod 容忍豁免 | taint、tolerations、三种 effect | 必做 |
| Lab 4 drain 和 uncordon | 排空节点：cordon + 驱逐；DaemonSet Pod 不驱逐；恢复调度 | drain、--ignore-daemonsets、uncordon | 必做 |
| Lab 5 PodDisruptionBudget | 限制自愿中断时同时下线的副本数；drain 被 PDB 拦截 | minAvailable、ALLOWED DISRUPTIONS、violates budget | 必做 |
| Lab 6 使 master 承载负载 | kubeadm 的 master 污点；删除后 master 参与调度；DaemonSet 每节点一个 | control-plane 污点、DaemonSet | 必做 |
| Lab 7 master 上的 daemonset | `operator: Exists` 容忍豁免 master 污点 | Exists vs Equal、系统 DaemonSet 模式 | 必做 |
| Lab 8 拓扑分布约束 | topologySpreadConstraints 均衡打散（2/1/1 分布） | maxSkew、topologyKey、ScheduleAnyway | 推荐 |
| Lab 9 Pod 亲和聚合 | podAffinity 与 cache 同节点（数据本地性） | preferred、podAffinityTerm | 推荐 |

**核心认知**：
1. **调度的本质是"匹配"**：调度器在"无污点（或有容忍）且满足 nodeSelector/亲和"的节点里选一个——三层筛选：节点可用性 → 污点/容忍 → 标签匹配（nodeSelector/亲和）
2. **主动选择 vs 被动排斥**：nodeSelector/亲和是 Pod **主动声明**"我只要这些节点"；taint 是节点**被动排斥**"我不接收这些 Pod"；toleration 是 Pod 的"豁免通行证"
3. **"存量不动"原则**：标签删除、污点删除、uncordon 都**不会迁移已运行的 Pod**——只有 NoExecute 污点会驱逐存量，其余只影响新调度（本实验多次验证）
4. **drain 是运维标准动作**：节点维护 = `drain（排空）→ 维护 → uncordon（恢复）`，配合 Deployment 自动重建实现业务无感；**PDB 给 drain 上保险**——可用副本跌破下限时 drain 会被拦截（高可用保障）
5. **亲和/反亲和高可用**：`podAntiAffinity + topologyKey: hostname` 让多副本跨节点分布——"高可用"不是默认的，要显式声明
6. **master 默认不跑业务**：kubeadm 的 `control-plane:NoSchedule` 保护控制面；单节点学习环境才删它（备注）

**与后续章节的衔接**：
- nodeSelector → nodeAffinity → 生产调度策略（亲和/反亲和/拓扑分布）
- DaemonSet 每节点一个 → 实验 08 安全组件（如网络策略）、实验 09 监控采集器（node-exporter/metrics-server）都用 DaemonSet 部署
- drain/taint/PDB → 实验 01 集群升级（worker 升级先 drain）、生产节点维护与故障隔离

