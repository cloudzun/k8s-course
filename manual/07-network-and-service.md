# 网络和服务基础


## 实验准备

- **前置条件**：已完成 实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，按 `nano xxx.yaml` 创建即可，无需克隆外部仓库
- **工作目录**：本章实验在 `/root/k8slab/svc` 下进行（如不存在先 `mkdir -p`）

> ℹ️ 各 Lab 中的终端输出为参考示例（基于本手册约定的 192.168.0.x 环境），实际 Pod IP、节点分布、AGE 等会因环境不同而不同，关注输出**结构**而非具体数值。

**实验分级**：

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 创建 katacoda deployment | Pod 独立 IP 直连 | 必做 |
| Lab 2 创建 cluster ip 服务 | Service 稳定入口 + 负载均衡 | 必做 |
| Lab 3 创建 nodeport 服务 | 集群外访问 | 必做 |
| Lab 4 创建 none clusterIP 服务 | headless + DNS 轮询 | 必做 |
| Lab 5 使用 ingress 发布服务 | 七层域名/路径路由 + TLS | 必做 |
| Lab 6 NetworkPolicy 网络策略 | 默认全通 → 白名单隔离 | 必做 |
| Lab 7 NetworkPolicy egress | 出站白名单 + DNS 放行 | 推荐 |
## Lab 1 创建 katacoda deployment

> **目标**：创建一个 3 副本的 Deployment（katacoda），并直接用 Pod IP 访问服务。
> **验证概念**：Deployment 的 Pod 各自有独立 IP（10.244.x.x），集群内可直接访问；为后续 Service 实验准备后端 Pod。

进入本章实验目录路径

```bash
root@node1:~/k8slab/svc# pwd
/root/k8slab/svc
```

创建 katacoda deployment 示例yaml

```bash
kubectl create deployment katacoda --image=katacoda/docker-http-server --dry-run=client -o yaml
```

进行适当的修改得到示例文件

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

> **配置要点**：与 实验 03 Lab 1 的 Deployment 相同结构——`replicas: 3`（3 个副本）、`selector.matchLabels` 与 `template.labels` 都是 `app: katacoda`（匹配才能管理）。`katacoda/docker-http-server` 镜像会返回"处理请求的主机名"，用于后续观察负载均衡（见 Lab 2）。

使用示例文件创建yaml文件

```bash
nano katacoda.yaml
```

创建deployment

```bash
kubectl create -f katacoda.yaml
```

查看pod，重点关注pod的名称和ip地址

```bash
kubectl get pods -o wide
```

```bash
root@node1:~/k8slab/svc# kubectl get pods -o wide
NAME                        READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
katacoda-56dbd65b59-csltf   1/1     Running   0          19s   10.244.104.17   node2   <none>           <none>
katacoda-56dbd65b59-fkwbx   1/1     Running   0          19s   10.244.135.52   node3   <none>           <none>
katacoda-56dbd65b59-l5zj7   1/1     Running   0          19s   10.244.104.18   node2   <none>           <none>
nginx                       1/1     Running   0          9h    10.244.135.3    node3   <none>           <none>
```

> **观察点**：3 个 `katacoda-*` Pod 各有独立 IP（10.244.104.17 / 10.244.135.52 / 10.244.104.18），分布在 node2/node3。**这是 Service 的后端池**——Lab 2 起的 Service 会把流量分发给这些 IP。

访问其中某个pod，查看访问效果

```bash
curl http://10.244.135.52
```

```bash
root@node1:~/k8slab/svc# curl http://10.244.135.52
<h1>This request was processed by host: katacoda-56dbd65b59-fkwbx</h1>
root@node1:~/k8slab/svc# curl http://10.244.104.17
<h1>This request was processed by host: katacoda-56dbd65b59-csltf</h1>
root@node1:~/k8slab/svc# curl http://10.244.104.18
<h1>This request was processed by host: katacoda-56dbd65b59-l5zj7</h1>
```

> **观察点**：用 Pod IP 直接访问，返回了 `processed by host: katacoda-xxxxx`——**每个 Pod 处理自己的请求**（Pod IP 直达）。问题：Pod IP 会随重建变化、且没有负载均衡——这正是 Lab 2 引入 Service 的原因。

## Lab 2 创建 cluster ip 服务

> **目标**：创建 ClusterIP 类型的 Service，通过集群内虚拟 IP 访问后端 Pod。
> **验证概念**：Service 是 Pod 的**稳定访问入口**——它有一个固定的虚拟 IP（CLUSTER-IP），通过 `selector` 匹配后端 Pod，并把流量**负载均衡**到多个 Pod。

创建cluster ip svc yaml示例文件

```bash
kubectl create service clusterip katacoda --tcp 80:80 --dry-run=client -o yaml
```

经过适当变造得到示例文件

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: katacoda
  name: katacoda
spec:
  ports:
  - name: 80-80
    port: 80
    protocol: TCP
    targetPort: 80
  selector:
    app: katacoda
  type: ClusterIP
```

> **配置要点**（Service 结构）：
> - `spec.selector`：**关键**——`app: katacoda` 匹配 Lab 1 创建的 Pod（Deployment 的 label），Service 通过它找到后端
> - `spec.ports[].port`：Service 对外暴露的端口（80）
> - `spec.ports[].targetPort`：转发到后端 Pod 的容器端口（80）
> - `type: ClusterIP`：默认类型，**只在集群内部可达**（虚拟 IP，外部无法直接访问）

使用示例文件创建yaml文件

```bash
nano katasvc.yaml
```

创建service发布服务

```bash
kubectl apply -f katasvc.yaml
```

查看服务，重点关注 TYPE 和 CLUSTER-IP

```bash
kubectl get svc
```

```bash
root@node1:~/k8slab/svc# kubectl get svc
NAME         TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(e)   AGE
katacoda     ClusterIP   10.97.66.233   <none>        80/TCP    8s
kubernetes   ClusterIP   10.96.0.1      <none>        443/TCP   242d
```

> **观察点**：`katacoda` 的 `CLUSTER-IP` 是 `10.97.66.233`（固定虚拟 IP）；`kubernetes` 是系统自带的 Service（集群 API 入口）。**注意 Service IP 与 Pod IP（10.244.x.x）网段不同**——Service IP 是虚拟的。

使用服务的ip访问,多访问几次，观察负载均衡效果

```bash
curl 10.97.66.233
```

```bash
root@node1:~/k8slab/svc# curl 10.97.66.233
<h1>This request was processed by host: katacoda-56dbd65b59-fkwbx</h1>
root@node1:~/k8slab/svc# curl 10.97.66.233
<h1>This request was processed by host: katacoda-56dbd65b59-csltf</h1>
root@node1:~/k8slab/svc# curl 10.97.66.233
<h1>This request was processed by host: katacoda-56dbd65b59-l5zj7</h1>
```

> **观察点**：**同一个 Service IP，多次访问返回不同 Pod**（fkwbx → csltf → l5zj7）——Service 自动把请求**负载均衡**到 3 个后端 Pod。对比 Lab 1 的"Pod IP 直达单个 Pod"，Service 是稳定的集群内入口。

## Lab 3 创建 nodeport 服务

> **目标**：创建 NodePort 类型的 Service，让服务在**集群外部**（通过节点 IP + 端口）也可访问。
> **验证概念**：NodePort 在 ClusterIP 基础上，额外在每个节点上开放一个端口（默认 30000-32767），外部通过 `<节点IP>:<NodePort>` 访问；流量进入后仍由 Service 负载均衡到后端 Pod。

创建nodeport svc yaml示例文件

```bash
kubectl create service nodeport katacoda --tcp 80:80 --dry-run=client -o yaml
```

经过适当变造得到示例文件

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: katacoda
  name: katacoda2
spec:
  ports:
  - name: 80-80
    port: 80
    protocol: TCP
    targetPort: 80
  selector:
    app: katacoda
  type: NodePort
```

> **配置要点**：与 Lab 2 的 ClusterIP 相比，只改了 `type: NodePort` 和 `name: katacoda2`——其余结构相同（selector 仍匹配 `app: katacoda` 的 Pod）。NodePort 会自动分配一个 30000-32767 的节点端口（见下方 `80:31215`）。

使用示例文件创建yaml文件

```bash
nano katasvc2.yaml
```

创建service发布服务

```bash
kubectl apply -f katasvc2.yaml
```

查看服务，重点关注TYPE和Port

```bash
kubectl get svc
```

```bash
root@node1:~/k8slab/svc# kubectl get svc
NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(e)        AGE
katacoda     ClusterIP   10.97.66.233     <none>        80/TCP         4m39s
katacoda2    NodePort    10.106.215.152   <none>        80:31215/TCP   9s
kubernetes   ClusterIP   10.96.0.1        <none>        443/TCP        242d
```

> **观察点**：`katacoda2` 的 PORT(e) 列显示 `80:31215/TCP`——**`31215` 就是自动分配的 NodePort**（80 是集群内端口）。每个节点上都会监听 31215 端口，转发到后端 Pod。

使用主机名/IP地址加端口号的方式进行访问

```bash
curl node1:31215
```

```bash
root@node1:~/k8slab/svc# curl node1:31215
<h1>This request was processed by host: katacoda-56dbd65b59-l5zj7</h1>
root@node1:~/k8slab/svc# curl node1:31215
<h1>This request was processed by host: katacoda-56dbd65b59-fkwbx</h1>
root@node1:~/k8slab/svc# curl node1:31215
<h1>This request was processed by host: katacoda-56dbd65b59-csltf</h1>
```

> **观察点**：`curl node1:31215`（**节点 IP + NodePort**）也能访问，且同样负载均衡到不同 Pod——NodePort 让服务对外可达。**注意**：访问的是"节点"而非 Service IP，这是与 ClusterIP 的本质区别（Lab 2 只能在集群内用 Service IP 访问）。

如果使用云主机做实验，也可用节点的公网IP地址加端口方式进行访问，但是前提是需要设置网络安全组

尝试从群集外用浏览器访问这个 nodeport 服务（浏览器访问 `http://<任一节点IP>:31215`）

修改nodeport端口到30080

```bash
KUBE_EDITOR="nano" kubectl edit svc katacoda2
```

```bash
ports:
  - name: 80-80
    nodePort: 30080 # 指定端口
    port: 80
    protocol: TCP
    targetPort: 80
```

> **配置要点**：`nodePort: 30080` 手动指定节点端口（默认是自动分配的随机端口）。NodePort 合法范围是 **30000-32767**。

亦可参照该范例修改yaml文件

查看服务，重点关注 TYPE 和 Port

```bash
kubectl get svc
```

```bash
root@node1:~/k8slab/svc# kubectl get svc
NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(e)        AGE
katacoda     ClusterIP   10.97.66.233     <none>        80/TCP         10m
katacoda2    NodePort    10.106.215.152   <none>        80:30080/TCP   5m50s
kubernetes   ClusterIP   10.96.0.1        <none>        443/TCP        242d
```

> **观察点**：PORT(e) 列从 `80:31215` 变为 **`80:30080`**——手动指定的端口生效。此时需用 `curl node1:30080` 访问。

## Lab 4 创建 none clusterIP 服务，并进行名称解析

> **目标**：创建 headless Service（`clusterIP: None`），并用 DNS 解析观察它的行为。
> **验证概念**：headless Service **没有虚拟 IP**——DNS 解析直接返回**所有后端 Pod 的 IP 列表**（而非一个 ClusterIP），调用方可自行选择（轮询）。用于需要"直接拿到每个 Pod IP"的场景（如 StatefulSet 每个 Pod 的稳定网络标识，实验 03 Lab 3 提到过 serviceName）。

使用示例文件创建yaml文件

```bash
nano katasvc3.yaml
```

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: katacoda
  name: katacoda3
spec:
  clusterIP: None
  ports:
  - name: 80-80
    port: 80
    protocol: TCP
    targetPort: 80
  selector:
    app: katacoda
```

> **配置要点**：与普通 Service 的唯一区别是 **`spec.clusterIP: None`**——声明为 headless（无头）服务。selector 仍匹配 `app: katacoda`，但不再分配虚拟 IP，DNS 直接返回后端 Pod IP 列表。

创建none clusterIP 发布服务

```bash
kubectl apply -f katasvc3.yaml
```

查看服务，重点关注 katacoda3 的 CLUSTER-IP

```bash
kubectl get svc
```

```bash
root@node1:~/k8slab/svc# kubectl get svc
NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(e)        AGE
katacoda     ClusterIP   10.97.66.233     <none>        80/TCP         13m
katacoda2    NodePort    10.106.215.152   <none>        80:30080/TCP   9m28s
katacoda3    ClusterIP   None             <none>        80/TCP         15s
kubernetes   ClusterIP   10.96.0.1        <none>        443/TCP        242d
```

> **观察点**：`katacoda3` 的 `CLUSTER-IP` 是 **`None`**——这就是 headless 服务（对比 katacoda 的 10.97.66.233）。

创建busybox pod，进行dns解析

```bash
kubectl run test-dns --image=busybox:1.28 -- sleep 3600
```

进入pod

```bash
kubectl exec -it test-dns -- /bin/sh
```

解析

```bash
nslookup katacoda3.default.svc.cluster.local
```

```text
root@node1:~/k8slab/svc# kubectl exec -it test-dns -- /bin/sh
/ # nslookup katacoda3.default.svc.cluster.local
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      katacoda3.default.svc.cluster.local
Address 1: 10.244.104.18 10-244-104-18.katacoda.default.svc.cluster.local
Address 2: 10.244.104.17 10-244-104-17.katacoda.default.svc.cluster.local
Address 3: 10.244.135.52 10-244-135-52.katacoda3.default.svc.cluster.local
```

> **观察点**：`nslookup katacoda3...` 返回了 **3 个 IP**（10.244.104.18 / 10.244.104.17 / 10.244.135.52）——正是后端 3 个 Pod 的 IP。**普通 Service 的 DNS 只返回 1 个虚拟 IP，headless 返回全部后端 IP**，这是两者 DNS 行为的本质区别。

多执行几次，观察轮询效果

```bash
Name:      katacoda3
Address 1: 10.244.135.52 10-244-135-52.katacoda.default.svc.cluster.local
Address 2: 10.244.104.17 10-244-104-17.katacoda.default.svc.cluster.local
Address 3: 10.244.104.18 10-244-104-18.katacoda.default.svc.cluster.local
/ # nslookup katacoda3.default.svc
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      katacoda3.default.svc
Address 1: 10.244.104.17 10-244-104-17.katacoda.default.svc.cluster.local
Address 2: 10.244.104.18 10-244-104-18.katacoda.default.svc.cluster.local
Address 3: 10.244.135.52 10-244-135-52.katacoda.default.svc.cluster.local
```

> **观察点**：多次解析，IP 列表顺序会变化（DNS 轮询）——headless 让客户端拿到全部后端 IP 自行选择。也注意 **DNS 全名规则**：`<service>.<namespace>.svc.cluster.local`（如 `katacoda3.default.svc.cluster.local`）。

退出pod上下文

```bash
exit
```

## Lab 5 使用 ingress 发布服务

> **目标**：部署 ingress-nginx 控制器，创建 Ingress 规则按**域名**把请求路由到 Service。
> **验证概念**：Ingress 是集群的**七层（HTTP）入口**——按 `host`（域名）+ `path`（路径）路由到后端 Service，一个 Ingress 可管理多个域名/服务。相比 NodePort（四层、每服务一个端口），Ingress 更灵活（域名/路径路由、统一入口）。

安装 ingress（使用官方当前版本 baremetal manifest）

> ⚠️ **实测（2026-08）**：ingress-nginx 官方镜像在 `registry.k8s.io`（国内不可达），且 `docker.1panel.live` 等加速站**不代理 registry.k8s.io**（直接替换前缀会 403）。实测可行方案：用 **Docker Hub 上同步官方镜像的仓库 `dyrnq/`** 预拉 + tag 成本地名，再 apply。

**① 先在 3 台节点上预拉 ingress 镜像并 tag**（controller 是 DaemonSet 每节点一个 + certgen Job 可能调度到任意节点，三台都要有）：

```bash
# 3 台节点都执行（ACCEL_HOST 用前置检查选出的主加速站）
ACCEL_HOST=docker.1panel.live

for img in "dyrnq/ingress-nginx-controller:v1.12.0" "dyrnq/kube-webhook-certgen:v1.5.0"; do
  echo "--- 拉 $img ---"
  ctr -n k8s.io images pull ${ACCEL_HOST}/$img 2>&1 | tail -1
done
ctr -n k8s.io images tag ${ACCEL_HOST}/dyrnq/ingress-nginx-controller:v1.12.0 registry.k8s.io/ingress-nginx/controller:v1.12.0
ctr -n k8s.io images tag ${ACCEL_HOST}/dyrnq/kube-webhook-certgen:v1.5.0 registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.5.0
# 验证：ctr -n k8s.io images list -q | grep "registry.k8s.io/ingress"  应看到两个镜像
```

> `dyrnq/` 是 Docker Hub 上持续同步 Kubernetes 官方镜像的仓库，实测其 digest 与官方 `registry.k8s.io/ingress-nginx/controller:v1.12.0` **完全一致**（同步的就是原版）。如果 `dyrnq` 拉取慢/失败，可换 `porterhub/ingress-nginx`、`willdockerhub/ingress-nginx-controller` 等同类同步仓库（版本号对齐 v1.12.0）。

**② 在 master 下载 manifest、去 digest 引用并 apply**：

```bash
curl -sSL https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/baremetal/deploy.yaml -o ingress-nginx.yaml

# 关键：去掉镜像名里的 @sha256 digest（本地 tag 的镜像没有官方 digest 引用，不去掉会强制走 registry.k8s.io 解析）
sed -i 's|@sha256:[a-f0-9]*||g' ingress-nginx.yaml

kubectl apply -f ingress-nginx.yaml
```

> 版本号 `controller-v1.12.0` 会随时间更新，最新版本见 https://github.com/kubernetes/ingress-nginx/releases；若下载失败可参考 实验 01 「应急方案」。等待 1-2 分钟让镜像拉取完成（预拉成功后 pod 会直接用本地镜像）。

查看 ingress-nginx 的pod

```bash
kubectl get pods -n ingress-nginx -o wide
```

```bash
root@node1:~/k8slab/svc# kubectl get pods -n ingress-nginx -o wide
NAME                                        READY   STATUS      RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
ingress-nginx-admission-create-2clxv        0/1     Completed   0          99s   10.244.104.19   node2   <none>           <none>
ingress-nginx-admission-patch-qs4hr         0/1     Completed   0          99s   10.244.135.54   node3   <none>           <none>
ingress-nginx-controller-76d86f9848-2jrc4   1/1     Running     0          99s   192.168.0.13   node3   <none>           <none>
```

> **观察点**：`ingress-nginx-controller-*`（baremetal manifest 默认 **1 个副本**，实测 Running）是 Ingress 的**控制面组件**——它监听 Ingress 规则并配置 Nginx 反向代理；`admission-*` 是安装时的一次性校验任务（Completed 正常）。controller 作为 NodePort 暴露（见下），是流量的实际入口。

关注 ingress-nginx-controller 所在节点

查看 ingress-nginx 的 svc

```bash
kubectl get svc -n ingress-nginx
```

```bash
root@node1:~/k8slab/svc# kubectl get svc -n ingress-nginx
NAME                                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(e)                      AGE
ingress-nginx-controller             NodePort    10.104.4.173     <none>        80:30193/TCP,443:32696/TCP   2m59s
ingress-nginx-controller-admission   ClusterIP   10.101.130.249   <none>        443/TCP                      2m59s
```

> **观察点**：`ingress-nginx-controller` 是 **NodePort** 类型（80:30193 / 443:32696）——外部流量先进 controller 的 NodePort，controller 再按 Ingress 规则路由到后端 Service。

使用以下范例创建 ingress 文件

```bash
nano katacoda.ingress.yaml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: katacoda-ingress
spec:
  rules:
  - host: hello.example.com # 主机名
    http:
      paths:
      - path: / # 路径
        pathType: Prefix
        backend: # 后端服务
          service:
            name: katacoda
            port:
              number: 80
```

> **配置要点**（Ingress 路由规则）：
> - `rules[].host`：**域名**（`hello.example.com`）——按 Host 头路由
> - `rules[].http.paths[]`：路径规则（`path: /` + `pathType: Prefix` 匹配所有路径）
> - `backend.service.name/number`：**流量转发到的 Service**（katacoda:80）——Ingress 不直接连 Pod，而是转发给 Service（Service 再负载均衡到 Pod）
> - 完整链路：`外部请求 → ingress-nginx(NodePort) → 按域名/路径 → katacoda Service → katacoda Pod`

创建 ingress

```bash
kubectl apply -f katacoda.ingress.yaml
```

> 说明：1.22+ 中 `kubernetes.io/ingress.class` 注释已弃用，改用 `spec.ingressClassName` 字段指定 Ingress 类（本手册基线 v1.36 下必须使用新写法）。若 apply 时收到弃用警告，按以下步骤更新：

**1. 删除当前的 Ingress 资源：**

```bash
kubectl delete ingress katacoda-ingress
```

**2. 使用新字段创建 Ingress（移除旧注释，改用 `spec.ingressClassName`）：**

```bash
nano updated-ingress.yaml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: katacoda-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: hello.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: katacoda
            port:
              number: 80
```

**3. 应用更新后的 Ingress：**

```bash
kubectl apply -f updated-ingress.yaml
```

查看ingress，观察ADDRESS选项

```bash
kubectl get ingress
```

```bash
root@node1:~/k8slab/svc# kubectl get ingress
NAME               CLASS    HOSTe               ADDRESS                       PORTS   AGE
katacoda-ingress   <none>   hello.example.com   192.168.0.12,192.168.0.13   80      10s
```

> **观察点**：`HOSTe` 列显示 `hello.example.com`（配置的域名）；`ADDRESS` 是 **ingress-nginx controller 所在节点的 IP**（192.168.0.12/13）——流量到达这些节点后，controller 按域名路由。

使用以下命令测试 ingress

```bash
curl http://192.168.0.12 -H "Host: hello.example.com"
```


```bash
root@node1:~/k8slab/svc# curl http://192.168.0.12 -H "Host: hello.example.com"
<h1>This request was processed by host: katacoda-56dbd65b59-l5zj7</h1>
root@node1:~/k8slab/svc# curl http://192.168.0.12 -H "Host: hello.example.com"
<h1>This request was processed by host: katacoda-56dbd65b59-fkwbx</h1>
root@node1:~/k8slab/svc# curl http://192.168.0.12 -H "Host: hello.example.com"
<h1>This request was processed by host: katacoda-56dbd65b59-csltf</h1>
```

> **观察点**：`curl http://192.168.0.12 -H "Host: hello.example.com"`——访问节点 IP 但**用 `-H` 指定 Host 头为 hello.example.com**，ingress-nginx 据此路由到 katacoda Service（仍负载均衡到 3 个 Pod）。**Ingress 的核心：同一个 IP，靠域名区分路由**（比 NodePort 每服务一个端口更灵活）。

亦可修改 hosts 文件

```bash
cat /etc/hosts
```

```bash
root@node1:~/k8slab/svc# cat /etc/hosts
127.0.0.1       localhost

# The following lines are desirable for IPv6 capable hosts
::1     localhost       ip6-localhost   ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters

127.0.1.1       localhost.vm    localhost
127.0.1.1       base    base
127.0.1.1       node1   node1

192.168.0.11 node1
192.168.0.12 node2 nfs
192.168.0.13 node3 hello.example.com
```

测试（hosts 已把 hello.example.com 解析到 node3，可直接用域名访问）

```bash
curl http://hello.example.com
```

```bash
root@node1:~/k8slab/svc# curl http://hello.example.com
<h1>This request was processed by host: katacoda-56dbd65b59-l5zj7</h1>
root@node1:~/k8slab/svc# curl http://hello.example.com
<h1>This request was processed by host: katacoda-56dbd65b59-fkwbx</h1>
root@node1:~/k8slab/svc# curl http://hello.example.com
<h1>This request was processed by host: katacoda-56dbd65b59-csltf</h1>
```

> **观察点**：直接用域名 `http://hello.example.com` 访问也成功（hosts 已配置解析），且负载均衡到 3 个 Pod——完整链路验证通过：**域名 → ingress-nginx → katacoda Service → Pod**。

**补充：Ingress 加 HTTPS（TLS）**

> 生产上 Ingress 通常走 HTTPS。给 Ingress 配 TLS 只需两步：**① 把证书存进 Secret（`kubernetes.io/tls` 类型，实验 06 将详述 Secret）；② Ingress 的 `spec.tls` 引用它**。证书可用自签名（测试）或正规 CA（生产）：

```bash
# 1. 生成自签名证书（测试用；生产用正规 CA 签发的证书）
openssl req -x509 -newkey rsa:2048 -nodes -keyout tls.key -out tls.crt -days 365 \
  -subj "/CN=hello.example.com"

# 2. 存入 TLS Secret（类型 kubernetes.io/tls）
kubectl create secret tls hello-tls --cert=tls.crt --key=tls.key -n default

# 3. Ingress 加 spec.tls 引用 Secret
kubectl patch ingress katacoda-ingress --type=merge -p '{
  "spec": {"tls": [{"hosts": ["hello.example.com"], "secretName": "hello-tls"}]}
}'
```

> **配置要点**（Ingress TLS 的机制）：
> - `kubectl create secret tls`——**TLS 专用 Secret 类型**（`kubernetes.io/tls`），cert/key 两个键；ingress-nginx 会读它并**自动终止 HTTPS**（外部走 443、到后端 Service 仍是 HTTP）
> - `spec.tls[].hosts`——哪些域名启用 TLS；`secretName`——用哪个证书
> - 访问验证：`curl -k https://hello.example.com`（`-k` 忽略自签名证书警告），同样能到达后端 Pod
> - 证书到期前要更新：重新 create secret 同名覆盖即可（ingress-nginx 自动加载）

清理 deploymen 和服务

```bash
kubectl delete -f katacoda.ingress.yaml
kubectl delete -f katasvc3.yaml
kubectl delete -f katasvc2.yaml
kubectl delete -f katasvc.yaml
kubectl delete -f katacoda.yaml
kubectl delete pod test-dns
```

## Lab 6 NetworkPolicy 网络策略

> **目标**：用 NetworkPolicy 实现**网络隔离**——只允许指定来源访问 Pod，验证"未放行的流量被丢弃"（CKA 必考）。
> **验证概念**：默认情况下**所有 Pod 之间可以任意互通**（扁平网络）。**NetworkPolicy 是"白名单防火墙"**：定义了哪些 Pod 允许被哪些来源访问（ingress）或访问哪些目标（egress）——**一旦有 NetworkPolicy 选中某个 Pod，未匹配的流量默认被拒绝**。本实验用 calico 作为 CNI（实验 01 装的，支持 NetworkPolicy）。

使用示例文件创建两个测试 Pod

```bash
nano netpolicy-pods.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  containers:
  - name: nginx
    image: nginx
---
apiVersion: v1
kind: Pod
metadata:
  name: client-allowed
  labels:
    role: allowed
spec:
  containers:
  - name: busybox
    image: busybox
    command: ["/bin/sh", "-c", "sleep 3600"]
---
apiVersion: v1
kind: Pod
metadata:
  name: client-blocked
  labels:
    role: blocked
spec:
  containers:
  - name: busybox
    image: busybox
    command: ["/bin/sh", "-c", "sleep 3600"]
```

```bash
kubectl apply -f netpolicy-pods.yaml
kubectl get pod -o wide
```

先验证：默认情况下两个客户端都能访问 web

```bash
kubectl exec -it client-allowed -- wget -q -O- http://<web-Pod-IP> | head -1
kubectl exec -it client-blocked -- wget -q -O- http://<web-Pod-IP> | head -1
```

```bash
root@node1:~/k8slab/svc# kubectl get pod -o wide
NAME             READY   STATUS    RESTARTS   AGE   IP             NODE
web              1/1     Running   0          30s   10.244.135.20  node3
client-allowed   1/1     Running   0          30s   10.244.104.60  node2
client-blocked   1/1     Running   0          30s   10.244.104.61  node2
root@node1:~/k8slab/svc# kubectl exec -it client-allowed -- wget -q -O- http://10.244.135.20
Welcome to nginx!
root@node1:~/k8slab/svc# kubectl exec -it client-blocked -- wget -q -O- http://10.244.135.20
Welcome to nginx!
```

> **观察点**（基线）：**两个客户端都能访问 web**——默认网络是"全通"的（无 NetworkPolicy 时没有任何隔离）。下面加策略后，对比立刻显现。

创建 NetworkPolicy：只允许 `role: allowed` 的 Pod 访问 web

```bash
nano web-netpolicy.yaml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-policy
spec:
  podeelector:                # 策略作用对象：带 app=web 标签的 Pod
    matchLabels:
      app: web
  policyTypes:                # 生效方向：ingress（入站）+ egress（出站）
  - Ingress
  - Egress
  ingress:                    # 入站白名单
  - from:
    - podeelector:            # 只允许带 role=allowed 标签的 Pod 访问
        matchLabels:
          role: allowed
    ports:
    - protocol: TCP
      port: 80
  egress:                     # 出站白名单（允许 DNS + 访问本命名空间）
  - to:
    - podeelector: {}
    ports:
    - protocol: TCP
      port: 80
  - to:
    - namespaceeelector: {}   # 允许访问 kube-system 的 DNS（coredns）
      podeelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
```

> **配置要点**（NetworkPolicy 的核心字段，CKA 必考）：
> - `podeelector`——**策略管谁**（带 app=web 的 Pod 被"圈进"这个策略）
> - `policyTypes`——生效方向：`Ingress`（入站）/`Egress`（出站）——**只要声明了方向，该方向未匹配的流量就被拒绝**
> - `ingress.from`——入站白名单：`podeelector`（按来源 Pod 标签）+ `namespaceeelector`（按来源命名空间，这里未用）；`ports` 限定端口
> - `egress.to`——出站白名单：本命名空间 Pod（`podeelector: {}`）+ coredns（`namespaceeelector: {}` 匹配 kube-system + podeelector 匹配 kube-dns）——**注意：egress 不放开 DNS，Pod 就没法域名解析**（新手最容易踩的坑）

应用策略并再次验证

```bash
kubectl apply -f web-netpolicy.yaml
kubectl exec -it client-allowed -- wget -q -O- http://10.244.135.20
kubectl exec -it client-blocked -- wget -q -O- http://10.244.135.20
```

```bash
root@node1:~/k8slab/svc# kubectl apply -f web-netpolicy.yaml
networkpolicy.networking.k8s.io/web-policy created
root@node1:~/k8slab/svc# kubectl exec -it client-allowed -- wget -q -O- http://10.244.135.20
Welcome to nginx!
root@node1:~/k8slab/svc# kubectl exec -it client-blocked -- wget -q -O- http://10.244.135.20
wget: can't connect to remote host (10.244.135.20): Connection timed out
```

> **观察点**（策略生效的瞬间，对比是最佳教学）：
> - `client-allowed` → **正常返回**（Welcome to nginx!）——`role: allowed` 在 ingress 白名单里
> - `client-blocked` → **`Connection timed out`**——不在白名单里，**流量被 calico 丢弃**（不是拒绝连接，而是超时——数据包被静默丢弃，这是网络策略的典型表现）
> - 结论：**同一目标、两种来源、两种结果**——NetworkPolicy 就是"按标签定向放行"的网络防火墙

查看 NetworkPolicy 详情

```bash
kubectl get networkpolicy
kubectl describe networkpolicy web-policy
```

> **观察点**：`kubectl get networkpolicy` 列表能看到 web-policy（`pod-selector: app=web`、`Ingress` 允许 `role=allowed:80`）；`describe` 详细列出 Podeelector/Ingress/Egress 规则——与 yaml 一一对应。

**清理**

```bash
kubectl delete -f web-netpolicy.yaml
kubectl delete -f netpolicy-pods.yaml
```

> 说明：删除策略与三个测试 Pod，恢复默认"全通"网络（生产环境的 NetworkPolicy 通常是默认拒绝 + 逐服务放行，配合命名空间标签管理）。

**补充：Service 进阶用法（多端口 + ExternalName）**

> Service 除了单端口，还有两个常用形态：

**① 多端口 Service**——后端 Pod 暴露多个端口时，给每个端口起名字（同一 selector 复用）：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-svc
spec:
  selector:
    app: myapp
  ports:
  - name: http        # 端口命名（多端口时必须命名）
    port: 80
    targetPort: 8080
  - name: metrics
    port: 9090
    targetPort: 9090
```

> **配置要点**：多个 `ports` 条目 + **每个必须 `name`**（多端口时命名是硬性要求）；`port`（Service 暴露的端口）与 `targetPort`（Pod 容器端口）可不同——`kubectl get svc` 会显示为 `80:xxxxx/TCP,9090:xxxxx/TCP`。

**② ExternalName 类型**——把 Service 指向**集群外部的域名**（如云数据库、第三方 API），Pod 通过 Service 名访问外部服务：

```bash
kubectl create service externalname my-ext --external-name=api.example.com --tcp=80:80
```

```bash
kubectl get svc my-ext
```

```bash
root@node1:~/k8slab/svc# kubectl get svc my-ext
NAME     TYPE           CLUSTER-IP   EXTERNAL-IP   PORT(e)   AGE
my-ext   ExternalName   <none>       api.example.com   80/TCP   5s
```

> **观察点**：`TYPE: ExternalName`、`CLUSTER-IP: <none>`、`EXTERNAL-IP: api.example.com`——Service 不做代理，只是 **DNS 别名**（CNAME）：Pod 访问 `my-ext.default.svc` 会直接解析到 `api.example.com`。适合"无缝对接外部系统"场景。

清理 ExternalName

```bash
kubectl delete svc my-ext
```


## Lab 7 NetworkPolicy egress 出站规则（推荐）

> **目标**：给 Pod 配置 egress（出站）规则，验证"只允许访问白名单目标"并理解 **DNS 放行**的必要性。
> **验证概念**：教材 §9.5.2——egress 限制 Pod 的**出站**流量；**配置 egress 后集群 DNS（coredns）也要放行**（53/UDP），否则 Pod 域名解析全断——教材实验 06 踩过的坑。

```bash
# ① 两个后端（echo 服务 + 普通 nginx）
kubectl create deployment echo-svc --image=nginx
kubectl expose deployment echo-svc --port=80
kubectl create deployment other-svc --image=nginx
kubectl expose deployment other-svc --port=80

# ② 客户端 Pod
kubectl run client --image=busybox --command -- sleep 3600
kubectl exec client -- wget -q -O- -T 3 http://echo-svc | head -1    # 基线：能通
```

> **基线确认**：默认全通（教材 §9.5.1）——client 能访问 echo-svc（没有策略时所有 Pod 互通）。

配置 egress 白名单（只允许访问 echo-svc + DNS）

```bash
cat > egress-policy.yaml <<'EOF'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: client-egress
spec:
  podSelector:
    matchLabels:
      run: client               # 作用对象：client Pod
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:              # 放行：echo-svc 的 Pod
        matchLabels:
          app: echo-svc
  - to:                          # 放行：集群 DNS（coredns）
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
    ports:
    - protocol: UDP
      port: 53
EOF
kubectl apply -f egress-policy.yaml
sleep 5
kubectl exec client -- wget -q -O- -T 3 http://echo-svc | head -1      # 通（白名单内）
kubectl exec client -- wget -q -O- -T 3 http://other-svc | head -1     # 不通（白名单外）
kubectl exec client -- nslookup kubernetes.default.svc                 # DNS 通（已放行）
```

```bash
root@node1:~/k8slab/svc# kubectl exec client -- wget -q -O- -T 3 http://other-svc | head -1
wget: can't connect to remote host (10.244.x.x:80): Connection timed out
```

> **配置要点**（egress，教材 §9.5.2）：
> - `policyTypes: [Egress]`——只限制出站（ingress 不受影响）
> - `to.podSelector`（echo-svc 的 Pod）+ **`to.namespaceSelector`（kube-system 的 coredns）放行 DNS 53/UDP**——**不放行 DNS 的话，连 `http://echo-svc` 都解析不了**（报 unknown host 而非超时）
> - 白名单语义：**egress 配置后，没写进 to 的目标全部禁止**（教材 §9.5.2）

> **观察点**（白名单生效 + DNS 放行）：client **能访问 echo-svc（白名单内）、不能访问 other-svc（超时）**；同时 DNS 解析正常（coredns 被显式放行）——**出站隔离的完整配置 = 业务白名单 + DNS 放行**（教材 §9.5.2 的踩坑点）。

**清理**

```bash
kubectl delete -f egress-policy.yaml
kubectl delete pod client
kubectl delete deployment echo-svc other-svc
kubectl delete svc echo-svc other-svc
```
## 本章小结

本章通过 7 个实验（+ 2 个补充），掌握了 Pod 服务暴露、集群网络与隔离的完整链路：

| 实验 | 验证的知识点 | 关键概念 | 级别 |
|---|---|---|:---:|
| Lab 1 创建 katacoda deployment | Pod 各自有独立 IP，可直接访问 | Pod IP（10.244.x.x） | 必做 |
| Lab 2 创建 cluster ip 服务 | Service 提供稳定的虚拟 IP 入口并负载均衡 | ClusterIP、selector、port/targetPort | 必做 |
| Lab 3 创建 nodeport 服务 | 节点端口暴露，集群外部可访问 | NodePort（30000-32767）、nodePort 手动指定 | 必做 |
| Lab 4 创建 none clusterIP 服务 | headless 服务 DNS 返回全部后端 IP | clusterIP: None、DNS 轮询 | 必做 |
| Lab 5 使用 ingress 发布服务 | 七层入口按域名/路径路由；TLS 证书终止 | ingress-nginx、host/path、spec.tls + Secret | 必做 |
| Lab 6 NetworkPolicy 网络策略 | 默认全通 → 策略白名单隔离；ingress 定向放行 | podSelector、policyTypes、from、DNS 放行 | 必做 |
| Lab 7 NetworkPolicy egress | 出站白名单；DNS（53/UDP）必须放行 | egress、to、namespaceSelector、DNS 放行 | 推荐 |

**核心认知**：
1. **Service 是 Pod 的稳定入口**——Pod IP 会变（重建/漂移），Service 的虚拟 IP 固定不变，且自动负载均衡
2. **三种 Service 类型**：ClusterIP（集群内）、NodePort（集群外，节点端口）、LoadBalancer（云负载均衡，本手册未覆盖）；headless（`clusterIP: None`）用于直接拿后端 IP；ExternalName（外部域名别名）
3. **四层 vs 七层**：Service/NodePort 是四层（IP+端口），Ingress 是七层（域名/路径）——Ingress 更灵活，一个入口管理多个服务；TLS 用 `spec.tls` + `kubernetes.io/tls` Secret
4. **Ingress 完整链路**：`外部请求 → ingress-nginx(NodePort) → 按域名/路径 → Service → Pod`
5. **网络不是默认安全的**：默认"全通"，隔离靠 NetworkPolicy 白名单——"管入也管出"，放行 DNS 是 egress 的常见坑

**与后续章节的衔接**：
- Service 的 selector/负载均衡 → 实验 04 调度（流量如何到 Pod）
- Ingress 的域名路由 → 实验 05 存储/实验 06 配置（应用发布场景）
- NetworkPolicy → 实验 08 安全（网络层隔离与 RBAC 互补）、生产多租户隔离
- TLS Secret → 实验 06 Secret 类型（kubernetes.io/tls）

## 备注

- 语法查询

查看创建服务的帮助文件

```text
kubectl create service --help
```

```text
kubectl create service clusterip --help
```

创建 katacoda deployment 示例 yaml

```bash
kubectl create deployment katacoda --image=katacoda/docker-http-server --dry-run=client -o yaml
```

创建 cluster ip svc yaml 示例文件

```text
kubectl create service clusterip katacoda --tcp 80:80 --dry-run=client -o yaml
```

创建 nodeport svc yaml 示例文件

```text
kubectl create service nodeport katacoda --tcp 80:80 --dry-run=client -o yaml
```

上述文件需要做少量的清理工作，注意缩进，svc如果要共存，则需要在对第二个文件中的服务名进行重命名

- ingress 创建步骤

> ⚠️ **v1.36 适配**：原备用方案（`k8s.gcr.io` + controller v1.0.0）已不可用——`k8s.gcr.io` 已于 2023 年停用（迁移至 `registry.k8s.io`），v1.0.0 也太老。改用官方当前版本的 baremetal manifest：

```bash
# 下载当前版本 ingress-nginx（baremetal 方式）
curl -sSL https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/baremetal/deploy.yaml -o deploy.yaml

# 国内网络可先将 registry.k8s.io 的镜像替换为加速镜像（可选，若拉取失败再执行）
sed -i 's@registry.k8s.io/ingress-nginx/controller@docker.1panel.live/registry.k8s.io/ingress-nginx/controller@g' deploy.yaml

kubectl apply -f deploy.yaml
```

> 版本号 `controller-v1.12.0` 会随时间更新，最新版本见 https://github.com/kubernetes/ingress-nginx/releases；国内网络拉取 `registry.k8s.io` 镜像失败时，可参考 实验 01 「应急方案」曲线导入，或改用文中加速站前缀。manifest 方式验证 `kubectl get pods -n ingress-nginx` 全部 Running 后，后续步骤不变。

