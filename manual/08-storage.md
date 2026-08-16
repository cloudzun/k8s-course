# 实现基本存储


## 实验准备

- **前置条件**：已完成 实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，按 `nano xxx.yaml` 创建即可，无需克隆外部仓库
- **工作目录**：本章实验在 `/root/k8slab/storage` 下进行（如不存在先 `mkdir -p`）

> ℹ️ 各 Lab 中的终端输出为参考示例（基于本手册约定的 192.168.0.x 环境），实际 Pod IP、节点分布、AGE 等会因环境不同而不同，关注输出**结构**而非具体数值。

```bash
root@node1:~/k8slab/storage# pwd
/root/k8slab/storage
```

**实验分级**：

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 卷基础（hostPath/emptyDir） | 挂载方式与持久性差异 | 必做 |
| Lab 2 hostpath 实现方式 | 应用级持久化 | 必做 |
| Lab 3 使用 PVC 和 PV | 静态绑定 | 必做 |
| Lab 4 使用存储类动态交付 | 声明即用 | 必做 |
| Lab 5 PVC 在线扩容 | 在线扩大不重建 | 推荐 |
| Lab 6 PV 回收策略对比 | Retain vs Delete | 推荐 |
| Lab 7 NFS 共享存储（RWX） | 多副本共享存储 | 推荐 |
## Lab 1 卷基础：Pod 级 volume（hostPath 与 emptyDir）

> **目标**：用单 Pod 演示 hostPath 和 emptyDir 两种卷，观察数据持久化与生命周期。
> **验证概念**：hostPath 把宿主机目录挂给 Pod（数据持久化，但**不跨节点**——Pod 漂移后数据丢失）；emptyDir 是 Pod 生命周期内的临时目录（Pod 删除即清空）。



使用示例文件创建yaml文件

```bash
nano nginx-volume-hostpath.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-volume-hostpath
  namespace: default
spec:
  volumes: # 定义卷（spec 级）
  - name: web-root
    hostPath:
      path: /data
  containers:
  - name: nginx
    image: nginx
    volumeMounts: # 挂接卷
    - name: web-root
      mountPath: /data
    command:
    - sleep
    args:
    - "3600"
```

> **配置要点**（卷的两种声明）：
> - `spec.volumes`：**定义卷**（spec 级）——`hostPath` 类型，把宿主机 `/data` 目录映射为卷
> - `spec.containers[].volumeMounts`：**挂接卷**——把上面定义的卷挂到容器内 `/data`（容器内路径）
> - 关键：**容器内 `/data` 实际就是宿主机 node 的 `/data`**（hostPath 是"直通宿主机目录"）
> - `command/args`：`sleep 3600` 让容器保持存活，方便进去验证

创建pod

```bash
kubectl apply -f nginx-volume-hostpath.yaml
```

进入pod中的容器

```text
kubectl exec -it nginx-volume-hostpath -- /bin/bash
```

查看路径

```bash
df -hT
```

尝试创建文件

```bash
cd /data/
touch aaa
touch bbb
echo "abraham is here" > ccc
ls
```

```bash
root@node1:~/k8slab/pod# kubectl exec -it nginx-volume-hostpath -- /bin/bash
root@nginx-volume-hostpath:/# df -hT
Filesystem     Type     Size  Used Avail Use% Mounted on
overlay        overlay  125G  6.6G  113G   6% /
tmpfs          tmpfs     64M     0   64M   0% /dev
tmpfs          tmpfs    3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/sda1      ext4     125G  6.6G  113G   6% /data
shm            tmpfs     64M     0   64M   0% /dev/shm
tmpfs          tmpfs    7.7G   12K  7.7G   1% /run/secrets/kubernetes.io/serviceaccount
tmpfs          tmpfs    3.9G     0  3.9G   0% /proc/acpi
tmpfs          tmpfs    3.9G     0  3.9G   0% /proc/scsi
tmpfs          tmpfs    3.9G     0  3.9G   0% /sys/firmware
root@nginx-volume-hostpath:/# cd /data/
touch aaa
touch bbb
echo "abraham is here" > ccc
ls
aaa  bbb  ccc
root@nginx-volume-hostpath:/data#
```

> **观察点**（df + 写文件）：
> - `df -hT` 里 `/data` 挂载的是 `/dev/sda1 ext4`（**宿主机磁盘**，不是容器 overlay）——证明 hostPath 把宿主机目录映射进来了
> - 在容器内 `/data` 写了 `aaa bbb ccc` 三个文件——**这些文件实际写到了宿主机 node2 的 /data**（下一步到 node2 验证）

退出容器上下文

```bash
exit
```

查看pod,关注pod所在的节点

```bash
kubectl get pod -o wide
```

此例中,该 pod 被调度到 node2 上

```bash
root@node1:~/k8slab/pod# kubectl get pod -o wide
NAME                    READY   STATUS    RESTARTS   AGE    IP             NODE    NOMINATED NODE   READINESS GATES
nginx                   1/1     Running   0          153m   10.244.135.3   node3   <none>           <none>
nginx-volume-hostpath   1/1     Running   0          4m9s   10.244.104.9   node2   <none>           <none>
```

> **观察点**：`nginx-volume-hostpath` 被调度到 **node2**（NODE 列）——hostPath 卷挂的是 node2 的 `/data`。**记下这个节点**：下面在 node2 上能看到写入的数据（也预示着局限——数据绑定在这台机器）。

在上述节点上下文中执行以下操作查看文件

```bash
cd /data/
ls
cat ccc
```

```bash
root@node2:~# cd /data/
root@node2:/data# ls
aaa  bbb  ccc
root@node2:/data# cat ccc
abraham is here
root@node2:/data#
```

> **观察点**：**在宿主机 node2 上直接看到了容器写入的 `aaa bbb ccc`**（cat ccc 返回容器里写入的内容）——验证了 hostPath 的本质：**容器内 /data 和宿主机 /data 是同一个目录**。数据确实持久化到了宿主机。

排空pod所在节点

```bash
kubectl drain node2 --ignore-daemonsets --force
```

```bash
root@node1:~/k8slab/pod# kubectl drain node2 --ignore-daemonsets --force
node/node2 cordoned
WARNING: deleting Pods not managed by ReplicationController, ReplicaSet, Job, DaemonSet or StatefulSet: default/nginx-volume-hostpath; ignoring DaemonSet-managed Pods: kube-system/calico-node-57snh, kube-system/kube-proxy-qkfvc
evicting pod default/nginx-volume-hostpath
pod/nginx-volume-hostpath evicted
node/node2 drained
```

查看node

```bash
kubectl get node
```

```bash
root@node1:~/k8slab/pod# kubectl get node
NAME    STATUS                     ROLES                  AGE    VERSION
node1   Ready                      control-plane,master   242d   v1.36.2
node2   Ready,SchedulingDisabled   <none>                 242d   v1.36.2
node3   Ready                      <none>                 242d   v1.36.2
```

> **观察点**：drain 后 node2 的 STATUS 变为 `Ready,SchedulingDisabled`（排空）——节点不再接收新 Pod，原有的 Pod 被逐出。这是测试"hostPath 数据是否跟着 Pod 走"的手段。

重新创建 pod

```bash
kubectl apply -f nginx-volume-hostpath.yaml
```

查看 pod

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/pod# kubectl get pod -o wide
NAME                    READY   STATUS    RESTARTS   AGE    IP             NODE    NOMINATED NODE   READINESS GATES
nginx                   1/1     Running   0          161m   10.244.135.3   node3   <none>           <none>
nginx-volume-hostpath   1/1     Running   0          20s    10.244.135.4   node3   <none>           <none>
```

> **观察点**：重新创建的 Pod 被调度到了 **node3**（不是原来的 node2）——而 hostPath 数据在 node2 的 `/data`。**下面验证：node3 上的 /data 是空的**（数据没有跟过来），这就是 hostPath 的核心局限。

注意这一次 pod 被调度到了 `node3` 上

再次进入 pod 中的容器

```bash
kubectl exec -it nginx-volume-hostpath -- /bin/bash
```

查看路径

```text
df -hT
```

```bash
root@node1:~/k8slab/pod# kubectl exec -it nginx-volume-hostpath -- /bin/bash
root@nginx-volume-hostpath:/# df -hT
Filesystem     Type     Size  Used Avail Use% Mounted on
overlay        overlay  125G  6.6G  113G   6% /
tmpfs          tmpfs     64M     0   64M   0% /dev
tmpfs          tmpfs    3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/sda1      ext4     125G  6.6G  113G   6% /data
shm            tmpfs     64M     0   64M   0% /dev/shm
tmpfs          tmpfs    7.7G   12K  7.7G   1% /run/secrets/kubernetes.io/serviceaccount
tmpfs          tmpfs    3.9G     0  3.9G   0% /proc/acpi
tmpfs          tmpfs    3.9G     0  3.9G   0% /proc/scsi
tmpfs          tmpfs    3.9G     0  3.9G   0% /sys/firmware
```

重点关注 /data 目录

查看文件

```bash
cd /data/
ls
```

```bash
root@nginx-volume-hostpath:/# cd /data/
ls
root@nginx-volume-hostpath:/data#
```

> **观察点**：Pod 重建后被调度到 **node3**，这里 `/data` 是**空的**（`ls` 无输出）——之前写在 node2 的数据没跟过来。**这就是 hostPath 的核心局限：数据绑定在 Pod 当时所在的节点，Pod 换节点 = 数据丢失**。生产环境要避免这种方案（用共享存储）。

荡然无存

退出容器上下文

```bash
exit
```

清理 pod

```bash
kubectl delete -f nginx-volume-hostpath.yaml
```

恢复此前被排空的节点

```bash
kubectl uncordon node2
```

确认节点状态

```bash
kubectl get node
```

```bash
root@node1:~/k8slab/pod# kubectl uncordon node2
node/node2 uncordoned
root@node1:~/k8slab/pod# kubectl get node
NAME    STATUS   ROLES                  AGE    VERSION
node1   Ready    control-plane,master   242d   v1.36.2
node2   Ready    <none>                 242d   v1.36.2
node3   Ready    <none>                 242d   v1.36.2
```



使用示例文件创建yaml文件

```bash
nano nginx-volume-emptydir.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-volume-emptydir
  namespace: default
spec:
  volumes:
  - name: web-path # 不用定义本地路径
    emptyDir:
  containers:
  - name: nginx
    image: nginx
    volumeMounts:
    - name: web-path # 挂接emptyDir
      mountPath: /www
    command:
    - sleep
    args:
    - "3600"
```

> **配置要点**：与 hostPath 的差异——
> - `emptyDir:`（**不指定路径**）：临时目录，随 Pod 生命周期创建/销毁（Pod 删除即清空）
> - 对比 hostPath 的 `path: /data`（指定宿主机路径，数据持久）
> - 用途：容器间共享临时数据（如缓存、sidecar 交换文件）

创建pod

```bash
kubectl apply -f nginx-volume-emptydir.yaml
```

查看 pod, 确认 pod 所在的节点

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/pod# kubectl get pod -o wide
NAME                    READY   STATUS    RESTARTS   AGE    IP              NODE    NOMINATED NODE   READINESS GATES
nginx                   1/1     Running   0          174m   10.244.135.3    node3   <none>           <none>
nginx-volume-emptydir   1/1     Running   0          37s    10.244.104.10   node2   <none>           <none>
```

> **观察点**：`nginx-volume-emptydir` 调度到 **node2**。emptyDir 与 hostPath 的关键区别在**生命周期**（下面验证）：emptyDir 不需要指定宿主机路径，Pod 删除数据即消失。

此例中, pod 被调度到 `node2`

进入pod中的容器

```bash
kubectl exec -it nginx-volume-emptydir -- /bin/bash
```

查看路径

```text
df -hT
```

```bash
root@node1:~/k8slab/pod# kubectl exec -it nginx-volume-emptydir -- /bin/bash
root@nginx-volume-emptydir:/# df -hT
Filesystem     Type     Size  Used Avail Use% Mounted on
overlay        overlay  125G  6.6G  113G   6% /
tmpfs          tmpfs     64M     0   64M   0% /dev
tmpfs          tmpfs    3.9G     0  3.9G   0% /sys/fs/cgroup
shm            tmpfs     64M     0   64M   0% /dev/shm
tmpfs          tmpfs    7.7G   12K  7.7G   1% /run/secrets/kubernetes.io/serviceaccount
tmpfs          tmpfs    3.9G     0  3.9G   0% /proc/acpi
tmpfs          tmpfs    3.9G     0  3.9G   0% /proc/scsi
tmpfs          tmpfs    3.9G     0  3.9G   0% /sys/firmware
```

看不到此前定义的www目录

尝试盲操作进入www目录，并创建文件

```bash
cd /www/
touch aaa
ls
```

```bash
root@nginx-volume-emptydir:/# cd /www/
touch aaa
ls
aaa
root@nginx-volume-emptydir:/www#
```

> **观察点**：`df` 里**看不到 /www 挂载**（emptyDir 不映射宿主机目录，df 不显示）——但 `cd /www` 能进入并写文件（emptyDir 自动创建在容器可写位置）。下面验证：**Pod 删除重建后，/www 里的文件就没了**（临时性）。

退出容器上下文

```bash
exit
```

删除并重新创建 pod

```bash
kubectl delete -f nginx-volume-emptydir.yaml
kubectl apply -f nginx-volume-emptydir.yaml
```

查看pod

```bash
kubectl get pod -o wide
```

```bash
root@node1:~/k8slab/pod# kubectl get pod -o wide
NAME                    READY   STATUS    RESTARTS   AGE    IP              NODE    NOMINATED NODE   READINESS GATES
nginx                   1/1     Running   0          3h2m   10.244.135.3    node3   <none>           <none>
nginx-volume-emptydir   1/1     Running   0          22s    10.244.104.11   node2   <none>           <none>
```

> **观察点**：删除并重建后，emptyDir Pod 仍调度到 node2（调度结果相同）。**关键是下面验证数据**：emptyDir 是临时目录，Pod 重建后数据应已清空（与 hostPath 的"数据在宿主机"不同）。

确认pod所在的节点没有变化

再次进入pod中的容器

```bash
kubectl exec -it nginx-volume-emptydir -- /bin/bash
```

尝试进入WWW目录，并查看文件列表

```bash
cd /www/
ls
```

```bash
root@node1:~/k8slab/pod# kubectl exec -it nginx-volume-emptydir -- /bin/bash
root@nginx-volume-emptydir:/# cd /www/
ls
root@nginx-volume-emptydir:/www#
```

> **观察点**：Pod 重建后 `/www` 里**什么都没有了**（之前写的 aaa 消失）——emptyDir 是**临时存储**，随 Pod 生命周期销毁。对比 hostPath（数据留宿主机），emptyDir 数据不持久。

都是空的所以这个故事告诉我们emptyDir就是一场空

退出容器上下文

```bash
exit
```

清理 pod

```bash
kubectl delete -f nginx-volume-emptydir.yaml
```


## Lab 2 hostpath 实现方式

> **目标**：给 mysql Deployment 挂 hostPath 卷，实现应用数据持久化。
> **验证概念**：生产应用的持久化方式——把数据目录（/var/lib/mysql）挂到宿主机，容器删除后数据仍在；同时看到 hostPath 的局限（数据固定在某个节点）。


创建名称空间

```bash
kubectl create ns blog
```

分析原版mysql deployment配置文件

```bash
mysql.deploy.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-deploy
  namespace: blog
  labels:
    app: mysql
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
      containers:
      - name: mysql
        image: mysql:5.7
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3306
          name: dbport
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: wordpress
        - name: MYSQL_DATABASE
          value: wordpress
```

> 该 Deployment 在 blog 命名空间部署 1 个 MySQL 5.7 实例（容器端口 3306），通过环境变量设置 root 密码和初始数据库均为 `wordpress`。本实验将在此基础上加入卷挂载实现数据持久化。

使用 hostPath 更新 mysql.deploy.yaml

```bash
nano mysql.deploy.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-deploy
  namespace: blog
  labels:
    app: mysql
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
      volumes: # 定义卷
      - name: mysqldata
        hostPath:
          path: /mysql
      containers:
      - name: mysql
        image: mysql:5.7
        imagePullPolicy: IfNotPresent
        volumeMounts:    #设定挂接点
        - name: mysqldata
          mountPath: /var/lib/mysql
        ports:
        - containerPort: 3306
          name: dbport
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: wordpress
        - name: MYSQL_DATABASE
          value: wordpress
```

> **配置要点**（相对基础 Deployment 增加的两处持久化配置）：
> 1. `volumes`：定义 `mysqldata` 卷（`hostPath` 类型，映射宿主机 `/mysql` 目录）
> 2. `volumeMounts`：将 `mysqldata` 卷挂载到容器 `/var/lib/mysql`（**MySQL 数据目录**），实现数据持久化——mysql 的数据写到了宿主机 `/mysql`，容器删除后数据仍在

运行mysql deployment


```bash
kubectl apply -f mysql.deploy.yaml
```

查看pod，关注mysql pod所在节点的信息

```bash
kubectl get pod -n blog -o wide
```

```bash
root@node1:~/k8slab/storage# kubectl get pod -n blog -o wide
NAME                           READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
mysql-deploy-cd587bcb4-cq42r   1/1     Running   0          63s   10.244.104.20   node2   <none>           <none>
```

> **观察点**：mysql Pod 运行在 **node2**（hostPath 卷绑定了 node2 的 `/mysql`）。下面到 node2 上验证数据是否真的写到了宿主机。

切换到上述节点的上下文，检查 volume 映射效果

```bash
ll /mysql/
```

```bash
root@node2:~# ll /mysql/
total 188488
drwxr-xr-x  6 systemd-coredump root                 4096 Dec 22 08:57 ./
drwxr-xr-x 23 root             root                 4096 Dec 22 08:57 ../
-rw-r-----  1 systemd-coredump systemd-coredump       56 Dec 22 08:57 auto.cnf
-rw-------  1 systemd-coredump systemd-coredump     1676 Dec 22 08:57 ca-key.pem
-rw-r--r--  1 systemd-coredump systemd-coredump     1112 Dec 22 08:57 ca.pem
-rw-r--r--  1 systemd-coredump systemd-coredump     1112 Dec 22 08:57 client-cert.pem
-rw-------  1 systemd-coredump systemd-coredump     1680 Dec 22 08:57 client-key.pem
-rw-r-----  1 systemd-coredump systemd-coredump     1352 Dec 22 08:57 ib_buffer_pool
-rw-r-----  1 systemd-coredump systemd-coredump 79691776 Dec 22 08:57 ibdata1
-rw-r-----  1 systemd-coredump systemd-coredump 50331648 Dec 22 08:57 ib_logfile0
-rw-r-----  1 systemd-coredump systemd-coredump 50331648 Dec 22 08:57 ib_logfile1
-rw-r-----  1 systemd-coredump systemd-coredump 12582912 Dec 22 08:57 ibtmp1
drwxr-x---  2 systemd-coredump systemd-coredump     4096 Dec 22 08:57 mysql/
drwxr-x---  2 systemd-coredump systemd-coredump     4096 Dec 22 08:57 performance_schema/
-rw-------  1 systemd-coredump systemd-coredump     1676 Dec 22 08:57 private_key.pem
-rw-r--r--  1 systemd-coredump systemd-coredump      452 Dec 22 08:57 public_key.pem
-rw-r--r--  1 systemd-coredump systemd-coredump     1112 Dec 22 08:57 server-cert.pem
-rw-------  1 systemd-coredump systemd-coredump     1676 Dec 22 08:57 server-key.pem
drwxr-x---  2 systemd-coredump systemd-coredump    12288 Dec 22 08:57 sys/
drwxr-x---  2 systemd-coredump systemd-coredump     4096 Dec 22 08:57 wordpress/
```

> **观察点**：node2 的 `/mysql/` 下有 mysql 的数据文件（ibdata1、ib_logfile0/1、mysql/、wordpress/ 等）——**mysql 的数据确实写到了宿主机目录**（hostPath 生效）。验证方法：删除 mysql Pod 再重建，数据仍在（数据在宿主机，不在容器里）。

## Lab 3 使用 PVC 和 PV

> **目标**：用 PVC 声明存储请求，手动创建 PV 并观察两者的绑定过程。
> **验证概念**：**PV（PersistentVolume）**是集群级存储资源，**PVC（PersistentVolumeClaim）**是应用对存储的请求；PVC 找到匹配的 PV 后绑定（Bound），Pod 才能调度。本 Lab 用 hostPath PV 演示静态绑定。


使用PVC更新 mysql.deploy.yaml

```bash
nano mysql.deploy3.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-deploy
  namespace: blog
  labels:
    app: mysql
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
      volumes: # 定义卷
      - name: mysqldata
        persistentVolumeClaim: # 使用PVC
          claimName: mysqldata
      containers:
      - name: mysql
        image: mysql:5.7
        imagePullPolicy: IfNotPresent
        volumeMounts:    #设定挂接点
        - name: mysqldata
          mountPath: /var/lib/mysql
        ports:
        - containerPort: 3306
          name: dbport
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: wordpress
        - name: MYSQL_DATABASE
          value: wordpress
```

> **配置要点**：与 Lab 2 的 hostPath 版本相比，卷改为 **PVC**——`volumes[].persistentVolumeClaim.claimName: mysqldata` 声明"我要使用名为 mysqldata 的 PVC"。这是**解耦**的方式：应用只声明"需要存储"，不关心底层实现（hostPath/NFS/云盘）。**PVC 必须存在才能调度**（下节演示 PVC 缺失导致 Pending）。

更新 deployment

```bash
kubectl apply -f mysql.deploy3.yaml
```

查看 pod 状态

```bash
kubectl get pod -n blog -o wide
```

```bash
root@node1:~/k8slab/storage# kubectl get pod -n blog -o wide
NAME                            READY   STATUS    RESTARTS   AGE   IP              NODE     NOMINATED NODE   READINESS GATES
mysql-deploy-77d94f6fb6-2gcds   1/1     Running   0          10m   10.244.104.23   node2    <none>           <none>
mysql-deploy-796f885bb8-t6kr8   0/1     Pending   0          6s    <none>          <none>   <none>           <none>
```

> **观察点**：新 deployment 的 Pod 状态 **`Pending`**（IP 为空、无节点）——因为它声明了 PVC（mysqldata），但**该 PVC 还不存在**，调度器无法确定存储，Pod 无法调度。这就是"PVC 必须先存在"的体现（下节创建 PVC 解决）。


可以观察到 pod 处于 pending 状态

查看 mysql pod 详细信息

```bash
kubectl describe pod mysql-deploy-796f885bb8-t6kr8 -n blog
```

```bash
Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  69s   default-scheduler  0/3 nodes are available: 3 persistentvolumeclaim "mysqldata" not found.
```

可以看到无法找到 pvc

使用以下范例创建 pvc 定义文件

```bash
nano mysql.pvc.yaml
```

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: mysqldata
  namespace: blog
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ""   # 关键：空字符串 = 禁用动态供应，强制手动匹配 PV
  resources:
    requests:
      storage: 5Gi
```

> **配置要点**（PVC 结构）：
> - `metadata.name/namespace`：PVC 名称（mysqldata）与命名空间（blog）——**PVC 是命名空间级资源**
> - `spec.accessModes: ReadWriteOnce`：访问模式（RWO=单节点读写）
> - `spec.resources.requests.storage: 5Gi`：申请的容量
> - **`storageClassName: ""`（实测必加）**：**若环境存在默认 StorageClass**（比如本 Lab 4 装了 local-path 后，或不带 SC 重新跑本实验），PVC 不指定 storageClassName 会**自动绑定默认 SC 走"动态供应"**（STATUS 变 Pending 等 WaitForFirstConsumer），**不会去匹配手动创建的 PV**——本 Lab 要演示的是手动 PV 的**静态绑定**，所以用空字符串显式禁用动态供应（**任何环境都稳妥**：无论有无默认 SC，都会强制手动匹配 PV）

创建pvc

```bash
kubectl apply -f mysql.pvc.yaml
```

查看 pvc，pvc 是定义在命名空间

```bash
kubectl get pvc -n blog
```

```bash
root@node1:~/k8slab/storage# kubectl get pvc -n blog
NAME        STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
mysqldata   Pending                                                     11s
```

> **观察点**：PVC 状态 **`Pending`**——还没有 PV 可绑定（VOLUME/CAPACITY 都为空）。PVC 创建后需要找到一个满足条件的 PV（容量 ≥5Gi、accessMode 匹配）才能 Bound。

再次查看mysql pod详细信息

```bash
kubectl describe pod mysql-deploy-796f885bb8-t6kr8 -n blog
```

```bash
Events:
  Type     Reason            Age                From               Message
  ----     ------            ----               ----               -------
  Warning  FailedScheduling  2m47s              default-scheduler  0/3 nodes are available: 3 persistentvolumeclaim "mysqldata" not found.
  Warning  FailedScheduling  55s (x1 over 90s)  default-scheduler  0/3 nodes are available: 3 persistentvolumeclaim "mysqldata" not found.
```

> **观察点**：Events 里的报错信息 `persistentvolumeclaim "mysqldata" not found`——**明确告诉你是 PVC 不存在导致无法调度**。排查 Pod Pending 问题，`describe` 的 Events 是最直接的线索。

状态依然是 pending，pvc 绑定出错

查看pvc状态

```bash
kubectl describe pvc mysqldata -n blog
```

```bash
root@node1:~/k8slab/storage# kubectl describe pvc mysqldata -n blog
Name:          mysqldata
Namespace:     blog
StorageClass:
Status:        Pending
Volume:
Labels:        <none>
Annotations:   <none>
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:
Access Modes:
VolumeMode:    Filesystem
Used By:       mysql-deploy-796f885bb8-t6kr8
Events:
  Type    Reason         Age                From                         Message
  ----    ------         ----               ----                         -------
  Normal  FailedBinding  2s (x8 over 102s)  persistentvolume-controller  no persistent volumes available for this claim and no storage class is set
```

> **观察点**：Events 的 `FailedBinding` 信息：`no persistent volumes available for this claim and no storage class is set`——**没有可用 PV 且没指定 StorageClass**，所以 PVC 无法绑定。下面创建 PV 解决。

可以看到没有可用 pv

使用以下范例定义pv（hostPath 类型，指向 node2 的目录；生产环境通常用云盘/NFS，此处为教学用 hostPath）

```bash
nano mysql.pv.yaml
```

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mysqldata-pv
  labels:
    name: mysqldata-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Recycle
  hostPath:
    path: /mysql-data
```

> **配置要点**：
> - `capacity.storage: 5Gi`：PV 声明的容量（需 ≥ PVC 请求的容量才能绑定）
> - `accessModes: ReadWriteOnce`：访问模式（RWO=单节点读写），需与 PVC 匹配
> - `hostPath.path: /mysql-data`：实际存储位置（本实验用 node 上的目录，生产用云盘/NFS 等真实存储）
> - `persistentVolumeReclaimPolicy: Recycle`：PVC 释放后 PV 的清空策略
> - **注意**：hostPath PV 绑定后，Pod 会调度到该目录所在的节点（node2）

创建 pv

```bash
kubectl apply -f mysql.pv.yaml
```

> 如果 node2 上还没有 `/mysql-data` 目录，先到 node2 创建：`mkdir -p /mysql-data`

查看 pv

```bash
kubectl get pv -o wide
```

```bash
root@node1:~/k8slab/storage# kubectl get pv -o wide
NAME           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM            STORAGECLASS   REASON   AGE   VOLUMEMODE
mysqldata-pv   5Gi        RWO            Recycle          Bound    blog/mysqldata                           30s   Filesystem
```

> **观察点**：`STATUS: Bound` + `CLAIM: blog/mysqldata`——**PV 和 PVC 成功绑定**（手动创建的 PV 被 PVC 匹配上）。容量（5Gi）和访问模式（RWO）匹配是关键。

已经和此前的 pvc 绑定

查看 pv 详细信息

```bash
kubectl describe pv mysqldata-pv -n blog
```

```bash
root@node1:~/k8slab/storage# kubectl describe pv mysqldata-pv -n blog
Name:            mysqldata-pv
Labels:          name=mysqldata-pv
Annotations:     pv.kubernetes.io/bound-by-controller: yes
Finalizers:      [kubernetes.io/pv-protection]
StorageClass:
Status:          Bound
Claim:           blog/mysqldata
Reclaim Policy:  Recycle
Access Modes:    RWO
VolumeMode:      Filesystem
Capacity:        5Gi
Node Affinity:   <none>
Message:
Source:
    Type:          HostPath (bare host directory volume)
    Path:          /mysql-data
    HostPathType:
Events:        <none>
```

> **观察点**：`Status: Bound`（PV 已绑定 PVC）、`Claim: blog/mysqldata`（绑定了哪个 PVC）、`Source` 显示 `HostPath /mysql-data`（实际存储位置在 node2）。

可以看到它所对应的目录

查看 pvc

```bash
kubectl get pvc -n blog -o wide
```

```bash
root@node1:~/k8slab/storage# kubectl get pvc -n blog -o wide
NAME        STATUS   VOLUME         CAPACITY   ACCESS MODES   STORAGECLASS   AGE     VOLUMEMODE
mysqldata   Bound    mysqldata-pv   5Gi        RWO                           4m42s   Filesystem
```

> **观察点**：PVC 状态从 Pending 变成 **`Bound`**，`VOLUME` 列指向 `mysqldata-pv`——**PVC 成功绑定 PV**（对比刚才的 Pending）。

查看 pvc 状态

```bash
kubectl describe pvc mysqldata -n blog
```

```bash
root@node1:~/k8slab/storage# kubectl get pvc -n blog -o wide
NAME        STATUS   VOLUME         CAPACITY   ACCESS MODES   STORAGECLASS   AGE     VOLUMEMODE
mysqldata   Bound    mysqldata-pv   5Gi        RWO                           4m42s   Filesystem
root@node1:~/k8slab/storage# kubectl describe pvc mysqldata -n blog
Name:          mysqldata
Namespace:     blog
StorageClass:
Status:        Bound
Volume:        mysqldata-pv
Labels:        <none>
Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      5Gi
Access Modes:  RWO
VolumeMode:    Filesystem
Used By:       mysql-deploy-796f885bb8-t6kr8
Events:
  Type    Reason         Age                     From                         Message
  ----    ------         ----                    ----                         -------
  Normal  FailedBinding  2m45s (x12 over 5m25s)  persistentvolume-controller  no persistent volumes available for this claim and no storage class is set
```

> **观察点**：`Status: Bound` + `Volume: mysqldata-pv`（绑定成功）；Events 里保留的 `FailedBinding` 是**之前 PVC 不存在时的历史记录**（绑定后不再新增）。`Used By` 显示哪个 Pod 在使用这个 PVC。

再次查看 mysql pod 详细信息

```bash
kubectl describe pod mysql-deploy-796f885bb8-t6kr8 -n blog
```

```bash
Events:
  Type     Reason            Age                   From               Message
  ----     ------            ----                  ----               -------
  Warning  FailedScheduling  8m24s                 default-scheduler  0/3 nodes are available: 3 persistentvolumeclaim "mysqldata" not found.
  Warning  FailedScheduling  6m32s (x1 over 7m7s)  default-scheduler  0/3 nodes are available: 3 persistentvolumeclaim "mysqldata" not found.
  Warning  FailedScheduling  4m7s (x1 over 5m7s)   default-scheduler  0/3 nodes are available: 3 pod has unbound immediate PersistentVolumeClaims.
  Normal   Scheduled         3m31s                 default-scheduler  Successfully assigned blog/mysql-deploy-796f885bb8-t6kr8 to node2
  Normal   Pulled            3m31s                 kubelet            Container image "mysql:5.7" already present on machine
  Normal   Created           3m31s                 kubelet            Created container mysql
  Normal   Started           3m31s                 kubelet            Started container mysql
```

一切 OK

清理资源

```bash
kubectl delete -f mysql.deploy3.yaml
kubectl delete -f mysql.pvc.yaml
kubectl delete -f mysql.pv.yaml
```

## Lab 4 使用存储类动态交付 PV

> **目标**：**安装 local-path StorageClass**（本手册刻意留到讲概念时才装），然后用它**自动创建 PV**——创建 PVC 即可使用，无需手动建 PV。
> **验证概念**：StorageClass 提供"动态交付"——声明 PVC 时指定 `storageClassName`，**provisioner 自动创建并绑定 PV**（对比 Lab 3 手动建 PV 的"静态绑定"）。本 Lab 从零安装 local-path（实验 01 安装阶段特意没装，就是为了在这里先讲概念再动手）。

**① 安装 local-path StorageClass**（仅 master 执行一次）：

```bash
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
kubectl patch storageclass local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

> **配置要点**（两条命令）：
> - 第一条：部署 **local-path-provisioner**（provisioner 组件 + StorageClass 对象 + RBAC），它是"谁负责自动创建 PV"的幕后角色
> - 第二条：把 `local-path` 标记为 **默认 StorageClass**（annotation `is-default-class: true`）——之后 PVC 不指定 storageClassName 时默认用它
> - 数据落点：local-path 在节点本地目录 `/opt/local-path-provisioner` 为 PVC 建目录（不是网络存储，是本地方案）
>
> ⚠️ **如果失败看这里**：local-path 的 provisioner Pod 一直 ImagePullBackOff/超时 → 该镜像（rancher/local-path-provisioner）在 docker.io，确认镜像加速配置（实验 01 步骤 3），或参考 实验 01 「应急方案」曲线导入。

**② 查看 StorageClass（确认安装成功）**

```bash
kubectl get sc -o wide
```

```bash
root@node1:~/k8slab/storage# kubectl get sc -o wide
NAME         PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
local-path   rancher.io/local-path   Delete          WaitForFirstConsumer false                  3d
```

> **观察点**：`local-path` 是默认 StorageClass（`(default)` 标记）。**`PROVISIONER: rancher.io/local-path`** 就是"谁负责自动创建 PV"——下面创建 PVC 时它会自动工作。

> 说明：若 `kubectl get sc` 显示 `local-path` 已存在且为 default（例如环境之前手动装过），可跳过安装步骤直接开始 ③。

使用以下样例创建 pvc yaml（指定 `storageClassName: local-path`）

```bash
nano pvc002.yaml
```

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pvc002
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: local-path
  resources:
    requests:
      storage: 10Gi
```

> **配置要点**：与 Lab 3 的 PVC 相比，这里 **`storageClassName: local-path`** 指定了存储类——创建 PVC 时 provisioner 会自动创建 PV 并绑定（动态交付）。注意**没有手动建 PV**（对比 Lab 3 的静态绑定）。

创建 pvc

```bash
kubectl apply -f pvc002.yaml
```

查看 pvc

```bash
kubectl get pvc
```

```bash
root@node1:~/k8slab/storage# kubectl get pvc
NAME     STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
pvc002   Bound    pvc-bb58a14d-d76b-4b99-b6fa-043336aaf6ff   10Gi       RWX            local-path     7s
```

> **观察点**：PVC **立即 Bound**——local-path 自动创建了 PV（VOLUME 列是自动生成的 PV 名）。对比 Lab 3 手动建 PV 后才能 Bound，这就是"动态交付"。

可以看到自动创建的 pv

查看 pv

```bash
kubectl get pv -o wide
```

```bash
root@node1:~/k8slab/storage# kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM            STORAGECLASS   REASON   AGE
pvc-bb58a14d-d76b-4b99-b6fa-043336aaf6ff   10Gi       RWX            Delete           Bound    default/pvc002   local-path              48s
```

> **观察点**：PV 名是 **`pvc-bb58a14d-...`**（自动生成，以 PVC 的 uid 命名）、`STORAGECLASS: local-path`、`RECLAIM POLICY: Delete`——**完全由 local-path 自动创建并绑定**，我们一行 PV 都没写（对比 Lab 3 手写 mysqldata-pv）。

特别关注 pv 的名称 `pvc-bb58a14d-d76b-4b99-b6fa-043336aaf6ff`

到 PV 所在节点查看实际目录（local-path 的数据落在节点本地 `/opt/local-path-provisioner` 下）

```bash
ll /opt/local-path-provisioner/
```

```bash
root@node2:~# ll /opt/local-path-provisioner/
total 20
drwxrwxrwx  4 root             root 4096 Dec 22 09:38 ./
drwxr-xr-x 23 root             root 4096 Dec 22 08:57 ../
drwxrwxrwx  2 root             root 4096 Dec 22 09:38 pvc-bb58a14d-d76b-4b99-b6fa-043336aaf6ff/
```

> **观察点**：`/opt/local-path-provisioner/` 下自动生成了 **`pvc-bb58a14d-...`** 目录（与 PV 名对应）——local-path 在节点本地为 PVC 创建了实际存储目录。数据会落在这个目录里。

可以看到 pv 对应的目录

更新 mysql pvc 文件

```bash
nano mysql.pvc2.yaml
```

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: mysqldata
  namespace: blog
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: local-path # 指定使用存储类（本 Lab 刚安装的默认 StorageClass）
  resources:
    requests:
      storage: 5Gi
```

> **配置要点**：与 Lab 3 的 mysql.pvc.yaml 相比，这里多了 **`storageClassName: local-path`**——指定用 local-path 动态创建 PV（无需手动建 PV，对比 Lab 3）。

更新 pvc

```bash
kubectl apply -f mysql.pvc2.yaml
```

查看 pvc

```bash
kubectl get pvc -n blog -o wide
```

```bash
root@node1:~/k8slab/storage# kubectl get pvc -n blog -o wide
NAME        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE   VOLUMEMODE
mysqldata   Bound    pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8   5Gi        RWO            local-path        9s    Filesystem
```

> **观察点**：mysql 的 PVC 也 **Bound**（`STORAGECLASS: local-path`）——local-path 自动为它创建了 PV（VOLUME 列 `pvc-c51e5118-...`）。**同一个 StorageClass 可以给多个 PVC 分别动态创建 PV**。

可以看到系统自动创建了 pv

查看 pv

```bash
kubectl get pv -o wide
```

```bash
root@node1:~/k8slab/storage# kubectl get pv -o wide
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM            STORAGECLASS   REASON   AGE     VOLUMEMODE
pvc-bb58a14d-d76b-4b99-b6fa-043336aaf6ff   10Gi       RWX            Retain           Bound    default/pvc002   local-path                 8m57s   Filesystem
pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8   5Gi        RWO            Retain           Bound    blog/mysqldata   local-path                 53s     Filesystem
```

> **观察点**：现在有 **2 个自动创建的 PV**，分别绑定到 `default/pvc002` 和 `blog/mysqldata`——每个 PVC 一个 PV，都是 local-path 动态生成的（对比 Lab 3 手动建一个 PV）。

查看 pv 详细信息

```bash
kubectl describe pv pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8 -n blog
```

```bash
root@node1:~/k8slab/storage# kubectl describe pv pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8 -n blog
Name:            pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8
Labels:          <none>
Annotations:     pv.kubernetes.io/provisioned-by: rancher.io/local-path
Finalizers:      [kubernetes.io/pv-protection]
StorageClass:    local-path
Status:          Bound
Claim:           blog/mysqldata
Reclaim Policy:  Delete
Access Modes:    RWO
VolumeMode:      Filesystem
Capacity:        5Gi
Node Affinity:   <none>
Message:
Source:
    Type:          HostPath (bare host directory volume)
    Path:          /opt/local-path-provisioner/pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8
    HostPathType:  DirectoryOrCreate
Events:                <none>
```

> **观察点**：`Annotations: provisioned-by: rancher.io/local-path`（PV 由 local-path 自动创建）、`Source: HostPath /opt/local-path-provisioner/...`（数据实际落在该节点目录）。**PV 名 `pvc-<uid>`、目录名全部自动生成**——这就是动态交付的产物（对比 Lab 3 手动命名 mysqldata-pv）。

重点关注 pv 所对应路径

在 PV 所在节点查看实际目录

```bash
ll /opt/local-path-provisioner/pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8/
```

```bash
root@node2:~# ll /opt/local-path-provisioner/pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8/
total 8
drwxrwxrwx 2 root root 4096 Dec 22 09:46 ./
drwxrwxrwx 5 root root 4096 Dec 22 09:46 ../
```

此时是空的

重新创建 mysql

```bash
kubectl apply -f mysql.deploy3.yaml
```

再次查看 pv 所对应的目录

```bash
ll /opt/local-path-provisioner/pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8/
```

```bash
root@node2:~# ll /opt/local-path-provisioner/pvc-c51e5118-a7c0-44ad-bf69-d7eca38fbdc8/
total 122944
drwxrwxrwx 5 systemd-coredump root                 4096 Dec 22 09:50 ./
drwxrwxrwx 5 root             root                 4096 Dec 22 09:46 ../
-rw-r----- 1 systemd-coredump systemd-coredump       56 Dec 22 09:50 auto.cnf
-rw------- 1 systemd-coredump systemd-coredump     1680 Dec 22 09:50 ca-key.pem
-rw-r--r-- 1 systemd-coredump systemd-coredump     1112 Dec 22 09:50 ca.pem
-rw-r--r-- 1 systemd-coredump systemd-coredump     1112 Dec 22 09:50 client-cert.pem
-rw------- 1 systemd-coredump systemd-coredump     1680 Dec 22 09:50 client-key.pem
-rw-r----- 1 systemd-coredump systemd-coredump 12582912 Dec 22 09:50 ibdata1
-rw-r----- 1 systemd-coredump systemd-coredump 50331648 Dec 22 09:50 ib_logfile0
-rw-r----- 1 systemd-coredump systemd-coredump 50331648 Dec 22 09:50 ib_logfile1
-rw-r----- 1 systemd-coredump systemd-coredump 12582912 Dec 22 09:50 ibtmp1
drwxr-x--- 2 systemd-coredump systemd-coredump     4096 Dec 22 09:50 mysql/
drwxr-x--- 2 systemd-coredump systemd-coredump     4096 Dec 22 09:50 performance_schema/
-rw------- 1 systemd-coredump systemd-coredump     1680 Dec 22 09:50 private_key.pem
-rw-r--r-- 1 systemd-coredump systemd-coredump      452 Dec 22 09:50 public_key.pem
-rw-r--r-- 1 systemd-coredump systemd-coredump     1112 Dec 22 09:50 server-cert.pem
-rw------- 1 systemd-coredump systemd-coredump     1676 Dec 22 09:50 server-key.pem
drwxr-x--- 2 systemd-coredump systemd-coredump    12288 Dec 22 09:50 sys/
```

此时应该有料

清理环境

```bash
kubectl delete -f mysql.deploy3.yaml
kubectl delete -f mysql.pvc2.yaml
kubectl delete -f pvc002.yaml
```


## Lab 5 PVC 在线扩容（推荐）

> **目标**：给已绑定的 PVC 在线扩容（不重建 Pod）。
> **验证概念**：教材 §10.4.5——StorageClass 开启 `allowVolumeExpansion: true` 后，PVC 的 storage 请求可在线调大（只能扩不能缩）；应用无感。

```bash
# ① 检查 local-path 是否支持扩容（v2.2 实测支持）
kubectl get sc local-path -o yaml | grep -i allowVolumeExpansion || echo "未开启"
kubectl patch sc local-path -p '{"allowVolumeExpansion": true}'

# ② 创建一个 1Gi PVC 并挂到 Pod（⚠️ 必须挂载，WaitForFirstConsumer 模式下不挂载会一直 Pending）
cat > expand-app.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expand-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: expand-app
  template:
    metadata:
      labels:
        app: expand-app
    spec:
      containers:
      - name: nginx
        image: nginx
        volumeMounts:
        - name: data
          mountPath: /usr/share/nginx/html
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: expand-pvc
EOF
cat > expand-pvc.yaml <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: expand-pvc
spec:
  accessModes: ["ReadWriteOnce"]
  storageClassName: local-path
  resources:
    requests:
      storage: 1Gi
EOF
kubectl apply -f expand-pvc.yaml -f expand-app.yaml
kubectl get pvc expand-pvc    # Bound（被 Pod 消费后绑定）

# ③ 发起扩容请求到 2Gi
kubectl patch pvc expand-pvc -p '{"spec":{"resources":{"requests":{"storage":"2Gi"}}}}'
kubectl get pvc expand-pvc    # 注意：CAPACITY 仍 1Gi（见下方观察点说明）
kubectl describe pvc expand-pvc | grep -i expand   # ExternalExpanding：等待外部控制器
```

```bash
root@node1:~/k8slab/storage# kubectl get pvc expand-pvc
NAME         STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
expand-pvc   Bound    pvc-xxx  2Gi        RWO            local-path     1m
```

> **观察点**（在线扩容，教材 §10.4.5）：patch 后 PVC 事件出现 **`ExternalExpanding: waiting for an external controller`**——扩容请求已被 kube-controller-manager 接受，但 **local-path 的 hostPath 实现不会真正完成扩容**（数据就在节点根分区上，没有独立块设备可扩，`CAPACITY` 保持 1Gi）。**真实在线扩容依赖 CSI 驱动的 `ExpandVolume` 实现**——云环境用云盘 StorageClass（allowVolumeExpansion: true + 驱动支持）即可在线扩：不重建 Pod、不停应用；只能扩大不能缩小。本 Lab 演示的是"扩容机制与请求链路"（补上 local-path 的局限认知）。

**清理**

```bash
kubectl delete -f expand-app.yaml -f expand-pvc.yaml
```

## Lab 6 PV 回收策略对比（Retain vs Delete）（推荐）

> **目标**：对比 PV 的两种回收策略在 PVC 删除后的行为差异。
> **验证概念**：教材 §10.3.2——**Retain**（PVC 删了 PV 变 Released，数据保留，管理员手动处理）vs **Delete**（PVC 删了 PV 连带删除，数据回收）。

```bash
# ① Retain 策略的 PV（手动建）
cat > pv-retain.yaml <<'EOF'
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-retain
spec:
  capacity: {storage: 1Gi}
  accessModes: ["ReadWriteOnce"]
  persistentVolumeReclaimPolicy: Retain
  hostPath: {path: /tmp/pv-retain}
EOF
kubectl apply -f pv-retain.yaml

# ② 绑定并删除 PVC
cat > pvc-retain.yaml <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-retain
spec:
  accessModes: ["ReadWriteOnce"]
  storageClassName: ""
  resources: {requests: {storage: 1Gi}}
EOF
kubectl apply -f pvc-retain.yaml
sleep 5
kubectl delete pvc pvc-retain
kubectl get pv pv-retain    # STATUS: Released（数据保留）
```

```bash
root@node1:~/k8slab/storage# kubectl get pv pv-retain
NAME        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM          STORAGECLASS
pv-retain   1Gi        RWO            Retain           Released    default/pvc-retain
```

> **观察点**（Retain 语义，教材 §10.3.2）：PVC 删除后 PV 变 **Released**（不是 Available）——**数据还在**（/tmp/pv-retain 目录未删），但 PV 不能直接复用（需管理员清理后手动恢复 Available）。这是"数据安全优先"的回收策略。

Delete 策略对比（local-path 动态供应）

```bash
# v1.36 已移除 `kubectl create pvc` 子命令，用 yaml 创建
cat > delete-pvc.yaml <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: delete-pvc
spec:
  accessModes: ["ReadWriteOnce"]
  storageClassName: local-path
  resources:
    requests:
      storage: 1Gi
EOF
kubectl apply -f delete-pvc.yaml
sleep 5
kubectl get pvc delete-pvc
kubectl delete -f delete-pvc.yaml
kubectl get pv | grep delete-pvc   # PV 连带删除（无输出 = 已删）
ls /opt/local-path-provisioner/ | grep delete-pvc   # 本地目录也删了
```

> **观察点**（Delete 语义）：PVC 删除 → **PV 与本地数据目录一并删除**（local-path 的 reclaimPolicy: Delete）——"PVC 删除 = 数据删除"的实证（教材 §10.4.4）。**对比：Retain 保数据、Delete 清数据**——生产按数据重要性选择。

**清理**

```bash
kubectl delete pv pv-retain
rm -rf /tmp/pv-retain
```

## Lab 7 NFS 共享存储（RWX）（推荐）

> **目标**：搭建 NFS 并接入 Kubernetes（静态 PV），验证**多副本共享同一 PVC（RWX）**。
> **验证概念**：教材 §10.5.2——NFS 是**共享存储**（支持 ReadWriteMany）：多个 Pod 可以同时挂同一个 PVC——这正是"多副本共享存储"的方案（对比 local-path 只能 RWO，教材 §10.5.1 的局限）；实验 11 的 WordPress 多副本在 NFS 下才能真正跨节点。

> ⚠️ 需在 node1 上安装 nfs-kernel-server（root 权限）；教学环境演示。

搭建 NFS 服务端（node1）

```bash
apt-get install -y nfs-kernel-server
mkdir -p /srv/nfs-share && chmod 777 /srv/nfs-share
echo "/srv/nfs-share 192.168.0.0/24(rw,sync,no_subtree_check,no_root_squash)" >> /etc/exports
exportfs -ra
showmount -e localhost
```

```bash
root@node1:~# showmount -e localhost
Export list for localhost:
/srv/nfs-share 192.168.0.0/24
```

> **配置要点**（NFS 服务端）：`/etc/exports` 声明导出的目录与允许的网段；`exportfs -ra` 重载生效。

> ⚠️ **客户端依赖（实测必装）**：node2/node3 必须装 nfs-common，否则 Pod 挂载报 `MountVolume.SetUp failed: exit status 32`（没有 mount.nfs 工具）。**在 node2/node3 各执行一次**：
> ```bash
> apt-get install -y nfs-common
> ```
> 装完可用 `which mount.nfs` 验证（有输出即 OK）。注意云主机安全组需放行 2049 端口的内网互访。

创建 NFS PV（RWX）与 PVC

```bash
cat > nfs-pv.yaml <<'EOF'
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nfs-pv
spec:
  capacity: {storage: 2Gi}
  accessModes: ["ReadWriteMany"]     # 关键：RWX 多节点读写
  persistentVolumeReclaimPolicy: Retain
  nfs:
    server: 192.168.0.114    # node1 内网 IP
    path: /srv/nfs-share
EOF
kubectl apply -f nfs-pv.yaml
cat > nfs-pvc.yaml <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nfs-pvc
spec:
  accessModes: ["ReadWriteMany"]
  storageClassName: ""
  resources: {requests: {storage: 2Gi}}
EOF
kubectl apply -f nfs-pvc.yaml
kubectl get pv,pvc | grep nfs
```

```bash
root@node1:~/k8slab/storage# kubectl get pv,pvc | grep nfs
persistentvolume/nfs-pv   2Gi   RWX   Retain   Bound   default/nfs-pvc
persistentvolumeclaim/nfs-pvc   Bound   nfs-pv   2Gi   RWX
```

> **观察点**（RWX 绑定）：PV 的 `ACCESS MODES` 是 **RWX**（ReadWriteMany）——对比 local-path 的 RWO；PVC 绑定成功。**这是 local-path 做不到的能力**（教材 §10.5.1 的局限在此解决）。

多副本共享同一 PVC（跨节点）

```bash
cat > nfs-app.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nfs-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nfs-app
  template:
    metadata:
      labels:
        app: nfs-app
    spec:
      containers:
      - name: nginx
        image: nginx
        volumeMounts:
        - name: data
          mountPath: /usr/share/nginx/html
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: nfs-pvc
EOF
kubectl apply -f nfs-app.yaml
kubectl get pods -o wide | grep nfs-app    # 2 个副本，可能在不同节点
kubectl exec deploy/nfs-app -- sh -c "echo nfs-shared > /usr/share/nginx/html/note.txt"
kubectl exec deploy/nfs-app -- cat /usr/share/nginx/html/note.txt
```

```bash
root@node1:~/k8slab/storage# kubectl get pods -o wide | grep nfs-app
nfs-app-xxx1   1/1   Running   0   30s   10.244.x.x   node2
nfs-app-xxx2   1/1   Running   0   30s   10.244.x.x   node3    ← 跨节点！
root@node1:~/k8slab/storage# kubectl exec deploy/nfs-app -- cat /usr/share/nginx/html/note.txt
nfs-shared
```

> **观察点**（共享存储的实战意义）：**2 个副本跨节点（node2/node3）挂同一个 PVC**——NFS 让"多副本共享数据"成为可能（对比实验 11 中 local-path 多副本只能堆同一节点的限制）；**一个副本写入，另一个副本能读到**（共享同一份数据）——这就是教材 §10.5.2 说的"水平扩展的前提是存储可共享"。

**清理**

```bash
kubectl delete deployment nfs-app
kubectl delete pvc nfs-pvc
kubectl delete pv nfs-pv
rm -rf /srv/nfs-share && sed -i '/nfs-share/d' /etc/exports && exportfs -ra
```
## 本章小结

本章通过 7 个实验，掌握了 Kubernetes 存储的完整体系（从 Pod 级卷到集群级抽象，再到共享存储）：

| 实验 | 验证的知识点 | 关键概念 | 级别 |
|---|---|---|:---:|
| Lab 1 卷基础（hostPath/emptyDir） | 卷的挂载方式；hostPath 持久化但不跨节点；emptyDir 临时性 | `volumes` + `volumeMounts`、hostPath/emptyDir | 必做 |
| Lab 2 hostpath 实现方式 | 应用级持久化（mysql 数据写到宿主机） | Deployment 挂 hostPath、数据目录挂载 | 必做 |
| Lab 3 使用 PVC 和 PV | PV/PVC 静态绑定：手动建 PV，PVC 匹配后 Bound | PV（集群级）、PVC（命名空间级）、accessModes/capacity 匹配 | 必做 |
| Lab 4 使用存储类动态交付 | **安装 local-path** + StorageClass 自动创建 PV，声明即用 | `storageClassName: local-path`、动态交付、provisioner | 必做 |
| Lab 5 PVC 在线扩容 | allowVolumeExpansion 在线扩大（不重建 Pod） | `allowVolumeExpansion`、patch PVC storage | 推荐 |
| Lab 6 PV 回收策略对比 | Retain（Released 保数据）vs Delete（连带删除） | RECLAIM POLICY、Released 状态 | 推荐 |
| Lab 7 NFS 共享存储（RWX） | 多副本跨节点共享同一 PVC；一份数据多副本读写 | NFS PV、ReadWriteMany、exports | 推荐 |

**核心认知**：
1. **卷的演进逻辑**：`hostPath/emptyDir（Pod 直接挂）→ PV/PVC（解耦）→ StorageClass（自动化）`——从"手动指定路径"到"声明存储请求"到"自动分配"（本手册刻意在 Lab 4 才装 StorageClass，就是为了按这个逻辑一步步展开）
2. **hostPath 是教学/单机方案**：数据绑定在具体节点，Pod 漂移即丢失（Lab 1 验证过）；生产用云盘/NFS 等共享存储
3. **PV/PVC 的解耦价值**：应用只声明"需要存储"（PVC），不关心底层（PV）怎么实现——便于迁移和统一管理
4. **StorageClass 是生产默认**：PVC 指定 `storageClassName` 后，provisioner 自动创建 PV（local-path 只是本地方案之一，云环境用云盘 provisioner）

**与后续章节的衔接**：
- PVC/PV 解耦思想 → 实验 06 ConfigMap/Secret（配置的解耦）
- 存储类选择 → 实际生产部署的关键决策
- mysql 应用贯穿 → 实验 06 继续用 mysql 演示配置注入
