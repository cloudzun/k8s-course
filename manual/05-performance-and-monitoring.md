# 资源管理和监控


## 实验准备

- **前置条件**：已完成 实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，按 `nano xxx.yaml` 创建即可，无需克隆外部仓库
- **工作目录**：本章实验在 `/root/k8slab/perfmon` 下进行（如不存在先 `mkdir -p`）

> ℹ️ 各 Lab 中的终端输出为参考示例（基于本手册约定的 192.168.0.x 环境），实际 Pod IP、节点分布、AGE 等会因环境不同而不同，关注输出**结构**而非具体数值。

**实验分级**：

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 安装 metrics-server | 指标链路数据源 | 必做 |
| Lab 2 启用 HPA | CPU/内存自动扩缩 | 必做 |
| Lab 3 使用 LimitRange | 单 Pod 资源约束 | 必做 |
| Lab 4 使用 ResourceQuota | 命名空间总量配额 | 必做 |
| Lab 5 HPA 稳定窗口观察 | 缩容 5 分钟窗口实测 | 推荐 |
| Lab 6 KEDA 事件驱动扩缩 | 消息队列触发扩容 | 可选·进阶 |

## Lab 1 安装 metrics-server

> **目标**：安装 metrics-server 采集集群资源指标，用 `kubectl top` 查看节点/Pod 的 CPU、内存实时用量。
> **验证概念**：`kubectl top` 的数据来自 metrics-server（通过 kubelet 的 Summary API 采集），它把节点/容器指标汇总成 `metrics.k8s.io` API——**HPA（Lab 2）和 `kubectl top` 都依赖它**。没有 metrics-server 时 `kubectl top` 会报 `metrics.k8s.io not available`。

```bash
root@node1:~/k8slab/perfmon# pwd
/root/k8slab/perfmon
```

安装 metrics-server（下载官方 components 清单并 apply）

```bash
curl -sSL https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml -o metrics-server.yaml

# v1.36 适配：kubelet 使用自签名证书，需加 --kubelet-insecure-tls 参数
sed -i '/- --secure-port=4443/a\        - --kubelet-insecure-tls' metrics-server.yaml

# 国内网络若拉取 registry.k8s.io 镜像失败，替换为加速站前缀（可选）
sed -i 's@registry.k8s.io/metrics-server@docker.1panel.live/registry.k8s.io/metrics-server@g' metrics-server.yaml

kubectl apply -f metrics-server.yaml
```

> **配置要点**（3 条命令各司其职）：
> - `curl` 下载**官方最新版** components.yaml（内含 Deployment + Service + RBAC，全部组件一次装好）
> - 第一条 `sed`：在 args 里追加 `--kubelet-insecure-tls`——**v1.36 必配**，因为 kubelet 默认用自签名证书，metrics-server 校验会失败
> - 第二条 `sed`（可选）：国内网络拉镜像失败时替换镜像前缀（参考 实验 01 加速站方案）

> 说明：官方 components.yaml 的镜像为 `registry.k8s.io/metrics-server/metrics-server:<最新版>`，版本随发布更新（当前稳定版 v0.7.x）；国内网络拉取失败时参考 实验 01 「应急方案」或改用加速站前缀。

查看pod

```bash
kubectl get pod -n kube-system
```

```bash
kubectl get pod -n kube-system | grep metrics-server
```

```bash
root@node1:~/k8slab/perfmon# kubectl get pod -n kube-system | grep metrics-server
metrics-server-756db4c674-gxm6h           1/1     Running   0             2m27s
```

> **观察点**：`metrics-server-<rs哈希>-<随机串>` 运行在 kube-system，`1/1 Running`——组件就绪（Pod 名格式与 实验 03 Deployment 一致）。

测试功能

```bash
kubectl top node
```

```bash
root@node1:~/k8slab/perfmon# kubectl top node
NAME    CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
node1   320m         8%     1929Mi          24%
node2   146m         3%     1607Mi          20%
node3   167m         4%     1478Mi          18%
```

> **观察点**（top node）：
> - 每个节点的实时用量：CPU 列 `320m`（毫核）+ 百分比（相对节点总核数），内存 `1929Mi` + 百分比
> - node1（master）CPU 最高（320m/8%）——控制面组件（apiserver/etcd 等）都跑在它上面，这是预期现象

```bash
kubectl top pod
```

```bash
root@node1:~/k8slab/perfmon# kubectl top pod
NAME                        CPU(cores)   MEMORY(bytes)
katacoda-daemonsets-5l28c   0m           1Mi
katacoda-daemonsets-vkrpj   0m           1Mi
katacoda-daemonsets-wh7hv   1m           1Mi
```

> **观察点**（top pod，仅 default 命名空间）：`katacoda-daemonsets-*` 是 实验 04 遗留的 DaemonSet（每节点一个），CPU 接近 0、内存 1Mi——轻量负载的典型值。

```bash
kubectl top pod -A
```

```bash
root@node1:~/k8slab/perfmon# kubectl top pod -A
NAMESPACE       NAME                                        CPU(cores)   MEMORY(bytes)
default         katacoda-daemonsets-5l28c                   0m           1Mi
default         katacoda-daemonsets-vkrpj                   0m           1Mi
default         katacoda-daemonsets-wh7hv                   1m           1Mi
ingress-nginx   ingress-nginx-controller-76d86f9848-8r5jq   3m           92Mi
ingress-nginx   ingress-nginx-controller-76d86f9848-klxnj   3m           91Mi
kube-system     calico-kube-controllers-7c845d499-9j9vk     5m           22Mi
kube-system     calico-node-57snh                           53m          147Mi
kube-system     calico-node-d5clh                           59m          148Mi
kube-system     calico-node-qcc6p                           65m          146Mi
kube-system     coredns-65c54cc984-rdfmg                    3m           13Mi
kube-system     coredns-65c54cc984-rt4wl                    3m           13Mi
kube-system     etcd-node1                                  32m          59Mi
kube-system     kube-apiserver-node1                        80m          408Mi
kube-system     kube-controller-manager-node1               27m          56Mi
kube-system     kube-proxy-f6zhl                            1m           19Mi
kube-system     kube-proxy-jljll                            1m           19Mi
kube-system     kube-proxy-qkfvc                            1m           18Mi
kube-system     kube-scheduler-node1                        6m           20Mi
kube-system     metrics-server-756db4c674-gxm6h             5m           15Mi
```

> **观察点**（top pod -A，全集群视角）：
> - `-A` = `--all-namespaces`——**能看到所有命名空间**的 Pod，包括系统组件
> - **kube-apiserver-node1 用量最高**（80m CPU / 408Mi 内存）——它是所有 API 请求的入口；`calico-node-*` 每节点一个（网络插件 DaemonSet，实验 04 学过）
> - 观察价值：**哪个 Pod 吃资源最多一眼可见**，这是日常排障的第一步

```bash
kubectl top pod | sort -k3 -nr
```

```bash
root@node1:~/k8slab/perfmon# kubectl top pod -A | sort -k3 -nr
kube-system     kube-apiserver-node1                        66m          359Mi
kube-system     calico-node-qcc6p                           61m          146Mi
kube-system     calico-node-57snh                           55m          147Mi
kube-system     calico-node-d5clh                           44m          147Mi
kube-system     kube-controller-manager-node1               26m          54Mi
kube-system     etcd-node1                                  26m          60Mi
kube-system     metrics-server-756db4c674-gxm6h             5m           14Mi
kube-system     kube-scheduler-node1                        5m           20Mi
kube-system     calico-kube-controllers-7c845d499-9j9vk     5m           22Mi
kube-system     coredns-65c54cc984-rt4wl                    2m           13Mi
kube-system     coredns-65c54cc984-rdfmg                    2m           13Mi
ingress-nginx   ingress-nginx-controller-76d86f9848-klxnj   2m           91Mi
ingress-nginx   ingress-nginx-controller-76d86f9848-8r5jq   2m           92Mi
kube-system     kube-proxy-qkfvc                            1m           18Mi
kube-system     kube-proxy-jljll                            1m           19Mi
kube-system     kube-proxy-f6zhl                            1m           19Mi
default         katacoda-daemonsets-wh7hv                   1m           1Mi
NAMESPACE       NAME                                        CPU(cores)   MEMORY(bytes)
default         katacoda-daemonsets-vkrpj                   0m           1Mi
default         katacoda-daemonsets-5l28c                   0m           1Mi
```

> **观察点**（sort 排序技巧）：`sort -k3 -nr` 按第 3 列（CPU）**数值倒序**——一眼看出 CPU 消耗排名；注意表头（NAMESPACE 行）也被排到中间了（sort 不认表头），这是正常现象。下面用 `head -1` 取第一名、`awk` 只取 Pod 名——**CKA 考试真题套路**（"找出占用内存最高的 Pod"）。

```bash
kubectl top pod -A | sort -k3 -nr | head -1
```

```bash
root@node1:~/k8slab/perfmon# kubectl top pod -A | sort -k3 -nr | head -1
kube-system     kube-apiserver-node1                        68m          359Mi
```

```bash
kubectl top pod -A | sort -k3 -nr | head -1 | awk '{print $2}'
```

```bash
root@node1:~/k8slab/perfmon# kubectl top pod -A | sort -k3 -nr | head -1 | awk '{print $2}'
kube-apiserver-node1
```

```bash
kubectl top pod -A | sort -k3 -nr | head -1 | awk '{print $2}' >/tmp/memtop.txt
```

> **观察点**（命令链逐步拆解）：
> - `sort -k3 -nr`：按 CPU 列降序 → `head -1`：取第 1 行（CPU 最高的 Pod）→ `awk '{print $2}'`：只输出第 2 列（Pod 名）→ `> /tmp/memtop.txt`：结果存文件
> - 结论：CPU 最高的 Pod 是 **`kube-apiserver-node1`**——控制面组件吃资源是正常现象，业务集群里通常看业务命名空间
> - 这是 CKA 考试的经典真题（按资源排序 + 提取字段），命令链可复用

## Lab 2 启用 HPA, 实现工作负载水平扩展

> **目标**：给 podinfo Deployment 创建 HPA，让副本数**按 CPU/内存指标自动伸缩**（2~10），并观察扩容全过程。
> **验证概念**：HPA（HorizontalPodAutoscaler）周期性地读取 metrics-server 的指标（Lab 1 刚装好），当 CPU 利用率超过目标（80%）或内存超过阈值（200M）时，自动调大副本数——**副本数由控制器调整，Pod 模板不动**（对比 实验 03 手改 replicas）。
>
> ⚠️ **v1.36 适配**：早期版本通过修改 kube-controller-manager 启动参数（`--horizontal-pod-autoscaler-downscale-delay` 等）调节 HPA 行为，这些 flag 在 **v1.26+ 已移除**，1.36 下无法使用。HPA 的扩缩容等待时间等行为现通过 HPA 资源的 `spec.behavior` 字段配置（可选，默认值即可满足本实验，扩展用法见 HPA YAML 后的说明）。本 Lab 改为直接创建 HPA 并验证扩容，保留原实验的教学目标。

使用范例创建 podinfo

```bash
nano podinfo.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: podinfo
spec:
  selector:
    matchLabels:
      app: podinfo
  replicas: 2
  template:
    metadata:
      labels:
        app: podinfo
      annotations:
        prometheus.io/scrape: "true"
    spec:
      containers:
        - name: podinfod
          image: stefanprodan/podinfo:2.0.0
          imagePullPolicy: Always
          volumeMounts:
            - name: metadata
              mountPath: /etc/podinfod/metadata
              readOnly: true
          ports:
            - containerPort: 9898
              protocol: TCP
          readinessProbe:
            httpGet:
              path: /readyz
              port: 9898
            initialDelaySeconds: 1
            periodSeconds: 2
            failureThreshold: 1
          livenessProbe:
            httpGet:
              path: /healthz
              port: 9898
            initialDelaySeconds: 1
            periodSeconds: 3
            failureThreshold: 2
          resources:
            requests:
              memory: "32Mi"
              cpu: "1m"
            limits:
              memory: "256Mi"
              cpu: "100m"
      volumes:
        - name: metadata
          downwardAPI:
            items:
              - path: "labels"
                fieldRef:
                  fieldPath: metadata.labels
              - path: "annotations"
                fieldRef:
                  fieldPath: metadata.annotations
```

> **配置要点**（podinfo.yaml 与 HPA 实验相关的部分）：
> - `replicas: 2`——初始副本数（HPA 的 minReplicas 也从 2 起步）
> - `resources.requests`（cpu 1m / memory 32Mi）——**HPA 算 CPU 利用率的分母**：利用率 = 实际用量 ÷ requests，所以 requests 写多少直接决定扩容灵敏度
> - readiness/liveness 探针：podinfo 的 `/readyz`、`/healthz` 接口，扩容时新 Pod 先通过就绪检查才接流量
> - `downwardAPI` 卷：把 Pod 的 labels/annotations 注入为文件（podinfo 展示用，与 HPA 无关）

创建pod

```bash
kubectl apply -f podinfo.yaml
```

查看 pod，重点关注数量

```bash
kubectl get pod | grep podinfo
```

```bash
root@node1:~/k8slab/perfmon# kubectl get pod | grep podinfo
podinfo-6ff67f567b-kvszn    1/1     Running   0          39s
podinfo-6ff67f567b-pk75b    1/1     Running   0          39s
```

> **观察点**：**2 个** podinfo Pod（基线副本数，对应 yaml 的 `replicas: 2`）。记住这个数字，HPA 启用后它会自己变。

使用范例创建 podinfo HPA

```bash
nano podinfo-hpa.yaml
```

```yaml
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: podinfo
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: podinfo
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 80
    - type: Resource
      resource:
        name: memory
        target:
          type: AverageValue
          averageValue: 200M
```

> **配置要点**（podinfo-hpa.yaml，autoscaling/v2 是 v1.26+ 唯一版本）：
> - `scaleTargetRef`——**HPA 管谁**：Deployment/podinfo（HPA 只改这个 Deployment 的 replicas）
> - `minReplicas: 2 / maxReplicas: 10`——副本数的**下限与上限**（防止缩没或无限扩容）
> - `metrics` 两条规则（满足其一即触发）：
>   - `cpu` 用 `Utilization`：**CPU 利用率 > 80%** 就扩容（利用率 = 实际用量 ÷ requests）
>   - `memory` 用 `AverageValue`：**内存均值 > 200M** 就扩容（绝对值，不看利用率）
> - `behavior` 字段（可选）：自定义扩缩容速率/稳定窗口，替代旧版 controller flag，默认值即可满足本实验

> **扩展（v1.36 下调节扩缩容行为）**：如需自定义扩容/缩容的等待时间与速率（替代早期版本的 kube-controller-manager flag），在 HPA 的 `spec` 下添加 `behavior` 字段，例如：
>
> ```yaml
> spec:
>   behavior:
>     scaleDown:
>       stabilizationWindowSeconds: 300   # 缩容稳定窗口，等效旧版 downscale-delay
>       policies:
>       - type: Percent
>         value: 50
>         periodSeconds: 60
>     scaleUp:
>       stabilizationWindowSeconds: 0
>       policies:
>       - type: Pods
>         value: 2
>         periodSeconds: 60
> ```
>
> 本实验使用默认行为即可，无需额外配置。

启用 HPA

```bash
kubectl apply -f podinfo-hpa.yaml
```

查看 HPA 关注 target 和 replica

```bash
kubectl get hpa
```

```bash
root@node1:~/k8slab/perfmon# kubectl get hpa
NAME      REFERENCE            TARGETS                         MINPODS   MAXPODS   REPLICAS   AGE
podinfo   Deployment/podinfo   <unknown>/200M, <unknown>/80%   2         10        0          15s
```

> **观察点**（刚创建时）：
> - `TARGETS` 显示 **`<unknown>`**——HPA 还没采到第一个指标（metrics-server 数据有延迟，等几十秒再看就正常了）
> - `REPLICAS 0`——HPA 还没接管副本数（等第一个指标周期后变成 2）

```bash
kubectl get hpa -o yaml
```

```bash
root@node1:~/k8slab/perfmon# kubectl get hpa -o yaml
apiVersion: v1
items:
- apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  metadata:
    creationTimestamp: "2022-12-22T08:06:28Z"
    name: podinfo
    namespace: default
  spec:
    maxReplicas: 10
    metrics:
    - resource:
        name: memory
        target:
          averageValue: 200M
          type: AverageValue
      type: Resource
    - resource:
        name: cpu
        target:
          averageUtilization: 80
          type: Utilization
      type: Resource
    minReplicas: 2
    scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: podinfo
  status:
    currentReplicas: 3
    desiredReplicas: 3
    currentMetrics:
    - resource:
        current:
          averageValue: "15659008"
        name: memory
      type: Resource
    - resource:
        current:
          averageUtilization: 100
          averageValue: 1m
        name: cpu
      type: Resource
```

> **观察点**（-o yaml，已精简 metadata/conditions）：
> - `spec.metrics`——刚才声明的两条规则原样呈现（memory 200M、cpu 80%）
> - `status.currentMetrics`——**HPA 实际采到的值**：memory `15659008`（≈15Mi）、cpu `100%`（1m）——CPU 利用率已经超过 80% 阈值
> - `status.currentReplicas: 3 / desiredReplicas: 3`——**已经扩到 3 个**（下面用 get pod 验证）

查看 pod，重点关注数量，查看水平扩展效果

```bash
kubectl get pod -o wide | grep podinfo
```

查看 pod 资源使用

```bash
kubectl top pod | grep podinfo
```

```bash
root@node1:~/k8slab/perfmon# kubectl get pod -o wide | grep podinfo
podinfo-6ff67f567b-cqspt    1/1     Running   0          2m48s   10.244.135.13    node3   <none>           <none>
podinfo-6ff67f567b-kvszn    1/1     Running   0          6m5s    10.244.135.14    node3   <none>           <none>
podinfo-6ff67f567b-nkvj4    1/1     Running   0          108s    10.244.104.48    node2   <none>           <none>
podinfo-6ff67f567b-pk75b    1/1     Running   0          6m5s    10.244.104.49    node2   <none>           <none>
podinfo-6ff67f567b-zkjw6    1/1     Running   0          4m33s   10.244.104.50    node2   <none>           <none>
root@node1:~/k8slab/perfmon# kubectl top pod | grep podinfo
podinfo-6ff67f567b-cqspt    1m           15Mi
podinfo-6ff67f567b-kvszn    1m           15Mi
podinfo-6ff67f567b-nkvj4    1m           15Mi
podinfo-6ff67f567b-pk75b    1m           15Mi
podinfo-6ff67f567b-zkjw6    1m           15Mi
```

> **观察点**（扩容已发生）：
> - podinfo Pod 从 2 个变成 **5 个**（`cqspt/nkvj4/zkjw6` 是新增的）——HPA 检测到 CPU 利用率超阈值后自动扩容
> - 新增 Pod 分布在 node2/node3（调度器自动均衡）；每个 Pod 实际只用 1m CPU / 15Mi 内存——**利用率计算的是"相对 requests 的比例"**，requests 只有 1m，所以一点压力就触发扩容（Requests 决定灵敏度，见配置要点）

查看扩展过程

```bash
kubectl describe hpa podinfo
```

```bash
root@node1:~/k8slab/perfmon# kubectl describe hpa podinfo
Name:                                                  podinfo
Namespace:                                             default
Labels:                                                <none>
Annotations:                                           <none>
CreationTimestamp:                                     Thu, 22 Dec 2022 16:06:28 +0800
Reference:                                             Deployment/podinfo
Metrics:                                               ( current / target )
  resource memory on pods:                             15880192 / 200M
  resource cpu on pods  (as a percentage of request):  100% (1m) / 80%
Min replicas:                                          2
Max replicas:                                          10
Deployment pods:                                       7 current / 7 desired
Conditions:
  Type            Status  Reason              Message
  ----            ------  ------              -------
  AbleToScale     True    ReadyForNewScale    recommended size matches current size
  ScalingActive   True    ValidMetricFound    the HPA was able to successfully calculate a replica count from cpu resource utilization (percentage of request)
  ScalingLimited  False   DesiredWithinRange  the desired count is within the acceptable range
Events:
  Type    Reason             Age    From                       Message
  ----    ------             ----   ----                       -------
  Normal  SuccessfulRescale  5m18s  horizontal-pod-autoscaler  New size: 3; reason: cpu resource utilization (percentage of request) above target
  Normal  SuccessfulRescale  3m33s  horizontal-pod-autoscaler  New size: 4; reason: cpu resource utilization (percentage of request) above target
  Normal  SuccessfulRescale  2m33s  horizontal-pod-autoscaler  New size: 5; reason: cpu resource utilization (percentage of request) above target
  Normal  SuccessfulRescale  32s    horizontal-pod-autoscaler  New size: 7; reason: cpu resource utilization (percentage of request) above target
```

> **观察点**（describe hpa，重点看 Events）：
> - `Metrics` 区 `( current / target )`：cpu `100% (1m) / 80%`——**当前已超阈值**
> - `Deployment pods: 7 current / 7 desired`——已扩到 7 个（上限 10）
> - **Events 是扩容过程的"日记"**：`New size: 3 → 4 → 5 → 7`，每次触发原因都是 `cpu utilization above target`——HPA 每个周期重新计算期望副本数，逐步扩容而不是一步到位（默认每 15s 评估一次）

查看 deployment

```bash
kubectl describe deploy podinfo
```

```bash
root@node1:~/k8slab/perfmon# kubectl describe deploy podinfo
Name:                   podinfo
Namespace:              default
CreationTimestamp:      Thu, 22 Dec 2022 16:05:11 +0800
Labels:                 <none>
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               app=podinfo
Replicas:               7 desired | 7 updated | 7 total | 7 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:       app=podinfo
  Annotations:  prometheus.io/scrape: true
  Containers:
   podinfod:
    Image:      stefanprodan/podinfo:2.0.0
    Port:       9898/TCP
    Host Port:  0/TCP
    Limits:
      cpu:     100m
      memory:  256Mi
    Requests:
      cpu:        1m
      memory:     32Mi
    Liveness:     http-get http://:9898/healthz delay=1s timeout=1s period=3s #success=1 #failure=2
    Readiness:    http-get http://:9898/readyz delay=1s timeout=1s period=2s #success=1 #failure=1
    Environment:  <none>
    Mounts:
      /etc/podinfod/metadata from metadata (ro)
  Volumes:
   metadata:
    Type:  DownwardAPI (a volume populated by information about the pod)
    Items:
      metadata.labels -> labels
      metadata.annotations -> annotations
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Progressing    True    NewReplicaSetAvailable
  Available      True    MinimumReplicasAvailable
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  7m36s  deployment-controller  Scaled up replica set podinfo-6ff67f567b to 2
  Normal  ScalingReplicaSet  6m4s   deployment-controller  Scaled up replica set podinfo-6ff67f567b to 3
  Normal  ScalingReplicaSet  4m19s  deployment-controller  Scaled up replica set podinfo-6ff67f567b to 4
  Normal  ScalingReplicaSet  3m19s  deployment-controller  Scaled up replica set podinfo-6ff67f567b to 5
  Normal  ScalingReplicaSet  78s    deployment-controller  Scaled up replica set podinfo-6ff67f567b to 7
```

> **观察点**（describe deploy，对照 HPA）：
> - `Replicas: 7 desired | 7 total | 7 available`——**Deployment 按 HPA 要求的 7 个副本工作**（HPA 只改 replicas，Deployment 负责建 Pod）
> - `RollingUpdateStrategy: 25% max unavailable, 25% max surge`——滚动更新策略（实验 03 内容）
> - Events 里 `ScalingReplicaSet to 2/3/4/5/7`——与 describe hpa 的 `New size` **一一对应**：HPA 决策 → Deployment 执行，完整链路闭环

**清理**

```bash
kubectl delete -f podinfo-hpa.yaml
kubectl delete -f podinfo.yaml
```

> 说明：先删 HPA（停止自动伸缩），再删 Deployment（连带清除全部副本）。

## Lab 3 使用 LimitRange 定义 pod 资源限额

> **目标**：创建 LimitRange 给命名空间内的**每个 Pod/容器**设资源上下限和默认值，并验证超限创建被拒绝。
> **验证概念**：LimitRange 是**命名空间级**的"资源约束器"——它管**单个 Pod**：声明了 `min/max`（硬性上下限）、`default/defaultRequest`（未声明时自动套用）。**任何违反 min/max 的 Pod 创建都会被拒绝**（Forbidden），这是"约定优于配置"的强制版。

使用以下范例创建 limitrange 定义文件

```bash
nano limitrange.yaml
```

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: cpu-min-max-demo-lr
  namespace: default
spec:
  limits:
  - type: Container
    max: # 上限
      cpu: "800m"
      memory: 1Gi
    default: # 默认的limits
      cpu: "800m"
      memory: "500Mi"
    defaultRequest: # 默认的request
      cpu: "500m"
      memory: "500Mi"
    min: # 下限
      cpu: "200m"
      memory: "500Mi"
  - type: PersistentVolumeClaim
    max:
      storage: 2Gi
    min:
      storage: 1Gi
```

> **配置要点**（limitrange.yaml 分两类限制）：
> - `type: Container`（作用于命名空间内所有容器）：
>   - `min/max`：**硬性范围**——每个容器的 cpu 必须在 200m~800m、内存 500Mi~1Gi，**超出即拒绝创建**
>   - `default`（= limits 默认值）/ `defaultRequest`（= requests 默认值）：Pod **没写** resources 时自动套用
> - `type: PersistentVolumeClaim`：PVC 的存储容量限制在 1Gi~2Gi（实验 08 PVC 的强制范围）

创建 limitrange

```bash
kubectl apply -f limitrange.yaml
```

查看 limitrange

```bash
kubectl get limitrange
```

```bash
kubectl describe limitrange cpu-min-max-demo-lr
```

```bash
root@node1:~/k8slab/perfmon# kubectl get limitrange
NAME                  CREATED AT
cpu-min-max-demo-lr   2022-12-22T08:18:22Z
root@node1:~/k8slab/perfmon# kubectl describe limitrange cpu-min-max-demo-lr
Name:                  cpu-min-max-demo-lr
Namespace:             default
Type                   Resource  Min    Max   Default Request  Default Limit  Max Limit/Request Ratio
----                   --------  ---    ---   ---------------  -------------  -----------------------
Container              memory    500Mi  1Gi   500Mi            500Mi          -
Container              cpu       200m   800m  500m             800m           -
PersistentVolumeClaim  storage   1Gi    2Gi   -                -              -
```

> **观察点**（describe limitrange 表格）：
> - 一行一个约束：`Container memory` 行 = min 500Mi / max 1Gi / defaultRequest 500Mi / default 500Mi；cpu 行同理
> - `Max Limit/Request Ratio` 为 `-`——未限制 limits/requests 比值（可省略）
> - 对照 yaml：describe 表格就是把 `min/max/default/defaultRequest` **摊平成行**，一眼可读

使用以下命令行创建 pod 用例

```bash
kubectl run lrpod1 --image=katacoda/docker-http-server
```

查看 pod

```bash
kubectl describe pod lrpod1
```

```bash
    Limits:
      cpu:     800m
      memory:  500Mi
    Requests:
      cpu:        500m
      memory:     500Mi
```

> **观察点**（重点验证"默认值自动套用"）：lrpod1 **没写任何 resources**，但 describe 显示：
> - `Limits: cpu 800m / memory 500Mi`——来自 LimitRange 的 **default**
> - `Requests: cpu 500m / memory 500Mi`——来自 LimitRange 的 **defaultRequest**
> - 这就是 LimitRange 的"强制约定"：**你不写，它替你写**（并保证在 min~max 范围内）

侧重观察 Limits 和 Requests 配置信息

使用以下范例创建 pod

```bash
nano lrpod2.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: lrpod2
  namespace: default
spec:
  containers:
  - image: katacoda/docker-http-server
    name: lrpod2
    resources:
      limits:
        cpu: 800m
        memory: 2Gi
      requests:
        cpu: 100m
        memory: 500Mi
```

> **配置要点**（lrpod2.yaml 故意超限的两个字段）：
> - `requests.cpu: 100m`——**低于 min（200m）**
> - `limits.memory: 2Gi`——**高于 max（1Gi）**
> - 其余字段合规（limits.cpu 800m = max、requests.memory 500Mi = min）——目的：**只触发这两条违规**，方便观察报错

创建 pod

```bash
kubectl apply -f lrpod2.yaml
```

此处应该有报错

```bash
root@node1:~/k8slab/perfmon# kubectl apply -f lrpod2.yaml
Error from server (Forbidden): error when creating "lrpod2.yaml": pods "lrpod2" is forbidden: [minimum cpu usage per Container is 200m, but request is 100m, maximum memory usage per Container is 1Gi, but limit is 2Gi]
```

> **观察点**（Forbidden 报错是 LimitRange 的核心机制）：
> - `Forbidden`——创建被**准入控制（Admission Control）**拒绝，yaml 根本没进集群
> - 报错逐条点名违规项：`minimum cpu usage is 200m, but request is 100m`（CPU 低于下限）、`maximum memory usage is 1Gi, but limit is 2Gi`（内存超上限）
> - 修复思路（报错信息直接给了）：CPU request 提到 ≥200m、内存 limit 降到 ≤1Gi

创建被拒的原因：lrpod2 的 CPU request（100m）低于 LimitRange 下限（200m），且内存 limit（2Gi）超过上限（1Gi）。需要把 CPU request 提到 ≥200m、内存 limit 降到 ≤1Gi。

修改 lrpod2.yaml

```bash
nano lrpod2.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: lrpod2
  namespace: default
spec:
  containers:
  - image: katacoda/docker-http-server
    name: lrpod2
    resources:
      limits:
        cpu: 800m
        memory: 1Gi # 调整到内存上限以内
      requests:
        cpu: 400m # 调整到cpu下限之上
        memory: 500Mi
```

> **配置要点**（修改的两处）：
> - `limits.memory: 2Gi → 1Gi`——降到 max（1Gi）以内
> - `requests.cpu: 100m → 400m`——提到 min（200m）之上（且 ≤ max 800m）
> - 其他字段不动（本来就在范围内）

再次创建 pod

```bash
kubectl apply -f lrpod2.yaml
```

```bash
kubectl describe pod lrpod2
```

```bash
    Limits:
      cpu:     800m
      memory:  1Gi
    Requests:
      cpu:        400m
      memory:     500Mi
```

> **观察点**：这次创建成功（无报错），describe 显示 `Limits 800m/1Gi`、`Requests 400m/500Mi`——**全部落在 min~max 范围内**。LimitRange 的约束闭环：超限被拒 → 修正 → 通过。

> 说明：lrpod1/lrpod2 先**保留**——Lab 4 的 ResourceQuota 需要它们占用配额来演示"超配额拒绝"，Lab 5 末尾统一清理。

侧重观察 `Limits` 和 `Requests` 配置信息

## Lab 4 使用 ResourceQuota 定义资源使用配额

> **目标**：创建 ResourceQuota 限制命名空间内资源**总量**，验证超配额创建被拒，释放资源后可再创建。
> **验证概念**：ResourceQuota 管的是**整个命名空间的累计用量**（对比 Lab 3 LimitRange 管单个 Pod）：所有 Pod 的 requests/limits **加起来**不能超过配额。本实验配额较小（cpu 1 核、内存 1Gi），默认命名空间已有 lrpod1/lrpod2 占用，所以新 Pod 很快撞到配额。

使用以下范例创建 ResourceQuota 定义文件

```bash
nano resourcequota.yaml
```

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: mem-cpu-demo
spec:
  hard: # 强制约束
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
```

> **配置要点**（resourcequota.yaml）：
> - `spec.hard`——配额上限（硬约束），4 条：`requests.cpu ≤ 1 核`、`requests.memory ≤ 1Gi`、`limits.cpu ≤ 2 核`、`limits.memory ≤ 2Gi`
> - 单位说明：`"1"`（字符串）= 1 核 CPU；`1Gi` = 1GiB 内存
> - 注意是**总量**：不是每个 Pod，而是命名空间里**所有 Pod 加总**（与 LimitRange 的单 Pod 限额是互补的两层）

创建 resourcequota

```bash
kubectl apply -f resourcequota.yaml
```

查看 resourcequota

```bash
kubectl get resourcequota
```

```bash
kubectl describe resourcequota mem-cpu-demo
```

```bash
root@node1:~/k8slab/perfmon# kubectl get resourcequota
NAME           AGE   REQUEST                                             LIMIT
mem-cpu-demo   8s    requests.cpu: 900m/1, requests.memory: 1000Mi/1Gi   limits.cpu: 1600m/2, limits.memory: 1524Mi/2Gi
root@node1:~/k8slab/perfmon# kubectl describe resourcequota mem-cpu-demo
Name:            mem-cpu-demo
Namespace:       default
Resource         Used    Hard
--------         ----    ----
limits.cpu       1600m   2
limits.memory    1524Mi  2Gi
requests.cpu     900m    1
requests.memory  1000Mi  1Gi
```

> **观察点**（describe 的 `Used / Hard` 两列是核心）：
> - `Used`——**命名空间当前累计用量**：requests.cpu 已用 900m（配额 1）、requests.memory 1000Mi（配额 1Gi）——**接近上限**（来自 lrpod1/lrpod2）
> - `Hard`——配额上限。Used/Hard 对比一眼看出"还剩多少"
> - 结论：requests.memory 1000Mi/1Gi 已占 98%——再建一个 500Mi 的 Pod 就会超

重点关注 `Used`

创建pod

```bash
kubectl run lrpod3 --image=katacoda/docker-http-server
```

```bash
root@node1:~/k8slab/perfmon# kubectl run lrpod3 --image=katacoda/docker-http-server
Error from server (Forbidden): pods "lrpod3" is forbidden: exceeded quota: mem-cpu-demo, requested: limits.cpu=800m,requests.cpu=500m,requests.memory=500Mi, used: limits.cpu=1600m,requests.cpu=900m,requests.memory=1000Mi, limited: limits.cpu=2,requests.cpu=1,requests.memory=1Gi
```

> **观察点**（`exceeded quota` 报错解读）：
> - `requested`——新 Pod 想要的：requests.cpu 500m、requests.memory 500Mi（来自 LimitRange 的默认值！）
> - `used`——当前已用：requests.cpu 900m、requests.memory 1000Mi
> - `limited`——配额上限：requests.cpu 1、requests.memory 1Gi
> - **900m + 500m > 1 核、1000Mi + 500Mi > 1Gi**——任何一个维度超了就整体拒绝（`Forbidden`），**多个约束对象叠加生效**：LimitRange 管单 Pod、ResourceQuota 管总量，两层都拦

观察到 `exceeded quota` 报错

删除 lrpod1

```bash
kubectl delete pod lrpod1
```

再次查看 resourcequota

```bash
kubectl describe resourcequota mem-cpu-demo
```

```bash
root@node1:~/k8slab/perfmon# kubectl describe resourcequota mem-cpu-demo
Name:            mem-cpu-demo
Namespace:       default
Resource         Used   Hard
--------         ----   ----
limits.cpu       800m   2
limits.memory    1Gi    2Gi
requests.cpu     400m   1
requests.memory  500Mi  1Gi
```

> **观察点**：删除 lrpod1 后，`Used` 大幅下降（requests.cpu 900m→400m、requests.memory 1000Mi→500Mi）——**配额是实时统计的**，删 Pod 立即释放配额。现在 requests 只剩 400m/500Mi，新 Pod 有空间了。

重点关注 `Used`

创建 pod

```bash
kubectl run lrpod3 --image=katacoda/docker-http-server
```

```bash
root@node1:~/k8slab/perfmon# kubectl run lrpod3 --image=katacoda/docker-http-server
pod/lrpod3 created
```

> **观察点**：这次 `pod/lrpod3 created`——释放配额后创建成功。配额机制的完整闭环：**创建撞配额（拒绝）→ 释放资源（删除 Pod）→ 重新创建（成功）**。生产上这就是"多租户隔离"的抓手：每个团队一个命名空间 + 配额，防止互相挤占。

正常创建

**清理**

```bash
kubectl delete pod lrpod3
kubectl delete pod lrpod2
kubectl delete -f limitrange.yaml
kubectl delete -f resourcequota.yaml
```

> 说明：删除全部实验 Pod + LimitRange + ResourceQuota，default 命名空间恢复无约束状态（注意 lrpod1 前面已删）。

## Lab 5 HPA 稳定窗口观察（推荐）

> **目标**：实测 HPA 的稳定窗口——停止压测后副本**不会立即缩**（默认缩容稳定窗口 5 分钟）。
> **验证概念**：教材 §7.2.3——HPA 用稳定窗口防抖动：**扩容快（窗口短）、缩容慢（默认 300s）**——避免指标波动导致副本数震荡。

```bash
# ① 创建 HPA（复用 Lab 2 的 podinfo 或新建简单应用）
kubectl create deployment cpu-app --image=busybox --replicas=1 --dry-run=client -o yaml > cpu-app.yaml
cat > cpu-app.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cpu-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cpu-app
  template:
    metadata:
      labels:
        app: cpu-app
    spec:
      containers:
      - name: busybox
        image: busybox
        command: ["/bin/sh", "-c", "sleep 3600"]
        resources:
          requests: {cpu: "100m"}
EOF
kubectl apply -f cpu-app.yaml
kubectl autoscale deployment cpu-app --cpu=50% --min=1 --max=5
kubectl get hpa cpu-app        # TARGETS: 0%/50%

# ② 制造 CPU 压力：对 cpu-app 的副本压测（HPA 只统计目标 Deployment 副本的指标，独立 Pod 无效！）
kubectl exec deploy/cpu-app -- sh -c "while true; do :; done >/dev/null 2>&1 &"   # 容器内后台压测（重定向防卡住）
sleep 90                        # 压 90 秒
kubectl get hpa cpu-app         # TARGETS 上升 → 副本扩容（扩容较快）

# ③ 停止压测，观察缩容节奏
kubectl exec deploy/cpu-app -- pkill -f "while true" || true     # 杀掉容器内压测进程
kubectl get hpa cpu-app -w     # TARGETS 回 0%，但 REPLICAS 保持 —— 等 5 分钟稳定窗口
```

```bash
root@node1:~/k8slab/perfmon# kubectl get hpa cpu-app -w
NAME      REFERENCE        TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
cpu-app   Deployment/cpu-app 130%/50%  1         5         3          2m
cpu-app   Deployment/cpu-app 0%/50%   1         5         3          4m
cpu-app   Deployment/cpu-app 0%/50%   1         5         2          9m   ← 5 分钟后才缩
```

> **观察点**（稳定窗口，教材 §7.2.3）：压测时 TARGETS 130% → 副本扩到 3（**扩容快**）；停止压测后 TARGETS 归 0%，但 **REPLICAS 保持 3 约 5 分钟**（缩容稳定窗口默认 300s）——**缩容比扩容谨慎**（教材 §7.2.3）：扩错最多多花钱，缩错会扛不住流量。生产可配 `behavior.scaleDown.stabilizationWindowSeconds` 调整（教材 §7.2.4）。

**清理**

```bash
kubectl delete deployment cpu-app
kubectl delete hpa cpu-app
kubectl exec deploy/cpu-app -- pkill -f "while true" || true   # 确保压测已停
```

## Lab 6 KEDA 事件驱动扩缩（可选·进阶）

> **目标**：安装 KEDA，体验"消息队列堆积触发扩容"（HPA 之外的事件驱动弹性）。
> **验证概念**：教材 §7.3.4——KEDA 把**外部系统指标**（队列长度/吞吐）变成 HPA 能用的指标；`ScaledObject` 声明"指标超过阈值 → 扩到 N 个"。

> ⚠️ 需要安装 KEDA（Helm 一键装，实验 13 知识）+ 一个消息队列（本实验用 Redis 模拟"队列长度"）。**国内网络提示**：KEDA 镜像在 ghcr.io（`ghcr.io/kedacore/*`），国内无公开加速、实测拉取失败——本 Lab 为可选·进阶，网络受限环境可**跳过**（概念见教材 §7.3.4），或自行配置 ghcr 代理/镜像后完成。

```bash
# ① 安装 KEDA
helm repo add kedacore https://kedacore.github.io/charts
helm upgrade --install keda kedacore/keda --namespace keda --create-namespace
kubectl get pods -n keda | grep -E "operator|metrics"   # 就绪

# ② 部署 Redis（模拟消息队列）+ 消费端应用
kubectl create deployment redis --image=redis:7
kubectl expose deployment redis --port=6379

# ③ 创建 ScaledObject：Redis 列表长度 > 5 时扩容
cat > redis-scaledobject.yaml <<'EOF'
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: redis-consumer
spec:
  scaleTargetRef:
    name: consumer            # 扩哪个 Deployment
  minReplicaCount: 1
  maxReplicaCount: 5
  triggers:
  - type: redis
    metadata:
      address: redis.default.svc:6379
      listName: queue
      listLength: "5"         # 队列长度超 5 就扩容
EOF
kubectl apply -f redis-scaledobject.yaml
kubectl get scaledobject
```

> **配置要点**（ScaledObject，教材 §7.3.4）：`scaleTargetRef` 指定被扩缩的 Deployment；`triggers` 声明外部指标源（redis 队列长度）；超过 `listLength: 5` → 自动扩到 max。**KEDA 内置 70+ scaler**（Kafka/RabbitMQ/HTTP 等）——HPA 只能看 CPU/内存，KEDA 补上"事件驱动"维度。

```bash
# ④ 往队列塞数据，观察扩容
kubectl exec deploy/redis -- redis-cli lpush queue $(seq 1 50 | tr '\n' ' ')
sleep 30
kubectl get hpa | grep consumer    # KEDA 自动创建的 HPA，REPLICAS 上升
kubectl get pods | grep consumer
```

> **观察点**：队列塞入 50 条消息后，consumer 副本自动增多（KEDA 把"队列长度"变成 HPA 指标）——**事件驱动弹性**（教材 §7.3.4）：消息积压自动加消费者、处理完自动缩回——消息类工作负载的标准弹性方案。

**清理**

```bash
kubectl delete scaledobject redis-consumer
kubectl delete deployment redis consumer
kubectl delete svc redis
helm uninstall keda -n keda && kubectl delete ns keda
```
## 本章小结

本章通过 6 个实验，掌握了 Kubernetes 的资源观测与治理体系：**先能看见（metrics）→ 再能自动扩（HPA）→ 最后能管住（requests/limits + LimitRange/ResourceQuota）**。

| 实验 | 验证的知识点 | 关键概念 | 级别 |
|---|---|---|---|
| Lab 1 安装 metrics-server | 采集节点/Pod 指标；`kubectl top` 查看实时用量 | metrics-server、`--kubelet-insecure-tls`、top/sort/awk 命令链 | 必做 |
| Lab 2 启用 HPA | 按 CPU/内存指标自动扩缩容（2~10） | autoscaling/v2、scaleTargetRef、Utilization/AverageValue、behavior | 必做 |
| Lab 3 使用 LimitRange | 命名空间内**单 Pod** 资源上下限与默认值 | min/max、default/defaultRequest、Forbidden 拒绝 | 必做 |
| Lab 4 使用 ResourceQuota | 命名空间**总量**配额，超限拒绝、释放后恢复 | hard、Used/Hard、exceeded quota | 必做 |
| Lab 5 HPA 稳定窗口观察 | 停止压测后副本不立即缩，5 分钟稳定窗口实测 | stabilizationWindowSeconds、扩容快缩容慢 | 推荐 |
| Lab 6 KEDA 事件驱动扩缩 | 队列堆积自动扩容、处理完自动缩回 | ScaledObject、triggers、redis scaler | 可选·进阶 |
**核心认知**：
1. **观测是第一步**：`kubectl top`（metrics-server）是所有资源决策的数据来源——HPA 依赖它、排障靠它；装好后先跑 `kubectl top node` 建立"集群健康状况"直觉
2. **HPA 扩的是副本数，不是资源**：HPA 只改 Deployment 的 replicas（控制器执行），Pod 模板不动；`requests` 写得越小越敏感（利用率 = 实际 ÷ requests）
3. **单 Pod 约束 → 总量约束**：`requests/limits`（Pod 自身）→ `LimitRange`（命名空间内单 Pod 强制上下限+默认值）→ `ResourceQuota`（命名空间总量）——三层从微观到宏观，逐层收紧
4. **拒绝机制是亮点**：LimitRange/ResourceQuota 的 `Forbidden`/`exceeded quota` 报错**直接告诉你缺什么**——"minimum cpu is 200m, but request is 100m"，照报错改即可

**与后续章节的衔接**：
- HPA/requests/limits → 生产容量规划、成本控制的核心依据
- metrics-server → 监控体系（Prometheus/Grafana）的扩展基础
- 图形化管理入口（dashboard 安装 + SA/Token 登录）→ **实验 09 Lab 6 综合演练**（SA + RBAC + Token 安全链路）

