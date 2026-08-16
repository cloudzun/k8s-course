# ConfigMap 和 Secret

## 实验准备

- **前置条件**：已完成 实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，按 `nano xxx.yaml` 创建即可，无需克隆外部仓库
- **工作目录**：本章实验在 `/root/k8slab/config` 下进行（如不存在先 `mkdir -p`）

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 基于文件的 configmap | 文件创建与卷挂载 | 必做 |
| Lab 2 键值对 configmap | 字面量创建与文件消费 | 必做 |
| Lab 3 使用 env 映射 configmap | env 注入 | 必做 |
| Lab 4 使用 secret 保存敏感信息 | base64 与注入 | 必做 |
| Lab 5 用 secret 封装 configmap | 文件型 Secret | 必做 |
| Lab 6 ConfigMap 热更新对比 | 卷热更新 vs env 需重启 | 必做 |
| Lab 7 subPath 陷阱与 immutable | 热更新丧失与性能优化 | 推荐 |
| Lab 8 imagePullSecrets 私有仓库 | 私有镜像凭据 | 可选·进阶 |
| 补充：Downward API | Pod 自身元数据注入 | 推荐 |
## Lab 1 基于文件的 configmap 的创建和使用

> **目标**：用 `kubectl create configmap --from-file` 把 MySQL 配置文件变成 ConfigMap，再把 ConfigMap 以卷方式挂载进 mysql Deployment，验证 MySQL 用的是外部化配置。
> **验证概念**：ConfigMap 把「配置」与「应用」解耦——配置文件内容存进集群（ConfigMap），容器启动时以**卷**方式读取；改配置只改 ConfigMap，不用重新构建镜像。

创建 configmap 目录并进入

```bash
mkdir configmaps
```

```bash
cd configmaps/
```

使用范例创建配置文件

```bash
nano mysqld.cnf
```

```text
[mysqld]
pid-file  = /var/run/mysqld/mysqld.pid
socket    = /var/run/mysqld/mysqld.sock
datadir   = /var/lib/mysql
symbolic-links=0
port    = 3306
```

> **配置要点**（nano mysqld.cnf）：
> - 这是**普通的 MySQL 配置文件**，不是 Kubernetes 语法——定义了 pid 文件、socket、数据目录、监听端口 3306
> - 关键：稍后 `--from-file=./mysqld.cnf` 会把**整个文件原样**收进 ConfigMap，键名自动取**文件名** `mysqld.cnf`
> - 这就是"配置外部化"的素材来源：配置内容从 Deployment 里抽出来，单独管理

创建 mysql 配置文件

```bash
kubectl create configmap mysql-cnf --from-file=./mysqld.cnf -n blog
```

查看 configmap

```bash
kubectl get configmap -n blog
```

```bash
root@node1:~/k8slab/config# kubectl get configmap -n blog
NAME               DATA   AGE
kube-root-ca.crt   1      77m
mysql-cnf          1      8s
```

> **观察点**：`mysql-cnf` 的 DATA 列 = **1**——ConfigMap 里存了 1 个键（就是文件名 `mysqld.cnf`）；`kube-root-ca.crt` 是集群自动生成的（CA 证书），与本实验无关。

查看 configmap 详情

```bash
kubectl describe configmap mysql-cnf -n blog
```

```bash
root@node1:~/k8slab/config# kubectl describe configmap mysql-cnf -n blog
Name:         mysql-cnf
Namespace:    blog
Labels:       <none>
Annotations:  <none>

Data
====
mysqld.cnf:
----
[mysqld]
pid-file  = /var/run/mysqld/mysqld.pid
socket    = /var/run/mysqld/mysqld.sock
datadir   = /var/lib/mysql
symbolic-links=0
port    = 3306

BinaryData
====

Events:  <none>
```

> **观察点**（describe）：
> - `Data` 区显示键名 `mysqld.cnf:`，`----` 分隔线下是**完整的文件原文**——`--from-file` 把整个文件内容当作一个值存进 ConfigMap
> - `BinaryData` 为空——配置是纯文本，没有二进制数据；`Events: <none>` 表示创建过程无异常

```bash
kubectl get configmap mysql-cnf -n blog -o yaml
```

```bash
root@node1:~/k8slab/config# kubectl get configmap mysql-cnf -n blog -o yaml
apiVersion: v1
data:
  mysqld.cnf: |
    [mysqld]
    pid-file  = /var/run/mysqld/mysqld.pid
    socket    = /var/run/mysqld/mysqld.sock
    datadir   = /var/lib/mysql
    symbolic-links=0
    port    = 3306
kind: ConfigMap
metadata:
  creationTimestamp: "2022-12-22T02:13:11Z"
  name: mysql-cnf
  namespace: blog
  resourceVersion: "73939"
  uid: 015844ed-ba54-4173-85cb-e95438749f63
```

> **观察点**（-o yaml）：`data.mysqld.cnf` 的值用 `|`（块标量）**原样保留了文件内容**（含换行缩进）；这就是下面"变造 yaml 文件"的依据——把 `data` 区内容复制成声明式 yaml。

从显示的配置文件中进行适当变造，得到 configmap 的 yaml 文件

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-cnf
  namespace: blog
data:
  mysqld.cnf: | # 配置值
    [mysqld]
    pid-file  = /var/run/mysqld/mysqld.pid
    socket    = /var/run/mysqld/mysqld.sock
    datadir   = /var/lib/mysql
    symbolic-links=0
    port    = 3306
```

> **配置要点**（configmap yaml）：
> - `kind: ConfigMap` + `metadata.name/namespace`——标识这个配置对象及所属命名空间
> - `data.mysqld.cnf`：键名仍是**文件名**，值用 `|` 块标量原样保存文件内容（`# 配置值` 是注释）
> - 与 `kubectl create configmap --from-file` 效果等价：一个用命令行生成，一个用 yaml 声明（以后用 yaml 方式更利于版本管理）

更新 mysql.depoly.yaml(ver 1.0)

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
      volumes:
      - name: mysql-config # 定义configmap 卷
        configMap:
          name: mysql-cnf
      containers:
      - name: mysql
        image: mysql:5.7
        imagePullPolicy: IfNotPresent
        volumeMounts:
        - name: mysql-config # 挂接configmap卷
          mountPath: /etc/mysql/mysql.conf.d
        ports:
        - containerPort: 3306
          name: dbport
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: wordpress
        - name: MYSQL_DATABASE
          value: wordpress
```

> **配置要点**（mysql.deploy.yaml 相对基础 Deployment 的新增部分）：
> - `spec.template.spec.volumes[].configMap.name: mysql-cnf`——**定义卷**：这个卷的数据来源是 ConfigMap `mysql-cnf`
> - `spec.template.spec.containers[].volumeMounts`——**挂接卷**：把 configMap 卷挂到容器内 `/etc/mysql/mysql.conf.d`（MySQL 5.7 读取自定义配置的目录）
> - 效果：ConfigMap 里的每个键会以**文件**形式出现在挂载目录（`/etc/mysql/mysql.conf.d/mysqld.cnf`）——MySQL 启动即用这份外部配置（**配置外部化**，本 Lab 核心）
> - `env` 里的 `MYSQL_ROOT_PASSWORD/MYSQL_DATABASE` 先用字面量写死，Lab 4 会用 Secret 接管密码

更新 mysql

```bash
kubectl apply -f mysql.deploy.yaml
```

查看 blog 名称空间

```bash
kubectl get pods -n blog
```

```bash
root@node1:~/k8slab/config# kubectl get pods -n blog
NAME                           READY   STATUS    RESTARTS   AGE
mysql-deploy-db4f6d8fc-v7xnc   1/1     Running   0          8s
```

> **观察点**：Pod 名 `mysql-deploy-db4f6d8fc-v7xnc` = Deployment 名 + **ReplicaSet 哈希**（db4f6d8fc）+ 随机串；`READY 1/1`、`Running`——Deployment 已带 configMap 卷正常启动（后面 exec 进容器验证配置真的挂上了）。

查看 mysql 的配置文件

```bash
kubectl exec -it mysql-deploy-db4f6d8fc-v7xnc -n blog -- /bin/bash
```

```bash
cat /etc/mysql/mysql.conf.d/mysqld.cnf
```

```bash
root@node1:~/k8slab/config# kubectl exec -it mysql-deploy-db4f6d8fc-v7xnc -n blog -- /bin/bash
root@mysql-deploy-db4f6d8fc-v7xnc:/# cat /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
pid-file  = /var/run/mysqld/mysqld.pid
socket    = /var/run/mysqld/mysqld.sock
datadir   = /var/lib/mysql
symbolic-links=0
port    = 3306
```

> **观察点**（容器内验证）：`cat` 显示的内容**与 ConfigMap 里完全一致**——configMap 卷挂载后，配置以**文件**形式出现在容器内指定路径，MySQL 直接读取。`kubectl exec` 的容器命令用 `--` 分隔（v1.36 规范写法，防止命令参数被 kubectl 误解析）。

退出pod上下文

```bash
exit
```

## Lab 2 键值对 configmap 的创建和使用

> **目标**：用 `kubectl create configmap --from-literal` 创建键值对 ConfigMap，再以**卷**方式挂载进 busybox Pod，验证配置以文件形式呈现。
> **验证概念**：ConfigMap 键值对挂载成卷后，**每个键变成一个文件名**，值就是文件内容——配置"所见即所得"（与 Lab 1 的 `--from-file` 只差数据来源不同）。

创建新的 configmap

```bash
kubectl create configmap test-conf --from-literal=user=bob --from-literal=password=123456
```

查看configmap

```bash
kubectl describe configmap test-conf
```

```bash
root@node1:~/k8slab/config# kubectl describe configmap test-conf
Name:         test-conf
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
password:
----
123456
user:
----
bob

BinaryData
====

Events:  <none>
```

> **观察点**（describe）：`Data` 区列出 **2 个键** `password`/`user`，值**明文**显示（`123456`、`bob`）——ConfigMap 不加密，**敏感信息别放这里**（Lab 4 的主角是 Secret）。

```bash
kubectl get configmap test-conf -o yaml
```

```bash
root@node1:~/k8slab/config# kubectl get configmap test-conf -o yaml
apiVersion: v1
data:
  password: "123456"
  user: bob
kind: ConfigMap
metadata:
  creationTimestamp: "2022-12-22T02:21:08Z"
  name: test-conf
  namespace: default
  resourceVersion: "74794"
  uid: 6853e868-0966-40b5-869c-577c1869e745
```

> **观察点**（-o yaml）：`data` 区两个键值对 `password: "123456"`、`user: bob`——值是**普通字符串**（`"123456"` 带引号说明是数字字符串），没有 `|` 块标量（因为不是文件内容，是字面量）。

根据 yaml 文件的输出进行适当变造得到如下 configmap 的 yaml 文件

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: test-conf
  namespace: default
data:
  password: "123456" # 明文显示的用户名和密码
  user: bob
```

使用样例创建 yaml 文件

```bash
nano test-conf.pod.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: test-conf
  name: test-conf
spec:
  volumes:
  - name: config
    configMap:
      name: test-conf
  containers:
  - image: busybox
    name: test-conf
    volumeMounts:
    - name: config
      mountPath: /tmp/volume
    command:
    - "/bin/sh"
    - "-c"
    - "sleep 37000"
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

> **配置要点**（test-conf.pod.yaml）：
> - `spec.volumes[].configMap.name: test-conf`——卷的数据源是 ConfigMap `test-conf`
> - `volumeMounts.mountPath: /tmp/volume`——挂载后，**每个键变成一个文件**：`/tmp/volume/user`、`/tmp/volume/password`（下面验证）
> - `command: sleep 37000`——让 busybox 保持存活，方便 exec 进去查看文件

创建pod

```bash
kubectl apply -f test-conf.pod.yaml
```

进入 pod 上下文验证 configmap 的配置

```bash
kubectl exec -it test-conf -- /bin/sh
```

```bash
cd /tmp/volume/

ls

cat user

cat password
```

```bash
root@node1:~/k8slab/config# kubectl exec -it test-conf -- /bin/sh
/ # cd /tmp/volume/
/tmp/volume #
/tmp/volume # ls
password  user
/tmp/volume #
/tmp/volume # cat user
bob/tmp/volume #
/tmp/volume # cat password
123456/tmp/volume #
```

> **观察点**（卷内文件验证）：
> - `ls` 显示 `password user` 两个**文件，文件名 = ConfigMap 的键名**
> - `cat user` → `bob`、`cat password` → `123456`——文件内容 = 键值，与 ConfigMap 完全一致
> - 对比 Lab 1：`--from-file` 的键名是文件名，`--from-literal` 的键名是字面量名——**键名怎么来，文件就叫什么**

退出 pod 上下文

```bash
exit
```

## Lab 3 使用 env 映射 configmap

> **目标**：把 ConfigMap 的键值对通过 `configMapKeyRef` 注入为容器的**环境变量**（不是文件）。
> **验证概念**：ConfigMap 有两种消费方式——**卷挂载**（Lab 2，键变文件）和 **env 注入**（本 Lab，键变环境变量）；env 注入只取**单个键**，且不支持热更新（改 ConfigMap 后需重启 Pod 才生效）。

使用样例创建 yaml 文件

```bash
nano test-conf-2.pod.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: test-conf-2
  name: test-conf-2
spec:
  containers:
  - image: busybox
    name: test-conf-2
    command:
    - "/bin/sh"
    - "-c"
    - "sleep 37000"
    env:
    - name: USER
      valueFrom:
        configMapKeyRef:
          name: test-conf
          key: user
    - name: PASSWORD
      valueFrom:
        configMapKeyRef:
          name: test-conf
          key: password
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

> **配置要点**（env 注入）：
> - `env[].name: USER / PASSWORD`——容器内**环境变量名**（可自定义，不必与键名相同）
> - `valueFrom.configMapKeyRef`：`name: test-conf`（来源 ConfigMap）+ `key: user`（取哪个键）——把 `test-conf` 的 `user` 键值注入为环境变量 `USER`，`password` 键注入为 `PASSWORD`
> - 对比 Lab 2 卷挂载：卷挂载是"**所有键全变文件**"，env 注入是"**挑一个键给一个变量**"（按需取用）

创建 pod

```bash
kubectl apply -f test-conf-2.pod.yaml
```

进入 pod 上下文验证 configmap 的配置

```bash
kubectl exec -it test-conf-2 -- /bin/sh
```

```bash
env | grep USER

env | grep PASSWORD
```

```bash
root@node1:~/k8slab/config# kubectl exec -it test-conf-2 -- /bin/sh
/ # env | grep USER
USER=bob
/ #
/ # env | grep PASSWORD
PASSWORD=123456
/ #
```

> **观察点**（env 验证）：`USER=bob`、`PASSWORD=123456`——ConfigMap 的键值成功注入为**环境变量**。与 Lab 2 的卷挂载区别：这里**没有生成文件**，只有变量；而且 env 注入是一次性的（Pod 运行中改 ConfigMap 不会更新，卷挂载会自动同步）。

退出 pod 上下文

```bash
exit
```

## Lab 4 使用 secret 保存敏感信息

> **目标**：用 Secret 保存 mysql 密码，对比 ConfigMap 的明文问题，并把 Secret 通过 `secretKeyRef` 注入 mysql Deployment。
> **验证概念**：Secret 与 ConfigMap 结构几乎一样，但值以 **base64** 存储（describe 不显示内容，只显示字节数）；**base64 只是编码不是加密**——真正安全依赖访问控制（RBAC）等集群机制。

查看此前包含密码的configmap

```bash
kubectl describe configmap test-conf
```

```bash
root@node1:~/k8slab/config# kubectl describe configmap test-conf
Name:         test-conf
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
password:
----
123456
user:
----
bob

BinaryData
====

Events:  <none>
```

> **观察点**：密码 `123456` 在 ConfigMap 里**明文可见**——任何有权限读 ConfigMap 的人都能看到。**这就是引入 Secret 的原因**：敏感信息不该用 ConfigMap 存。

注意: 密码是明文显示

创建 secret

```bash
kubectl create secret generic mysql-pass --from-literal=password=password -n blog
```

查看 secret

```bash
kubectl get secret -n blog
```

```bash
kubectl describe secret mysql-pass -n blog
```

```bash
root@node1:~/k8slab/config# kubectl get secret -n blog
NAME                  TYPE                                  DATA   AGE
default-token-gqhgg   kubernetes.io/service-account-token   3      100m
mysql-pass            Opaque                                1      7s
root@node1:~/k8slab/config# kubectl describe secret mysql-pass -n blog
Name:         mysql-pass
Namespace:    blog
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
password:  8 bytes
```

> **观察点**（get + describe secret）：
> - `get`：`mysql-pass` 的 TYPE 是 **`Opaque`**（通用 Secret，K8s 不解析内容）、DATA=1（1 个键）；对比 `default-token-gqhgg` 是 service-account-token（集群自动生成的 SA 令牌）
> - `describe`：Data 区只显示 **`password: 8 bytes`**（键名 + 字节数），**不显示内容**——与 ConfigMap 的明文显示形成鲜明对比

```bash
kubectl get -o yaml secret mysql-pass -n blog
```

```text
root@node1:~/k8slab/config# kubectl get -o yaml secret mysql-pass -n blog
apiVersion: v1
data:
  password: cGFzc3dvcmQ=
kind: Secret
metadata:
  creationTimestamp: "2022-12-22T02:36:31Z"
  name: mysql-pass
  namespace: blog
  resourceVersion: "76425"
  uid: 7bf165ca-2636-41fc-b6dc-bd626199b134
type: Opaque
```

> **观察点**（-o yaml）：`data.password` 的值是 **`cGFzc3dvcmQ=`**——这就是 `password` 的 base64 编码。**Secret 存的是编码后的值**：`-o yaml` 能看到密文，`describe` 连密文都不显示。

找到 password 对应的值 `cGFzc3dvcmQ=`

解码 password

```bash
echo cGFzc3dvcmQ= | base64 -d
```

```bash
root@node1:~/k8slab/config# echo cGFzc3dvcmQ= | base64 -d
passwordroot@node1:~/k8slab/config#
```

> **观察点**（解码）：`base64 -d` 还原出明文 `password`（紧贴提示符是因为 base64 输出**不带换行**）——**再次印证 base64 是编码不是加密**：拿到 `-o yaml` 输出就能解开。生产环境对 Secret 的依赖是"访问控制 + 加密存储"，不是 base64 本身。

将 secrect 密文更新到 mysql.deploy2.yaml

```bash
nano mysql.deploy2.yaml
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
      volumes:
      - name: mysql-config # 定义configmap 卷
        configMap:
          name: mysql-cnf
      containers:
      - name: mysql
        image: mysql:5.7
        imagePullPolicy: IfNotPresent
        volumeMounts:
        - name: mysql-config # 挂接configmap卷
          mountPath: /etc/mysql/mysql.conf.d
        ports:
        - containerPort: 3306
          name: dbport
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom: # 从secrect处调用密码
            secretKeyRef:
              name: mysql-pass
              key: password
        - name: MYSQL_DATABASE
          value: wordpress
```

> **配置要点**（mysql.deploy2.yaml 相对 Lab 1 的变化）：
> - **ConfigMap 卷部分不变**（`mysql-config` 卷 + 挂载 `/etc/mysql/mysql.conf.d`）——MySQL 仍使用外部配置文件
> - **关键变化**：`MYSQL_ROOT_PASSWORD` 从 `value: wordpress`（yaml 明文写死）改为 **`valueFrom.secretKeyRef`**——从 Secret `mysql-pass` 取 `password` 键注入（`name` 指向 Secret、`key` 指向键）
> - `MYSQL_DATABASE: wordpress` 保持普通 env（非敏感信息，不需要 Secret）
> - 结果：**密码不再出现在 yaml 明文里**，只存在于集群的 Secret 中（配置与敏感信息分离管理）

更新 mysql

```bash
kubectl apply -f mysql.deploy2.yaml
```

进入 mysql 上下文查看 env

```bash
kubectl exec -it mysql-deploy-6f5dcfc78d-f2trc -n blog -- /bin/bash
```

```bash
env
```

```bash
root@node1:~/k8slab/config# kubectl get pod -n blog
NAME                            READY   STATUS    RESTARTS   AGE
mysql-deploy-6f5dcfc78d-f2trc   1/1     Running   0          9s
root@node1:~/k8slab/config# kubectl exec -it mysql-deploy-6f5dcfc78d-f2trc -n blog -- /bin/bash
root@mysql-deploy-6f5dcfc78d-f2trc:/# env | grep -E 'MYSQL_ROOT|MYSQL_DATABASE'
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=wordpress
```

> **观察点**（env 验证，已用 grep 精简输出）：
> - **`MYSQL_ROOT_PASSWORD=password`**——密码从 Secret `mysql-pass` 注入成功（K8s 挂载/注入时自动把 base64 还原成明文）
> - `MYSQL_DATABASE=wordpress`——普通 env 正常注入
> - Pod 名变为 `mysql-deploy-6f5dcfc78d-f2trc`（新 ReplicaSet 哈希）——**apply 后 Deployment 因 env 变化重建了 Pod**（旧 Pod 被替换）

退出pod上下文

```bash
exit
```

## Lab 5 用 secret 封装 configmap

> **目标**：用 `--from-file` 把**整个配置文件**封装成 Secret，再以卷方式挂载进 busybox Pod，验证密文在容器内还原为明文文件。
> **验证概念**：Secret 不只存密码，也能存整个配置文件（`--from-file` 用法与 ConfigMap 一致）；**挂载进容器后 K8s 自动还原 base64**——容器里看到的是明文，`-o yaml` 里是密文。

基于文件创建 secret

```bash
cd configmap
```

```bash
kubectl create secret generic mysql-conf --from-file=mysqld.cnf
```

查看 secret

```bash
kubectl get secret
```

```bash
kubectl get secret mysql-conf -o yaml
```

```bash
root@node1:~/k8slab/config# kubectl get secret
NAME                  TYPE                                  DATA   AGE
default-token-m2d4t   kubernetes.io/service-account-token   3      242d
mysql-conf            Opaque                                1      9s
root@node1:~/k8slab/config# kubectl get secret mysql-conf -o yaml
apiVersion: v1
data:
  mysqld.cnf: W215c3FsZF0KcGlkLWZpbGUgID0gL3Zhci9ydW4vbXlzcWxkL215c3FsZC5waWQKc29ja2V0ICAgID0gL3Zhci9ydW4vbXlzcWxkL215c3FsZC5zb2NrCmRhdGFkaXIgICA9IC92YXIvbGliL215c3FsCnN5bWJvbGljLWxpbmtzPTAKcG9ydCAgICA9IDMzMDYK
kind: Secret
metadata:
  creationTimestamp: "2022-12-22T02:42:15Z"
  name: mysql-conf
  namespace: default
  resourceVersion: "77063"
  uid: b9a7c8f3-2543-4611-9df5-07741b56fcb6
type: Opaque
```

> **观察点**（get + -o yaml）：
> - `get`：`mysql-conf` TYPE=`Opaque`、DATA=1——整个文件被封装成 **1 个键**（键名=文件名 `mysqld.cnf`）
> - `-o yaml`：`data.mysqld.cnf` 的值是一长串 base64（`W215c3Fs...`）——**整个配置文件被编码**。对比 Lab 1 的 ConfigMap：同样是 `mysqld.cnf`，那里是明文 `|` 块标量，这里是密文

注意: 此处 mysqld.cnf 的值被编码（base64）——用 `base64 -d` 可以还原

尝试对这个值进行解码

```bash
echo W215c3FsZF0KcGlkLWZpbGUgID0gL3Zhci9ydW4vbXlzcWxkL215c3FsZC5waWQKc29ja2V0ICAgID0gL3Zhci9ydW4vbXlzcWxkL215c3FsZC5zb2NrCmRhdGFkaXIgICA9IC92YXIvbGliL215c3FsCnN5bWJvbGljLWxpbmtzPTAKcG9ydCAgICA9IDMzMDYK | base64 -d
```

```bash
root@node1:~/k8slab/config# echo W215c3FsZF0KcGlkLWZpbGUgID0gL3Zhci9ydW4vbXlzcWxkL215c3FsZC5waWQKc29ja2V0ICAgID0gL3Zhci9ydW4vbXlzcWxkL215c3FsZC5zb2NrCmRhdGFkaXIgICA9IC92YXIvbGliL215c3FsCnN5bWJvbGljLWxpbmtzPTAKcG9ydCAgICA9IDMzMDYK | base64 -d
[mysqld]
pid-file  = /var/run/mysqld/mysqld.pid
socket    = /var/run/mysqld/mysqld.sock
datadir   = /var/lib/mysql
symbolic-links=0
port    = 3306
```

> **观察点**（解码）：`base64 -d` 把整串密文还原成**和 Lab 1 里一模一样的 mysqld.cnf 原文**——证明 Secret 里存的就是 base64 编码的配置内容。任何能读 `-o yaml` 的人都能解开（再次提醒：**base64 编码 ≠ 加密**）。

使用上述范例创建配置文件

```bash
nano test-secret.pod.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: test-secret
  name: test-secret
spec:
  volumes:
  - name: test-secret
    secret:
      secretName: mysql-conf
  containers:
  - image: busybox
    name: test-secret
    volumeMounts:
    - name: test-secret
      mountPath: /tmp/volume
    command:
    - "/bin/sh"
    - "-c"
    - "sleep 37000"
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

> **配置要点**（test-secret.pod.yaml）：
> - `spec.volumes[].secret.secretName: mysql-conf`——卷的数据源是 Secret `mysql-conf`（与 ConfigMap 卷写法几乎一致，只是 `configMap` 换成 `secret`）
> - `volumeMounts.mountPath: /tmp/volume`——挂载后生成文件 `/tmp/volume/mysqld.cnf`
> - **K8s 挂载 Secret 时自动还原 base64**：容器内读到的是明文配置文件（下面验证）

更新 pod

```bash
kubectl apply -f test-secret.pod.yaml
```

进入 pod 上下文验证 secret 的配置

```bash
kubectl exec -it test-secret -- /bin/sh
```

```bash
cat /tmp/volume/mysqld.cnf
```

```bash
root@node1:~/k8slab/config# kubectl exec -it test-secret -- /bin/sh
/ # cat /tmp/volume/mysqld.cnf
[mysqld]
pid-file  = /var/run/mysqld/mysqld.pid
socket    = /var/run/mysqld/mysqld.sock
datadir   = /var/lib/mysql
symbolic-links=0
port    = 3306
```

> **观察点**（容器内验证）：`cat /tmp/volume/mysqld.cnf` 看到的是**明文配置文件**（与 Lab 1 完全一致）——Secret 卷挂载时 K8s 已自动还原 base64。**完整对比链**：`-o yaml` 看到密文（编码）→ `base64 -d` 手动还原 → 挂载后容器内自动明文；而 ConfigMap 全程明文。

退出 pod 上下文

```bash
exit
```

**补充：Secret 的常见类型（不只是 Opaque）**

> 前面 Lab 4/5 用的都是 `Opaque`（通用型）。Secret 还有几个**专用类型**，K8s 会按类型解析内容：

**① `kubernetes.io/tls`——TLS 证书**

```bash
# 语法：kubectl create secret tls <名字> --cert=证书 --key=私钥
kubectl create secret tls my-tls --cert=tls.crt --key=tls.key
kubectl get secret my-tls -o yaml
```

```bash
root@node1:~/k8slab/config# kubectl get secret my-tls -o yaml
apiVersion: v1
data:
  tls.crt: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0t...   # base64 编码的证书
  tls.key: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQ==   # base64 编码的私钥
kind: Secret
metadata:
  name: my-tls
type: kubernetes.io/tls        # 专用类型：Ingress/网关按此类型识别证书
```

> **配置要点**：`type: kubernetes.io/tls` + 固定两个键 `tls.crt`（证书）/`tls.key`（私钥）——**Ingress 的 `spec.tls.secretName` 就引用这种 Secret**（实验 07 Ingress TLS 补充里用过）。

**② `kubernetes.io/dockerconfigjson`——私有镜像仓库凭据**

```bash
# 语法：kubectl create secret docker-registry <名字> \
#   --docker-server=仓库地址 --docker-username=用户名 --docker-password=密码 --docker-email=邮箱
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com --docker-username=admin --docker-password=pass123

# Pod 里通过 imagePullSecrets 引用，就能拉取私有仓库镜像
```

```yaml
spec:
  imagePullSecrets:    # 拉私有镜像时指定凭据
  - name: regcred
  containers:
  - name: app
    image: registry.example.com/myapp:v1
```

> **配置要点**：`dockerconfigjson` 存的是 `~/.docker/config.json` 的 base64（`--docker-server/username/password` 三个参数自动生成）；Pod 用 `spec.imagePullSecrets` 引用它——**私有仓库镜像拉取的标准做法**（实验 01 镜像加速之外的另一道凭据）。

**③ `kubernetes.io/service-account-token`——SA 令牌**（Lab 8 的 dashboard 登录就是动态签发这类 token，v1.24+ 不再自动存成 Secret，用 `kubectl create token`）

> **记忆口诀**：`Opaque`（通用键值）、`tls`（证书）、`dockerconfigjson`（镜像仓库凭据）、`service-account-token`（SA 令牌）——按用途选类型，`describe` 的 `Type:` 字段一眼可辨。

清理（含补充实验的 tls secret）

```bash
kubectl delete secret my-tls
```

**清理**

按 yaml 创建的资源（deployment、pod）用文件批量删除：

```bash
kubectl delete -f .
```

> 说明：`-f .` 会删除当前目录下所有 yaml 对应的资源。但 **`kubectl create` 命令创建的 ConfigMap/Secret 不在这批 yaml 里**，需单独清理（按命名空间区分）：

```bash
kubectl delete configmap mysql-cnf -n blog
kubectl delete secret mysql-pass -n blog
kubectl delete configmap test-conf
kubectl delete secret mysql-conf
```

> 清理后可用 `kubectl get configmap,secret -A` 确认全部删除。

## Lab 6 ConfigMap 热更新对比（卷 vs env）

> **目标**：同一份 ConfigMap 分别用**卷挂载**和 **env 注入**消费，修改 ConfigMap 后对比两者的更新行为。
> **验证概念**：教材 §8.2.5——**卷挂载能热更新**（kubelet 同步 + 软链接机制）、**env 注入不能**（进程启动时注入，需重启 Pod）——这是选择消费方式的关键依据。

准备 ConfigMap 和两种消费方式的 Pod

```bash
kubectl create configmap app-cfg --from-literal=APP_MODE=dev
```

```bash
nano hot-reload.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hot-reload
spec:
  containers:
  - name: via-volume
    image: busybox
    command: ["/bin/sh", "-c", "sleep 3600"]
    volumeMounts:
    - name: cfg
      mountPath: /etc/cfg          # 卷方式：整个 ConfigMap 挂载
  - name: via-env
    image: busybox
    command: ["/bin/sh", "-c", "sleep 3600"]
    env:
    - name: APP_MODE               # env 方式：单键注入
      valueFrom:
        configMapKeyRef:
          name: app-cfg
          key: APP_MODE
  volumes:
  - name: cfg
    configMap:
      name: app-cfg
```

```bash
kubectl apply -f hot-reload.yaml
kubectl exec hot-reload -c via-volume -- cat /etc/cfg/APP_MODE   # dev
kubectl exec hot-reload -c via-env -- printenv APP_MODE           # dev
```

> **配置要点**：同一个 ConfigMap 的两种消费——`via-volume` 容器挂卷（键变文件 `/etc/cfg/APP_MODE`）、`via-env` 容器用 `configMapKeyRef` 注入环境变量（教材 §8.2.2/8.2.3）。

修改 ConfigMap 并观察差异

```bash
kubectl create configmap app-cfg --from-literal=APP_MODE=prod --dry-run=client -o yaml | kubectl apply -f -
sleep 10    # 等 kubelet 同步（默认约 10s 轮询）
kubectl exec hot-reload -c via-volume -- cat /etc/cfg/APP_MODE   # prod（热更新生效！）
kubectl exec hot-reload -c via-env -- printenv APP_MODE           # 仍是 dev（env 不变）
```

```bash
root@node1:~/k8slab/config# kubectl exec hot-reload -c via-volume -- cat /etc/cfg/APP_MODE
prod
root@node1:~/k8slab/config# kubectl exec hot-reload -c via-env -- printenv APP_MODE
dev
```

> **观察点**（热更新的核心对比）：**卷挂载的容器读到 `prod`（自动热更新），env 注入的容器还是 `dev`（进程启动时已固定）**——env 要生效只能重启 Pod（新 Pod 用新值）。这就是教材 §8.2.5 的机制实证。

**清理**

```bash
kubectl delete pod hot-reload
kubectl delete configmap app-cfg
```

## Lab 7 subPath 陷阱与 immutable（推荐）

> **目标**：验证 subPath 挂载**丧失热更新**（教材 §8.2.6 经典坑），并体验 immutable 配置。
> **验证概念**：**subPath 单文件挂载是"复制"而非"软链接"**——ConfigMap 更新后文件不变（教材 §8.2.6）；**immutable: true** 的 ConfigMap 禁止修改（删除重建，省 kubelet 轮询，教材 §8.2.7）。

subPath 陷阱验证

```bash
kubectl create configmap app-cfg --from-literal=APP_MODE=dev
```

```bash
nano subpath-demo.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: subpath-demo
spec:
  containers:
  - name: app
    image: busybox
    command: ["/bin/sh", "-c", "sleep 3600"]
    volumeMounts:
    - name: cfg
      mountPath: /etc/cfg-mode     # 只挂单个文件
      subPath: APP_MODE            # 用 subPath 指定文件
  volumes:
  - name: cfg
    configMap:
      name: app-cfg
```

```bash
kubectl apply -f subpath-demo.yaml
kubectl exec subpath-demo -- cat /etc/cfg-mode          # dev
kubectl create configmap app-cfg --from-literal=APP_MODE=prod --dry-run=client -o yaml | kubectl apply -f -
sleep 10
kubectl exec subpath-demo -- cat /etc/cfg-mode          # 仍是 dev（subPath 不热更新！）
```

```bash
root@node1:~/k8slab/config# kubectl exec subpath-demo -- cat /etc/cfg-mode
dev
```

> **观察点**（经典坑实证，教材 §8.2.6）：ConfigMap 已改成 `prod`，但 subPath 挂载的文件**仍是 `dev`**——**subPath 是复制挂载（无软链接），彻底丧失热更新**。需要热更新的配置不要用 subPath（挂整个目录）。

immutable 体验

```bash
kubectl create configmap fixed-cfg --from-literal=KEY=val1
kubectl patch configmap fixed-cfg -p '{"immutable": true}'
kubectl create configmap fixed-cfg --from-literal=KEY=val2 --dry-run=client -o yaml | kubectl apply -f -
```

```bash
root@node1:~/k8slab/config# kubectl create configmap fixed-cfg --from-literal=KEY=val2 --dry-run=client -o yaml | kubectl apply -f -
Error from server (Invalid): ... field is immutable
```

> **观察点**（immutable，教材 §8.2.7）：标了 `immutable: true` 的 ConfigMap **禁止修改**（报 `field is immutable`）——只能删除重建；好处是 kubelet 不再轮询检查变化（大规模集群性能优化）。

**清理**

```bash
kubectl delete pod subpath-demo
kubectl delete configmap app-cfg fixed-cfg
```

## Lab 8 imagePullSecrets 私有仓库（可选·进阶）

> **目标**：部署一个本地私有镜像仓库，用 imagePullSecrets 让 kubelet 拉取私有镜像。
> **验证概念**：教材 §12.4.1——私有仓库凭据用 **dockerconfigjson 类型 Secret**，Pod 通过 `imagePullSecrets` 引用；没有凭据 → ImagePullBackOff（实验 10 的排障场景之一）。

部署本地私有仓库（用 registry 容器模拟）

```bash
kubectl create ns registry-demo
kubectl create deployment registry --image=registry:2 -n registry-demo
kubectl expose deployment registry --port=5000 -n registry-demo
```

创建私有镜像凭据 Secret

```bash
kubectl -n registry-demo create secret docker-registry regcred \
  --docker-server=registry.registry-demo.svc:5000 \
  --docker-username=test --docker-password=test123
```

创建使用凭据的 Pod

```bash
cat > private-pod.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: private-app
  namespace: registry-demo
spec:
  imagePullSecrets:            # 关键：引用凭据 Secret
  - name: regcred
  containers:
  - name: app
    image: registry.registry-demo.svc:5000/busybox:latest
    command: ["/bin/sh", "-c", "sleep 3600"]
EOF
kubectl apply -f private-pod.yaml
kubectl get pod private-app -n registry-demo
```

> **配置要点**（imagePullSecrets，教材 §12.4.1）：
> - `kubectl create secret docker-registry` 生成 **dockerconfigjson 类型** Secret（存 .dockerconfigjson 凭据）
> - Pod 的 `spec.imagePullSecrets` 引用它——**kubelet 拉镜像时用该凭据认证**
> - 注意凭据**按命名空间生效**：每个命名空间都要创建自己的 regcred

> **观察点**：有凭据的 Pod 能拉取私有镜像（真实环境：企业私有仓库/镜像加速认证）；去掉 `imagePullSecrets` 会报 `ErrImagePull`（unauthorized）——这正是实验 10 Lab 2 的 ImagePullBackOff 根因之一。

**清理**

```bash
kubectl delete pod private-app
kubectl delete ns registry-demo
```
## 补充：Downward API——把 Pod 自身信息注入容器

**补充：Downward API——把 Pod 自身信息注入容器**

> 本 Lab 的 podinfo.yaml 里用到了 `downwardAPI` 卷（把 Pod 的 labels/annotations 注入为文件），这里把它讲透。**Downward API** 让容器"知道自己是谁"：把 Pod 的元数据（名称、命名空间、标签、注解、IP、节点名）以**环境变量**或**文件**方式注入——应用不需要连 API Server 就能读到自己的身份信息。

**方式一：env 注入（fieldRef）**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: downward-demo
  labels:
    app: demo
    env: test
spec:
  containers:
  - name: busybox
    image: busybox
    command: ["/bin/sh", "-c", "sleep 3600"]
    env:
    - name: MY_POD_NAME        # 环境变量名
      valueFrom:
        fieldRef:              # 来源：Pod 字段
          fieldPath: metadata.name        # Pod 名
    - name: MY_NODE
      valueFrom:
        fieldRef:
          fieldPath: spec.nodeName        # 所在节点
    - name: MY_NAMESPACE
      valueFrom:
        fieldRef:
          fieldPath: metadata.namespace   # 命名空间
```

```bash
kubectl apply -f downward-demo.yaml
kubectl exec -it downward-demo -- env | grep MY_
```

```bash
root@node1:~/k8slab/perfmon# kubectl exec -it downward-demo -- env | grep MY_
MY_POD_NAME=downward-demo
MY_NODE=node2
MY_NAMESPACE=default
```

> **观察点**（env 注入）：`MY_POD_NAME/MY_NODE/MY_NAMESPACE` 三个变量自动带上了 Pod 的真实信息——**Pod 里的应用不用查 API 就知道自己在哪台机器、叫什么名字**（日志上报、监控打点常用）。

**方式二：卷挂载（downwardAPI 卷，podinfo.yaml 用的这种）**

```yaml
    volumeMounts:
    - name: podinfo
      mountPath: /etc/podinfo
    volumes:
    - name: podinfo
      downwardAPI:
        items:
        - path: "labels"                 # 生成文件 /etc/podinfo/labels
          fieldRef:
            fieldPath: metadata.labels
        - path: "annotations"            # 生成文件 /etc/podinfo/annotations
          fieldRef:
            fieldPath: metadata.annotations
```

> **配置要点**（两种方式对比）：
> - **env 注入**（`valueFrom.fieldRef`）：单字段 → 环境变量，适合少量信息（Pod 名/节点名）
> - **卷挂载**（`downwardAPI` 卷 + `items[].path/fieldRef`）：多字段 → 文件，labels/annotations 这类**整个对象**用文件方式（podinfo.yaml 正是把 labels/annotations 变成 `/etc/podinfod/metadata/labels` 文件展示在页面上）
> - 与 实验 06 ConfigMap 对比：ConfigMap 注入的是**外部配置**，Downward API 注入的是 **Pod 自己的元数据**——两者机制类似、数据来源不同

清理

```bash
kubectl delete -f downward-demo.yaml
```

> 说明：删除 Downward API 演示 Pod（podinfo 已在 Lab 2 清理过）。

> 说明：Downward API 与 ConfigMap 的机制对比（数据来源不同：一个注入 Pod 自身元数据、一个注入外部配置）是教材第 8 章的考点；实验 05 Lab 2 的 HPA 演示应用 podinfo 也用了 downwardAPI 卷（把 labels/annotations 挂成文件展示）。

## 本章小结

本章通过 8 个实验 + 1 个补充，掌握了 Kubernetes 配置管理的核心对象：ConfigMap 与 Secret（及 Downward API）。

| 实验 | 验证的知识点 | 关键概念 | 级别 |
|---|---|---|:---:|
| Lab 1 基于文件的 configmap | `--from-file` 从文件创建；configMap 卷挂载进 mysql | 配置外部化、卷挂载、键名=文件名 | 必做 |
| Lab 2 键值对 configmap | `--from-literal` 创建；键值对挂载成**文件**（键名=键名） | 卷方式消费、文件即配置 | 必做 |
| Lab 3 env 映射 configmap | `configMapKeyRef` 把键值注入为**环境变量** | env 注入、单键引用 | 必做 |
| Lab 4 secret 保存敏感信息 | Secret 存密码（base64 编码）；`secretKeyRef` 注入 mysql | Secret、base64、describe 不显示内容 | 必做 |
| Lab 5 用 secret 封装 configmap | `--from-file` 封装整个配置文件；挂载后自动还原明文 | 文件型 Secret、挂载还原 | 必做 |
| Lab 6 ConfigMap 热更新对比 | 卷挂载自动更新 vs env 需重启（同源对比） | 热更新机制、kubelet 同步周期 | 必做 |
| Lab 7 subPath 陷阱与 immutable | subPath 丧失热更新；immutable 禁止修改 | `subPath` 复制挂载、`immutable: true` | 推荐 |
| Lab 8 imagePullSecrets 私有仓库 | 私有镜像凭据与拉取认证 | `docker-registry` Secret、`imagePullSecrets` | 可选·进阶 |
| 补充：Downward API | Pod 自身元数据注入（env 的 fieldRef / 卷的 downwardAPI） | `fieldRef`、`downwardAPI` 卷、labels/annotations 注入 | 推荐 |

**核心认知**：
1. **ConfigMap 管配置，Secret 管敏感信息**：两者结构几乎一样（`data` 区键值对），区别是 Secret 的值经 base64 编码、`describe` 不显示内容（Lab 4/5 对比验证）
2. **两种消费方式按场景选**：**卷挂载**（键变文件，支持热更新，Lab 1/2/5）和 **env 注入**（单键变变量，一次性，改后需重启 Pod，Lab 3/4）
3. **base64 是编码不是加密**：`kubectl get -o yaml` 就能看到密文，`echo ... | base64 -d` 就能还原（Lab 4/5 亲手验证过）——Secret 的安全依赖**访问控制（RBAC）和加密存储**，不是 base64
4. **配置外部化**：mysql 的配置文件（cnf）和密码都从 Deployment yaml 里"抽"出来放进集群对象——改配置不用改镜像、不用重建，便于统一管理和版本控制
5. **Secret 按类型使用**：`Opaque`（通用）、`kubernetes.io/tls`（证书，配 Ingress）、`kubernetes.io/dockerconfigjson`（私有仓库凭据，配 imagePullSecrets）、`service-account-token`（SA 令牌）
6. **Downward API vs ConfigMap**：前者注入 **Pod 自己的元数据**（我是谁/在哪），后者注入**外部配置**（应用要什么）——机制类似（env/卷两种方式）、数据来源不同

**与后续章节的衔接**：
- ConfigMap/Secret 都是**卷和环境变量的数据源** → 实验 08 安全（RBAC 控制谁能读 Secret、SA token）、实验 09 可观测（配置变更与监控）
- `kubernetes.io/tls` Secret → 实验 07 Ingress TLS；`dockerconfigjson` → 私有镜像仓库拉取
- 配置外部化的思想 → 实验 04 Ingress/网络中的资源配置、生产环境配置管理
- Downward API → 实验 05 Lab 2 的 podinfo 应用（labels/annotations 挂载展示）
- mysql + blog 应用贯穿 → 后续章节继续作为示例应用

