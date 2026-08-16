# 解析Pod

## 实验准备

- **前置条件**：已完成 实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）
- **公共基础**：kubectl 命令体系、yaml 语法、命名空间、标签等基础见 实验 01 「Kubectl 基础与公共操作」
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，**无需克隆任何外部仓库**；按 Lab 中的 `nano xxx.yaml` 步骤创建文件即可

> ℹ️ 各 Lab 中的终端输出为参考示例（基于本手册约定的 192.168.0.x 环境），实际 Pod IP、节点分布、AGE 等会因环境不同而不同，关注输出**结构**而非具体数值。

**实验分级**：

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 极简创建 pod | 两个必填属性；Pod 独立 IP | 必做 |
| Lab 2 创建多容器 pod | 多容器共享 Pod IP/生命周期 | 必做 |
| Lab 3 使用 Init 容器完成初始化 | init 顺序执行、等依赖 | 必做 |
| Lab 4 定义映像拉取策略 | 三种 imagePullPolicy | 必做 |
| Lab 5 注入环境变量 | env 注入方式 | 必做 |
| Lab 6 定义 pod 执行的任务 | Job 一次性任务语义 | 必做 |
| Lab 7 增加标签和注解 | 标签/注解用途 | 必做 |
| Lab 8 Pod 健康检查（探针） | liveness/readiness/startup | 必做 |
| Lab 9 容器生命周期钩子 | postStart/preStop 与优雅终止 | 必做 |
| Lab 10 Pod 资源请求与限制 | requests/limits 基础 | 必做 |
| Lab 11 sidecar 模式实战 | 边车容器扩展主容器 | 推荐 |
| Lab 12 QoS 等级观察 | Guaranteed/Burstable/BestEffort | 推荐 |
## Lab 1 极简创建 pod

> **目标**：用命令行创建一个最小 Pod，再用 yaml 文件创建一个 Pod，并用 Pod IP 访问其服务。
> **验证概念**：Pod 的两个必填属性（`name` 与 `image`）；Pod 拥有独立 IP（10.244.x.x）；kubectl 命令式（run）与声明式（apply）两种创建方式。

使用命令行创建pod，注意两个必须的属性名称和映像

```bash
kubectl run nginx --image=nginx
```

查看pod

```bash
kubectl get pods
```

```bash
root@node1:~/k8slab# kubectl get pods
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          97s
```

> **观察点**：`STATUS=Running` 表示 Pod 创建成功；`1/1` 表示 1 个容器中有 1 个就绪。

观测其他属性，比如 ip 地址，所在节点

```bash
kubectl get pods -o wide
```

```bash
NAME    READY   STATUS    RESTARTS   AGE    IP             NODE    NOMINATED NODE   READINESS GATES
nginx   1/1     Running   0          116s   10.244.135.2   node3   <none>           <none>
```

> **观察点**：`IP` 是 Pod 在集群内的独立 IP（10.244.x.x 网段，来自 CNI 分配）；`NODE` 是 Pod 被调度到的节点（本例 node3）。**Pod 之间靠这个 IP 互通**，这是后续 Service 的基础。

删除现有 pod，准备另起炉灶

```bash
kubectl delete pod nginx
```

```bash
root@node1:~/k8slab# kubectl delete pod nginx
pod "nginx" deleted
```

创建yaml文件，使用最简配置

```bash
nano nginx.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx
```

> **说明**：这是 Pod 的最简 yaml——`apiVersion: v1` + `kind: Pod`（实验 01 公共基础 §3 讲过如何用 `api-resources`/`explain` 查这些）；`metadata.name` 与 `containers[].image` 是唯二必填项，对应命令行的 `--image` 和 Pod 名称。

创建pod

```bash
kubectl apply -f nginx.yaml
```

查看pod

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/pod# kubectl get pod -o wide
NAME    READY   STATUS    RESTARTS   AGE   IP             NODE    NOMINATED NODE   READINESS GATES
nginx   1/1     Running   0          92s   10.244.135.3   node3   <none>           <none>
```

> **观察点**：用 yaml 创建的 Pod 与命令行创建的完全等价（同样有独立 IP、被调度到节点）——两种方式殊途同归，yaml 更适合需要复杂配置的场景。

使用pod ip地址访问pod

```bash
curl 10.244.135.3
```

```bash
root@node1:~/k8slab/pod# curl 10.244.135.3
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
<h1>Welcome to nginx!</h1>
...（HTML 内容省略，看到 nginx 欢迎页即可）
```

> **观察点**：`curl <Pod IP>` 返回了 nginx 欢迎页——**验证 Pod 内的服务可通过 Pod IP 访问**。这是 Pod 网络的基础：Pod IP 在集群内可达（后续 实验 04 会讲如何通过 Service 暴露给更多场景）。

查看 pod 详细信息,分段查看重点字段内容

```bash
kubectl describe pod nginx
```

```bash
root@node1:~/k8slab/pod# kubectl describe pod nginx
Name:         nginx
Namespace:    default
Node:         node3/192.168.0.13
Status:       Running
IP:           10.244.135.3
Containers:
  nginx:
    Image:          nginx
    State:          Running
    Ready:          True
    Restart Count:  0
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  3m41s  default-scheduler  Successfully assigned default/nginx to node3
  Normal  Pulling    3m41s  kubelet            Pulling image "nginx"
  Normal  Started    3m26s  kubelet            Started container nginx
```

> **观察点**：`describe` 是排查 Pod 问题的核心命令（输出已省略 Annotations/Volumes/Tolerations 等次要字段）。重点看：
> - `Node`：Pod 实际运行在哪个节点
> - `IP`：Pod 的集群内 IP
> - `Containers → State/Ready`：容器是否 Running、Ready
> - `Conditions`：Init/Ready/ContainersReady/PodScheduled 是否全部 True
> - `Events`：Pod 的生命周期事件（调度 → 拉镜像 → 创建 → 启动），**排查卡住的问题时看 Events 的报错**

查看pod yaml文件

```bash
kubectl get pods -o yaml
```
```bash
root@node1:~/k8slab/pod# kubectl get pods -o yaml
apiVersion: v1
items:
- apiVersion: v1
  kind: Pod
  metadata:
    name: nginx
    namespace: default
  spec:
    containers:
    - image: nginx
      imagePullPolicy: Always   # 默认值：未指定时为 Always（latest tag）
      name: nginx
      resources: {}
    dnsPolicy: ClusterFirst      # 默认值：使用集群 DNS
    restartPolicy: Always        # 默认值：总是重启
    nodeName: node3              # 调度器填写的实际节点
    serviceAccountName: default
    ...（其余默认字段省略：tolerations/volumes/securityContext 等）
  status:
    conditions:
    - type: Ready
      status: "True"
    phase: Running
    podIP: 10.244.135.3
```

> **观察点**：对比你写的 nginx.yaml 与系统的完整定义——Kubernetes 为未指定的字段**自动填了默认值**（`imagePullPolicy: Always`、`dnsPolicy: ClusterFirst`、`restartPolicy: Always` 等），并在 `status` 记录实际状态（节点、IP、Ready）。这就是声明式 API 的核心：**你声明"要什么"，系统补齐"怎么实现"**。

## Lab 2 创建多容器 pod

> **目标**：用一个 yaml 创建包含 3 个容器（nginx/redis/memcached）的 Pod，并分别进入不同容器执行命令。
> **验证概念**：一个 Pod 内可运行多个容器（共享网络/IP/生命周期）；`kubectl exec -c <容器名>` 指定进入哪个容器，不指定时默认进入第一个。

使用示例文件创建yaml文件

```bash
nano many-pods.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: many-pods
spec:
  containers:
  - name: nginx
    image: nginx
  - name: redis # 多容器
    image: redis
  - name: memcached # 多容器
    image: memcached
```

> **配置要点**：与 Lab 1 的单容器 Pod 相比，唯一的区别是 `spec.containers` 下**并列列出多个容器**（nginx/redis/memcached）——每个容器有自己的 name/image，共享同一个 Pod 的网络/IP 与生命周期。多容器模式典型场景：sidecar（如日志采集伴随主应用）。

创建pod

```bash
kubectl apply -f many-pods.yaml
```

查看pod

```bash
kubectl get pods
```

```bash
root@node1:~/k8slab/pod# kubectl get pods
NAME        READY   STATUS    RESTARTS   AGE
many-pods   3/3     Running   0          77s
nginx       1/1     Running   0          19m
```

> **观察点**：`many-pods` 的 READY 是 **3/3**——3 个容器全部就绪。**注意 3 个容器共享同一个 Pod IP**（一个 Pod 一个 IP，多个容器共用），这是多容器模式（如 sidecar）的基础。

查看pod详细信息

```bash
kubectl describe pod many-pods
```


```bash
root@node1:~/k8slab/pod# kubectl describe pod many-pods
Name:         many-pods
Namespace:    default
Node:         node2/192.168.0.12
Status:       Running
IP:           10.244.104.3
Containers:
  nginx:
    Image:          nginx
    State:          Running
    Ready:          True
  redis:
    Image:          redis
    State:          Running
    Ready:          True
  memcached:
    Image:          memcached
    State:          Running
    Ready:          True
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  4m18s  default-scheduler  Successfully assigned default/many-pods to node2
  Normal  Started    4m9s   kubelet            Started container nginx
  Normal  Started    3m51s  kubelet            Started container redis
  Normal  Started    3m49s  kubelet            Started container memcached
```

> **观察点**：与 Lab 1 的单容器 describe 对比，多容器 Pod 的 describe 关键差异（输出已省略 Container ID/Mounts 等次要字段）：
> - `Containers` 下列出 **3 个容器**（nginx/redis/memcached），每个都有独立的 Image/State/Ready
> - 3 个容器共用一个 `IP: 10.244.104.3`（Pod 级 IP，容器共享）
> - `Events` 里每个容器都有 Started 记录（3 条），可看到容器**依次**被创建
> - 排查多容器问题（如某容器 CrashLoopBackOff）时，在 `Containers` 段找到对应容器名看它的 State 和 Restart Count

进入pod中的容器

```bash
kubectl exec -it many-pods -- /bin/bash
```

```bash
root@node1:~/k8slab/pod# kubectl exec -it many-pods -- /bin/bash
Defaulted container "nginx" out of: nginx, redis, memcached
root@many-pods:/#
```

> **观察点**：`Defaulted container "nginx"`——**没指定容器时，exec 默认进入 yaml 里定义的第一个容器**（nginx）。

退出nginx容器上下文

```text
exit
```

加-c参数进入redis容器

```bash
kubectl exec -it many-pods -c redis -- /bin/bash
```

> **说明**：`-c redis` 指定进入 redis 容器（Pod 内有多个容器时必须用 `-c` 指定才能进入非第一个容器）。

在redis容器上下文执行redis-cli

```bash
redis-cli
```

退出redis容器上下文，需执行两次

```bash
exit
```

```bash
root@node1:~/k8slab/pod# kubectl exec -it many-pods -c redis -- /bin/bash
root@many-pods:/data# redis-cli
127.0.0.1:6379> exit
root@many-pods:/data# exit
exit
```

> **观察点**：`redis-cli` 直接进入了 redis 交互命令行（`127.0.0.1:6379>`）——证明 `-c redis` 确实进入了 redis 容器，且该容器内 redis 服务正在运行。

加-c参数进入memcached容器

```bash
kubectl exec -it many-pods -c memcached -- /bin/bash
```

在memcached容器上下文执行命令

```bash
memcached --help
```

```bash
root@node1:~/k8slab/pod# kubectl exec -it many-pods -c memcached -- /bin/bash
memcache@many-pods:/$ memcached --help
memcached 1.6.12
-p, --port=<num>          TCP port to listen on (default: 11211)
-U, --udp-port=<num>      UDP port to listen on (default: 0, off)
-s, --unix-socket=<file>  UNIX socket to listen on (disables network support)
...（memcached 参数列表省略，此处仅验证能进入容器并执行命令）
```

> **观察点**：`-c memcached` 成功进入 memcached 容器并执行了命令（提示符变为 `memcache@many-pods`）——结合前两步，验证了**通过 `-c` 可进入多容器 Pod 的任意指定容器**。

退出memcache容器上下文

```text
exit
```

```bash
memcache@many-pods:/$ exit
exit
```

清理pod

```bash
kubectl delete -f many-pods.yaml
```

## Lab 3 使用 Init 容器完成初始化

> **目标**：用 `initContainers` 在主容器启动前执行初始化任务（写配置、等依赖），观察"先 init 后主容器"的执行顺序。
> **验证概念**：**Init 容器是"一次性准备容器"**——按声明顺序**逐个执行**，每个必须**成功退出（exit 0）**后下一个才启动，**全部完成**后主容器才启动；任何一个 init 失败，整个 Pod 会反复重启 init 直到成功（主容器永远不启动）。典型场景：等数据库就绪、预写配置文件、下载初始化数据（CKA 高频考点）。

使用示例文件创建yaml文件

```bash
nano init-pod.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-pod
spec:
  initContainers:          # init 容器（先于 containers 执行，全部成功后退出）
  - name: init-write       # init 1：向共享卷写初始化文件
    image: busybox
    command: ["/bin/sh", "-c", "echo 'init data ready' > /work/init.txt && echo init-write done"]
    volumeMounts:
    - name: workdir
      mountPath: /work
  - name: init-wait        # init 2：模拟"等待依赖就绪"（如数据库）
    image: busybox
    command: ["/bin/sh", "-c", "sleep 3 && echo init-wait done"]
  containers:
  - name: main             # 主容器：只有两个 init 都成功后才会启动
    image: nginx
    volumeMounts:
    - name: workdir
      mountPath: /usr/share/nginx/html
  volumes:
  - name: workdir
    emptyDir: {}           # 共享卷：init 写、主容器读
```

> **配置要点**（initContainers 的关键点）：
> - `spec.initContainers` 与 `spec.containers` **平级**——结构完全一样（image/command/volumeMounts），只是"先执行、执行完就退出"
> - **顺序执行**：`init-write` 先跑（写完退出），`init-wait` 再跑（sleep 3 后退出），最后才轮到 `main`
> - **共享卷传数据**：init 容器把结果写进 `emptyDir` 共享卷（`/work`），主容器在 `/usr/share/nginx/html` 读取——这是 init 容器最常见的用法（"初始化数据"交给主应用）

创建pod

```bash
kubectl apply -f init-pod.yaml
```

查看pod（重点观察 STATUS 的 Init 阶段）

```bash
kubectl get pods
```

```bash
root@node1:~/k8slab/pod# kubectl apply -f init-pod.yaml
pod/init-pod created
root@node1:~/k8slab/pod# kubectl get pods
NAME        READY   STATUS     RESTARTS   AGE
init-pod    0/1     Init:0/2   0          4s
```

> **观察点**（STATUS 揭示执行阶段）：
> - 刚创建时 `Init:0/2`——**0/2 个 init 容器完成**（2 个 init 正在排队执行）
> - 几秒后变成 `Init:1/2`（init-write 完成）→ `Init:2/2`（init-wait 完成）→ `Running`（主容器启动）
> - `READY 0/1` 直到主容器就绪——**Pod 的 Ready 只算主容器**，init 阶段永远 0/1

等 init 完成后再看

```bash
kubectl get pods
```

```bash
root@node1:~/k8slab/pod# kubectl get pods
NAME        READY   STATUS    RESTARTS   AGE
init-pod    1/1     Running   0          12s
```

> **观察点**：`1/1 Running`——两个 init 全部成功退出，主容器 nginx 启动完成。**对比刚才的 `Init:0/2`，STATUS 的变化就是执行顺序的直观证据**。

查看详细信息确认 init 容器状态

```bash
kubectl describe pod init-pod
```

```bash
root@node1:~/k8slab/pod# kubectl describe pod init-pod
Name:         init-pod
Namespace:    default
Node:         node2/192.168.0.12
Status:       Running
Init Containers:
  init-write:
    Image:          busybox
    State:          Terminated
      Reason:       Completed
      Exit Code:    0
  init-wait:
    Image:          busybox
    State:          Terminated
      Reason:       Completed
      Exit Code:    0
Containers:
  main:
    Image:          nginx
    State:          Running
    Ready:          True
```

> **观察点**（describe 的 Init Containers 段）：
> - 两个 init 容器状态都是 **`Terminated / Completed / Exit Code: 0`**——执行完毕且成功退出（init 容器不常驻，跑完就结束）
> - 主容器 `main` 状态 `Running`——**init 全部成功后它才启动**
> - 如果某个 init 容器 `Exit Code: 非0` 或 `Error`——Pod 会停在 Init 阶段反复重启它，主容器永远不启动（排查时看这段）

进入主容器验证 init 写入的数据

```bash
kubectl exec -it init-pod -- cat /usr/share/nginx/html/init.txt
```

```bash
root@node1:~/k8slab/pod# kubectl exec -it init-pod -- cat /usr/share/nginx/html/init.txt
init data ready
```

> **观察点**：主容器里读到了 `init data ready`——**init 容器通过共享卷把数据交给了主容器**。这就是 init 容器的价值：主应用启动时，它的环境（配置、数据、依赖）已被 init 容器准备好。

清理pod

```bash
kubectl delete -f init-pod.yaml
> **扩展：等依赖的标准写法（可选）**：生产上"等数据库就绪"不靠固定 sleep（sleep 3 不够就失败），而是**循环探测直到成功**——失败就 sleep 重试，直到依赖可用或超时：

```yaml
  initContainers:
  - name: init-wait-db        # 循环探测：直到能连上 mydb.default.svc 3306 才退出
    image: busybox
    command: ["/bin/sh", "-c",
      "until nc -z mydb.default.svc 3306; do echo 'waiting for db...'; sleep 2; done"]
```

> **观察点**：init 容器 `until ... done` 循环——依赖没就绪就无限重试（Pod 停在 `Init:1/2`），数据库一好立刻退出、主容器启动。**对比固定 sleep**：sleep 是猜时间（可能不够/浪费），循环探测是"等真就绪"——CKA 常考、生产必用。

```

## Lab 4 定义映像拉取策略

> **目标**：通过 `imagePullPolicy` 控制镜像拉取时机，并用 yaml 定义一个固定策略的 Pod。
> **验证概念**：三种拉取策略——`Always`（每次启动都拉取）、`IfNotPresent`（本地没有才拉取，默认）、`Never`（只用本地镜像，不拉取）。tag 为 `latest` 或无 tag 时默认 `Always`，有明确版本号时默认 `IfNotPresent`。

使用示例文件创建yaml文件

```bash
nano nginx-imagePullPolicy.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-imagepullpolicy
spec:
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: Always # 拉取策略
```

> **配置要点**：`spec.containers[].imagePullPolicy` 定义镜像拉取时机——`Always`（每次启动都从仓库拉取）、`IfNotPresent`（本地没有才拉取，默认）、`Never`（只用本地镜像）。本实验显式设为 `Always` 以便观察拉取行为；若不设置，tag 为 `latest` 时默认 Always、有版本号时默认 IfNotPresent（Lab 3 验证概念讲过）。

创建pod

```bash
kubectl apply -f nginx-imagePullPolicy.yaml
```

查看pod

```bash
kubectl get pods -o wide
```

> **观察点**：Pod 正常 Running 即表示拉取策略生效。想验证 `Always` 的实际效果，可 `kubectl delete pod` 后再 `apply`，观察 kubelet 重新拉取镜像（`kubectl describe pod` 的 Events 里有 `Pulling image` / `Pulled` 记录）。


```bash
kubectl delete -f nginx-imagePullPolicy.yaml
```

## Lab 5 注入环境变量

> **目标**：用命令行（`--env`）向容器注入环境变量，并进入容器验证变量生效。
> **验证概念**：环境变量是给容器传递配置（密码、地址、开关等）的常用方式；Kubernetes 在创建容器时注入，容器内 `env` 可见。

先看宿主机（node1）的环境变量，作为对比基准：

```bash
env | head -20
```

```text
SHELL=/bin/bash
PWD=/root/k8slab/pod
LOGNAME=root
HOME=/root
LANG=en_US.UTF-8
SSH_CONNECTION=192.168.0.72 61498 192.168.0.11 22
USER=root
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
...
```

> **观察点**：宿主机 env 是操作系统的变量。接下来对比容器内的 env——Kubernetes 会自动注入集群相关信息（KUBERNETES_SERVICE_* 等），我们手动注入的变量也会出现在其中。

进入 nginx pod 查看容器默认 env（未注入时）：

```bash
kubectl exec -it nginx -- env | head -10
```

```text
KUBERNETES_SERVICE_PORT_HTTPS=443
KUBERNETES_SERVICE_PORT=443
HOSTNAME=nginx
PWD=/
HOME=/root
KUBERNETES_PORT_443_TCP=tcp://10.96.0.1:443
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
NGINX_VERSION=1.21.5
```

> **观察点**：容器内自带 KUBERNETES_SERVICE_*、HOSTNAME、NGINX_VERSION 等变量（镜像 + 集群自动注入），但**没有** mysqlhost 之类——下面手动注入。

使用命令行创建带环境变量的 pod（`--env` 可重复指定多个变量）

```bash
kubectl run nginx-env --image=nginx --env=mysqlhost=10.96.0.110 --env=mysqlport=3306 --env=mysqldb=wordpress
```

> 等价 yaml 写法（env 字段在 `spec.containers[].env` 下）：
> ```yaml
> spec:
>   containers:
>   - name: nginx
>     image: nginx
>     env:
>     - name: mysqlhost
>       value: "10.96.0.110"
>     - name: mysqlport
>       value: "3306"
>     - name: mysqldb
>       value: "wordpress"
> ```

查看 pod 状态

```bash
kubectl get pod nginx-env
```

进入 pod 容器，验证注入的变量：

```bash
kubectl exec -it nginx-env -- env | grep mysql
```

```text
mysqlhost=10.96.0.110
mysqlport=3306
mysqldb=wordpress
```

> **观察点**：三个 mysql 开头的变量是 `--env` 注入的，容器内可见——**验证注入生效**。这就是给应用传配置的机制，实验 06 会讲更高级的 ConfigMap 方式。

清理pod

```bash
kubectl delete pod nginx-env
```

## Lab 6 定义 pod 执行的任务

> **目标**：理解并覆盖容器的默认启动命令（CMD），用 `--command` 让容器执行自定义任务。
> **验证概念**：镜像自带默认启动命令（如 nginx 的 `CMD ["nginx", "-g", "daemon off;"]`）；Pod 的 `command`/`args` 可覆盖它（`command` 对应 Docker 的 ENTRYPOINT，`args` 对应 CMD）。适合跑一次性任务或需要自定义启动参数的场景。

先看 nginx 镜像的默认启动命令（Dockerfile 最后一行）：

```bash
CMD ["nginx", "-g", "daemon off;"]
```

进入 nginx pod 观察默认启动进程（需先安装 procps 才能用 ps）：

```bash
kubectl exec -it nginx -- /bin/bash
```

安装procps

```bash
apt update
apt install -y procps
```

查看nginx的启动参数

```text
ps -ef
```

```bash
root@nginx:/# ps -ef
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 01:31 ?        00:00:00 nginx: master process nginx -g daemon off;
nginx         32       1  0 01:31 ?        00:00:00 nginx: worker process
nginx         33       1  0 01:31 ?        00:00:00 nginx: worker process
nginx         34       1  0 01:31 ?        00:00:00 nginx: worker process
nginx         35       1  0 01:31 ?        00:00:00 nginx: worker process
root          60       0  0 02:43 pts/0    00:00:00 /bin/bash
root         404      60  0 02:44 pts/0    00:00:00 ps -ef
```

> **观察点**：PID 1 的进程是 `nginx: master process nginx -g daemon off;`——这就是镜像的默认启动命令。记住它，下面对比覆盖后的效果。

退出容器上下文

```text
exit
```

使用命令行创建执行自定义命令的 pod（`--command` 覆盖镜像默认启动命令，`--` 后为命令与参数）

```bash
kubectl run nginx-args --image=nginx --command -- sleep 3600
```

> 等价 yaml 写法（command/args 在 `spec.containers[].command` / `args` 下）：
> ```yaml
> spec:
>   containers:
>   - name: nginx
>     image: nginx
>     command:   # 启动命令（覆盖镜像 CMD）
>     - sleep
>     args:      # 命令参数
>     - "3600"
> ```

查看 pod 状态

```bash
kubectl get pod nginx-args
```

进入 nginx-args pod 观察被覆盖后的启动进程：

```bash
kubectl exec -it nginx-args -- /bin/bash
```

安装procps，如果速度慢，可以根据备注中的提示换源

```bash
apt update
apt install procps
```

查看nginx的启动参数

```bash
ps -ef
```

```bash
root@nginx-args:/# ps -ef
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 02:50 ?        00:00:00 sleep 3600
root           7       0  0 02:50 pts/0    00:00:00 /bin/bash
root         351       7  0 02:52 pts/0    00:00:00 ps -ef
```

> **观察点**：PID 1 从 `nginx: master process...` 变成了 `sleep 3600`——**`--command` 成功覆盖了默认启动命令**。容器不再跑 nginx，而是执行我们指定的任务。这也是跑"一次性任务"（Job）的基础（实验 03 会用到）。

退出容器上下文

```bash
exit
```

清理pod

```bash
kubectl delete pod nginx-args
```

## Lab 7 增加标签和注解

> **目标**：给 Pod 添加标签（labels）和注解（annotations），并通过 describe 观察。
> **验证概念**：**标签**是键值对，**可被选择器（selector）选中**（后续章节 Deployment/Service 靠它管理 Pod）；**注解**也是键值对，但**不能用于选择**，只做说明/元数据。区分两者是理解 Kubernetes 资源关联的基础（实验 01 公共基础 §4）。

使用示例文件创建yaml文件

```bash
nano nginx-annotation.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-annotation
  namespace: default
  labels:
    app: nginx-annotation # 标签
  annotations:
    app: nginx-annotation # 注解
spec:
  containers:
  - name: nginx
    image: nginx
    command:
    - sleep
    args:
    - "3600"
```

> **配置要点**：`metadata.labels` 和 `metadata.annotations` 都是键值对，但用途不同——
> - **labels（标签）**：可被选择器（`kubectl get pod -l app=...`）选中，是资源关联/管理的手段（后续 Deployment/Service 都靠它）
> - **annotations（注解）**：不可被选择，只做说明性元数据（记录版本、负责人、监控开关等）
> - `command/args`：让容器跑 `sleep 3600` 保持存活（实验 02 Lab 5 讲过 command 覆盖）

创建pod

```bash
kubectl apply -f nginx-annotation.yaml
```

查看pod，重点关注标签和注解

```bash
kubectl describe pod nginx-annotation
```

```bash
root@node1:~/k8slab/pod# kubectl describe pod nginx-annotation
Name:         nginx-annotation
Namespace:    default
Priority:     0
Node:         node2/192.168.0.12
Labels:       app=nginx-annotation
Annotations:  app: nginx-annotation
              cni.projectcalico.org/containerID: e4988e9d61d50c402228beaa70df89d25aff372d9c2ffe6eae4cc5714919a73a
              cni.projectcalico.org/podIP: 10.244.104.8/32
Status:       Running
IP:           10.244.104.8
Containers:
  nginx:
    Container ID:   containerd://a8f1b238fa227303c0776cf075e353cf119c9d95f50f1df514747bc32d318857
    Image:          nginx
    Command:
      sleep
    Args:
      3600
    State:          Running
    Ready:          True
    Restart Count:  0
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
```

> **观察点**：`Labels: app=nginx-annotation` 和 `Annotations: app: nginx-annotation`——两者看起来一样，但用途不同：
> - **labels** 可被选择器选中：`kubectl get pod -l app=nginx-annotation` 能筛出它（后续章节 Deployment 用 label 管理 Pod 副本）
> - **annotations** 不可被选择，仅作说明（如记录版本、负责人、监控开关）
> 命令式也能加标签：`kubectl label pod nginx-annotation team=dev`（实验 01 公共基础 §4 讲过）。

清理pod


```bash
kubectl delete -f nginx-annotation.yaml
```


## Lab 8 Pod 健康检查（探针）

> **目标**：给 Pod 配置三种探针（startup/liveness/readiness），观察探针对容器生命周期的影响。
> **验证概念**：三种探针的作用与失败后果——startupProbe（启动成功）、livenessProbe（存活，失败重启容器）、readinessProbe（就绪，失败从 Service 摘除不重启）。Deployment 滚动更新依赖 readinessProbe 判断新 Pod 是否可接管流量（结合 实验 03 Lab 2 理解）。

**三种探针**：
| 探针 | 作用 | 失败后果 |
|---|---|---|
| `startupProbe` | 容器启动是否成功（适合慢启动应用） | 容器重启 |
| `livenessProbe` | 容器是否存活 | 容器重启 |
| `readinessProbe` | 容器是否就绪可接收流量 | 从 Service 摘除，不重启 |

**通用参数**：`initialDelaySeconds`（启动后延迟探测）、`periodSeconds`（探测间隔）、`timeoutSeconds`（超时）、`failureThreshold`（连续失败次数）、`successThreshold`（成功阈值）。

**探测方式**：`httpGet`（HTTP 请求）、`tcpSocket`（TCP 连接）、`exec`（执行命令）。

创建带三种探针的 Pod（精简示例）：

```bash
nano nginx-healthcheck.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-healthcheck
spec:
  containers:
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
    startupProbe:   # 启动检查：执行命令探活
      exec:
        command: ["/bin/sh", "-c", "cat /usr/share/nginx/html/index.html"]
      initialDelaySeconds: 5
      periodSeconds: 1
      failureThreshold: 18
    livenessProbe:  # 存活检查：TCP 端口探活
      tcpSocket:
        port: 80
      periodSeconds: 10
      failureThreshold: 3
    readinessProbe: # 就绪检查：HTTP 路径探活
      httpGet:
        path: /
        port: 80
      periodSeconds: 1
      failureThreshold: 3
```

> **配置要点**（探针通用参数，三种探针共用）：
> - `initialDelaySeconds`：容器启动后等多久才开始探测（给应用初始化时间）
> - `periodSeconds`：每隔多久探测一次
> - `timeoutSeconds`：单次探测超时时间
> - `failureThreshold`：连续失败多少次才判定失败（startup 用 18 次容忍慢启动）
> - 三种探测方式：`exec`（容器内执行命令）、`tcpSocket`（连端口）、`httpGet`（HTTP 请求，本例用 `/` 路径）
> - **readinessProbe 用 httpGet 探测 80 端口**——Pod 就绪后才接收流量（实验 03 Lab 2 滚动更新的关键依赖）

创建并查看

```bash
kubectl apply -f nginx-healthcheck.yaml
kubectl get pod -o wide
```

```bash
kubectl describe pod nginx-healthcheck | grep -A5 'Probe'
```

> **观察点**：Pod 显示 `1/1 Running` 且 READY 正常表示探针通过；`describe ... | grep -A5 Probe` 可看到三个探针的配置。若探针失败，`describe` 的 Events 里会出现 `Unhealthy` 事件、容器被重启或从 Service 摘除。结合 实验 03 Lab 2：Deployment 滚动更新用 readinessProbe 判断新 Pod 是否可接管流量。

**清理**

```bash
kubectl delete -f nginx-healthcheck.yaml
```

## Lab 9 容器生命周期钩子（postStart / preStop）与优雅终止

> **目标**：用生命周期钩子（lifecycle hooks）在容器启动后/终止前执行额外操作，并观察 Pod 的**优雅终止**过程。
> **验证概念**：生命周期钩子是容器的"前后置回调"——`postStart`（容器创建后立即执行，常用于初始化环境）和 `preStop`（容器终止前执行，常用于**优雅下线**：通知注册中心摘除、等待存量请求处理完）。配合 `terminationGracePeriodSeconds`（宽限期）与 `kubectl delete --grace-period`，实现"先 graceful 再强杀"的完整下线流程（生产发布的关键，CKA 相关）。

使用示例文件创建 yaml 文件

```bash
nano lifecycle-pod.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo
spec:
  terminationGracePeriodSeconds: 30   # 优雅终止宽限期：超过后强制 SIGKILL
  containers:
  - name: nginx
    image: nginx
    lifecycle:
      postStart:                      # 启动后钩子：向共享位置写一行"上线日志"
        exec:
          command: ["/bin/sh", "-c", "echo postStart fired >> /tmp/lifecycle.log && echo 'ready for traffic' >> /tmp/lifecycle.log"]
      preStop:                        # 终止前钩子：模拟"优雅下线"（如反注册、排空连接）
        exec:
          command: ["/bin/sh", "-c", "sleep 5 && echo preStop fired >> /tmp/lifecycle.log && echo 'draining connections...' >> /tmp/lifecycle.log"]
```

> **配置要点**（lifecycle 两个钩子 + 宽限期）：
> - `postStart.exec.command`——**容器启动后**执行的命令（与容器进程并行，不是阻塞等待）；写日志/初始化配置的常见入口
> - `preStop.exec.command`——**容器终止前**执行的命令，K8s 会**等它执行完**才发 SIGTERM；`sleep 5` 模拟"给应用 5 秒处理存量请求/反注册"
> - `terminationGracePeriodSeconds: 30`——总宽限期：preStop + SIGTERM 处理都算在内，**超时强制 SIGKILL**
> - 钩子执行失败不会阻止容器运行，但会记录事件（describe 可见）

创建并验证

```bash
kubectl apply -f lifecycle-pod.yaml
kubectl exec -it lifecycle-demo -- cat /tmp/lifecycle.log
```

```bash
root@node1:~/k8slab/deploy# kubectl apply -f lifecycle-pod.yaml
pod/lifecycle-demo created
root@node1:~/k8slab/deploy# kubectl exec -it lifecycle-demo -- cat /tmp/lifecycle.log
postStart fired
ready for traffic
```

> **观察点**：容器内 `/tmp/lifecycle.log` 已有 **`postStart fired`**——postStart 钩子在容器启动后自动执行了。注意钩子与容器主进程**并行**执行，不影响 nginx 启动。

删除 Pod，观察 preStop 与优雅终止

```bash
time kubectl delete pod lifecycle-demo
```

```bash
root@node1:~/k8slab/deploy# time kubectl delete pod lifecycle-demo
pod "lifecycle-demo" deleted

real    0m5.5s
```

> **观察点**（优雅终止的完整过程）：
> - `kubectl delete pod` 后**没有立刻消失**，`real 0m5.5s`——命令等待了约 5 秒
> - 这 5 秒就是 **preStop 钩子的执行时间**（`sleep 5`）——K8s 先执行 preStop、再发 SIGTERM、宽限期内不强行杀
> - 如果把宽限期（30s）内钩子/应用都处理完，Pod 干净退出（graceful）；超时则 SIGKILL 强杀
> - 结合 实验 04 drain：节点排空时同样走这个优雅终止流程，业务才能无感迁移

快速再验证一次（对比：没有 preStop 时删除是秒回的）

```bash
kubectl run quick --image=nginx -- sleep 3600
time kubectl delete pod quick --grace-period=1
```

```bash
root@node1:~/k8slab/deploy# kubectl run quick --image=nginx -- sleep 3600
pod/quick created
root@node1:~/k8slab/deploy# time kubectl delete pod quick --grace-period=1
pod "quick" deleted

real    0m1.2s
```

> **观察点**（对比组）：没有 preStop 的普通 Pod，删除时 `--grace-period=1`（宽限期压到 1 秒）几乎秒删（`real 0m1.2s`）——**对比出钩子 + 宽限期对下线流程的影响**。生产上：preStop 里做反注册/排空，宽限期给足，滚动发布才能不丢请求。

**清理**

```bash
kubectl delete pod quick --grace-period=1 --force
```

> 说明：`quick` 已在上面删除，此处兜底清理；`--force` 用于确保清干净（正常情况下不需要）。

## Lab 10 Pod 资源请求与限制（requests / limits）

> **目标**：用 yaml 给 Pod 声明 `requests`（请求）和 `limits`（限制），并查看配置生效。
> **验证概念**：**requests 是调度依据**（调度器保证节点剩余 ≥ requests 才放行），**limits 是运行时上限**（CPU 超限被限流、内存超限被杀）。本 Lab 是 实验 05 Lab 3/4（LimitRange/ResourceQuota）的前置基础——后面两个对象就是**批量约束**这些字段的。

**核心概念**：
- `requests`：Pod 运行所需的最低资源（调度器据此选节点）
- `limits`：Pod 能使用的资源上限（超限会被限制/被杀）
- 单位：CPU 用核（`0.1` = 100m）、内存用 Mi/Gi

> ⚠️ **v1.36 实测**：`kubectl run` 已**不支持** `--requests/--limits` 参数（报 `unknown flag`），且 **Pod 创建后 resources 字段不可修改**（`kubectl set resources pod` 也会被拒）——所以声明 resources **只能用 yaml 创建时指定**：

用 yaml 创建带资源限制的 Pod：

```bash
nano nginx-res.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-res
spec:
  containers:
  - name: nginx
    image: nginx
    resources:
      requests:
        cpu: "100m"
        memory: "32Mi"
      limits:
        cpu: "200m"
        memory: "64Mi"
```

```bash
kubectl apply -f nginx-res.yaml
```

> **配置要点**（yaml 的 resources 字段）：
> - `spec.containers[].resources.requests`——请求 100 毫核 CPU + 32Mi 内存
> - `spec.containers[].resources.limits`——上限 200 毫核 CPU + 64Mi 内存
> - 生产惯例：requests < limits（给突发流量留空间）；**声明式 yaml 是唯一方式**（CLI 无法设置 Pod 资源）

查看 Pod 的 Requests/Limits 配置：

```bash
kubectl describe pod nginx-res
```

```bash
root@node1:~# kubectl describe pod nginx-res
...
    Limits:
      cpu:     200m
      memory:  64Mi
    Requests:
      cpu:        100m
      memory:     32Mi
```

> **观察点**（describe 输出已精简）：`Containers` 段显示 `Requests`（100m/32Mi）和 `Limits`（200m/64Mi），**与 yaml 声明的值一一对应**。调度器用 Requests 选节点、运行时用 Limits 限制。CPU 用核数（`"100m"` 与 `0.1` 等价）、内存用 `Mi/Gi`。

**清理**

```bash
kubectl delete pod nginx-res
```

> 说明：实验 05 Lab 3 的 LimitRange 就是用来**约束**命名空间内所有 Pod 的 requests/limits 的。

## Lab 11 sidecar 模式实战（推荐）

> **目标**：实现教材 §4.1.3 的 sidecar 模式——主容器（nginx）+ 日志采集 sidecar（共享卷读日志）。
> **验证概念**：**sidecar 与主容器共享 Pod 卷**（教材 §4.1.3）——主容器写日志文件、sidecar 读并转发（如转发到 stdout 便于 kubectl logs 查看）——"多容器协作"的典型生产模式。

```bash
nano sidecar-demo.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-demo
spec:
  containers:
  - name: web                       # 主容器：nginx 写访问日志
    image: nginx
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx     # 写日志到共享卷
  - name: log-sync                  # sidecar：轮询读日志并转发到 stdout
    image: busybox
    command: ["/bin/sh", "-c", "while true; do cat /var/log/nginx/access.log 2>/dev/null; sleep 2; done"]
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx     # 挂同一共享卷
  volumes:
  - name: logs
    emptyDir: {}                    # Pod 级共享卷
```

```bash
kubectl apply -f sidecar-demo.yaml
sleep 5
# 制造访问日志
kubectl exec sidecar-demo -c web -- sh -c "curl -s http://localhost >/dev/null 2>&1; echo test >> /var/log/nginx/access.log"
sleep 3
kubectl logs sidecar-demo -c log-sync --tail=3    # sidecar 的 stdout = 主容器日志
```

```bash
root@node1:~/k8slab/pod# kubectl logs sidecar-demo -c log-sync --tail=3
test
```

> **配置要点**（sidecar 模式，教材 §4.1.3）：
> - 两个容器共享 Pod 级 `emptyDir` 卷（`logs`）——主容器写、sidecar 读
> - **sidecar 把文件日志"转发"到自己的 stdout**——这样 `kubectl logs` 就能看主容器的日志（统一日志出口，教材 §15.3.3 的 sidecar 收集模式）
> - 与 Init 容器的区别（教材 §4.3.3）：Init 跑完即退；**sidecar 与主容器同生命周期长期运行**

> **观察点**：`kubectl logs -c log-sync` 看到主容器写的日志——**日志采集 sidecar 的完整模式**（生产里把 `cat` 换成 filebeat 等采集器即可，教材 §15.3.3）。

**清理**

```bash
kubectl delete -f sidecar-demo.yaml
```

## Lab 12 QoS 等级观察（推荐）

> **目标**：创建三个不同资源声明的 Pod，观察它们的 QoS 等级；理解"资源紧张时谁先被杀"。
> **验证概念**：教材 §4.5.3——QoS 三档由 requests/limits 决定：**Guaranteed**（requests=limits）> **Burstable**（requests<limits）> **BestEffort**（什么都不写）——节点内存压力时按此顺序被杀。

```bash
# ① 三个 Pod：Guaranteed / Burstable / BestEffort
kubectl run qos-g --image=busybox --command -- sleep 3600 --dry-run=client -o yaml > qos-g.yaml
cat > qos-g.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: qos-g
spec:
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
    resources:
      requests: {cpu: "100m", memory: "128Mi"}
      limits:   {cpu: "100m", memory: "128Mi"}    # requests == limits → Guaranteed
EOF
cat > qos-b.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: qos-b
spec:
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
    resources:
      requests: {cpu: "50m", memory: "64Mi"}
      limits:   {cpu: "200m", memory: "256Mi"}    # requests < limits → Burstable
EOF
kubectl run qos-e --image=busybox --command -- sleep 3600    # 不写 resources → BestEffort

kubectl apply -f qos-g.yaml -f qos-b.yaml
kubectl get pod qos-g qos-b qos-e -o jsonpath='{range .items[*]}{.metadata.name}: {.status.qosClass}{"\n"}{end}'
```

```bash
root@node1:~/k8slab/pod# kubectl get pod qos-g qos-b qos-e -o jsonpath='{range .items[*]}{.metadata.name}: {.status.qosClass}{"\n"}{end}'
qos-g: Guaranteed
qos-b: Burstable
qos-e: BestEffort
```

> **配置要点**（QoS 判定，教材 §4.5.3）：
> - **Guaranteed**：所有容器 requests == limits（且都设置）
> - **Burstable**：有 requests（或 requests < limits）
> - **BestEffort**：完全不写 resources
> - `jsonpath` 提取字段是 CKA 考点技巧（教材 §19.3.2）

> **观察点**（QoS 与杀进程优先级）：三种声明对应三个等级——**节点内存压力时（OOM），先杀 BestEffort、再 Burstable、最后 Guaranteed**（教材 §4.5.3）。生产核心服务配 Guaranteed（requests=limits）、一般服务 Burstable、测试任务 BestEffort。

**清理**

```bash
kubectl delete pod qos-g qos-b qos-e
```
## 本章小结

本章通过 12 个实验，掌握了 Pod 的核心概念与操作：

| 实验 | 验证的知识点 | 关键命令/概念 | 级别 |
|---|---|---|:---:|
| Lab 1 极简创建 pod | Pod 两个必填属性（name/image）；Pod 有独立 IP（10.244.x.x） | `kubectl run`（命令式）/ `kubectl apply`（声明式）；`get -o wide` 看 IP/节点；`describe` 看状态与 Events | 必做 |
| Lab 2 创建多容器 pod | 一个 Pod 可运行多个容器，共享同一 Pod IP 与生命周期 | `containers` 列表；`kubectl exec -c <容器>` | 必做 |
| Lab 3 使用 Init 容器完成初始化 | init 容器按顺序执行、成功退出后主容器才启动；共享卷传数据 | `initContainers`、`Init:0/2` 状态、Exit Code 0、emptyDir 共享卷 | 必做 |
| Lab 4 定义映像拉取策略 | imagePullPolicy 三种策略的触发时机 | `Always` / `IfNotPresent`（默认）/ `Never` | 必做 |
| Lab 5 注入环境变量 | env 是给容器传配置的机制，创建时注入 | `kubectl run --env=KEY=VAL`；等价 yaml `spec.containers[].env` | 必做 |
| Lab 6 定义 pod 执行的任务 | command/args 覆盖镜像默认启动命令（CMD） | `kubectl run --command -- cmd args`；`ps -ef` 观察 PID 1 | 必做 |
| Lab 7 增加标签和注解 | labels 可被选择器选中、annotations 仅作说明 | `metadata.labels` / `metadata.annotations`；`describe` 查看 | 必做 |
| Lab 8 Pod 健康检查（探针） | 三种探针作用与失败后果；readiness 是滚动更新无损切换的前提 | `startupProbe`/`livenessProbe`/`readinessProbe`、httpGet/tcpSocket/exec、Unhealthy 事件 | 必做 |
| Lab 9 生命周期钩子与优雅终止 | postStart 启动后执行、preStop 终止前执行；宽限期与强杀 | `lifecycle`、`terminationGracePeriodSeconds`、`--grace-period` | 必做 |
| Lab 10 资源请求与限制 | requests 管调度、limits 管运行；CPU/内存超限不同后果 | `resources.requests/limits`、CPU 毫核与内存 Mi/Gi | 必做 |
| Lab 11 sidecar 模式实战 | 主容器 + 日志采集 sidecar 共享卷；统一日志出口 | 多容器共享 emptyDir、sidecar 转发 stdout | 推荐 |
| Lab 12 QoS 等级观察 | Guaranteed/Burstable/BestEffort 判定与杀进程优先级 | `status.qosClass`、jsonpath 提取 | 推荐 |

**核心认知**：
1. **Pod 是 K8s 的最小调度单元**——一个或多个容器共享网络/存储/生命周期，是后续所有工作负载（Deployment/Job/DaemonSet）的基础
2. **声明式 API**：yaml 声明"要什么"（期望状态），系统补齐默认值并维护实际状态（status）
3. **两种创建方式**：命令式（run/apply -f 生成的 yaml）适合快速验证；声明式（手写 yaml）适合复杂配置与版本管理
4. **排查思路**：`get -o wide` 看调度/IP → `describe` 看状态/事件 → `logs` 看日志 → `exec` 进容器（实验 01 公共基础有完整清单）
5. **多容器三形态**：普通多容器（Lab 2，并行常驻）→ Init 容器（Lab 3，先跑后退）→ sidecar 模式（生产最常用，主容器+辅助容器并存）
6. **探针三兄弟**（Lab 8）：readiness 摘流量、liveness 重启、startup 保护慢启动——**探针是"自愈"和"无损发布"的感知层**
7. **优雅终止**（Lab 9）：preStop + 宽限期保证下线不丢请求——滚动更新、节点 drain 都依赖它
8. **资源声明**（Lab 10）：requests 是调度承诺、limits 是运行时上限——**内存 limits 是生产底线**（超限 OOM 被 SIGKILL）

**与后续章节的衔接**：
- 标签/选择器 → 实验 03 Deployment 管理 Pod、实验 04 调度
- env/ConfigMap 思想 → 实验 06 ConfigMap 和 Secret
- command/args（一次性任务）→ 实验 03 Job/CronJob
- Init 容器 → 生产初始化场景（等依赖/预置数据）
- 探针/钩子 → 实验 03 滚动更新的无损切换、实验 04 drain 优雅驱逐、实验 05 HPA 就绪判断
- 资源 requests/limits → 实验 04 调度器过滤依据、实验 05 LimitRange/ResourceQuota 批量约束
- Pod IP/网络 → 实验 07 Service 与网络
