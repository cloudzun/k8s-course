# 综合演练：WordPress 应用发布

## 实验准备

- **前置条件**：已完成 实验 01-10全部实验的 3 节点集群（node1=master，node2/node3=worker），并已具备：calico CNI、ingress-nginx（实验 07 Lab 5）、local-path 默认 StorageClass（实验 08 Lab 4）、metrics-server（实验 05 Lab 1）
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，按 `nano xxx.yaml` 创建即可，无需克隆外部仓库
- **工作目录**：本章实验在 `/root/k8slab/wp` 下进行（如不存在先 `mkdir -p`）

> ℹ️ **本章定位**：全书收官综合演练——把 实验 02-09的核心知识（Deployment/Service/Ingress、PV/PVC、ConfigMap/Secret、HPA、探针）串成一个真实应用：**发布一个可持久化、可水平扩展、可通过域名访问的 WordPress 站点**。各 Lab 中的终端输出为参考示例（基于本手册约定的 192.168.0.x 环境），实际 IP、AGE 等会因环境不同而不同，**关注架构链路而非具体数值**。

**整体架构**：

```
用户 → http://wp.example.com
        └── Ingress（ingress-nginx，实验 04）
             └── WordPress Service（ClusterIP）
                  ├── WordPress Deployment（多副本 + HPA，实验 09）
                  │    ├── /var/www/html ← PVC（wordpress-pvc，local-path 动态，实验 05）
                  │    └── env 密码 ← Secret（mysql-pass，实验 06）
                  └── MySQL Service（ClusterIP）
                       └── MySQL Deployment（单副本）
                            ├── /var/lib/mysql ← PVC（mysql-pvc，local-path 动态）
                            └── env 密码 ← Secret（mysql-pass）
```

**实验分级**：

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 MySQL 数据库 | Secret + PVC 持久化 | 必做 |
| Lab 2 发布 WordPress | Deployment + Service + PVC | 必做 |
| Lab 3 水平扩展 | 多副本 + HPA | 必做 |
| Lab 4 Ingress 域名发布 | 完整链路验证 | 必做 |
| Lab 5 数据持久化验证 | 删 Pod 数据仍在 | 必做 |
| Lab 6 WordPress 生产化 | PDB/配额/探针/preStop 收尾 | 可选·进阶 |

---
## Lab 1 MySQL 数据库（Secret + PVC 持久化）

> **目标**：部署 MySQL 作为 WordPress 的数据库，用 Secret 管理密码、PVC 持久化数据目录。
> **验证概念**：复用 05/实验 06 知识——**Secret 注入敏感信息**（`secretKeyRef` 从 Secret 取密码，yaml 里不出现明文）、**PVC + local-path 动态交付**（数据落节点本地，删 Pod 不丢）。MySQL 是本应用"数据之源"，先把它跑稳。

创建命名空间与 Secret

```bash
kubectl create ns wordpress
kubectl -n wordpress create secret generic mysql-pass --from-literal=password=wordpress123
```

> **配置要点**（Secret，实验 06 Lab 4 复习）：`--from-literal` 创建 `mysql-pass`（Opaque 类型），密码 `wordpress123` 只存在 Secret 里；后面 MySQL 和 WordPress 都用 `secretKeyRef` 引用，yaml 全程无明文密码。

创建 MySQL 的 PVC（数据持久化）

```bash
nano mysql-pvc.yaml
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  namespace: wordpress
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: local-path   # 实验 08 Lab 4 安装的默认 StorageClass（动态交付）
  resources:
    requests:
      storage: 5Gi
```

```bash
kubectl apply -f mysql-pvc.yaml
```

> **配置要点**（PVC，实验 08 Lab 4 复习）：声明 5Gi 存储 + `storageClassName: local-path`——local-path provisioner 会自动创建 PV 并绑定（动态交付），数据落在节点本地 `/opt/local-path-provisioner`。

创建 MySQL Deployment

```bash
nano mysql.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
  namespace: wordpress
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: mysql-pvc
      containers:
      - name: mysql
        image: mysql:5.7
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-pass
              key: password
        - name: MYSQL_DATABASE
          value: wordpress        # 启动时自动创建 wordpress 库
        - name: MYSQL_USER
          value: wordpress        # 创建专用账号（不用 root）
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-pass
              key: password
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
```

> **配置要点**（MySQL 与生产配置的对应关系）：
> - `volumes[].persistentVolumeClaim` + `volumeMounts`——数据目录 `/var/lib/mysql` 挂到 PVC（**Pod 删了数据还在**）
> - `env` 四个变量：root 密码与业务密码都来自 **Secret**（`secretKeyRef`）；`MYSQL_DATABASE/USER/PASSWORD` 是官方镜像的初始化钩子——首次启动自动建库建账号
> - 单副本（`replicas: 1`）：数据库不适合随意多副本（多写冲突），生产会用主从，本演练保持单点

部署并暴露 Service

```bash
kubectl apply -f mysql.yaml
kubectl -n wordpress expose deployment mysql --port=3306 --target-port=3306 --name=mysql
```

查看状态（首次初始化数据目录较慢，等待 1-2 分钟）

```bash
kubectl -n wordpress get pod,svc,pvc
```

```bash
root@node1:~/k8slab/wp# kubectl -n wordpress get pod,svc,pvc
NAME                         READY   STATUS    RESTARTS   AGE
pod/mysql-55b646db5d-vht5r   1/1     Running   0          2m

NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/mysql   ClusterIP   10.109.236.97   <none>        3306/TCP   2m

NAME                              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
persistentvolumeclaim/mysql-pvc   Bound    pvc-e76d5cd0-72fe-4830-87a0-ee44eff2bc19   5Gi        RWO            local-path     2m
```

> **观察点**（三层都就绪）：
> - Pod `mysql-xxx` **Running**——MySQL 启动完成
> - Service `mysql`（ClusterIP:3306）——**WordPress 通过服务名 `mysql` 连接**（实验 04 知识：Service 提供稳定入口，Pod 重建 IP 变了也不影响）
> - PVC `mysql-pvc` **Bound**（VOLUME 是 `pvc-<uid>` 自动名）——local-path 动态创建了 PV，数据落节点本地

验证数据库可用（wordpress 库已自动创建）

```bash
POD=$(kubectl -n wordpress get pod -l app=mysql -o jsonpath='{.items[0].metadata.name}')
kubectl -n wordpress exec $POD -- mysql -uwordpress -pwordpress123 -e "show databases;"
```

```bash
root@node1:~/k8slab/wp# kubectl -n wordpress exec $POD -- mysql -uwordpress -pwordpress123 -e "show databases;"
mysql: [Warning] Using a password on the command line interface can be insecure.
Database
information_schema
wordpress
```

> **观察点**：`wordpress` 数据库已存在——`MYSQL_DATABASE=wordpress` 初始化生效，密码来自 Secret 认证成功。

## Lab 2 发布 WordPress（Deployment + Service + PVC）

> **目标**：部署 WordPress 前端（PHP+Apache），连接 MySQL，并把站点文件（主题/上传）持久化到 PVC。
> **验证概念**：WordPress 通过**环境变量**（`WORDPRESS_DB_*`，实验 06 env 注入）连接 MySQL；站点文件目录 `/var/www/html` 挂 PVC（**持久化用户数据：主题、插件、上传的图片**）；`readinessProbe`（实验 03）保证就绪才接流量。

创建 WordPress 的 PVC

```bash
nano wordpress-pvc.yaml
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: wordpress-pvc
  namespace: wordpress
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: local-path
  resources:
    requests:
      storage: 2Gi
```

```bash
kubectl apply -f wordpress-pvc.yaml
```

创建 WordPress Deployment

```bash
nano wordpress.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordpress
  namespace: wordpress
spec:
  replicas: 1
  selector:
    matchLabels:
      app: wordpress
  template:
    metadata:
      labels:
        app: wordpress
    spec:
      volumes:
      - name: wp-data
        persistentVolumeClaim:
          claimName: wordpress-pvc
      containers:
      - name: wordpress
        image: wordpress:php8.2-apache
        env:
        - name: WORDPRESS_DB_HOST
          value: mysql                    # Service 名（实验 07 DNS）
        - name: WORDPRESS_DB_USER
          value: wordpress
        - name: WORDPRESS_DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-pass            # 与 MySQL 同一个 Secret（实验 06）
              key: password
        - name: WORDPRESS_DB_NAME
          value: wordpress
        ports:
        - containerPort: 80
        readinessProbe:                   # 就绪探针（实验 03）：就绪才接流量
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
        volumeMounts:
        - name: wp-data
          mountPath: /var/www/html
```

> **配置要点**（WordPress 与环境变量的对应）：
> - `WORDPRESS_DB_HOST: mysql`——**直接填 Service 名**（实验 07 DNS 解析：`mysql.wordpress.svc` → ClusterIP），Pod 重建也不影响连接
> - `WORDPRESS_DB_PASSWORD` 用 `secretKeyRef` 引同一个 `mysql-pass`——**应用与数据库共享一个 Secret**（实验 06"配置外部化"）
> - `readinessProbe`——WordPress 启动较慢（要连 MySQL + 初始化），探针确保"就绪才接流量"（实验 03）
> - `image: wordpress:php8.2-apache`——官方镜像，**较大（~600MB）**，首次拉取请耐心（加速站可能 10-30 分钟，见 实验 01 镜像加速；也可预先用 `ctr pull` 预拉）

> ⚠️ **镜像拉取慢的应对（实测）**：wordpress 镜像 ~600MB，免费加速站（1panel/hubfast 等）对大镜像**限速或卡死**（实测 1.5KiB/s 基本不动）。实测有效方案：**用 `ctr` 后台从 `docker.m.daocloud.io` 拉取**（约 3 分钟完成），再 tag 成官方名，kubelet 直接用本地镜像：
>
> ```bash
> # 在需要运行 wordpress 的节点上执行（Deployment 会调度到哪台，先看现状；保险起见 3 台都拉）
> nohup bash -c 'ctr -n k8s.io images pull docker.m.daocloud.io/library/wordpress:php8.2-apache \
>   && ctr -n k8s.io images tag docker.m.daocloud.io/library/wordpress:php8.2-apache \
>      docker.io/library/wordpress:php8.2-apache' > /tmp/pull-wp.log 2>&1 &
> # 查看进度：tail -f /tmp/pull-wp.log；完成后 ctr -n k8s.io images list -q | grep wordpress
> ```
>
> 拉取完成后删除 wordpress pod 触发重建（kubelet 用本地镜像秒起）。备选源：`docker.1panel.live`（小镜像快）、`free.hubfast.cn`。

部署并暴露 Service

```bash
kubectl apply -f wordpress.yaml
kubectl -n wordpress expose deployment wordpress --port=80 --target-port=80 --name=wordpress
```

查看状态（镜像大，等待时间较长）

```bash
kubectl -n wordpress get pod,svc
```

```bash
root@node1:~/k8slab/wp# kubectl -n wordpress get pod,svc
NAME                             READY   STATUS    RESTARTS   AGE
pod/mysql-55b646db5d-vht5r       1/1     Running   0          10m
pod/wordpress-64cd84dd9-tq44d    1/1     Running   0          9m

NAME                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/mysql       ClusterIP   10.109.236.97   <none>        3306/TCP   10m
service/wordpress   ClusterIP   10.101.240.46   <none>        80/TCP     9m
```

> **观察点**：`wordpress-xxx` **1/1 Running**——readinessProbe 通过（说明 WordPress 已连上 MySQL 并完成初始化）。两个 Service 就绪。

验证 WordPress 页面（从集群内访问；**首次访问返回 302 重定向到安装页，用 `-L` 跟随**）

```bash
WPIP=$(kubectl -n wordpress get pod -l app=wordpress -o jsonpath='{.items[0].status.podIP}')
curl -sL http://$WPIP | grep -o '<title>[^<]*'
```

```bash
root@node1:~/k8slab/wp# curl -sL http://$WPIP | grep -o '<title>[^<]*'
<title>WordPress › Installation</title>
```

> **观察点**：返回 `<title>WordPress › Installation</title>`——**WordPress 安装页已可访问**（首次访问 302 重定向到 `/wp-admin/install.php` 安装向导，配置完站点标题等即可用）。用 `kubectl logs` 能看到 `GET / → 302`、`GET /wp-admin/install.php → 200` 的完整请求链。

## Lab 3 水平扩展（多副本 + HPA）

> **目标**：把 WordPress 扩到多副本，并用 HPA 按 CPU 自动伸缩。
> **验证概念**：WordPress 是无状态前端（数据在 MySQL/PVC），**可以安全多副本**（实验 03 Deployment + 实验 05 HPA）。注意：多副本共享同一个 `wordpress-pvc`——**local-path 是单节点存储**，多副本会调度到不同节点导致 PVC 无法同时挂载！所以本 Lab 先扩到多节点可用状态，HPA 用 CPU 演示（真机多副本共享 PVC 需共享存储，见 实验 05 说明）。

> ⚠️ **local-path 的单节点限制（实测关键）**：`wordpress-pvc` 是 local-path（节点本地），**同一时刻只能被一个节点的 Pod 挂载**（ReadWriteOnce + 单节点存储）。所以本 Lab 的"多副本"是**同一节点上的多副本**（或用 `podAntiAffinity` 避免冲突），HPA 主要演示**机制**；生产多副本共享存储需 NFS/云盘（实验 05 讲过 local-path 的局限）。

扩到 2 副本（同一节点可共存）

```bash
kubectl -n wordpress scale deployment wordpress --replicas=2
kubectl -n wordpress get pod -o wide | grep wordpress
```

```bash
root@node1:~/k8slab/wp# kubectl -n wordpress get pod -o wide | grep wordpress
wordpress-64cd84dd9-tq44d    1/1     Running   0          12m   10.244.135.63   node2   <none>   <none>
wordpress-64cd84dd9-zx7p2    1/1     Running   0          30s   10.244.135.64   node2   <none>   <none>
```

> **观察点**：2 个副本都在 node2（`10.244.135.63/64`）——因为 PVC 是节点本地存储，调度器保证它们在同节点（第二个副本调度时发现 PVC 已被 node2 占用，只能也去 node2；若强制跨节点会 Pending，`describe` 会看到 PVC 冲突）。**多副本 + 共享 PVC = 同节点**，Service 照常负载均衡（实验 07）。

创建 HPA（按 CPU 自动伸缩）

```bash
kubectl -n wordpress autoscale deployment wordpress --cpu=60% --min=1 --max=5
kubectl -n wordpress get hpa
```

```bash
root@node1:~/k8slab/wp# kubectl -n wordpress get hpa
NAME        REFERENCE              TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
wordpress   Deployment/wordpress   cpu: 0%/60%     1         5         2          20s
```

> **观察点**（HPA，实验 05 Lab 2 复习）：`cpu: 0%/60%`——metrics-server 在采集；CPU 超 60% 自动扩容到最多 5 副本。**注意**：由于共享 PVC 的限制，扩容上来的副本仍会堆在同一节点（或 Pending），这正说明"**水平扩展的前提是存储可共享**"（生产用 NFS/云盘，实验 05 核心认知）。
>
> ℹ️ 旧语法 `--cpu-percent=60` 已弃用（会告警 `Flag --cpu-percent has been deprecated`），v1.36 用 `--cpu=60%`。

手动触发扩容观察（可选：模拟 CPU 压力）

```bash
kubectl -n wordpress run load --image=busybox --restart=Never -- sh -c \
  "while true; do wget -q -O- http://wordpress >/dev/null 2>&1; done" &
# 观察 HPA 的 TARGETS 上升
kubectl -n wordpress get hpa -w
```

> **观察点**：持续请求会让 CPU 利用率上升，HPA 的 TARGETS 从 0% 涨到 60%+ 后自动 `New size: 3`（实验 05 Events）。压测完删除 load Pod：`kubectl -n wordpress delete pod load`。

## Lab 4 Ingress 域名发布 + 完整链路验证

> **目标**：用 Ingress 把 WordPress 发布为域名 `wp.example.com`，并从集群外完整验证整条链路。
> **验证概念**：实验 07 Ingress 复习——`ingress-nginx` 按 Host 头路由：`wp.example.com → wordpress Service → Pod`；`-H "Host: wp.example.com"` 模拟域名访问（真实环境在 DNS 把域名指向节点 IP）。

创建 Ingress

```bash
nano wordpress-ingress.yaml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: wordpress
  namespace: wordpress
spec:
  ingressClassName: nginx
  rules:
  - host: wp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: wordpress
            port:
              number: 80
```

```bash
kubectl apply -f wordpress-ingress.yaml
kubectl -n wordpress get ingress
```

```bash
root@node1:~/k8slab/wp# kubectl -n wordpress get ingress
NAME        CLASS   HOSTS            ADDRESS         PORTS   AGE
wordpress   nginx   wp.example.com   192.168.0.181   80      5s
```

> **观察点**：Ingress `HOSTS: wp.example.com`、`ADDRESS` 是 ingress-nginx controller 所在节点 IP——**流量到达该节点后按域名路由**（实验 07）。

完整链路验证（模拟域名访问；**首次访问返回 302 重定向，直接访问安装页路径最直观**）

```bash
NP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.spec.ports[0].nodePort}')
echo "ingress-nginx NodePort: $NP"
# 方式 A：请求安装页路径（绕过 302 重定向）
curl -s -H "Host: wp.example.com" "http://192.168.0.114:$NP/wp-admin/install.php" | grep -o '<title>[^<]*'
# 方式 B：请求根路径看 302 重定向（证明路由生效）
curl -s -o /dev/null -w "HTTP %{http_code} -> %{redirect_url}\n" -H "Host: wp.example.com" "http://192.168.0.114:$NP"
```

```bash
root@node1:~/k8slab/wp# curl -s -H "Host: wp.example.com" "http://192.168.0.114:$NP/wp-admin/install.php" | grep -o '<title>[^<]*'
<title>WordPress › Installation</title>
root@node1:~/k8slab/wp# curl -s -o /dev/null -w "HTTP %{http_code} -> %{redirect_url}\n" -H "Host: wp.example.com" "http://192.168.0.114:$NP"
HTTP 302 -> http://wp.example.com/wp-admin/install.php
```

> **观察点**（完整链路打通）：
> - 方式 A 返回 **`WordPress › Installation`**——`wp.example.com → ingress-nginx → wordpress Service → Pod → MySQL` 全链路连通
> - 方式 B 显示 **`302 → http://wp.example.com/wp-admin/install.php`**——Ingress 正确路由到 WordPress，WordPress 引导到安装向导
> - **注意**：`-L` 跟随重定向会去解析 `wp.example.com`（真实环境 DNS 已指向节点）；本实验无真实 DNS，所以直接用安装页路径验证。真实环境把 `wp.example.com` 解析到节点 IP 后，浏览器直接打开 `http://wp.example.com` 即可。

## Lab 5 数据持久化验证 + 清理

> **目标**：验证"删掉 Pod 数据仍在"（持久化的意义），然后按序清理全部资源。
> **验证概念**：WordPress 的内容（主题/上传）在 PVC、数据库在 MySQL 的 PVC——**删 Pod、甚至删 Deployment，数据都还在**（实验 05 核心认知）。先写入数据再删 Pod 验证，最后整体清理。

**验证持久化**（写入 → 删 Pod → 数据仍在）

```bash
# ① 在 PVC 里写一个标识文件
WP_POD=$(kubectl -n wordpress get pod -l app=wordpress -o jsonpath='{.items[0].metadata.name}')
kubectl -n wordpress exec $WP_POD -- sh -c "echo persistence-ok > /var/www/html/persist.txt"

# ② 删除全部 WordPress Pod（模拟故障/重建）
kubectl -n wordpress delete pod -l app=wordpress

# ③ 等新 Pod 起来（拉镜像已有，很快），检查数据
sleep 30
WP_POD2=$(kubectl -n wordpress get pod -l app=wordpress -o jsonpath='{.items[0].metadata.name}')
kubectl -n wordpress exec $WP_POD2 -- cat /var/www/html/persist.txt
```

```bash
root@node1:~/k8slab/wp# kubectl -n wordpress exec $WP_POD2 -- cat /var/www/html/persist.txt
persistence-ok
```

> **观察点**：新 Pod 里读到了 `persistence-ok`——**Pod 删除重建后，PVC 里的数据原样保留**。同理 MySQL 的数据在 `mysql-pvc`，删 MySQL Pod 数据库也不丢。这就是"**应用无状态、数据有状态**"的容器化实践（03/实验 08）。

**按序清理**（先业务后数据，先应用后存储）

```bash
# ① 删 Ingress 和 HPA（先停流量与伸缩）
kubectl -n wordpress delete ingress wordpress
kubectl -n wordpress delete hpa wordpress

# ② 删 Deployment 和 Service
kubectl -n wordpress delete deployment wordpress mysql
kubectl -n wordpress delete svc wordpress mysql

# ③ 删 PVC（确认数据不要了才删！PVC 删了数据目录跟着回收）
kubectl -n wordpress delete pvc wordpress-pvc mysql-pvc

# ④ 删 Secret 和命名空间（命名空间删除会清掉里面全部残留）
kubectl -n wordpress delete secret mysql-pass
kubectl delete ns wordpress

# ⑤ 确认清空
kubectl get ns | grep wordpress || echo "wordpress 命名空间已删除"
```

> **清理说明**：**顺序很重要**——先删 Ingress/HPA（停入口与伸缩），再删工作负载（Deployment/SVC），最后删数据（PVC）与凭据（Secret）。**PVC 删除 = 数据删除**（local-path 的回收策略 Delete），确认不要数据再删；想保留数据就留着 PVC。

## Lab 6 WordPress 生产化（可选·进阶）

> **目标**：给已跑通的 WordPress 套上生产安全网：**PDB（驱逐保护）+ 资源配额 + liveness 探针 + preStop 优雅退出**——演练"从能跑 → 生产可用"的最后一步。
> **验证概念**：教材 §11 生产化设计——可用性三件套：**PDB 保副本**（驱逐时至少留 1）、**配额控资源**（防单应用吃光集群）、**探针 + preStop 保优雅**（探针感知故障、preStop 让旧 Pod 体面下线）。

```bash
# ① PDB：保证 WordPress 至少 1 个副本可用（排空节点时不再"裸奔"）
cat > wp-pdb.yaml <<'EOF'
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: wordpress-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: wordpress
EOF
kubectl apply -f wp-pdb.yaml
kubectl get pdb wordpress-pdb    # ALLOWED DISRUPTIONS: 1（当前 2 副本时可容忍驱逐 1 个）

# ② 资源配额：给 wp 命名空间设总量上限（防 WordPress 压垮集群）
cat > wp-quota.yaml <<'EOF'
apiVersion: v1
kind: ResourceQuota
metadata:
  name: wp-quota
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
EOF
kubectl apply -f wp-quota.yaml
kubectl describe quota wp-quota

# ③ 给 WordPress Deployment 补 liveness 探针 + 资源 requests/limits + preStop
kubectl patch deployment wordpress --patch '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "wordpress",
          "livenessProbe": {
            "httpGet": {"path": "/", "port": 80},
            "initialDelaySeconds": 30, "periodSeconds": 10
          },
          "resources": {"requests": {"cpu": "100m", "memory": "128Mi"},
                        "limits":   {"cpu": "500m", "memory": "512Mi"}},
          "lifecycle": {"preStop": {"exec": {"command": ["/bin/sh", "-c", "sleep 5"]}}}
        }]
      }
    }
  }
}'
kubectl rollout status deployment/wordpress
kubectl get pods -l app=wordpress   # 滚动更新后 RestartCount 应为 0（liveness 没误杀）
```

> **配置要点**：
> - **PDB**（教材 §10.3.2）：`minAvailable: 1` = 驱逐时至少保留 1 个副本——`kubectl drain` 会被 PDB 挡住（ALLOWED DISRUPTIONS 为 0 时驱逐失败，实验 12 Lab 3 的实战场景）
> - **配额**（实验 05 Lab 4 复习）：命名空间总量上限，超限的 Deployment 创建直接被拒
> - **liveness**（实验 03 探针）：`initialDelaySeconds: 30` 避开启动慢误杀；`periodSeconds: 10` 每 10 秒探一次
> - **preStop**：Pod 终止前先睡 5 秒——等 Service Endpoint 摘除完成再停容器，**滚动更新/缩容时不丢请求**（配合 readiness 全链路优雅）

> **观察点**：`kubectl get pods -w` 看滚动更新过程（新 Pod Ready 后旧 Pod 才终止）；`kubectl rollout restart deployment wordpress` 手动触发一次，观察 preStop 的 5 秒延迟（Pod Terminating 状态停留 ~5s）。

**清理**（含 Lab 5 未删资源，一次性收尾）

```bash
kubectl delete pdb wordpress-pdb
kubectl delete quota wp-quota
kubectl delete ingress wp-ingress
kubectl delete hpa wordpress
kubectl delete deployment wordpress mysql
kubectl delete svc wordpress mysql
kubectl delete pvc wordpress-pvc mysql-pvc   # 确认数据不要了再删
kubectl delete secret mysql-pass
kubectl delete ns wordpress
```
## 本章小结

本章用一个真实的 WordPress 应用，把全书核心知识点串成了完整链路：

| 环节 | 用到的知识（章节） | 关键资源 | 级别 |
|---|---|---|---|
| MySQL 数据库 | Secret 密码（06）、PVC 持久化（05） | mysql Deployment、mysql-pvc、mysql-pass | 必做 |
| WordPress 前端 | env 注入（06）、readinessProbe（03） | wordpress Deployment、wordpress-pvc | 必做 |
| 服务暴露 | Service（04） | wordpress/mysql ClusterIP | 必做 |
| 水平扩展 | Deployment 扩缩容（03）、HPA（09） | `scale`、autoscale、cpu%/60 | 必做 |
| 域名发布 | Ingress（04） | wp.example.com → wordpress | 必做 |
| 数据持久化 | PV/PVC（05） | 删 Pod 数据仍在 | 必做 |
| 生产化收尾 | PDB（10）、配额（05）、探针/preStop（03） | PDB、ResourceQuota、liveness、preStop | 可选·进阶 |

**核心认知**：
1. **完整链路**：`域名 → Ingress → Service → Deployment(Pod) → PVC/MySQL`——每一步都是前面某章的知识点，缺一环应用就跑不起来
2. **数据与应用分离**：WordPress 前端是无状态的（可多副本、可删可重建），**数据（上传文件 + MySQL）是有状态的**（PVC 持久化）——这是云原生应用设计的核心原则
3. **Secret 贯穿全程**：数据库密码只在 Secret 里出现一次，MySQL 和 WordPress 都通过 `secretKeyRef` 引用——**凭据不落 yaml**（实验 06）
4. **水平扩展的前提是存储可共享**：local-path 是单节点存储，多副本共享 PVC 会受限——生产多副本必须用 NFS/云盘等共享存储（实验 08 local-path 局限的实战体现）
5. **排障思路**（实验 10）在本章同样适用：WordPress 白屏 → `kubectl logs` 看是否连不上 MySQL → `describe` 看探针/事件 → 检查 Secret/Service 名

**实战意义**：这个演练就是**生产环境"发布一个 Web 应用"的标准姿势**——数据库独立、凭据入 Secret、数据进 PVC、前端可扩展、域名走 Ingress。掌握了它，就掌握了 K8s 上部署业务应用的完整方法论。
