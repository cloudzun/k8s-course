# 认证与授权


## 实验准备

- **前置条件**：已完成 实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，按 `nano xxx.yaml` 创建即可，无需克隆外部仓库
- **操作位置**：证书相关操作在 master 的 `/etc/kubernetes/pki/` 目录，kubectl 配置操作在 `~/.kube/` 目录

> ℹ️ 各 Lab 中的终端输出为参考示例（基于本手册约定的 192.168.0.x 环境），实际 Pod IP、节点分布、AGE 等会因环境不同而不同，关注输出**结构**而非具体数值。

**实验分级**：

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 查看证书目录 | 信任根与组件证书体系 | 必做 |
| Lab 2 生成用户证书 | 认证：X.509 用户身份 | 必做 |
| Lab 3 创建 SA | 认证：机器身份 | 必做 |
| Lab 4 给用户授权 | 授权：RBAC 三要素 | 必做 |
| Lab 5 给 SA 授权 | 授权：命名空间级 RoleBinding | 必做 |
| Lab 6 dashboard 综合演练 | SA+RBAC+Token 全链路 | 必做 |
| Lab 7 SecurityContext | 容器降权加固 | 必做 |
| Lab 8 Pod Security Admission | 命名空间强制安全标准 | 必做 |
| Lab 9 集群安全加固 | 证书续期 + etcd 静态加密 | 必做 |
| Lab 10 API Server 审计日志 | 谁在何时做了什么 | 推荐 |
| Lab 11 PSA 三动作对比 | enforce/audit/warn 差异 | 推荐 |
| Lab 12 kubectl auth can-i | 权限自检命令 | 推荐 |
## Lab 1 查看 Kubernetes 证书目录

> **目标**：认识 master 节点上的证书体系——CA 根证书、各组件证书、etcd 证书、admin.conf 认证文件。
> **验证概念**：Kubernetes 用 **X.509 证书做双向认证**：`ca.crt/ca.key` 是集群的**信任根**，所有组件证书（apiserver、kubelet、etcd 等）都由它签发；apiserver 校验客户端证书时，只认"由 ca 签发的证书"——这就是 Lab 2 里给用户签发证书的原理。

查看 master 的证书

```bash
cd /etc/kubernetes/pki/
```

```bash
ls
```

```bash
root@node1:/etc/kubernetes/pki# ls
apiserver.crt              apiserver.key                 ca.crt  front-proxy-ca.crt      front-proxy-client.key
apiserver-etcd-client.crt  apiserver-kubelet-client.crt  ca.key  front-proxy-ca.key      sa.key
apiserver-etcd-client.key  apiserver-kubelet-client.key  etcd    front-proxy-client.crt  sa.pub
```

> **观察点**（ls 分类看三组）：
> - **CA 对**：`ca.crt`（证书）+ `ca.key`（私钥）——信任根，其余证书都由它签发（注意 `ca.key` 必须严格保密）
> - **apiserver 相关**：`apiserver.crt/key`、`apiserver-kubelet-client.crt/key`、`apiserver-etcd-client.crt/key`——apiserver 对外服务、访问 kubelet、访问 etcd 各自一对
> - **其他**：`front-proxy-*`（聚合 API 代理）、`sa.key/sa.pub`（SA token 签名）、`etcd/` 子目录（etcd 集群证书）

`ca.crt` 是 ca 的自签名证书，`ca.key` 是验证 key，其他各个组件分别持有的 crt 和 key 也在这个目录中

查看ca.crt

```bash
cat /etc/kubernetes/pki/ca.crt
```

对ca.crt进行base64转码

```bash
cat /etc/kubernetes/pki/ca.crt | base64 -w0
```

```text
root@node1:/etc/kubernetes/pki# cat /etc/kubernetes/pki/ca.crt
-----BEGIN CERTIFICATE-----
MIIC/jCCAeagAwIBAgIBADANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQDEwprdWJl
...
-----END CERTIFICATE-----
root@node1:/etc/kubernetes/pki# cat /etc/kubernetes/pki/ca.crt | base64 -w0
LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUMvakNDQWVhZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwK...
```

> **观察点**（base64 转码的意义）：`cat ca.crt` 看到的是 PEM 格式（`-----BEGIN CERTIFICATE-----`），`base64 -w0` 转成**单行 base64 字符串**——**kubeconfig 里存的证书就是这个格式**（下一步对比 admin.conf 验证）。

对比一下两部分的显示

查看etcd证书

```bash
cd etcd/
ls
```

```bash
root@node1:/etc/kubernetes/pki/etcd# ls
ca.crt  ca.key  healthcheck-client.crt  healthcheck-client.key  peer.crt  peer.key  server.crt  server.key
```

> **观察点**：etcd 有**自己独立的 CA**（`ca.crt/ca.key`）+ 三类证书：`server`（etcd 对外服务）、`peer`（etcd 节点间通信）、`healthcheck-client`（健康检查）——etcd 集群内部自成一套 PKI。

此处存放的是etcd和其他各个组件进行通讯用的证书

查看admin.conf 认证文件架构

```bash
cat /etc/kubernetes/admin.conf
```

> **观察点**（admin.conf = 集群管理员 kubeconfig）：
> - `certificate-authority-data`——**就是刚才 base64 转码的 ca.crt**（对比验证：同一串字符），客户端用它校验 apiserver 身份
> - `client-certificate-data / client-key-data`——管理员自己的证书（由 ca 签发的 `kubernetes-admin`），客户端用它向 apiserver 证明身份
> - 这就是 kubeconfig 的"双向信任"：**CA 校验服务器 + 客户端证书证明自己**

特别关注证书验证数据certificate-authority-data部分，和之前解码的ca.crt进行对比

## Lab 2 生成用户证书及配置文件

> **目标**：用 openssl 让集群 CA 签发一个**用户证书**（train），写入 kubeconfig 生成新上下文，体验"能认证但没权限"（Forbidden）。
> **验证概念**：① **kubeconfig 三段式**：`cluster`（连哪）+ `user`（我是谁）+ `context`（两者组合）；② **客户端证书认证**：apiserver 用 ca.crt 校验 train.crt 的签名与 CN，通过即认证成功；③ **认证 ≠ 授权**：train 能通过认证（身份有效），但没有任何 RBAC 权限，访问被 Forbidden 拒绝（Lab 4 才授权）。

切换目录

```bash
cd /root/.kube/
```

生成用户key

```bash
openssl genrsa -out train.key 2048
```

基于key生成csr

```bash
openssl req -new -key train.key -out train.csr -subj "/CN=train/O=cloudzun"
```

向ca提交csr生成证书

```bash
openssl x509 -req -in train.csr -CA /etc/kubernetes/pki/ca.crt -CAkey /etc/kubernetes/pki/ca.key -CAcreateserial -out train.crt -days 500
```

> **配置要点**（openssl 三步签发用户证书）：
> - `openssl genrsa`——生成用户私钥 `train.key`（2048 位）
> - `openssl req -subj "/CN=train/O=cloudzun"`——生成证书签名请求：**`CN`（Common Name）= 用户名**，`O`（Organization）= 用户组（apiserver 认证时 CN 即用户名、O 即组名，后面 RBAC 按它匹配）
> - `openssl x509 -req`——**用集群 CA（ca.crt/ca.key）签发**证书：`-CAcreateserial` 生成序列号文件、`-days 500` 有效期。这一步相当于"管理员盖章"，签完 train 就拥有了被集群信任的证书

查看证书和key文件

```bash
ls
```

```bash
root@node1:~/.kube# openssl genrsa -out train.key 2048
Generating RSA private key, 2048 bit long modulus (2 primes)
.......................................................................+++++
e is 65537 (0x010001)
root@node1:~/.kube# openssl req -new -key train.key -out train.csr -subj "/CN=train/O=cloudzun"
root@node1:~/.kube# openssl x509 -req -in train.csr -CA /etc/kubernetes/pki/ca.crt -CAkey /etc/kubernetes/pki/ca.key -CAcreateserial -out train.crt -days 500
Signature ok
subject=CN = train, O = cloudzun
Getting CA Private Key
root@node1:~/.kube# ls
cache  config  train.crt  train.csr  train.key
```

> **观察点**：生成三个文件 `train.key`（私钥）、`train.csr`（请求）、`train.crt`（**签发后的证书**）；`Signature ok` + `subject=CN = train, O = cloudzun`——CA 签名成功，用户身份是 `train`（组 cloudzun）。

备份

```bash
cp config config.bak
```

> 说明：先备份原始 kubeconfig（后续命令会往里追加），实验结束用 `cp config.bak config` 还原。

使用命令行创建配置文件

```bash
kubectl config set-credentials train --client-certificate=train.crt  --client-key=train.key
```

> **配置要点**（kubeconfig 写入 user 段）：
> - `set-credentials train`——在 kubeconfig 里新增一个名为 `train` 的 **user 条目**
> - `--client-certificate=train.crt --client-key=train.key`——把刚才签发的证书/私钥**填进这个 user**（kubectl 会读取文件内容，base64 后写入 `client-certificate-data` 字段）

查看config文件

```bash
nano config
```

确认train的证书和密钥都被填充进来

设置上下文

```bash
kubectl config set-context train@kubernetes --cluster=kubernetes --user=train
```

> **配置要点**（kubeconfig 写入 context 段）：`set-context train@kubernetes --cluster=kubernetes --user=train`——把 **user（train）+ cluster（kubernetes）组合成上下文** `train@kubernetes`。命名习惯 `用户@集群`，与 `kubernetes-admin@kubernetes` 一致。

查看config文件

```bash
nano config
```

确认train的上下文被填充进来

查看当前上下文

```bash
kubectl config current-context
```

查看所有上下文

```bash
kubectl config get-contexts
```

```bash
root@node1:~/.kube# kubectl config get-contexts
CURRENT   NAME                          CLUSTER      AUTHINFO           NAMESPACE
*         kubernetes-admin@kubernetes   kubernetes   kubernetes-admin
          train@kubernetes              kubernetes   train
```

有星标的是当前上下文

查看config命令行帮助

```bash
kubectl config --help
```

```bash
root@node1:~/.kube# kubectl config --help
Modify kubeconfig files using subcommands like "kubectl config set current-context my-context"

 The loading order follows these rules:

  1.  If the --kubeconfig flag is set, then only that file is loaded. The flag may only be set once and no merging takes
place.
  2.  If $KUBECONFIG environment variable is set, then it is used as a list of paths (normal path delimiting rules for
your system). These paths are merged. When a value is modified, it is modified in the file that defines the stanza. When
a value is created, it is created in the first file that exists. If no files in the chain exist, then it creates the
last file in the list.
  3.  Otherwise, ${HOME}/.kube/config is used and no merging takes place.

Available Commands:
  current-context Display the current-context
  delete-cluster  Delete the specified cluster from the kubeconfig
  delete-context  Delete the specified context from the kubeconfig
  delete-user     Delete the specified user from the kubeconfig
  get-clusters    Display clusters defined in the kubeconfig
  get-contexts    Describe one or many contexts
  get-users       Display users defined in the kubeconfig
  rename-context  Rename a context from the kubeconfig file
  set             Set an individual value in a kubeconfig file
  set-cluster     Set a cluster entry in kubeconfig
  set-context     Set a context entry in kubeconfig
  set-credentials Set a user entry in kubeconfig
  unset           Unset an individual value in a kubeconfig file
  use-context     Set the current-context in a kubeconfig file
  view            Display merged kubeconfig settings or a specified kubeconfig file

Usage:
  kubectl config SUBCOMMAND [options]

Use "kubectl <command> --help" for more information about a given command.
Use "kubectl options" for a list of global command-line options (applies to all commands).
```

可以看到有删除重命名上下文的命令（delete-context / rename-context / use-context 等），多上下文管理就靠这些子命令

切换上下文

```bash
kubectl config use-context train@kubernetes
```

在当前上下文中尝试执行一些命令行操作

```bash
kubectl get pods
```

```bash
kubectl explain pods
```

```bash
root@node1:~/.kube# kubectl config use-context train@kubernetes
Switched to context "train@kubernetes".
root@node1:~/.kube# kubectl get pods
Error from server (Forbidden): pods is forbidden: User "train" cannot list resource "pods" in API group "" in the namespace "default"
root@node1:~/.kube# kubectl explain pods
KIND:     Pod
VERSION:  v1

DESCRIPTION:
     Pod is a collection of containers that can run on a host. This resource is
     created by clients and scheduled onto hosts.

FIELDS:
   apiVersion   <string>
     APIVersion defines the versioned schema of this representation of an
     object. Servers should convert recognized schemas to the latest internal
     value, and may reject unrecognized values.
   kind <string>
     Kind is a string value representing the REST resource this object
     represents. Servers may infer this from the endpoint the client submits
     requests to. Cannot be updated. In CamelCase.
   metadata     <Object>
     Standard object's metadata.
   spec <Object>
     Specification of the desired behavior of the pod.
   status       <Object>
     Most recently observed status of the pod.
```

> **观察点**（认证成功 + 授权失败，教学核心）：
> - `Switched to context "train@kubernetes"`——上下文切换成功
> - `kubectl get pods` → **`Forbidden`**：报错点名 `User "train" cannot list resource "pods"`——**注意报错里能认出 User "train"**，说明**认证通过了**（服务器识别了你的身份），只是**没有任何授权**（RBAC 权限），被拒绝
> - `kubectl explain pods` → 正常返回——因为 explain 只读**本地 schema 缓存**（不需要集群授权），与 get 形成对照
> - 结论：**认证（你是谁）与授权（你能干啥）是两件事**——Lab 4 给 train 授权后就通了

如果遇到报错，可能需要复制.crt和.key文件到 /root/.kube/

> **补充：官方推荐的证书签发方式（CSR API）**
>
> 上面用 `openssl x509 -CA` 手动签发是经典做法（CKA 也考）。Kubernetes 官方更推荐用 **CertificateSigningRequest（CSR API）**——把签名交给集群内的 controller-manager 完成，不需要在 master 上操作 ca.key：
>
> ```bash
> # 1. 生成私钥和 csr（与上面相同）
> openssl genrsa -out train.key 2048
> openssl req -new -key train.key -out train.csr -subj "/CN=train/O=cloudzun"
>
> # 2. 把 csr 内容 base64 后提交为 CSR 对象
> cat <<EOF | kubectl apply -f -
> apiVersion: certificates.k8s.io/v1
> kind: CertificateSigningRequest
> metadata:
>   name: train
> spec:
>   request: $(cat train.csr | base64 -w0)   # 证书请求内容（base64）
>   signerName: kubernetes.io/kube-apiserver-client   # 指定签名者：apiserver 客户端证书
>   usages:
>   - client auth   # 用途：客户端认证
> EOF
>
> # 3. 管理员审批（approve）→ controller-manager 自动签发
> kubectl certificate approve train
>
> # 4. 取回证书并写进 kubeconfig
> kubectl get csr train -o jsonpath='{.status.certificate}' | base64 -d > train.crt
> kubectl config set-credentials train --client-certificate=train.crt --client-key=train.key
> ```
>
> **对比**：openssl 方式由**管理员直接用 ca.key 签名**（一次性、适合教学）；CSR API 由**集群控制器签名**（审批留痕、ca.key 不出 master、适合生产）。两种方式产出的 train.crt 效果相同（都是 ca 签发的客户端证书），后续 RBAC 授权完全一样。

切换回上下文

```bash
kubectl config use-context kubernetes-admin@kubernetes
```

**清理**

```bash
kubectl config use-context kubernetes-admin@kubernetes
```

> 说明：train 上下文保留（Lab 4 授权后还要用）；只切回管理员上下文继续实验。

## Lab 3 创建 sa

> **目标**：创建 ServiceAccount（SA）并签发 token，把 token 写进 kubeconfig，用 SA 身份访问集群。
> **验证概念**：**SA 是给 Pod/程序用的"机器身份"**（对比 Lab 2 用户证书是给人用的）——SA 认证靠 **Bearer Token**（不是证书）；SA 的用户名格式固定为 `system:serviceaccount:<命名空间>:<名字>`（报错里能看到）；v1.24+ 用 `kubectl create token` **动态签发** token。

创建 lab 命名空间

```bash
kubectl create namespace lab
```

创建 sa

```bash
kubectl -n lab create serviceaccount lab-sa
```

定义 token 变量

> ⚠️ **v1.36 适配**：v1.24+ 中 ServiceAccount 不再自动创建 secret（`{.secrets[0].name}` 为空），需用 `kubectl create token` 动态签发（旧版方式见本 Lab 末尾说明）：

```bash
TOKEN=`kubectl -n lab create token lab-sa`
```

> **配置要点**：`kubectl create token lab-sa` 动态签发一个 **JWT Bearer Token**（默认 1 小时有效）；存进变量 `TOKEN` 供下一步写入 kubeconfig。**旧版**（v1.23 及以前）通过 SA 自动绑定的 secret 取 token：`TOKENNAME=kubectl -n lab get serviceaccount/lab-sa -o jsonpath='{.secrets[0].name}'` 然后 `TOKEN=kubectl -n lab get secret $TOKENNAME -o jsonpath='{.data.token}' | base64 --decode`。两者效果相同（都拿到 SA 的 bearer token），v1.36 用 `create token` 方式。

更新认证文件，增加 sa 的 token

```bash
kubectl config set-credentials lab-sa --token=$TOKEN
```

> **配置要点**：与 Lab 2 的 `set-credentials` 用法相同，只是认证凭据从"证书文件"换成"**token 字符串**"（`--token=$TOKEN`）——kubeconfig 的 user 段两种凭据都支持。

更新认证文件，增加sa的上下文

```bash
kubectl config set-context lab-sa@kubernetes --cluster=kubernetes --user=lab-sa
```

查看所有上下文

```bash
kubectl config get-contexts
```

```bash
root@node1:~/.kube# kubectl config get-contexts
CURRENT   NAME                          CLUSTER      AUTHINFO           NAMESPACE
*         kubernetes-admin@kubernetes   kubernetes   kubernetes-admin
          lab-sa@kubernetes             kubernetes   lab-sa
          train@kubernetes              kubernetes   train
```

> **观察点**：现在有 **3 个上下文**：`kubernetes-admin`（管理员，当前带 `*`）、`train`（Lab 2 用户证书）、`lab-sa`（Lab 3 SA token）——kubeconfig 可以同时管理多种身份，用 `use-context` 切换。

切换上下文到sa

```bash
kubectl config use-context lab-sa@kubernetes
```

执行一些操作

```bash
kubectl get pod -A
```

```bash
root@node1:~/.kube# kubectl get pod -A
Error from server (Forbidden): pods is forbidden: User "system:serviceaccount:lab:lab-sa" cannot list resource "pods" in API group "" at the cluster scope
```

> **观察点**（SA 身份已生效）：
> - 报错里的用户名是 **`system:serviceaccount:lab:lab-sa`**——SA 的标准用户名格式（`system:serviceaccount:<ns>:<name>`），证明 token 认证通过、身份是 lab 命名空间的 lab-sa
> - 同样 `Forbidden`——SA 也还没有任何权限（Lab 5 才给 lab-sa 授权）

切换回上下文

```bash
kubectl config use-context kubernetes-admin@kubernetes
```

**清理**

```bash
kubectl config use-context kubernetes-admin@kubernetes
```

> 说明：lab-sa 上下文保留（Lab 5 授权后还要用），只切回管理员。lab 命名空间也保留（Lab 5 继续使用）。

## Lab 4 给用户授权

> **目标**：用 ClusterRoleBinding 给用户 train 绑定角色（先体验内置 cluster-admin，再自己写一个 Role），让 train 从"认证通过但 Forbidden"变成"有权限"。
> **验证概念**：**RBAC 三要素**：`Subject`（谁：User/Group/ServiceAccount）+ `Role/ClusterRole`（权限集合）+ `Binding`（把谁和哪个权限绑一起）——`ClusterRoleBinding` 绑出的权限**全集群生效**，`RoleBinding` 只在一个命名空间生效（Lab 5 讲）。内置角色 `view`（只读）/`edit`（可写）/`admin`（命名空间全权）/`cluster-admin`（集群全权）。

查看clusterroles角色

```bash
kubectl get clusterroles -o wide
```

```bash
root@node1:~/.kube# kubectl get clusterroles -o wide
NAME                                   CREATED AT
admin                                  2022-04-23T02:51:44Z
calico-node                            2022-04-23T02:52:24Z
cluster-admin                          2022-04-23T02:51:44Z
edit                                   2022-04-23T02:51:44Z
ingress-nginx                          2022-12-21T11:19:28Z
kubeadm:get-nodes                      2022-04-23T02:51:46Z
system:aggregate-to-admin              2022-04-23T02:51:44Z
system:aggregate-to-edit               2022-04-23T02:51:44Z
system:aggregate-to-view               2022-04-23T02:51:44Z
system:certificates.k8s.io:...         2022-04-23T02:51:44Z
system:controller:*                    2022-04-23T02:51:44Z
system:coredns                         2022-04-23T02:51:46Z
system:kube-scheduler                  2022-04-23T02:51:44Z
system:node                            2022-04-23T02:51:44Z
view                                   2022-04-23T02:51:44Z
（其余 system:* 系统角色已省略，输出很长）
```r

> **观察点**（clusterroles 列表，已精简）：
> - **内置用户角色**（最常用）：`cluster-admin`（集群全权）、`admin`（命名空间全权）、`edit`（可读写）、`view`（只读）——教学/日常授权优先用这些
> - **`system:*` 系统角色**：给 kubelet、各 controller、coredns 等系统组件用的，**不要手动绑定给用户**
> - 非 `system:` 前缀的 `calico-*`、`ingress-nginx` 等是组件安装时自带的自定义角色

查看 role 的定义

```bash
kubectl get -o yaml clusterrole view
```

```bash
kubectl get -o yaml clusterrole edit
```

> **观察点**（内置角色内部结构）：`kubectl get -o yaml clusterrole view` 能看到角色的 `rules` 段——`apiGroups`（API 组）+ `resources`（资源）+ `verbs`（操作，如 get/list/watch）组成的**权限矩阵**。内置角色就是一组 rules 的集合，下面我们自己写一个同样结构的。

**补充：自定义 Role（CKA 必考）**

> 内置角色不够用时，自己写 Role/ClusterRole——核心是 **`rules` 三段式：`apiGroups` + `resources` + `verbs`**：

```bash
nano dev-role.yaml
```

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: dev-role
  namespace: default   # Role 只在本命名空间生效（ClusterRole 则无 namespace 字段，全集群）
rules:
- apiGroups: [""]              # "" 表示核心组（pods/services 等，不带 group 前缀）
  resources: ["pods"]          # 资源名（复数）
  verbs: ["get", "list", "watch"]   # 允许的操作
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "create", "update", "delete"]
```

> **配置要点**（rules 的字段含义）：
> - `apiGroups`：API 组——核心资源（Pod/Service）用 `""`，`apps` 组（Deployment/StatefulSet）用 `["apps"]`，不确定时 `kubectl explain pod.apiVersion` 或 `kubectl api-resources` 查（实验 01 学过）
> - `resources`：资源名**复数**（pods、deployments、services）；`verbs` 常用 `get/list/watch/create/update/patch/delete`
> - `kind: Role` + `namespace` = **命名空间内生效**；`kind: ClusterRole`（无 namespace）= 全集群生效

创建并绑定给 train：

```bash
kubectl apply -f dev-role.yaml
kubectl create rolebinding train-dev --role=dev-role --user=train -n default
```

> 说明：`--role=dev-role` 引用刚创建的 Role、`--user=train` 绑定用户、`-n default` 绑定在 default 命名空间（RoleBinding 必须带命名空间）。train 现在可以在 default 命名空间查看 Pod、管理 Deployment（下面再用 cluster-admin 绑定体验"最高权限"，两者不冲突）。

通过设置 clusterrolebinding 给 train 授予最高权限

```bash
kubectl create clusterrolebinding train@cluster-admin --user=train --clusterrole=cluster-admin
```

> **配置要点**（ClusterRoleBinding）：
> - `--clusterrole=cluster-admin`——绑定内置**集群最高权限**角色
> - `--user=train`——授权对象是用户 train（注意不是 `--serviceaccount`，那是给 SA 用的，Lab 5 对比）
> - 与刚才的 RoleBinding 对比：**ClusterRoleBinding 无命名空间概念**（全集群生效），RoleBinding 限命名空间

切换到 train 上下文，执行一些操作

```bash
kubectl config use-context train@kubernetes
```

```bash
kubectl get pods -A -o wide
```

```bash
root@node1:~/.kube# kubectl config use-context train@kubernetes
Switched to context "train@kubernetes".
root@node1:~/.kube# kubectl get pods -A -o wide
NAMESPACE       NAME                                        READY   STATUS    RESTARTS      AGE    IP               NODE
default         katacoda-daemonsets-5l28c                   1/1     Running   0             28m    10.244.104.39    node2
default         katacoda-daemonsets-vkrpj                   1/1     Running   0             28m    10.244.166.137   node1
ingress-nginx   ingress-nginx-controller-76d86f9848-8r5jq   1/1     Running   0             95m    192.168.0.13    node3
kube-system     calico-node-57snh                           1/1     Running   1 (37d ago)   243d   192.168.0.12    node2
kube-system     etcd-node1                                  1/1     Running   1 (37d ago)   243d   192.168.0.11    node1
kube-system     kube-apiserver-node1                        1/1     Running   1 (37d ago)   243d   192.168.0.11    node1
（其余 Pod 已省略）
```

> **观察点**（授权生效的瞬间）：同一个 train，Lab 2 里 `get pods` 报 `Forbidden`，现在 **`get pods -A` 成功列出所有命名空间的 Pod**——cluster-admin 绑定生效。**授权是即时生效的**，不需要重启任何组件。

查看 clusterrolebinding

```bash
kubectl get clusterrolebinding
```

```bash
kubectl describe clusterrolebinding train@cluster-admin
```

```bash
kubectl get clusterrolebinding train@cluster-admin -o yaml
```

```bash
root@node1:~/.kube# kubectl get clusterrolebinding train@cluster-admin -o yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: train@cluster-admin
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: User
  name: train
```

> **观察点**（binding 的 yaml 结构）：`roleRef`（引用哪个角色：cluster-admin）+ `subjects`（授权给谁：`kind: User, name: train`）——**RBAC 三要素在 yaml 里一目了然**：用 Binding 把 Role 和 Subject 关联起来。`kind: User` 对应 Lab 2 的证书用户；SA 授权时这里是 `kind: ServiceAccount`（Lab 5 对比）。

切换回上下文

```bash
kubectl config use-context kubernetes-admin@kubernetes
```

**清理**

```bash
kubectl delete rolebinding train-dev -n default
kubectl delete -f dev-role.yaml
```

> 说明：删掉自定义 RoleBinding/Role（自定义实验的产物）。train 的 cluster-admin 绑定与上下文保留（Lab 6 不用 train，可留作后续实验；如需彻底还原：`kubectl delete clusterrolebinding train@cluster-admin` 并用 Lab 2 的 `config.bak` 还原 kubeconfig）。

## Lab 5 给 sa 授权

> **目标**：用 RoleBinding 给 lab 命名空间的 SA（lab-sa）授予**命名空间内**的只读权限，验证"跨命名空间失败、本命名空间成功"。
> **验证概念**：**RoleBinding 是命名空间级的绑定**——它把 `view`（ClusterRole）绑给 lab-sa，但只在 **lab 命名空间**生效：lab-sa 能看 lab 里的资源，看其他命名空间仍然 Forbidden（对比 Lab 4 的 ClusterRoleBinding 全集群生效）。

通过创建角色绑定给 lab-sa 授予 lab 命名空间的查看权限

```bash
kubectl create rolebinding lab-sa --clusterrole=view --serviceaccount=lab:lab-sa -n lab
```

> **配置要点**（与 Lab 4 的对比是关键）：
> - `--serviceaccount=lab:lab-sa`——授权对象是 **SA**（格式 `命名空间:SA名`），对比 Lab 4 的 `--user=train`（User）
> - `--clusterrole=view` + `-n lab`——绑定内置只读角色，**限定在 lab 命名空间**（RoleBinding 必须带 `-n`）
> - 为什么用 ClusterRole 却只在一个命名空间生效？——**RoleBinding 引用 ClusterRole 时，权限范围被限制在 RoleBinding 自己的命名空间**

切换上下文到 sa

```bash
kubectl config use-context lab-sa@kubernetes
```

执行一些操作

```bash
kubectl get pod -A
```

```bash
root@node1:~/.kube# kubectl get pod -A
Error from server (Forbidden): pods is forbidden: User "system:serviceaccount:lab:lab-sa" cannot list resource "pods" in API group "" at the cluster scope
```

> **观察点**：`get pod -A`（跨命名空间）**依然 Forbidden**——RoleBinding 只在 lab 命名空间生效，SA 没有集群范围的权限（`at the cluster scope`）。这正好说明 RoleBinding 与 ClusterRoleBinding 的差别。

失败依旧

在自己地盘里睽睽

```bash
kubectl get pod -n lab
```

```bash
root@node1:~/.kube# kubectl get pod -n lab
No resources found in lab namespace.
```

> **观察点**：`get pod -n lab`（自己的命名空间）**成功**——`No resources found` 说明请求被允许了（只是 lab 里还没有 Pod）。**同一身份：跨命名空间被拒、本命名空间放行**，RoleBinding 的作用范围一目了然。

切换回上下文

```bash
kubectl config use-context kubernetes-admin@kubernetes
```

查看lab命名空间的rolebinding

```bash
kubectl get rolebinding -n lab
```

```bash
kubectl get -o yaml rolebinding lab-sa -n lab
```

```bash
kubectl describe rolebindings lab-sa -n lab
```

```bash
root@node1:~/.kube# kubectl get rolebinding -n lab
NAME     ROLE               AGE
lab-sa   ClusterRole/view   90s
root@node1:~/.kube# kubectl get -o yaml rolebinding lab-sa -n lab
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: lab-sa
  namespace: lab
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: view
subjects:
- kind: ServiceAccount
  name: lab-sa
  namespace: lab
root@node1:~/.kube# kubectl describe rolebindings lab-sa -n lab
Name:         lab-sa
Role:
  Kind:  ClusterRole
  Name:  view
Subjects:
  Kind            Name    Namespace
  ----            ----    ---------
  ServiceAccount  lab-sa  lab
```

> **观察点**（与 Lab 4 的 yaml 逐字段对比）：
> - `subjects.kind: ServiceAccount`——授权对象是 **SA**（Lab 4 是 `User`）
> - `metadata.namespace: lab` + `roleRef.kind: ClusterRole`——**RoleBinding（命名空间级）引用 ClusterRole（集群级角色）**，生效范围 = 命名空间
> - 对照记忆：**Binding 的类型决定生效范围**（RoleBinding=命名空间，ClusterRoleBinding=全集群），**Role 的类型决定权限内容**

**清理**

```bash
kubectl delete ns lab
cp config.bak config
```

> 说明：删除 lab 命名空间（连带 lab-sa、rolebinding 一并清除）；**用 Lab 2 的备份还原 kubeconfig**——删掉 train/lab-sa 上下文和 token，恢复初始管理员状态。注意：train 的 cluster-admin 绑定还在集群里，如不需要一并删除：`kubectl delete clusterrolebinding train@cluster-admin`。

## Lab 6 综合演练：安装 dashboard 并用 SA/Token 登录

> **目标**：把本章学过的知识串成完整链路——安装 kubernetes-dashboard（helm + NodePort），创建 SA、用 ClusterRoleBinding 赋权、签发 Token，**用 Token 登录图形化管理界面**。
> **验证概念**：这是 Lab 3（SA + create token）+ Lab 4（ClusterRoleBinding 授权）的**综合应用**：dashboard 登录的本质就是"**认证（Token 证明你是谁）+ 授权（RBAC 决定你能干啥）**"——浏览器输入 Token 的一瞬间，走的正是本章前 4 个 Lab 的机制。
>
> ⚠️ **v1.36 适配**：原实验使用 2020 年的 helm 3.3.0 和已废弃的 `incubator` chart 仓库（早已归档、阿里云镜像源也已失效）。本 Lab 改用**官方安装脚本安装最新 helm** + **官方 dashboard chart**，实验目标（NodePort 暴露 + Token 登录）不变。

安装 helm（官方脚本，安装最新稳定版）

```bash
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

> 若 `raw.githubusercontent.com` 拉取慢/失败（国内网络），可改用国内镜像：`curl -fsSL https://get.helm.sh/helm-v3.18.0-linux-amd64.tar.gz -o helm.tgz && tar xf helm.tgz && mv linux-amd64/helm /usr/bin/`（版本号以 https://github.com/helm/helm/releases 为准）。

查看 helm 版本

```bash
helm version
```

部署 dashboard（官方 chart）

```bash
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard -n kube-system
```

> 若 `kubernetes.github.io` 不可达，可跳过 helm，直接用官方 manifest：
>
> ```bash
> kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v3.0.5/kubernetes-dashboard.yaml
> ```
>
> （版本号以 https://github.com/kubernetes/dashboard/releases 为准；用 manifest 方式时无 helm release，后续步骤不受影响）

```bash
root@node1:~# helm version
version.BuildInfo{Version:"v3.18.0", ...}
```

> **观察点**：`helm version` 输出 `v3.18.0`——helm 就绪。`helm upgrade --install` 是幂等安装（有则升级、无则安装），dashboard 被部署到 **kube-system** 命名空间（图表里的 SA、Deployment、Service 等资源由 helm 一并创建）。

修改 Service 类型为 NodePort，暴露 dashboard 访问端口

> v3 架构包含多个 service（web / auth / kong-proxy 等）。将 web 入口 service 改为 NodePort：

```bash
kubectl -n kube-system patch svc kubernetes-dashboard-web -p '{"spec":{"type":"NodePort"}}'
```

> 若 patch 报 `NotFound`（不同版本 service 名可能不同），先用 `kubectl -n kube-system get svc | grep dashboard` 查看实际 service 名，再对 web 入口那个执行同样 patch。

查看 NodePort 端口（Port 列的 443:xxxxx 即为访问端口）

```bash
kubectl -n kube-system get svc kubernetes-dashboard-web
```

```bash
root@node1:~# kubectl -n kube-system get svc kubernetes-dashboard-web
NAME                        TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)         AGE
kubernetes-dashboard-web    NodePort   10.97.171.201   <none>        443:30573/TCP   3m59s
```

> **观察点**（patch 生效）：TYPE 变成 **`NodePort`**，`443:30573/TCP`——**30573 就是访问端口**（NodePort 范围 30000-32767，实验 04 学过）。v3 的 `web` 是入口 service（另有 auth/kong-proxy，见下方 svc 列表）。

浏览器访问：`https://<任一节点IP>:30573/`（如 https://192.168.0.11:30573/）

> 注意：dashboard v3 默认要求通过 HTTPS 访问，浏览器首次访问会提示证书不受信任，点击"高级 → 继续前往"即可（自签名证书）。如果浏览器无法访问，确认云主机安全组/防火墙已放行该 NodePort。

查看 pod

```bash
kubectl get pod -n kube-system | grep dashboard
```

```bash
root@node1:~/kubernetes-dashboard# kubectl get pod -n kube-system | grep dashboard
kubernetes-dashboard-687b7474-pbvmp       1/1     Running   0             3m14s
```

> **观察点**：dashboard 的 Pod `kubernetes-dashboard-<rs哈希>-<随机串>` 在 kube-system 运行正常——helm 把 chart 里的 Deployment 等资源都创建好了。

查看 svc

```bash
kubectl get svc -n kube-system  | grep dashboard
```

```bash
root@node1:~# kubectl get svc -n kube-system  | grep dashboard
kubernetes-dashboard-web         NodePort    10.97.171.201   <none>        443:30573/TCP    3m59s
kubernetes-dashboard-auth        ClusterIP   10.98.91.18     <none>        8000/TCP         3m59s
kubernetes-dashboard-kong-proxy  ClusterIP   10.99.72.5      <none>        80/TCP           3m59s
```

> **观察点**（v3 的多 service 架构）：
> - `kubernetes-dashboard-web`（NodePort，443:30573）——**浏览器入口**，唯一对外暴露的
> - `kubernetes-dashboard-auth`（ClusterIP，8000）——认证服务（处理 Token 登录）
> - `kubernetes-dashboard-kong-proxy`（ClusterIP，80）——kong API 网关代理
> - 三者通过集群内部网络协作：浏览器 → web（NodePort）→ auth（认证）→ kong-proxy（转发 API）

此处也可以观察到 dashboard 的端口号（web service 的 443:xxxxx）

**下面的步骤就是本章的核心：创建登录身份（复用 Lab 3/4 的知识）**

创建一个 sa

```bash
kubectl create sa -n kube-system chengzh
```

给 sa 赋权（复用 Lab 4 的 ClusterRoleBinding 语法）

```bash
kubectl create clusterrolebinding chengzh@kubernetes --serviceaccount=kube-system:chengzh --clusterrole=cluster-admin
```

> **配置要点**（SA + RBAC 两步，与 Lab 3/4 完全一致）：
> - `kubectl create sa chengzh -n kube-system`——创建 ServiceAccount `chengzh`（登录身份）
> - `kubectl create clusterrolebinding chengzh@kubernetes --serviceaccount=kube-system:chengzh --clusterrole=cluster-admin`——把 **cluster-admin**（集群最高权限角色）绑给这个 SA：`--serviceaccount=<命名空间>:<SA名>`（Lab 5 语法）+ `--clusterrole=cluster-admin`（Lab 4 语法）
> - 绑定后，`chengzh` 签发的 token 就拥有管理整个集群的权限——**dashboard 登录后就是管理员视图**

查看该 sa

```bash
kubectl describe sa chengzh -n kube-system
```

```bash
root@node1:~# kubectl describe sa chengzh -n kube-system
Name:                chengzh
Namespace:           kube-system
Labels:              <none>
Annotations:         <none>
Image pull secrets:  <none>
Mountable secrets:   <none>
Tokens:              <none>
Events:              <none>
```

> **观察点**：`Tokens: <none>`、`Mountable secrets: <none>`——**v1.24+ 的正常现象**（SA 不再自动创建长期 token secret，改用动态签发），别误以为没建成功，token 用下面的 `create token` 获取（Lab 3 讲过）。

获取 token（v1.36 用 `kubectl create token` 动态签发，默认 1 小时有效，过期后重新执行）

```bash
kubectl -n kube-system create token chengzh
```

```bash
root@node1:~# kubectl -n kube-system create token chengzh
eyJhbGciOiJSUzI1NiIsImtpZCI6...（此处省略）
```

> **观察点**：输出一长串以 **`eyJ` 开头**的 JWT——这就是登录凭据（默认 1 小时有效，过期重新执行同一条命令即可）。`eyJ` 是 JWT（JSON Web Token）的固定开头（Lab 3 的 `create token` 同款）。

复制输出的整段 token（以 `eyJ` 开头），用于登录 dashboard。

> 旧版方式（v1.23 及以前）为 `kubectl describe secret <token-secret名> -n kube-system` 查看 `Data.token` 字段；本手册基线 v1.36 请使用 `create token`。

使用该 token 登录到 dashboard

浏览器打开 `https://192.168.0.11:30573/`，在登录页选择 **Token** 方式，粘贴上一步复制的 token 即可进入。首次访问会提示证书不受信任，点击"高级 → 继续前往"（自签名证书）。

> **观察点**（登录页界面）：
> - 登录页提供 **Token** 和 **Kubeconfig** 两种方式，默认选中 Token——提示"每个 ServiceAccount 都有合法的 Bearer Token 可用于登录"
> - 粘贴 token 后点击登录即可进入 dashboard 主界面
> - 主界面左侧是功能菜单（Pods、Jobs、Namespaces 等），右侧展示资源列表——登录后先看 **Namespaces** 页面，能看到 `default`、`kube-system`、`ingress-nginx` 等命名空间（运行状态均为 Active，即全集群概览）
> - **回顾本章**：这个 Token 之所以能登录并看到所有资源，正是 Lab 3（SA+token 认证）+ Lab 4（cluster-admin 授权）的机制在背后工作

**清理**

> dashboard 是长期运维组件（和 metrics-server 一样），**建议保留**继续用于后续章节查看。如确需卸载：

```bash
helm uninstall kubernetes-dashboard -n kube-system
kubectl delete clusterrolebinding chengzh@kubernetes
kubectl delete sa chengzh -n kube-system
```

> 说明：`helm uninstall` 删除 dashboard 全部资源（Pod/svc），clusterrolebinding 和 SA 是实验创建的登录身份，一并清理。

## Lab 7 SecurityContext 安全上下文

> **目标**：用 `securityContext` 给容器"降权"——以非 root 用户运行、只读根文件系统、丢弃危险能力（capabilities），并对比降权前后的权限差异。
> **验证概念**：**容器默认以 root 身份运行**（宿主机的 root 权限过大，一旦被攻破危害极大）。`securityContext` 是容器/Pod 的"安全设置区"：`runAsUser`（以哪个 UID 运行）、`readOnlyRootFilesystem`（根文件系统只读）、`capabilities`（Linux 能力：`drop ALL` 丢弃全部、`add` 按需添加）。这是容器安全加固的第一步（配合 Lab 8 PSA 强制执行）。

先看基线：默认 Pod 以 root 运行

```bash
kubectl run whoami --image=busybox --command -- sleep 3600
```

```bash
kubectl exec -it whoami -- whoami
```

```bash
root@node1:~# kubectl exec -it whoami -- whoami
root
```

> **观察点**（基线）：容器内 `whoami` 返回 **`root`**——默认情况下容器以 root 运行（容器内的 root 与宿主机 root 共享内核权限，有逃逸风险）。这就是下面要加固的"默认状态"。

使用范例创建加固 Pod

```bash
nano secured-pod.yaml
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secured-pod
spec:
  securityContext:              # Pod 级安全上下文（作用于所有容器）
    runAsNonRoot: true          # 强制非 root 运行（UID 为 0 则拒绝启动）
    runAsUser: 1000             # 以 UID 1000 运行（非特权用户）
  containers:
  - name: busybox
    image: busybox
    command: ["/bin/sh", "-c", "sleep 3600"]
    securityContext:            # 容器级安全上下文（只作用于本容器）
      readOnlyRootFilesystem: true   # 根文件系统只读（/ 不能写）
      capabilities:
        drop: ["ALL"]           # 丢弃全部 Linux 能力（最严格）
```

> **配置要点**（securityContext 两级设置）：
> - **Pod 级**（`spec.securityContext`）：对 Pod 内所有容器生效——`runAsNonRoot: true`（UID=0 直接拒绝启动）+ `runAsUser: 1000`（指定运行用户）
> - **容器级**（`spec.containers[].securityContext`）：只对本容器生效——`readOnlyRootFilesystem: true`（容器根目录只读，防止写入恶意文件）、`capabilities.drop: ["ALL"]`（丢弃全部能力，如 NET_ADMIN/SYS_ADMIN 等危险项）
> - 生产常用组合：`drop: ["ALL"]` + `add: ["NET_BIND_SERVICE"]`（只保留绑定低端口的能力）

创建并验证

```bash
kubectl apply -f secured-pod.yaml
```

```bash
kubectl describe pod secured-pod
```

```bash
kubectl exec -it secured-pod -- id
```

```bash
kubectl exec -it secured-pod -- touch /test.txt
```

```bash
root@node1:~# kubectl apply -f secured-pod.yaml
pod/secured-pod created
root@node1:~# kubectl exec -it secured-pod -- id
uid=1000(1000) gid=1000(1000) groups=1000(1000)
root@node1:~# kubectl exec -it secured-pod -- touch /test.txt
touch: /test.txt: Read-only file system
```

> **观察点**（降权生效）：
> - `id` 显示 **`uid=1000`**——容器以非 root 用户运行（对比基线 Pod 的 `root`）
> - `touch /test.txt` 报 **`Read-only file system`**——根文件系统只读生效，攻击者无法在容器内落盘
> - describe pod 的 `Containers` 段能看到 `Security Context` 配置（runAsUser 1000、readOnlyRootFilesystem true、capabilities drop）

**清理**

清理两个实验 Pod

```bash
kubectl delete pod whoami
kubectl delete -f secured-pod.yaml
```

> 说明：SecurityContext 只是"Pod 自己声明安全要求"；**如何强制所有 Pod 都必须安全？**——用命名空间的 Pod Security 标准（Lab 8）。

## Lab 8 Pod Security Admission（PSA）

> **目标**：给命名空间打**安全标准标签**（baseline），强制该命名空间内所有 Pod 必须满足安全要求，验证违规 Pod 创建被拒。
> **验证概念**：**Pod Security Admission（PSA）**是 v1.25+ 默认启用的准入控制器（取代已废弃的 PSP）。它定义了三个安全级别：**`privileged`**（无限制）/ **`baseline`**（最小限制，默认建议）/ **`restricted`**（最严格，对齐 Lab 7 的加固要求）；通过命名空间标签 `pod-security.kubernetes.io/enforce=<级别>` **强制实施**——违规 Pod 创建即被拒绝（Lab 7 的 SecurityContext 是"自觉"，PSA 是"强制"）。

创建演示命名空间并打 baseline 标签

```bash
kubectl create ns psa-demo
kubectl label ns psa-demo pod-security.kubernetes.io/enforce=baseline
```

> **配置要点**（PSA 通过命名空间标签控制，三个动作标签）：
> - `enforce`（强制）：违规 Pod **创建被拒**（本实验用这个）
> - `audit`（审计）：允许创建但记录审计日志
> - `warn`（警告）：允许创建但给用户警告
> - **baseline 禁止的内容**（最常见的）：`privileged` 容器、hostPath 卷、hostNetwork/hostPID/hostIPC、特权端口等；`restricted` 在此基础上还要求非 root、只读根文件系统、drop ALL（Lab 7 那套）

查看命名空间标签

```bash
kubectl get ns psa-demo -o yaml
```

```bash
root@node1:~# kubectl get ns psa-demo -o yaml
apiVersion: v1
kind: Namespace
metadata:
  labels:
    kubernetes.io/metadata.name: psa-demo
    pod-security.kubernetes.io/enforce: baseline
  name: psa-demo
```

> **观察点**：命名空间的 `labels` 里有 **`pod-security.kubernetes.io/enforce: baseline`**——准入控制器看到这个标签，就会按 baseline 标准检查该命名空间里所有 Pod 的创建请求。

创建违规 Pod（privileged：请求特权容器）

```bash
kubectl -n psa-demo run bad-pod --image=busybox --privileged --command -- sleep 3600
```

```bash
root@node1:~# kubectl -n psa-demo run bad-pod --image=busybox --privileged --command -- sleep 3600
Error from server (Forbidden): pods "bad-pod" is forbidden: violates PodSecurity "baseline:latest": privileged (container "bad-pod" must not set securityContext.privileged=true)
```

> **观察点**（PSA 拒绝，报错信息是教学重点）：
> - `violates PodSecurity "baseline:latest": privileged`——**明确告诉你违反了哪个级别、哪个规则**：baseline 级别的 `privileged` 规则（`latest` 是策略版本号，正常现象）
> - `must not set securityContext.privileged=true`——特权容器被禁止（`--privileged` 会授予容器全部能力，与 Lab 7 的"最小权限"理念相反）
> - 与 LimitRange/ResourceQuota 的拒绝一样：**准入控制在创建时拦截，yaml 根本没进集群**

再试 hostPath 卷（baseline 同样禁止）

```bash
kubectl -n psa-demo apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: hostpath-pod
spec:
  containers:
  - name: busybox
    image: busybox
    command: ["sleep", "3600"]
  volumes:
  - name: host
    hostPath:
      path: /tmp
EOF
```

```bash
root@node1:~# kubectl -n psa-demo apply -f - <<'EOF'
...
Error from server (Forbidden): pods "hostpath-pod" is forbidden: violates PodSecurity "baseline:hostPath": hostPath volumes are not allowed
```

> **观察点**：`violates PodSecurity "baseline:hostPath"`——hostPath 卷也被拒绝（baseline 禁止把宿主机目录挂进容器）。**多试几次违规，就能摸清 baseline 的完整禁令清单**（privileged、hostPath、hostNetwork、hostPID、hostIPC…）。

创建合规 Pod（无任何特权）

```bash
kubectl -n psa-demo run good-pod --image=busybox --command -- sleep 3600
```

```bash
root@node1:~# kubectl -n psa-demo run good-pod --image=busybox --command -- sleep 3600
pod/good-pod created
```

> **观察点**：普通 Pod（不申请特权、不用 hostPath）**创建成功**——`pod/good-pod created`。对比：**PSA 只拦"越界"的 Pod，正常业务 Pod 不受影响**。生产实践：测试/开发命名空间用 baseline，核心生产命名空间用 restricted。

**清理**

```bash
kubectl delete ns psa-demo
```

> 说明：删除命名空间（连带其中的 good-pod 与全部标签设置）。

## Lab 9 集群安全加固（证书续期与 etcd 静态加密）

> **目标**：检查并管理集群证书有效期，理解 etcd 静态加密与 kubelet 安全配置（对应教材第 13 章）。
> **验证概念**：集群安全的三道加固点——**证书**（kubeadm 签发的组件证书有有效期，过期集群瘫痪，需 `certs renew`）、**数据**（etcd 里的 Secret 默认明文存储，可配**静态加密** EncryptionConfiguration 落盘加密）、**节点**（kubelet 的认证授权模式）。

**① 检查证书有效期（只读安全）**

```bash
kubeadm certs check-expiration
```

```bash
root@node1:~# kubeadm certs check-expiration
[check-expiration] Reading configuration from the cluster...
[check-expiration] FYI: You can look at this file with 'kubeadm certs renew --help'

CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 Aug 15, 2027 13:52 UTC   364d            ca                      no
apiserver                  Aug 15, 2027 13:52 UTC   364d            ca                      no
apiserver-etcd-client      Aug 15, 2027 13:52 UTC   364d            etcd-ca                 no
...
kubelet.conf               Aug 15, 2027 13:52 UTC   364d            ca                      no
```

> **观察点**：每个证书的 `EXPIRES`（到期时间）和 `RESIDUAL TIME`（剩余时间）——**默认有效期 1 年**。生产上要**提前续期**（剩余 <90 天就该处理），否则到期后组件互信失败、集群瘫痪。

**② 证书续期（可选实操；教学集群安全，生产需谨慎规划）**

```bash
# 续期全部证书
kubeadm certs renew all

# 续期后重启控制面静态 Pod（kubelet 会自动重建，证书生效）
# 如果 kubeconfig 也过期了，重新生成：
#   kubeadm init phase kubeconfig admin --config /etc/kubernetes/kubeadm-config.yaml
```

> **观察点**：`certs renew all` 更新所有证书（到期时间顺延 1 年）。**注意**：续期后部分组件（kubelet 等）需要重启才能加载新证书；控制面静态 Pod 由 kubelet 自动重建。生产升级/续期流程见教材第 14 章。

**③ etcd 静态加密（数据落盘加密）**

```bash
# 查看 apiserver 当前是否启用加密（默认无 --encryption-provider-config）
grep encryption /etc/kubernetes/manifests/kube-apiserver.yaml || echo "未启用静态加密（默认状态）"
```

> **观察点**：默认情况下 etcd 里存的 **Secret 是明文**（base64 编码只是传输格式，不是加密）——能读 etcd 备份的人能看到所有密码。启用静态加密需要三件事（生产实操，本 Lab 讲配置）：
>
> ```yaml
> # 1. 创建加密配置文件 /etc/kubernetes/enc/enc.yaml（aescbc 用随机密钥）
> apiVersion: apiserver.config.k8s.io/v1
> kind: EncryptionConfiguration
> resources:
> - resources: ["secrets"]
>   providers:
>   - aescbc:
>       keys:
>       - name: key1
>         secret: <32字节随机base64密钥>
>   - identity: {}   # 兜底：解密旧的未加密数据
> ```
>
> ```bash
> # 2. 在 apiserver manifest 挂载并加参数（实测用 python3 修改更稳，避免 sed 插错位置）
> #    - command 加：--encryption-provider-config=/etc/kubernetes/enc/enc.yaml
> #    - volumeMounts 加：{name: enc, mountPath: /etc/kubernetes/enc, readOnly: true}
> #    - volumes 加：{name: enc, hostPath: {path: /etc/kubernetes/enc, type: DirectoryOrCreate}}
> # 3. apiserver 静态 Pod 自动重启生效；之后新写入的 Secret 落盘加密
> ```
>
> **验证加密（实测命令）**：创建新 Secret 后，用 **`kubectl exec` 进 etcd 容器**执行 etcdctl（etcdctl 不在 master 宿主机上）：
>
> ```bash
> # 创建新 Secret（加密前创建的旧 Secret 仍是明文，identity 兜底用于解密）
> kubectl create secret generic test-enc --from-literal=password=topsecret
>
> # 进 etcd 容器读该 Secret——应看到 k8s:enc:aescbc:v1:key1: 前缀（密文），无明文
> kubectl -n kube-system exec etcd-node1 -- etcdctl \
>   --endpoints=https://127.0.0.1:2379 \
>   --cacert=/etc/kubernetes/pki/etcd/ca.crt \
>   --cert=/etc/kubernetes/pki/etcd/server.crt \
>   --key=/etc/kubernetes/pki/etcd/server.key \
>   get /registry/secrets/default/test-enc
> ```
>
> ```bash
> root@node1:~# kubectl -n kube-system exec etcd-node1 -- etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key get /registry/secrets/default/test-enc
> /registry/secrets/default/test-enc
> k8s:enc:aescbc:v1:key1:�...
> ```
>
> > **观察点（实测验证）**：etcd 里看到的是 **`k8s:enc:aescbc:v1:key1:` 开头的密文**（看不到 password=topsecret）——**落盘加密生效**。而 `kubectl get secret test-enc -o jsonpath='{.data.password}' | base64 -d` 仍能正常返回 `topsecret`（API 层自动解密，对应用透明）。验证完删掉测试 Secret：`kubectl delete secret test-enc`。

**④ kubelet 安全配置查看**

```bash
grep -A3 -e "authentication:" -e "authorization:" /var/lib/kubelet/config.yaml
```

```bash
root@node1:~# grep -A3 -e "authentication:" -e "authorization:" /var/lib/kubelet/config.yaml
authentication:
  anonymous:
    enabled: false      # 禁止匿名访问
  webhook:
    enabled: true       # 用 TokenReview 认证
authorization:
  mode: Webhook         # 用 SubjectAccessReview 授权（走 apiserver 的 RBAC）
```

> **观察点**：kubelet 默认 `anonymous: false`（禁匿名）+ `webhook` 认证 + `Webhook` 授权——**kubelet 的 API 与 apiserver 走同一套 RBAC**，不是裸奔的。生产不要改成 `AlwaysAllow`。

**清理**

本 Lab 的证书检查/续期为集群级操作，**无需清理**；若执行了 etcd 加密实操，需保留加密配置文件（删除会导致已加密数据无法解密）。

## Lab 10 API Server 审计日志（推荐）

> **目标**：启用审计日志（Audit Policy），验证"谁在什么时候对 apiserver 做了什么"被记录。
> **验证概念**：教材 §13.5——审计日志是集群的"天眼"：Audit Policy 按 level（None/Metadata/Request/RequestResponse）决定记录粒度；默认不启用，需配置 policy 文件 + apiserver 参数。

> ⚠️ 本 Lab 修改 apiserver manifest（静态 Pod 自动重启，短时中断）；教学集群安全，生产操作需谨慎。

创建 Audit Policy 并启用

```bash
mkdir -p /etc/kubernetes/audit
cat > /etc/kubernetes/audit/policy.yaml <<'EOF'
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: Metadata                      # 记录元数据（用户/操作/结果）
  resources:
  - group: ""
    resources: ["secrets"]             # 重点盯 Secret 访问
- level: None                          # 兜底：其余不记录
EOF
# 修改 apiserver manifest：挂载 audit 目录 + 加参数
python3 - <<'PYEOF'
import yaml
p = '/etc/kubernetes/manifests/kube-apiserver.yaml'
d = yaml.safe_load(open(p))
c = d['spec']['containers'][0]
c['command'] += ['--audit-policy-file=/etc/kubernetes/audit/policy.yaml',
                 '--audit-log-path=/var/log/kubernetes/audit.log',
                 '--audit-log-maxage=7']
c['volumeMounts'].append({'name':'audit','mountPath':'/etc/kubernetes/audit','readOnly':True})
c['volumeMounts'].append({'name':'auditlog','mountPath':'/var/log/kubernetes'})
d['spec']['volumes'].append({'name':'audit','hostPath':{'path':'/etc/kubernetes/audit','type':'DirectoryOrCreate'}})
d['spec']['volumes'].append({'name':'auditlog','hostPath':{'path':'/var/log/kubernetes','type':'DirectoryOrCreate'}})
yaml.dump(d, open(p,'w'), default_flow_style=False, sort_keys=False)
PYEOF
sleep 40    # 等 apiserver 静态 Pod 重建
kubectl get pod -n kube-system | grep apiserver    # 1/1 Running
```

> **配置要点**（Audit Policy，教材 §13.5.2）：`level: Metadata` 记录"谁/何时/做了什么/结果码"（默认推荐）；`resources: secrets` 只对 Secret 访问加细记录（敏感资源重点盯）；`--audit-log-path` 指定输出文件。

验证审计日志

```bash
kubectl get secret   # 制造一次 Secret 访问（当前用户）
sleep 5
grep -o '"verb":"get".*"resource":"secrets"' /var/log/kubernetes/audit.log | head -2
head -3 /var/log/kubernetes/audit.log
```

```bash
root@node1:~# head -3 /var/log/kubernetes/audit.log
{"kind":"Event","level":"Metadata","verb":"list","user":{"username":"kubernetes-admin",...
{"kind":"Event","level":"Metadata","verb":"get","user":{"username":"kubernetes-admin",...
```

> **观察点**（审计日志内容，教材 §13.5.3）：日志里能看到 **`user: kubernetes-admin`、`verb: get/list`、`resource: secrets`**——"谁访问了 Secret"一目了然；`level: None` 的兜底规则让其他操作不记录（**控制面开销可控**）。这就是安全审计/合规取证的原料（教材 §13.5）。

**清理**

```bash
# 还原 apiserver manifest（去掉 audit 参数），等重建
cp /etc/kubernetes/manifests/kube-apiserver.yaml /tmp/kube-apiserver.yaml.audit
python3 - <<'PYEOF'
import yaml
p = '/etc/kubernetes/manifests/kube-apiserver.yaml'
d = yaml.safe_load(open(p))
c = d['spec']['containers'][0]
c['command'] = [x for x in c['command'] if 'audit' not in x]
c['volumeMounts'] = [v for v in c['volumeMounts'] if v['name'] not in ('audit','auditlog')]
d['spec']['volumes'] = [v for v in d['spec']['volumes'] if v['name'] not in ('audit','auditlog')]
yaml.dump(d, open(p,'w'), default_flow_style=False, sort_keys=False)
PYEOF
sleep 40
kubectl get pod -n kube-system | grep apiserver
```

## Lab 11 PSA 三动作对比（enforce / audit / warn）（推荐）

> **目标**：对比 PSA 三种动作标签的行为差异（enforce 拒绝 / audit 记录 / warn 警告）。
> **验证概念**：教材 §12.2.3——`enforce` 强制拒绝、`audit` 允许但记录审计、`warn` 允许但警告——渐进式落地的三档开关。

```bash
# 三个命名空间分别用三种动作
kubectl create ns psa-enforce
kubectl create ns psa-audit
kubectl create ns psa-warn
kubectl label ns psa-enforce pod-security.kubernetes.io/enforce=baseline
kubectl label ns psa-audit pod-security.kubernetes.io/audit=baseline
kubectl label ns psa-warn pod-security.kubernetes.io/warn=baseline

# 三个命名空间创建同样的违规 Pod（privileged）
kubectl -n psa-enforce run bad --image=busybox --privileged --command -- sleep 3600
kubectl -n psa-audit run bad --image=busybox --privileged --command -- sleep 3600
kubectl -n psa-warn run bad --image=busybox --privileged --command -- sleep 3600
```

```bash
root@node1:~# kubectl -n psa-enforce run bad --image=busybox --privileged --command -- sleep 3600
Error from server (Forbidden): ... violates PodSecurity "baseline:latest": privileged ...
root@node1:~# kubectl -n psa-audit run bad --image=busybox --privileged --command -- sleep 3600
pod/bad created            ← audit：允许创建
root@node1:~# kubectl -n psa-warn run bad --image=busybox --privileged --command -- sleep 3600
Warning: would violate PodSecurity "baseline:latest": privileged ...   ← warn：警告但创建
pod/bad created
```

> **观察点**（三动作对比，教材 §12.2.3）：**enforce 直接 Forbidden（创建被拒）；audit 允许创建（但记录审计日志）；warn 允许创建（但给 Warning）**——这就是渐进式落地的路径：先 warn 观察 → audit 记录 → 最后 enforce 强制。

查看 audit 记录

```bash
kubectl get events -A | grep -i "podsecurity" | head -3
```

> **观察点**：audit 命名空间的违规 Pod 创建被记录（`podsecurity` 相关事件）——**先观察再强制的完整链路**（教材 §12.2.3 的落地建议）。

**清理**

```bash
kubectl delete ns psa-enforce psa-audit psa-warn
```

## Lab 12 kubectl auth can-i 权限验证（推荐）

> **目标**：用 `kubectl auth can-i` 验证权限（不给权限前/后对比），掌握排障工具。
> **验证概念**：教材 §11.4.2——`auth can-i` 直接查询"某身份能否做某操作"，**不用真试**——给权限前后各验证一次，形成闭环。

```bash
# ① 无权限时（普通用户 train，实验 02 创建的）
kubectl auth can-i get pods --as=train
kubectl auth can-i list secrets --as=train

# ② 授权后
kubectl create clusterrolebinding train-view --clusterrole=view --user=train
kubectl auth can-i get pods --as=train
kubectl auth can-i delete pods --as=train
```

```bash
root@node1:~# kubectl auth can-i get pods --as=train
no
root@node1:~# kubectl create clusterrolebinding train-view --clusterrole=view --user=train
clusterrolebinding.rbac.authorization.k8s.io/train-view created
root@node1:~# kubectl auth can-i get pods --as=train
yes
root@node1:~# kubectl auth can-i delete pods --as=train
no
```

> **观察点**（auth can-i，教材 §11.4.2）：授权前 `get pods` 返回 `no`，授权 view 后返回 `yes`；而 `delete pods` 仍是 `no`（view 只读）——**权限验证不用真试**（不会真的去 get/delete），模拟用户身份查询（`--as`）。排障"为什么 Forbidden"时的标准工具。

**清理**

```bash
kubectl delete clusterrolebinding train-view
```
## 本章小结

本章通过 12 个实验（Lab 1-12），掌握了 Kubernetes 安全体系的完整主线：**身份认证（你是谁）→ 权限授权（你能干啥）→ 容器加固（Pod 有多安全）→ 集群加固（证书/数据/节点/审计）**。

| 实验 | 验证的知识点 | 关键概念 | 级别 |
|---|---|---|:---:|
| Lab 1 查看证书目录 | master 证书体系：CA 根、组件证书、etcd PKI、admin.conf | X.509、ca.crt/ca.key、双向认证 | 必做 |
| Lab 2 生成用户证书 | openssl 用 CA 签发用户证书；kubeconfig 三段式；认证≠授权 | CSR、CN/O、set-credentials、Forbidden | 必做 |
| Lab 3 创建 SA | SA 是机器身份；token 认证；用户名格式 | ServiceAccount、create token、Bearer Token | 必做 |
| Lab 4 给用户授权 | ClusterRoleBinding 全集群授权；自定义 Role rules | RBAC 三要素、cluster-admin、apiGroups/resources/verbs | 必做 |
| Lab 5 给 SA 授权 | RoleBinding 命名空间级授权；跨命名空间失败 | RoleBinding vs ClusterRoleBinding、view | 必做 |
| Lab 6 dashboard 综合演练 | SA+RBAC+Token 完整链路落地 | helm、NodePort、SA、clusterrolebinding、JWT | 必做 |
| Lab 7 SecurityContext | 容器降权：非 root、只读根文件系统、drop 能力 | runAsUser、readOnlyRootFilesystem、capabilities | 必做 |
| Lab 8 Pod Security Admission | 命名空间强制安全标准，违规创建被拒 | PSA、baseline/restricted、enforce 标签 | 必做 |
| Lab 9 集群安全加固 | 证书有效期检查与续期；etcd 静态加密；kubelet 安全配置 | certs check-expiration/renew、EncryptionConfiguration、Webhook 模式 | 必做 |
| Lab 10 审计日志 | Audit Policy 配置与四阶段；请求全记录 | `--audit-policy-file`、Metadata 粒度、审计取证 | 推荐 |
| Lab 11 PSA 三动作对比 | enforce 拒绝 / audit 记录 / warn 警告 | 三动作标签、渐进式落地 | 推荐 |
| Lab 12 auth can-i | 授权前后权限验证（不用真试） | `kubectl auth can-i`、`--as` | 推荐 |

**核心认知**：
1. **认证与授权是两件事**：认证回答"你是谁"（证书 CN / SA token），授权回答"你能干啥"（RBAC）——Lab 2/3 里"能登录但 Forbidden"就是两者分离的最好证明
2. **RBAC 三要素记牢**：`Subject`（User/SA/Group）+ `Role/ClusterRole`（权限）+ `Binding`（关联）——**Binding 决定生效范围**（RoleBinding=命名空间、ClusterRoleBinding=全集群），**Role 决定权限内容**
3. **两种身份**：User（给人，证书认证）vs ServiceAccount（给程序，token 认证）；v1.24+ 用 `kubectl create token` 动态签发
4. **从"自觉"到"强制"**：SecurityContext 是 Pod 自己声明安全要求（自觉），PSA 是命名空间强制标准（强制）——生产上两者配合：PSA 定红线，SecurityContext 落实细节
5. **集群安全三道防线**：证书（到期即瘫痪，提前 `certs renew`）、数据（etcd 静态加密防备份泄露）、节点（kubelet 走 RBAC 不裸奔）
6. **dashboard 是安全链路的活教材**：浏览器输 Token 登录的背后，就是 Lab 1-5 的全部机制在运转

**与后续章节的衔接**：
- SA + RBAC → 生产权限管理、多团队命名空间隔离（配合 实验 05 ResourceQuota）
- SecurityContext/PSA → 容器安全加固、CKS 认证方向的基础
- 证书体系/静态加密 → 实验 01 安装的产物、教材第 13-14 章 集群安全与运维

