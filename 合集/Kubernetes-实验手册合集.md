# Kubernetes 容器云原生实战课程 · 实验手册合集

> 本合集由实验手册 14 个实验整合而成，用于分发与离线阅读。实验分级：必做（无后缀）/ 推荐（推荐）/ 可选·进阶（可选·进阶）。

> 前置：已完成实验 01 部署的 3 节点集群；各实验 yaml 均内嵌，无需外部仓库。

## 目录

1. K8S 群集的安装
2. 解析Pod
3. 工作负载调度
4. 集群资源调度
5. 资源管理和监控
6. ConfigMap 和 Secret
7. 网络和服务基础
8. 实现基本存储
9. 认证与授权
10. 故障排查
11. 综合演练：WordPress 应用发布
12. 集群维护与运维
13. Helm 应用交付
14. 生产可观测性（可选·进阶）

---

# K8S 群集的安装

## 本章目标

学完本章后，你将能够：

- 独立部署一个 **3 节点 Kubernetes 集群**（1 个 master + 2 个 worker）
- 理解 kubeadm 安装流程每一步在做什么（kubelet / kubeadm / kubectl 三件套、CRI、CNI；StorageClass 按教学顺序延迟到 实验 08 Lab 4 安装）
- 掌握国内网络环境下的**连通性检查**与**镜像加速配置**方法
- 用 kubectl 完成集群状态查看、命名空间与 Pod 的基本操作，熟悉交互方式

## 实验环境与时间预估

| 项 | 要求 |
|---|---|
| 节点数量 | 3 台（node1 = master，node2 / node3 = worker） |
| 节点 IP 约定 | 本手册后续章节统一按 **node1=192.168.0.11、node2=192.168.0.12、node3=192.168.0.13** 编写（实际部署请替换为你自己的 IP，输出示例基于此约定） |
| 操作系统 | Ubuntu 24.04（或其他主流发行版，部分命令略有差异） |
| 硬件规格 | 每台 2 核 4GB 起步（建议 4 核 8GB，后续 HPA 实验需要余量） |
| 网络 | 云主机或虚拟机均可；国内网络环境需先按"前置检查"实测连通性 |
| 预计时长 | **90~120 分钟**（含前置检查与最终验证；网络状况差时会更久） |

> ⚠️ 如果只有一台机器，可先按文末「附录E：单节点快速安装」体验，但**后续章节（02-09）的实验默认是 3 节点环境**（调度、跨节点网络、NFS 存储等），强烈建议按正文完成 3 节点部署。

## 手动安装（3 节点·国内网络版）

> 基于 2026-07-22 在华为云虚机（Ubuntu 24.04，2核 4GB）上的实际部署经验整理。

---

### 文章概述

国内网络环境下用 kubeadm 从零部署标准 Kubernetes 集群，最大的坑不在 K8s 本身，而在于 `registry.k8s.io`、`docker.io`、`ghcr.io`、`pkgs.k8s.io` 这些海外基础设施在国内的连通性参差不齐——同一份检查脚本在不同机房跑出来的结果可能截然相反，没法照搬一份"绝对能行"的方案。

本文档把一次完整实战踩坑整理成可复用的操作指南：**正文是从系统准备到集群验证通过的 10 个步骤**（步骤 1-4 在三台节点上都要执行，步骤 5-10 在 master 上执行，步骤 7 在 worker 上执行 join），每一步先测连通性、按需切换国内加速源，重点解决了 containerd 2.x 版本镜像加速配置容易"配了却不生效"的坑；**附录部分**收录了实测过的国内镜像加速站清单、部分配置背后的原理说明、本次验证通过的组件版本组合，以及单节点快速安装的可选路径。

适合场景：拿到 3 台国内云主机（华为云/阿里云等），要从零装一个能正常工作的标准版 K8s 集群，且不确定这台机器对海外网络的连通性如何。

---

### 前置检查

务必先做，能节省后面排查的大量时间。**三台节点都要执行。**

#### 1. SSH 连通性 + 系统信息

```bash
uname -a; cat /etc/os-release; free -h; df -h /; nproc; ip a | grep inet
```

记录：CPU核数、内存、内网/公网 IP、系统版本（Ubuntu/CentOS 等）。**master 的 内网 IP 后面 init 要用，worker 的 IP 用于 join 后确认。**

#### 2. 测网络连通性和真实带宽（关键！）

不要只看 connect 是否通，要实测速度：

```bash
# 测真实下载速度（用CDN测速点，不受地域限制）
curl -o /dev/null -s -w "speed=%{speed_download} bytes/s\n" --max-time 20 \
  https://speed.cloudflare.com/__down?bytes=25000000

# 分别测关键域名连通性（docker registry类端点用/v2/探测，200/302/401都算"通"，401是缺认证信息导致的正常响应）
for u in https://registry.k8s.io https://pkgs.k8s.io https://ghcr.io https://docker.1panel.live; do
  curl -s -o /dev/null -w "$u => %{http_code} time=%{time_total}\n" --max-time 8 $u/v2/ 2>&1 || echo "$u FAILED"
done

# dl.k8s.io 是后面获取"最新稳定版"K8s版本号要用到的域名，单独测（不是registry API，不能用/v2/）
curl -s -o /dev/null -w "dl.k8s.io => %{http_code} time=%{time_total}\n" --max-time 8 https://dl.k8s.io/release/stable.txt

# 阿里云的两个备选源不是docker registry API，不能用/v2/探测，要用各自实际路径测试
curl -s -o /dev/null -w "aliyun-registry => %{http_code}\n" --max-time 8 https://registry.aliyuncs.com/v2/
curl -s -o /dev/null -w "aliyun-apt-source => %{http_code}\n" --max-time 8 https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.34/deb/Release
```

**重要教训**：整体带宽可能是好的（比如 7-8MB/s），但特定海外域名单独慢/不稳定，不能一概而论。`docker.io` 通常国内直连超时，但 `registry.k8s.io` 是否可达**因机房而异，实测结果差异很大**（同一份检查脚本在不同虚机上跑出过"直连超时"和"200直通"两种截然不同的结果），所以每次部署都要重新测，不能凭上次经验判断这次能不能通。

#### 3. 镜像加速站预测试 + K8s 版本探测（关键！）

> **务必在最开始就做**——不要等装完 containerd 才发现加速站不可用，也不要等 init 拉镜像才发现源不通。这一步同时确定两件事：**用哪个加速站**、**装哪个 K8s 版本**（默认安装当前最新稳定版）。

```bash
# ① 探测当前 K8s 最新稳定版（本手册默认安装"当前最新版"，别照抄历史版本号）
curl -sL https://dl.k8s.io/release/stable.txt
#    → 输出如 v1.36.3，记下这个版本号，步骤 4 安装时用它（或直接动态获取）

# ② 候选 docker.io 加速站逐个预测试（附录A 实测过 + 本次实测补充，多站备选）
#    返回 200/401/403 都算"可连接"（403 表示可达但可能对部分镜像受限）
for host in docker.1panel.live docker.m.daocloud.io docker.jiaxin.site proxy.vvvv.ee free.hubfast.cn; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 https://$host/v2/ 2>/dev/null)
  echo "$host => ${code:-FAILED}"
done

# ③ 测试 kubeadm 控制面镜像仓库（registry.k8s.io 不可达时用阿里云替代）
curl -s -o /dev/null -w "registry.k8s.io => %{http_code}\n" --max-time 8 https://registry.k8s.io/v2/
curl -s -o /dev/null -w "aliyun-google_containers => %{http_code}\n" --max-time 8 https://registry.aliyuncs.com/v2/
```

**根据输出确定三个关键选择**（后面步骤会用到，建议记在纸上/文件里）：

| 选择 | 判定 | 后续使用位置 |
|---|---|---|
| 主加速站 `ACCEL_HOST` | ②中返回 200 且速度快的（如 `docker.1panel.live`） | 步骤 3 配置 hosts.toml |
| 备用加速站（1-2 个） | ②中其他可连接的（如 `docker.m.daocloud.io`） | 步骤 8 calico 预拉失败时换源 |
| 镜像仓库 `IMAGE_REPO` | ③中 `registry.k8s.io` 返回 200 → 用官方源；不通 → `registry.aliyuncs.com/google_containers` | 步骤 5 kubeadm init |

> ⚠️ **实测教训**：① 加速站对**不同镜像可用性不同**——同一批站里 `docker.1panel.live` 对 `calico/node` 正常、但对 `calico/cni` 返回 **403**（换 `docker.m.daocloud.io` 成功）；② 加速站可用性随时间变化，**每次部署都要重新测**，别沿用上次结果。

#### 4. 资源规划

2核机器只够跑单节点 K8s 基础组件 + 少量应用 Pod。如果计划部署较多 Deployment/Pod（尤其自动扩容 HPA），提前评估好 CPU/内存总量，避免后续出现 `Insufficient cpu` 导致 Pod 一直 Pending。

---

### 部署步骤（kubeadm）

> **节点分工**：步骤 1-4 在 **3 台节点上都要执行**；步骤 5-6、8-10 仅在 **master（node1）** 执行；步骤 7 在 **worker（node2/node3）** 执行。以下命令均假设你已是 root（或已 `sudo -i` 切换到root）。如果习惯给每条命令单独加 `sudo`，注意管道+`tee` 写文件的场景要把 `sudo` 加在 `tee` 前面而不是 `cat` 前面，例如 `cat <<EOF | sudo tee file`。

#### 1. 系统准备（3 台节点）

关闭 swap、加载 br_netfilter/overlay 模块、配置 sysctl 转发参数

```bash
swapoff -a
sed -i '/ swap /s/^/#/' /etc/fstab

cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
modprobe overlay
modprobe br_netfilter

cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system

apt-get update -qq
apt-get install -y -qq apt-transport-https ca-certificates curl gnupg
```

> ⚠️ **如果失败看这里**：`modprobe: FATAL: Module br_netfilter not found` → 内核模块缺失，先 `apt-get install -y linux-modules-extra-$(uname -r)` 再试；`sysctl --system` 报 `net.bridge` 相关错误 → 确认 br_netfilter 已加载（`lsmod | grep br_netfilter`）。

#### 2. 装 containerd（3 台节点）

生成默认配置，**改 SystemdCgroup=true**

```bash
apt-get install -y -qq containerd
mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
systemctl restart containerd
systemctl enable containerd
```

> ⚠️ **如果失败看这里**：`containerd config default` 提示文件不存在 → 先确认 containerd 已安装（`containerd --version`）；restart 后状态异常 → `systemctl status containerd` 查看报错。

#### 3. 配置 docker.io 镜像加速（3 台节点）

强烈建议在装完 containerd 后立刻做这一步，避免后面所有 docker.io 镜像拉取都超时。

需要同时做两件事：

**1) 打开 `use_local_image_pull` 开关**（containerd 2.x 默认关闭，不打开的话下面的镜像加速配置不会生效）：

```bash
sed -i "s/use_local_image_pull = false/use_local_image_pull = true/" /etc/containerd/config.toml
```

**2) 配置镜像加速站**（推荐地址见附录A，这里以 `docker.1panel.live` 为例）：

```bash
mkdir -p /etc/containerd/certs.d/docker.io
cat > /etc/containerd/certs.d/docker.io/hosts.toml <<EOF
server = "https://docker.io"
[host."https://docker.1panel.live"]
  capabilities = ["pull", "resolve"]
EOF
```

两步做完后重启 containerd 生效：

```bash
systemctl restart containerd
```

验证：

```bash
crictl pull docker.io/library/nginx:alpine
```

应在 10 秒内完成（而非超时）。

> ⚠️ **如果失败看这里**：`crictl pull` 超时 → 先确认 `use_local_image_pull` 已是 true（`grep use_local_image_pull /etc/containerd/config.toml`），再确认 hosts.toml 里的加速站地址正确；还不行就换前置检查第3步选出的另一个加速站试试。原理见附录B。
>
> **特别注意（实测踩坑）**：hosts.toml 是 **TOML 格式，双引号不能丢**——`server = "https://docker.io"` 和 `[host."https://加速站"]` 的引号必须保留，否则 containerd 解析失败、静默回退直连 docker.io（表现为"配置了加速但拉取还是超时"）。写完用 `cat /etc/containerd/certs.d/docker.io/hosts.toml` 核对引号是否完整。
>
> `crictl` 需要单独安装（kubeadm 不带）；如果当前机器还没装 crictl（或 GitHub 下载慢），可跳过本条验证，**改用集群装好后步骤 10 的 `kubectl run test --image=busybox` 来验证 docker.io 加速是否生效**（kubelet 走同样的 CRI 拉取路径）。

> `ghcr.io`、`registry.k8s.io` 等非 docker.io 的海外源，没有这类现成 CDN 加速，遇到需要拉取的场景见下方「应急方案」。

#### 4. 装 kubelet / kubeadm / kubectl（3 台节点）

官方 apt 源是 `pkgs.k8s.io/core:/stable:/v{MINOR}/deb/`，先测一下连通性，不通则改用国内镜像源：

```bash
curl -s -o /dev/null -w "%{http_code}\n" --max-time 8 https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release
```

若返回非200/302（如超时或连接失败），改用阿里云的 kubernetes apt 镜像源
（`https://mirrors.aliyun.com/kubernetes-new/core/stable/v{MINOR}/deb/`）替代下面命令里的 `pkgs.k8s.io`。

```bash
LATEST=$(curl -sL https://dl.k8s.io/release/stable.txt)
MINOR=$(echo "$LATEST" | sed -E 's/^v([0-9]+\.[0-9]+)\..*/\1/')

mkdir -p /etc/apt/keyrings
# 注意：gpg 必须加 --batch（无 TTY 的自动化环境/脚本执行必需，否则报 cannot open '/dev/tty'）
curl -fsSL https://pkgs.k8s.io/core:/stable:/v${MINOR}/deb/Release.key | gpg --batch --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v${MINOR}/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list

apt-get update -qq
apt-get install -y -qq kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
```

> ⚠️ **如果失败看这里**：`Release.key` 下载失败 → `pkgs.k8s.io` 不通，按上面说明换阿里云源；`apt-get update` 报 GPG 错误 → 确认 keyring 路径与 `signed-by` 一致。**三台节点务必装同一个版本**（都用动态获取，间隔不长则版本一致；若不一致，worker 节点手动指定与 master 相同的版本号，见附录C）。

#### 5. kubeadm init（仅 master）

**先根据前置检查第3步里 `registry.k8s.io` 的连通性结果决定要不要用国内镜像仓库**（`IMAGE_REPO` 变量）：如果那一步测试是通的（200），可以省掉 `--image-repository` 参数直接走官方源；如果超时/不通，用 `registry.aliyuncs.com/google_containers` 替代。本次实测以国内镜像仓库为例：

先预热镜像，**并注入 kubelet 的沙箱（pause）镜像**（关键！减少 init 失败重试的时间浪费，同时避免下面这个最常见的坑）：

```bash
IMAGE_REPO=registry.aliyuncs.com/google_containers

# ① 预热全部控制面组件镜像（含 pause）
kubeadm config images pull --image-repository ${IMAGE_REPO}

# ② 注入 pause 沙箱镜像（关键预防步骤）
#    坑：kubelet 创建 Pod 沙箱时默认从 registry.k8s.io 拉 pause 镜像，国内拉不到会导致
#    init 卡在 wait-control-plane（静态 Pod 全部起不来，日志报 failed to get sandbox image）。
#    注意 kubelet 内置的默认 pause 版本与 kubeadm 预热的版本可能不同（实测 kubeadm 拉 3.10.2、
#    kubelet 要 3.10.1），所以把常见版本都 tag 一遍，确保全覆盖：
PAUSE_VER=$(kubeadm config images list --image-repository ${IMAGE_REPO} | grep pause | rev | cut -d: -f1 | rev)
ctr -n k8s.io images pull ${IMAGE_REPO}/pause:${PAUSE_VER}
for v in ${PAUSE_VER} $(echo ${PAUSE_VER} | cut -d. -f1-2) $(echo ${PAUSE_VER} | cut -d. -f1-2).1; do
  ctr -n k8s.io images tag ${IMAGE_REPO}/pause:${PAUSE_VER} registry.k8s.io/pause:${v}
done
# 验证：ctr -n k8s.io images list -q | grep "registry.k8s.io/pause"  应看到多个 tag
```

关键参数（`INNER_IP` 用前置检查第1步 `ip a | grep inet` 里记录的**内网**IP，不是公网IP）：

```bash
INNER_IP=<替换成你记录的内网IP，如 192.168.0.11>

kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --apiserver-advertise-address=${INNER_IP} \
  --image-repository ${IMAGE_REPO} \
  --cri-socket=unix:///var/run/containerd/containerd.sock
```

> ⚠️ **不要用 `192.168.0.0/16` 作为 pod-network-cidr**，会跟节点自身网段冲突（很多云主机内网就是 `192.168.x.x/24`）！

> `--image-repository ${IMAGE_REPO}` 指定控制面镜像仓库，避免拉取超时。

> ⚠️ **如果失败看这里**：
> - init 卡在 `error execution phase wait-control-plane` 且 `journalctl -u kubelet` 报 **`failed to get sandbox image "registry.k8s.io/pause:xxx"`** → 就是 pause 沙箱镜像没注入成功，回到上面 ② 重新注入（确认 `ctr -n k8s.io images list -q | grep pause` 有 `registry.k8s.io/pause:<版本>`），然后 `systemctl restart kubelet`；**不要急着 reset 重来**
> - init 卡在 wait-control-plane 且日志报 `PullImage` 超时（非 pause）→ 控制面镜像拉取失败，换 `IMAGE_REPO` 重试（先 `kubeadm reset -f` 清理）
> - 报 `[ERROR CRI]` → 确认 containerd 在运行且 SystemdCgroup 已改
> - **init 失败后 `kubectl get nodes` 报 `Forbidden`**（`User "kubernetes-admin" cannot list ...`）→ v1.36 起 kubeadm 用 `kubeadm:cluster-admins` 组（依赖 RBAC binding，init 中断时 binding 未创建），此时用 **`super-admin.conf`** 救急：`export KUBECONFIG=/etc/kubernetes/super-admin.conf`（该文件用户属于 `system:masters` 组，内置超级权限），再补建 binding：`kubectl create clusterrolebinding kubeadm:cluster-admins --group=kubeadm:cluster-admins --clusterrole=cluster-admin`

**init 成功后务必保存输出末尾的 join 命令**（`kubeadm join ... --token ... --discovery-token-ca-cert-hash ...`），步骤 7 要用；如果丢了也没关系，可用步骤 7 的方法重新生成。

#### 6. 配置 kubeconfig（仅 master）

```bash
mkdir -p $HOME/.kube && cp /etc/kubernetes/admin.conf $HOME/.kube/config
# 写入 ~/.bashrc: export KUBECONFIG=/etc/kubernetes/admin.conf
```

> ⚠️ **如果失败看这里**：`cp` 报权限错误 → 确认是 root 或在 `sudo -i` 状态；配完后 `kubectl get nodes` 报 connection refused → 检查 init 是否真的成功。

#### 7. worker 节点加入集群（node2 / node3）

**先取 join 凭证**（在 master 上执行；`kubeadm init` 生成的默认 token 有效期只有 24 小时，这条命令随时可重新生成新凭证）：

```bash
kubeadm token create --print-join-command
```

会输出类似这样的完整 join 命令：

```
kubeadm join 192.168.0.11:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash sha256:1234...cdef
```

**再到每台 worker 节点上执行 join**（node2、node3 各执行一次）。**先注入 pause 沙箱镜像**（worker 的 kubelet 创建 Pod 沙箱同样要拉 pause，步骤 5 的坑在 worker 上一样存在）：

```bash
# 在 worker 节点上：注入 pause 沙箱镜像（与步骤5的②相同，IMAGE_REPO 保持一致）
IMAGE_REPO=registry.aliyuncs.com/google_containers
PAUSE_VER=$(kubeadm config images list --image-repository ${IMAGE_REPO} | grep pause | rev | cut -d: -f1 | rev)
ctr -n k8s.io images pull ${IMAGE_REPO}/pause:${PAUSE_VER}
for v in ${PAUSE_VER} $(echo ${PAUSE_VER} | cut -d. -f1-2) $(echo ${PAUSE_VER} | cut -d. -f1-2).1; do
  ctr -n k8s.io images tag ${IMAGE_REPO}/pause:${PAUSE_VER} registry.k8s.io/pause:${v}
done

# 然后 join（--cri-socket 显式指定，避免探测出错）
kubeadm join 192.168.0.11:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash sha256:1234...cdef \
    --cri-socket=unix:///var/run/containerd/containerd.sock
```

> ⚠️ 注意手动加上 `--cri-socket=unix:///var/run/containerd/containerd.sock`——如果节点上只装了 containerd（没有额外装 docker），这个参数通常可以省略，kubeadm 会自动探测到唯一的 CRI；但显式指定能避免探测出错，跟正文 `kubeadm init` 里的写法保持一致。

> ⚠️ **如果 join 后节点长期 `NotReady`**：先 `kubectl describe node <节点名>` 看 Conditions。若 kubelet 报 sandbox 镜像拉取失败 → 确认 pause 注入（上面命令）；若等 CNI 装完才 Ready 属正常（步骤 8 装完 calico 后才会变 Ready）。

看到类似 `This node has joined the cluster` 的输出即代表加入成功。两台 worker 都 join 完，回到 master 确认：

```bash
kubectl get nodes
```

> ⚠️ **如果失败看这里**：join 报 `token has expired` → 回 master 重新执行 `kubeadm token create --print-join-command`；报 `[ERROR CRI]: container runtime is not running` → containerd 没装好/没启动，`systemctl status containerd` 确认；新节点长期 `NotReady` → CNI 还没装（下一步就装），或镜像加速没配好，`kubectl describe node <节点名>` 看 Conditions。

#### 8. 装 CNI（Calico）（仅 master）

**先在 3 台节点上都预拉 calico 镜像**（calico 是 DaemonSet，每个节点都要跑；镜像在 docker.io，走加速站预拉 + tag 成本地镜像，**避免 apply 后 ImagePullBackOff 再逐个排查**；注意实测 `docker.1panel.live` 对 `calico/cni` 返回 **403**，所以用多站 fallback 链）：

```bash
# 3 台节点都执行：预拉 calico 三件套（cni/node/kube-controllers），多加速站 fallback
# ACCEL_HOSTS 填前置检查第3步选出的主站 + 备用站（如 docker.1panel.live docker.m.daocloud.io）
ACCEL_HOSTS="docker.1panel.live docker.m.daocloud.io docker.jiaxin.site"
CALICO_VER=v3.29.1

for img in cni node kube-controllers; do
  for host in ${ACCEL_HOSTS}; do
    echo "--- 尝试 ${host}/calico/${img}:${CALICO_VER} ---"
    ctr -n k8s.io images pull ${host}/calico/${img}:${CALICO_VER} 2>&1 | tail -1
    if ctr -n k8s.io images list -q 2>/dev/null | grep -q "${host}/calico/${img}:${CALICO_VER}"; then
      ctr -n k8s.io images tag ${host}/calico/${img}:${CALICO_VER} docker.io/calico/${img}:${CALICO_VER}
      echo ">>> ${img} 就绪"
      break
    fi
  done
done
# 验证：ctr -n k8s.io images list -q | grep "docker.io/calico"   应看到 cni/node/kube-controllers 三个
```

然后在 master 下载 manifest 并调整 Pod 网段：

```bash
curl -sL https://raw.githubusercontent.com/projectcalico/calico/${CALICO_VER}/manifests/calico.yaml -o /tmp/calico.yaml

# 该字段默认被注释掉，需要手工打开注释并把值改成与init时一致的网段。先定位所在行号：
grep -n "CALICO_IPV4POOL_CIDR" -A1 /tmp/calico.yaml
```

会看到类似这样的内容（行号可能不同）：

```yaml
            # - name: CALICO_IPV4POOL_CIDR
            #   value: "192.168.0.0/16"
```

用 `vi`/`nano` 打开文件跳到对应行号，把这两行的 `#` 去掉，并把网段值改成 `10.244.0.0/16`（跟 init 时一致），改完再 apply：

```bash
kubectl apply -f /tmp/calico.yaml
# 镜像已在上一步预拉并 tag 成 docker.io/calico/*，kubelet 直接用本地镜像，无需再走网络
```

> ⚠️ **如果失败看这里**：`apply` 后 Calico Pod 一直 ImagePullBackOff → 先确认 3 台节点的预拉都成功（`ctr -n k8s.io images list -q | grep docker.io/calico` 三台都要有）；某台缺哪个镜像就回上一步补拉（换 fallback 站）。apply 失败报 schema 错误 → 确认 YAML 里改的是 `value` 行且格式正确。等 1-3 分钟，**此时所有节点应变为 Ready**：

```bash
kubectl get nodes -o wide
kubectl get pods -A -o wide
```

#### 9. 装默认 StorageClass —— 本手册【延迟到 实验 08 Lab 4】安装

> **教学顺序说明**：本手册刻意**不在安装阶段装 StorageClass**——"存储类（StorageClass）"是 实验 05 第 4 个实验的核心概念，为了在讲到概念时再动手、避免"没学过就先装好了"，这里跳过。**此时集群没有默认 StorageClass 是正常的**（`kubectl get sc` 为空）。等到 **实验 08 Lab 4「使用存储类动态交付」** 时再安装（那节有完整安装命令）。
>
> 如果需要提前装（比如想先跑别的需要 PVC 的实验），可手动执行：
>
> ```bash
> kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
> kubectl patch storageclass local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
> ```
>
> ⚠️ **如果失败看这里**：local-path 的 helper Pod 一直 ContainerCreating 最后超时 → 该镜像在 docker.io，确认镜像加速配置，或走「应急方案」曲线导入。

#### 10. 验证（master）

```bash
kubectl get nodes          # 应为3个节点全部Ready
kubectl get pods -A        # 系统Pod应全部Running

# 验证CNI+镜像拉取链路通畅
kubectl run test --image=docker.io/library/busybox --restart=Never -- sleep 3600
kubectl get pod test -o wide   # 几秒内应变Running，并注意它被调度到哪个节点（worker）
kubectl delete pod test        # 验证完清理掉测试Pod
```

> 💡 3 节点环境下，Pod 会被调度到 **worker 节点**（node2/node3）上，master 默认不承载业务负载——这是正常设计，不是故障。若看到 `kubectl get nodes` 显示 master 有 `control-plane` 污点导致无法调度，属预期行为，后续 实验 04 会讲如何让 master 承载负载。

---

### 常见故障排查清单

| 现象 | 根因 | 解决 |
|-|-|-|
| kubeadm init 卡在 `error execution phase wait-control-plane`，kubelet 日志报 `failed to get sandbox image "registry.k8s.io/pause:xxx"` | **pause 沙箱镜像拉不到**（kubelet 默认从 registry.k8s.io 拉，国内不可达；`--image-repository` 不覆盖 kubelet 的沙箱镜像） | 按步骤5的②注入 pause 镜像（ctr 拉国内源 + tag 成 `registry.k8s.io/pause:<版本>`，**常见版本都 tag**），`systemctl restart kubelet`，不要急着 reset |
| kubeadm init 卡在 `error execution phase wait-control-plane`（非 pause 报错） | 控制面组件镜像拉取超时 | 检查 `journalctl -u kubelet` 里的 PullImage 报错，换 `IMAGE_REPO` 后 `kubeadm reset -f` 重来 |
| **init 失败后 `kubectl` 报 `Forbidden`（User "kubernetes-admin" cannot list ...）** | v1.36 起 kubeadm 用 `kubeadm:cluster-admins` 组（走 RBAC binding），init 中断时 binding 未创建 | 用 `export KUBECONFIG=/etc/kubernetes/super-admin.conf` 救急（system:masters 超级组），补建 `kubectl create clusterrolebinding kubeadm:cluster-admins --group=kubeadm:cluster-admins --clusterrole=cluster-admin` |
| **worker join 后 kubelet 报 sandbox 镜像拉取失败** | worker 的 pause 镜像没注入 | 在 worker 上执行步骤7的 pause 注入命令 |
| **Calico Pod `ImagePullBackOff`，Events 报 403 Forbidden** | 加速站对该镜像受限（实测 `docker.1panel.live` 对 `calico/cni` 返回 403） | 按步骤8的多站 fallback 链换站（如 `docker.m.daocloud.io`）预拉 + tag |
| Calico Pod `ImagePullBackOff`（无 403，纯超时） | 镜像加速没配好 / 该节点没预拉 | 确认该节点 hosts.toml 正确（**注意引号不能丢**，见步骤3）与 use_local_image_pull=true；或按步骤8预拉 |
| Pod 一直 ContainerCreating，Events 显示"Pulling"但 crictl images 显示镜像已存在 | (a) containerd debug 日志级别拖慢处理 (b) use_local_image_pull 配置未生效 | 检查 `/etc/containerd/config.toml` 的 level 改回 info；确认 use_local_image_pull 和 hosts.toml 配置 |
| PVC 一直 Pending，helper-pod 一直 ContainerCreating 最后超时（实验 08 Lab 4 安装 local-path 时） | local-path-provisioner 本身镜像被墙（docker.io） | 配置好镜像加速或走曲线导入法 |
| Pod Pending，Events 显示"Insufficient cpu" | 单节点资源不足 | 精简 Pod 数量/减少副本数/升级机器规格 |
| namespace 卡 Terminating 不消失 | 通常是残留 Pod 的 finalizer 依赖已删除的 controller 处理 | 先确认 `kubectl get all -n <ns>` 真的空了，再等一会或强制 delete 残留 Pod |
| 新节点 join 后长期 NotReady | CNI 未装或镜像拉不下来；新节点镜像加速没配 | 按步骤8装 CNI；在新节点确认 use_local_image_pull 和 hosts.toml，`kubectl describe node` 看报错 |
| worker 与 master 版本不一致 | 动态获取"最新版"间隔较长导致版本漂移 | worker 手动指定与 master 一致的版本号（见附录C），跨版本窗口 ±1 个小版本 |

以下这条不是K8s特有问题，是Linux环境的通用坑，一并收录方便查阅：

| 现象 | 根因 | 解决 |
|-|-|-|
| kubectl 在原生 shell 里提示 command not found 但文件存在 | 极可能是 `~/.bashrc` 里 PATH 被意外覆盖（没有正确拼接 `$PATH`） | 检查 `.bashrc`/`.profile` 找出错误的 `export PATH=...` 赋值行并修复 |

---

### 应急方案：海外源（ghcr.io 等）镜像曲线导入法

当某个特定镜像域名没有国内 CDN 代理、直连又慢到几分钟都拉不完时（`ghcr.io`、`registry.k8s.io` 之外的自定义镜像仓库等）：

**1. 找一台网络更好的机器**（如本地 WSL、开发机，实测可能有 7-8MB/s+ 的国际带宽）：

```bash
ctr -n k8s.io images pull --platform linux/amd64 <慢速镜像>  # 只拉需要的架构，减小体积
```

**2. 导出为 tar**：

```bash
ctr -n k8s.io images export --platform linux/amd64 /tmp/xxx.tar <镜像地址>
```

**3. scp 传到目标机器**（国内到国内传输通常很快，13MB/s+）：

```bash
scp /tmp/xxx.tar root@<目标IP>:/tmp/
```

**4. 在目标机器导入**：

```bash
ctr -n k8s.io images import /tmp/xxx.tar
```

**5. 重建对应 Pod**（imagePullPolicy 为 IfNotPresent 时会直接用本地镜像，不再联网）：

```bash
kubectl delete pod <pod名> --force --grace-period=0
```

> **注意**：大镜像（300MB+）在 target 机器上 `ctr images import` 偶尔会莫名卡住不动（CPU/IO 都空闲，进程处于 sleeping 状态），此时表现为长时间无响应。这是本次实测中观察到的现象，具体成因未深究（可能与containerd版本、磁盘IO、镜像层数有关），遇到这种情况直接 kill 掉重试一次通常能解决，不必死等，但不保证百分百有效。

---

### 附录A：docker.io 镜像加速站实测清单

#### 测试方法（可复用于验证新的加速站候选）

```bash
# 1. 连通性测试
curl -s -o /dev/null -w "http=%{http_code} time=%{time_total}s\n" --max-time 8 https://<候选站>/v2/

# 2. 配置为containerd镜像源
cat > /etc/containerd/certs.d/docker.io/hosts.toml <<EOF
server = "https://docker.io"
[host."https://<候选站>"]
  capabilities = ["pull", "resolve"]
EOF
systemctl restart containerd

# 3. 清缓存后真实拉取测试（一个官方镜像 + 一个个人命名空间镜像，两类都要测）
ctr -n k8s.io images rm docker.io/library/nginx:latest 2>&1
ctr -n k8s.io images rm docker.io/<user>/<repo>:latest 2>&1
time crictl --runtime-endpoint unix:///var/run/containerd/containerd.sock pull nginx:latest
time crictl --runtime-endpoint unix:///var/run/containerd/containerd.sock pull <user>/<repo>:latest
```

> 注意：加速站的可用性和限流策略会随时间变化，这份清单有时效性，正式使用前建议重新跑一遍上述测试脚本验证。

#### 实测结果（2026-07-22，华为云虚机，来源清单参考 [dongyubin/DockerHub](https://github.com/dongyubin/DockerHub)）

测试对象：官方镜像（`nginx`、`postgres`，即 `library/xxx`）+ 个人命名空间镜像（`chengzh/backend`、`chengzh/frontend`、`katacoda/docker-http-server`，即 `user/repo` 格式）

| 加速站 | 连通性 | 官方镜像 | 个人命名空间镜像 | 结论 |
|-|-|-|-|-|
| **`docker.1panel.live`** | 通 | ✅ 1.5s | ✅ 4.1s | **全部可用，速度快，推荐** |
| **`proxy.vvvv.ee`** | 通 | ✅ 2.1s | ✅ 2.3s | **全部可用，速度快，推荐** |
| **`docker.jiaxin.site`** | 通 | ✅ 2.8s | ✅ 2.1s | **全部可用，速度快，推荐** |
| **`free.hubfast.cn`** | 通 | ✅ 2.8s | ✅ 1.6s | **全部可用，速度快，推荐** |
| `dockerproxy.net` | 通 | ✅ \~20s | ✅ 2s\~60s（波动大） | 全部可用，但速度不稳定 |
| `docker.m.daocloud.io` | 通 | ✅ 成功 | ❌ 403 Forbidden | 官方可用，个人命名空间必403 |
| `docker.xuanyuan.me` | 通 | ✅ 0.8s | ❌ 429 Too Many Requests（稳定复现，重试仍429） | 官方可用，个人镜像被限流 |
| `docker.1ms.run` | 通 | ✅（同一批次测试中通过） | ❌ 404（白名单机制，不在白名单里的直接404） | 只镜像热门白名单镜像 |
| `dockerproxy.link` | 通 | ❌ size validation failed（数据损坏） | ❌ 同样失败 | 不可用，返回内容与声明大小不符 |
| `registry.cyou` | ❌ 无法建立连接 | - | - | 不可用 |
| `mirror.houlang.cloud` | ❌ 超时（需登录token） | - | - | 不可用（需额外注册） |

**推荐优先级**：`docker.1panel.live` / `proxy.vvvv.ee` / `docker.jiaxin.site` / `free.hubfast.cn`，可以配置多个做 fallback。

国内镜像加速列表持续更新参考：https://github.com/dongyubin/DockerHub

---

### 附录B：镜像加速配置的原理笔记

这里记录正文「步骤3」和「步骤4」背后的排障过程和原理，仅供理解/排查参考，不影响正常部署照抄正文操作。

#### 为什么要改 `use_local_image_pull`

`/etc/containerd/certs.d/<domain>/hosts.toml` 是 containerd 传统的 mirror 配置方式，但在 **containerd 2.x 版本里可能不生效**——因为新版本默认走一条新的 transfer service 拉取路径，这条路径不读取 certs.d 目录下的配置。

排障时的关键线索：开启 containerd debug 日志（`config.toml` 中 `level = 'debug'`）后能看到日志显示走的是 `resolving host=registry-1.docker.io`，即镜像拉取压根没有经过配置的加速地址。

根因定位：`/etc/containerd/config.toml` 中 `use_local_image_pull = false`（这是新版本的默认值）时走新的 transfer service，忽略 hosts.toml；改成 `true` 后才会走老的 CRI pull 路径，认 hosts.toml 配置。

**踩坑复盘**：这个开关如果为了某次应急排障被临时改回 `false`，一定要记得在问题解决后改回 `true`，否则会"复发"——表现为"明明配置过加速，怎么又变慢了"。可以用 `grep use_local_image_pull /etc/containerd/config.toml` 快速自检这个状态有没有被意外改回。

#### 关于 `pkgs.k8s.io` 连通性的实测背景

`pkgs.k8s.io` 背后是 Google 主导的 CDN，跟拉取镜像用的 `registry.k8s.io` 属于同一基础设施家族。这次在华为云虚机上实测是通的（`curl -I https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release` 返回302，`apt-get install` 一次性成功），但这只是单次、单台机器的验证结果——`pkgs.k8s.io` 的国内可达性完全可能因机房、运营商出口路由不同而表现不一致，换一台机器/换一个云厂商不能假设默认能通，一定要现场测试。

---

### 附录C：实测部署的组件版本汇总

以下是 **2026-08 在 3 台国内云主机（Ubuntu 24.04）上从零实测通过**的一套组件版本组合，供复现参考：

| 组件 | 版本 | 备注 |
|-|-|-|
| 操作系统 | Ubuntu 24.04.4 LTS | 4核 / 8GB内存 / 40GB磁盘（手册约定 2核4G 也能跑，资源更紧） |
| Kubernetes（kubelet/kubeadm/kubectl） | v1.36.3 | 通过 `dl.k8s.io/release/stable.txt` 动态获取的"当前最新稳定版"（实测时刻） |
| containerd | 2.2.1 | apt 默认源安装的版本 |
| CNI：Calico | v3.29.1 | manifest 版本，`docker.io/calico/*` 三件套（cni/node/kube-controllers）需预拉 + tag |
| CRI 镜像仓库（控制面组件） | registry.aliyuncs.com/google_containers | 本次实测 registry.k8s.io 不可达才用；其他环境按前置检查第3步测试，可达就用官方源 |
| 存储：local-path-provisioner | rancher/local-path-provisioner（master 分支 manifest） | **本手册按教学顺序在 实验 08 Lab 4 安装**（安装阶段不装） |
| metrics-server | v0.9.0（components.yaml 最新版） | 需追加 `--kubelet-insecure-tls` 参数（见 实验 05 Lab 1，sed 定位注意端口可能不是 4443） |
| Pod 网段 | 10.244.0.0/16 | 需与节点自身网段（常见 192.168.x.x/24）区分开 |
| docker.io 镜像加速站 | docker.1panel.live（主）+ docker.m.daocloud.io（备） | 实测 1panel 对部分镜像（如 calico/cni）403，需备站 |

> ⚠️ **版本号随时间变化**（"最新稳定版"会持续推进），**不要照抄此表**——新部署一律用文档里的动态获取方式（`curl -sL https://dl.k8s.io/release/stable.txt` 拿当时最新版），本表只证明这套组合在实测时刻可协同工作。

---

### 附录D：worker 节点一键就绪脚本

如果觉得步骤 1-4 在三台节点上逐条执行太繁琐，可以把它们合并成一段脚本，在**新 worker 节点**上执行，跑完后节点环境就绪、等待 join：

```bash
#!/bin/bash
set -e

# 可配置项（先做前置检查第3步的预测试再填）：
ACCEL_HOST="docker.1panel.live"          # 主加速站（前置检查选出）
IMAGE_REPO="registry.aliyuncs.com/google_containers"   # 控制面镜像仓库（registry.k8s.io 不通时）

# ===== 步骤1：系统准备 =====
swapoff -a
sed -i '/ swap /s/^/#/' /etc/fstab

cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
modprobe overlay
modprobe br_netfilter

cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system

apt-get update -qq
apt-get install -y -qq apt-transport-https ca-certificates curl gnupg

# ===== 步骤2：装containerd =====
apt-get install -y -qq containerd
mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
systemctl restart containerd
systemctl enable containerd

# ===== 步骤3：配置docker.io镜像加速 =====
sed -i "s/use_local_image_pull = false/use_local_image_pull = true/" /etc/containerd/config.toml
mkdir -p /etc/containerd/certs.d/docker.io
cat > /etc/containerd/certs.d/docker.io/hosts.toml <<EOF
server = "https://docker.io"
[host."https://${ACCEL_HOST}"]
  capabilities = ["pull", "resolve"]
EOF
systemctl restart containerd

# ===== 步骤4：装kubelet/kubeadm/kubectl（当前最新稳定版）=====
LATEST=$(curl -sL https://dl.k8s.io/release/stable.txt)
MINOR=$(echo "$LATEST" | sed -E 's/^v([0-9]+\.[0-9]+)\..*/\1/')

mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v${MINOR}/deb/Release.key | gpg --batch --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v${MINOR}/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list

apt-get update -qq
apt-get install -y -qq kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

# ===== 步骤5：注入 pause 沙箱镜像（关键，防 join 后 sandbox 拉取失败）=====
PAUSE_VER=$(kubeadm config images list --image-repository ${IMAGE_REPO} | grep pause | rev | cut -d: -f1 | rev)
ctr -n k8s.io images pull ${IMAGE_REPO}/pause:${PAUSE_VER}
for v in ${PAUSE_VER} $(echo ${PAUSE_VER} | cut -d. -f1-2) $(echo ${PAUSE_VER} | cut -d. -f1-2).1; do
  ctr -n k8s.io images tag ${IMAGE_REPO}/pause:${PAUSE_VER} registry.k8s.io/pause:${v}
done

echo "=== 节点环境就绪，等待 join ==="
echo "join 命令在 master 上执行: kubeadm token create --print-join-command"
```

> ⚠️ 跟正文一样，**先做前置检查再跑这个脚本**：如果这台新节点的 `pkgs.k8s.io` 不通，脚本里的下载会失败，需要按正文步骤4的方法换成阿里云的 kubernetes apt 镜像源。如果 K8s 版本要跟 master 保持一致（强烈建议同版本），可以跳过 `LATEST`/`MINOR` 的动态获取，改成写死 master 当时用的版本号（见附录C）。
>
> ⚠️ **实测补充**：① 脚本已加 `gpg --batch`（无 TTY 环境必需）；② 若 `apt-get update` 报 GPG 错误或 `Release.key` 下载损坏（`gpg: no valid OpenPGP data`）→ 删掉 `/etc/apt/keyrings/kubernetes-apt-keyring.gpg` 后重跑本段即可（网络波动导致，重试通常成功）；③ **本脚本已验证可让一台全新 worker 直接加入集群**（含 pause 注入），join 后等 CNI 装好即 Ready。

---

### 附录E：单节点快速安装（可选）

如果只有一台机器，只想快速体验 K8s，可以按正文的步骤 1-6 装好 master 后，**跳过步骤 7（不需要 worker）**，然后：

**1. 去掉 master 的调度污点**（否则 Pod 调度不上）：

```bash
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

**2. 继续步骤 8 装 CNI，步骤 10 验证**（StorageClass 按教学顺序在 实验 08 Lab 4 安装）。

> 单节点下 Pod 会调度到 master 本机。注意：**该形态与后续章节（02-09）默认的 3 节点环境不一致**（单节点没有跨节点调度、没有多节点网络与 NFS 存储实验），仅适合快速体验或资源受限场景。

## 使用在线沙盒

如果没有足够的硬件资源,可以考虑使用 https://killercoda.com/ 提供的 [Kubernetes Playground](https://killercoda.com/playgrounds/scenario/kubernetes) ,目前已经支持最新的 `1.36` 版本.

使用要点:

- 建议使用 `Github` 账号进行注册,体验最好.
- 如果没有 `Github` 账号,可以使用国内的信箱进行注册,但是可能会在开启场景的时候用邮件再次激活.
- 每个场景最长运行时间是1小时.
- 目前 Playground 环境免费.

## Kubectl 基础与公共操作

> 本章节是后续所有章节（02-09）的**公共基础**：kubectl 命令体系、yaml 基本语法、命名空间、标签与选择器、上下文切换。后续章节不再重复讲解，直接引用本节。

### 1. kubectl 命令体系

kubectl 是操作 Kubernetes 的唯一命令行工具，命令格式统一为：

```text
kubectl <操作动词> <资源类型> [资源名] [flags]
```

**常用操作动词**（作用于任意资源）：

| 动词 | 作用 | 示例 |
|---|---|---|
| `get` | 查看资源列表 | `kubectl get pods` |
| `describe` | 查看资源详细信息 | `kubectl describe pod nginx` |
| `create` | 创建资源（命令式） | `kubectl create ns lab` |
| `apply` | 创建/更新资源（声明式，yaml） | `kubectl apply -f deploy.yaml` |
| `delete` | 删除资源 | `kubectl delete pod nginx` |
| `logs` | 查看 Pod 日志 | `kubectl logs nginx` |
| `exec` | 进入 Pod 执行命令 | `kubectl exec -it nginx -- bash` |
| `edit` | 在线编辑资源 | `kubectl edit deployment nginx` |
| `label` | 增删改标签 | `kubectl label pod nginx app=web` |

**常用输出参数**：

| 参数 | 作用 |
|---|---|
| `-o wide` | 显示更多列（IP、节点等） |
| `-o yaml` | 输出资源定义（yaml 格式） |
| `-o json` | 输出资源定义（json 格式） |
| `-n <namespace>` | 指定命名空间 |
| `-A` / `--all-namespaces` | 所有命名空间 |
| `-w` | 持续监听变化 |
| `--dry-run=client -o yaml` | 只生成 yaml 不创建（教学利器） |

### 2. 命名空间

命名空间（namespace）用于**逻辑隔离**资源。默认资源在 `default` 命名空间，系统组件在 `kube-system`。

查看集群状态

```bash
kubectl get node -o wide
```

```bash
kubectl get pod -o wide
```

```bash
kubectl get pod -A -o wide        # 所有命名空间
```

```bash
kubectl get ns
```

```bash
kubectl get pod -n kube-system    # 指定命名空间
```

```bash
kubectl get pod -n kube-system | grep calico
```

创建命名空间

```bash
kubectl create ns lab
```

查看命名空间

```bash
kubectl get ns -o wide
```

查看命名空间详细信息

```bash
kubectl describe ns kube-system
```

查看命名空间的定义文件

```bash
kubectl get ns lab -o yaml
```

### 3. yaml 基本语法与工作流

Kubernetes 一切资源都是声明式对象，用 yaml 描述"期望状态"。**本手册的教学原则**：简单操作用命令行，涉及多对象/复杂结构（卷、探针、多容器、Deployment 等）用 yaml 文件。

**yaml 文件通用结构**（所有资源一致）：

```yaml
apiVersion: apps/v1        # API 版本（资源类型决定）
kind: Deployment           # 资源类型
metadata:                  # 元数据（名称、命名空间、标签）
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:                      # 期望状态（每种资源不同）
  ...
```

**推荐工作流**（先命令生成骨架，再修改，再 apply）：

```bash
kubectl create deployment myapp --image=nginx --dry-run=client -o yaml > myapp.yaml
nano myapp.yaml            # 按需修改
kubectl apply -f myapp.yaml
```

> 用 `--dry-run=client -o yaml` 生成骨架是避免手写缩进错误的推荐做法；`kubectl apply` 是幂等的（可重复执行），`kubectl create` 重复执行会报已存在。

**资源类型与字段查询**（写 yaml 前先查）：

```bash
kubectl api-resources     # 列出所有资源类型（含简称、API 版本）
kubectl explain pods      # 查看某资源（如 Pod）的字段定义与含义
```

`kubectl api-resources` 输出示例（截取）：

```text
NAME                              SHORTNAMES   APIVERSION       NAMESPACED   KIND
configmaps                        cm           v1               true         ConfigMap
deployments                       deploy       apps/v1          true         Deployment
namespaces                        ns           v1               false        Namespace
nodes                             no           v1               false        Node
pods                              po           v1               true         Pod
services                          svc          v1               true         Service
```

`kubectl explain pods` 输出示例（截取）：

```text
KIND:     Pod
VERSION:  v1

DESCRIPTION:
     Pod is a collection of containers that can run on a host. This resource is
     created by clients and scheduled onto hosts.

FIELDS:
   apiVersion   <string>
   kind         <string>
   metadata     <Object>
   spec         <Object>
```

> 写 yaml 的完整流程：`api-resources` 确认资源类型和 API 版本 → `explain` 查看字段 → `--dry-run` 生成骨架 → 修改 → `apply`。`explain` 支持深层字段（如 `kubectl explain pods.spec.containers`）。

### 4. 标签与选择器

标签（label）是挂在资源上的键值对，**选择器（selector）** 用它筛选/关联资源。这是后续所有章节（Deployment 管理 Pod、Service 选择后端等）的基础。

为命名空间添加标签：

```bash
kubectl label ns lab name=lab
```

查看标签：

```bash
kubectl get ns --show-labels
```

修改标签（--overwrite）：

```bash
kubectl label ns lab name=cka --overwrite
```

删除标签（标签名后加 `-`）：

```bash
kubectl label ns lab name-
```

按标签筛选（选择器）：

```bash
kubectl get pod -l app=myapp          # 筛选含 app=myapp 的 Pod
kubectl get pod -l 'app in (myapp,nginx)'   # 多值匹配
```

### 5. Pod 基本操作

创建 pod（命令式）

```bash
kubectl run katacoda --image=katacoda/docker-http-server -n lab
```

查看新建的 pod

```bash
kubectl get pod -n lab -o wide
```

**特别留意 pod 的 ip 地址，以及所在节点**

使用 pod 的 ip 访问 pod

```bash
curl 10.244.29.132
```

查看 pod 详细信息

```bash
kubectl describe pod katacoda -n lab
```

查看 pod 的日志

```bash
kubectl logs katacoda -n lab
```

查看 pod 的 yaml 文件

```bash
kubectl get -o yaml katacoda -n lab
```

编辑 pod（查看/修改配置）

```bash
KUBE_EDITOR="nano" kubectl edit pod katacoda -n lab
```

### 6. 清理

删除 pod

```bash
kubectl delete pod katacoda -n lab
```

删除 ns

```bash
kubectl delete ns lab
```


## 本章验收清单

完成本章后，逐项核对（全部 ✅ 才算达标）：

| # | 检查项 | 验证命令 | 达标标准 |
|---|---|---|---|
| 1 | 节点就绪 | `kubectl get nodes` | 3 个节点（node1/node2/node3）全部 `Ready` |
| 2 | 系统组件正常 | `kubectl get pods -A` | kube-system 等系统 Pod 全部 `Running`（或 Completed） |
| 3 | CNI 网络可用 | `kubectl get pods -n kube-system \| grep calico` | calico 相关 Pod `Running`，无 CrashLoopBackOff |
| 4 | 镜像拉取链路通 | `kubectl run test --image=busybox -- sleep 3600` | test Pod 快速 `Running`，`kubectl delete pod test` 能清理 |
| 5 | 跨节点调度 | 查看第 4 项 Pod 的 NODE 列 | Pod 调度到 worker（node2/node3）而非 master |
| 6 | （延迟项）StorageClass | `kubectl get storageclass` | **本阶段为空属正常**——按教学顺序在 实验 08 Lab 4 安装（此处不装） |
| 7 | kubectl 交互熟悉 | 完成「Kubectl 基础与公共操作」小节的命令 | 能独立完成查看/创建/描述/编辑/删除资源 |
| 8 | 网络连通性自查 | 回顾前置检查记录 | 了解本环境哪些海外域名可达、哪些走了加速/镜像源 |

---

## 附录F：2026-08 三节点实测记录（从空白机器到可用集群）

> 本节记录一次**真实的从零安装全过程**（3 台国内云主机，Ubuntu 24.04.4 / 4核8G，从空白系统开始），包含每一步的**实际输出、踩到的坑、根因与修复**。目的：让后来者知道"手册为什么这么写"——每个预防步骤背后都有一个真实事故。**按正文步骤执行即可，本节供遇到问题时对照。**

### F.1 环境与最终版本

| 项 | 值 |
|---|---|
| 云厂商/规格 | 国内云 3 台，4核 / 7.4GB / 40GB，同内网（192.168.0.x/24） |
| 操作系统 | Ubuntu 24.04.4 LTS（内核 6.8.0-106） |
| 最终版本 | kubelet/kubeadm/kubectl **v1.36.3**、containerd **2.2.1**、Calico v3.29.1、metrics-server v0.9.0（local-path 按教学顺序在 实验 08 Lab 4 安装） |
| 加速站 | docker.1panel.live（主）+ docker.m.daocloud.io（备） |
| 镜像仓库 | registry.aliyuncs.com/google_containers（registry.k8s.io 本环境不可达） |

### F.2 实测时间线与踩坑记录

| # | 步骤 | 现象 | 根因 | 修复（已固化进正文） |
|---|---|---|---|---|
| 1 | 前置检查 | `docker.io` 直连超时；`registry.k8s.io` 可达（307）；`pkgs.k8s.io` 可达（302）；dl.k8s.io 返回 `v1.36.3` | 国内网络对海外源连通性参差 | 前置检查第3步：加速站预测试 + 版本探测，输出主站/备站/镜像仓库三选 |
| 2 | 步骤5 init | **init 卡 `wait-control-plane`**，`journalctl -u kubelet` 报 `failed to get sandbox image "registry.k8s.io/pause:3.10.1"` | kubelet 创建 Pod 沙箱默认从 `registry.k8s.io` 拉 pause；`--image-repository` 只作用于控制面组件、**不覆盖** kubelet 的沙箱镜像；且 kubeadm 预热的 pause 是 3.10.2 而 kubelet 内置默认要 **3.10.1**（版本不一致） | 步骤5 ②：ctr 拉国内 pause + **把常见版本（3.10/3.10.1/3.10.2）全部 tag** 成 `registry.k8s.io/pause:*`，重启 kubelet 即可，**不要急着 reset** |
| 3 | init 失败后 | `kubectl get nodes` 报 **`Forbidden`（User "kubernetes-admin" cannot list ...）** | v1.36 起 kubeadm 把 admin 组从 `system:masters` 改为 `kubeadm:cluster-admins`（走 RBAC binding）；init 中断时该 binding 未创建 | 用 `export KUBECONFIG=/etc/kubernetes/super-admin.conf`（system:masters 超级组）救急 + 补建 `kubeadm:cluster-admins` binding |
| 4 | 步骤3 加速 | hosts.toml 配了但拉取仍直连 `registry-1.docker.io` 超时 | **TOML 双引号丢失**导致配置解析失败、containerd 静默回退直连（自动化传输/复制时引号最易丢） | 步骤3 特别提示：引号不能丢 + `cat` 核对 |
| 5 | 步骤8 calico | `calico-node` 全部 `ImagePullBackOff` | calico 三件套（cni/node/kube-controllers）在 docker.io，加速站对**部分镜像 403**：实测 `docker.1panel.live` 对 `calico/cni` 返回 **403**，对 node/controllers 正常 | 步骤8：3 台节点**先预拉 + 多站 fallback 链**（1panel 失败自动换 daocloud/jiaxin），tag 成本地镜像 |
| 6 | 步骤10 冒烟 | busybox 秒拉、跨节点调度成功 | — | 验证通过（见 F.3） |
| 7 | 实验 09 metrics-server | `kubectl top node` 报 `Metrics API not available`，pod 日志报 kubelet 证书校验失败 | 官方 components.yaml 的 `--secure-port` 参数实际是 **10250**（非早期版本的 4443），按旧版 sed 定位加 `--kubelet-insecure-tls` 会加不上 | 实验 05 Lab 1 用 `kubectl patch` 或按实际参数定位追加 `--kubelet-insecure-tls` |
| 8 | worker 重装 | node3 完全重置（reset + 清镜像）后按附录 D 脚本重装 | — | **端到端验证通过**：脚本可用、pause 预防生效（join 后无 sandbox 报错）、fallback 链实测复现（cni 走 daocloud）、node3 重新 Ready |
| 9 | 自动化环境 | 附录 D 脚本在无 TTY 下 `gpg` 报 `cannot open '/dev/tty'` | gpg 需要 TTY；自动化/脚本环境没有 | gpg 加 **`--batch`**（正文步骤4 + 附录D 已同步） |

### F.3 冒烟测试结果（实验 02-09核心 Lab）

| 验证项 | 命令 | 结果 |
|---|---|---|
| Deployment 扩缩容 | `kubectl create deployment nginx --replicas=3` + `scale 5` | ✅ 3→5 副本 |
| Service 访问 | `kubectl expose deployment nginx --port=80` + 集群内 curl ClusterIP | ✅ 返回 nginx 页面 |
| PVC 动态卷 | PVC(1Gi) → local-path 自动 PV → Pod 写文件 | ✅ Bound + 数据写入 |
| ConfigMap | create configmap + 挂载读取 | ✅ user= bob |
| SA + RBAC | create sa + create token + rolebinding | ✅ eyJ token + view 角色 |
| metrics-server | 部署 + `kubectl top node` | ✅ 三节点 CPU/内存数据 |
| HPA | `kubectl autoscale --cpu=50%`（旧语法 `--cpu-percent=50` 已弃用） | ✅ `cpu: 0%/50%` 有真实指标 |

### F.4 结论

**正文 + 附录 A-E 在实测环境下按步骤执行可一次成功**（本记录中的坑均已在前置检查/步骤/故障清单中固化为预防或处理手段）。**两个最关键的预防动作**：① init 前注入 pause 沙箱镜像（坑 #2）；② calico 预拉用多站 fallback（坑 #5）。新环境部署请务必先做**前置检查第 3 步**（加速站 + 版本预测试），不要跳过。


---


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


---


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


---


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


---


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


---


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


---


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


---


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


---


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


---


# 故障排查

## 实验准备

- **前置条件**：已完成 实验 01-09实验的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）
- **自包含说明**：本手册所有 yaml 文件已内嵌在对应 Lab 中，按 `nano xxx.yaml` 创建即可，无需克隆外部仓库
- **工作目录**：本章实验在 `/root/k8slab/trouble` 下进行（如不存在先 `mkdir -p`）

> ℹ️ **本章定位**：CKA 考试中「故障排查」占 **30%** 权重，也是运维日常最常干的活。前 9 章的知识点都散落着排查命令，本章把它们**系统化**成"三板斧 + 三大场景"的方法论。各 Lab 中的终端输出为参考示例，实际报错信息、时间戳等会因环境不同而不同，**关注报错信息本身的结构**。

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 排查三板斧 | describe / logs / events | 必做 |
| Lab 2 CrashLoopBackOff | 崩溃循环与退出码 | 必做 |
| Lab 3 节点 NotReady | kubelet 定位 | 必做 |
| Lab 4 Service/DNS | Endpoints 与解析链 | 必做 |
| Lab 5 可靠性演练 | 滚动更新调优 / 优雅终止 / PDB | 必做 |
| Lab 6 排障容器与 kubectl debug | 临时容器注入调试 | 推荐 |
| Lab 7 停节点主动演练 | 混沌演练：业务迁移与恢复 | 推荐 |
| Lab 8 探针失败动态观察 | readiness 摘除与恢复 | 推荐 |
## Lab 1 排查三板斧：logs / describe / events

> **目标**：建立标准排查流程——遇到任何异常，先按"看事件 → 看状态 → 看日志"的顺序取证。
> **验证概念**：三个命令各管一段：`kubectl describe`（对象状态 + Events 历史，回答"发生了什么"）、`kubectl logs`（容器 stdout/stderr，回答"应用说了什么"）、`kubectl get events`（集群级事件流，回答"整个集群在发生什么"）。**排查顺序：先 describe 看 Events，再 logs 看容器输出**——大部分问题在前两步就能定位。

先创建一个正常 Pod 作为"对照组"

```bash
kubectl run web-ok --image=nginx
```

查看 describe（重点看 Events 段）

```bash
kubectl describe pod web-ok
```

```bash
root@node1:~/k8slab/trouble# kubectl describe pod web-ok
Name:             web-ok
Namespace:        default
Node:             node2/192.168.0.12
Status:           Running
IP:               10.244.104.80
Containers:
  web-ok:
    Container ID:  containerd://8f2a...
    Image:         nginx
    State:         Running
      Started:     2026-01-01T10:00:00Z
    Ready:         True
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  15s   default-scheduler  Successfully assigned default/web-ok to node2
  Normal  Pulling    15s   kubelet            Pulling image "nginx"
  Normal  Pulled     12s   kubelet            Successfully pulled image "nginx"
  Normal  Created    12s   kubelet            Created container web-ok
  Normal  Started    12s   kubelet            Started container web-ok
```

> **观察点**（正常 Pod 的 Events 是一条"时间线"）：
> - `Scheduled → Pulling → Pulled → Created → Started`——**完整生命周期**，全部 Normal
> - **Events 是排查的第一现场**：异常时会在这里出现 `FailedScheduling`（实验 04）、`FailedMount`（实验 08）、`ErrImagePull`（下面 Lab 2）等 Warning——**看到哪个 Warning，问题就在哪一步**

查看日志与集群事件

```bash
kubectl logs web-ok
kubectl get events --sort-by=.lastTimestamp | tail -20
```

```bash
root@node1:~/k8slab/trouble# kubectl logs web-ok
/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
...
root@node1:~/k8slab/trouble# kubectl get events --sort-by=.lastTimestamp | tail -20
LAST SEEN   TYPE      REASON             OBJECT            MESSAGE
2m          Normal    Scheduled          pod/web-ok        Successfully assigned ...
1m          Normal    Pulling            pod/web-ok        Pulling image "nginx"
...
```

> **观察点**：
> - `kubectl logs`——应用自己的输出（nginx 启动日志）；**容器反复崩溃时 logs 是最快线索**（Lab 2）
> - `kubectl get events --sort-by=.lastTimestamp`——**全集群事件流**（按时间排序），能看到所有命名空间发生了什么；排查"整个集群级"问题（如多个 Pod 同时异常）用它
> - 三板斧小结：**describe（这个对象）→ logs（这个容器）→ events（整个集群）**

清理

```bash
kubectl delete pod web-ok
```

## Lab 2 排查 CrashLoopBackOff（Pod 崩溃循环）

> **目标**：制造两种典型故障（镜像不存在、启动命令报错），用 describe + logs 定位并修复。
> **验证概念**：Pod 常见的两个"卡死"状态：**`ImagePullBackOff`**（镜像拉取失败，Events 里有 `ErrImagePull`）和 **`CrashLoopBackOff`**（容器反复崩溃重启——`kubectl logs` 会给出崩溃原因，通常是启动命令/探针/配置问题）。**报错信息永远指向下一步**：ErrImagePull 去查镜像名，CrashLoop 去查 logs。

**故障一：镜像不存在**

```bash
kubectl run bad-image --image=nginx:notexist
kubectl get pod bad-image
```

```bash
root@node1:~/k8slab/trouble# kubectl get pod bad-image
NAME        READY   STATUS             RESTARTS   AGE
bad-image   0/1     ImagePullBackOff   0          20s
```

> **观察点**：STATUS = **`ImagePullBackOff`**——镜像拉不下来。先用 describe 看 Events 确认原因：

```bash
kubectl describe pod bad-image | grep -A5 Events
```

```bash
Events:
  Type     Reason     Age   From     Message
  ----     ------     ----  ----     -------
  Normal   Pulling    22s   kubelet  Pulling image "nginx:notexist"
  Warning  Failed     19s   kubelet  Failed to pull image "nginx:notexist": ... manifest for nginx:notexist not found
  Warning  Failed     19s   kubelet  Error: ErrImagePull
  Warning  Failed     8s    kubelet  Back-off pulling image "nginx:notexist"
```

> **观察点**（Events 直说原因）：`Failed to pull image ... manifest for nginx:notexist not found`——**tag 不存在**（拼写错误或私有镜像未授权）。修复：换成存在的 tag 即可（如 `nginx:1.27`）。另外：国内网络拉镜像失败也会 ErrImagePull，区别是报错是 `timeout/connection refused` 而非 `not found`——那是网络问题，按 实验 01 加速方案处理。

**故障二：启动命令报错（崩溃循环）**

```bash
kubectl run bad-cmd --image=busybox --command -- /bin/sh -c "exit 1"
kubectl get pod bad-cmd
```

```bash
root@node1:~/k8slab/trouble# kubectl get pod bad-cmd
NAME      READY   STATUS             RESTARTS   AGE
bad-cmd   0/1     CrashLoopBackOff   4          90s
```

> **观察点**：STATUS = **`CrashLoopBackOff`** + `RESTARTS 4`——容器启动即崩溃、反复重启。**logs 看崩溃原因**：

```bash
kubectl logs bad-cmd
```

```bash
root@node1:~/k8slab/trouble# kubectl logs bad-cmd
# （无输出——命令 exit 1 什么都没打印就退出了）
```

> **观察点**：logs 为空？说明崩溃发生在"打印任何日志之前"（命令立即 exit 1）。此时 `kubectl logs --previous`（看**上一次**容器的日志）和 describe 的 Events 是补充线索：

```bash
kubectl describe pod bad-cmd | grep -A3 'Last State'
```

```bash
    Last State:     Terminated
      Reason:       Error
      Exit Code:    1
```

> **观察点**（崩溃根因）：`Last State: Terminated / Exit Code: 1`——**退出码 1** 说明是应用自身逻辑错误（exit 1），不是 OOM（137）也不是被杀（143）。排查结论：**镜像/命令本身的问题**（这里就是故意 `exit 1`），修复 = 改对启动命令。**退出码速查**：`0` 正常、`1` 应用错误、`137` OOM 被杀、`143` SIGTERM 优雅退出、`127` 命令不存在。

**实战修复**：换一个能正常运行的命令

```bash
kubectl delete pod bad-cmd
kubectl run bad-cmd-fixed --image=busybox --command -- /bin/sh -c "sleep 3600"
kubectl get pod bad-cmd-fixed
```

```bash
root@node1:~/k8slab/trouble# kubectl get pod bad-cmd-fixed
NAME            READY   STATUS    RESTARTS   AGE
bad-cmd-fixed   1/1     Running   0          10s
```

> **观察点**：`1/1 Running`——修复生效。**排查闭环**：状态异常（ImagePullBackOff/CrashLoopBackOff）→ describe 看 Events/Last State → logs 看输出 → 定位根因 → 修改 → 验证 Running。

清理

```bash
kubectl delete pod bad-image bad-cmd-fixed
```

## Lab 3 排查节点 NotReady

> **目标**：模拟 kubelet 故障导致节点 NotReady，用 systemctl/journalctl 定位并恢复（CKA 高频场景）。
> **验证概念**：**节点状态由 kubelet 的心跳决定**——kubelet 周期性上报节点健康，超过 `node-monitor-grace-period`（默认 40s）没收到心跳，节点变为 **`NotReady`**。排查节点问题 = 查 kubelet：`systemctl status kubelet`（服务状态）+ `journalctl -u kubelet`（kubelet 日志）。

> ⚠️ 本 Lab 会**真的停掉 node2 的 kubelet**（约 1-2 分钟），教学环境安全；生产环境排查时不要停 kubelet，只做只读检查。

在 node2 上停掉 kubelet（模拟故障）

```bash
systemctl stop kubelet
```

> 说明：在 **node2**（worker）上执行。kubelet 停止后，节点不再上报心跳。

回到 master 查看节点状态（等 ~60 秒让心跳超时）

```bash
kubectl get nodes
```

```bash
root@node1:~/k8slab/trouble# kubectl get nodes
NAME    STATUS     ROLES           AGE    VERSION
node1   Ready      control-plane   250d   v1.36.2
node2   NotReady   <none>          250d   v1.36.2
node3   Ready      <none>          250d   v1.36.2
```

> **观察点**：node2 变成 **`NotReady`**——kubelet 心跳超时（约 40s 宽限期后）。**节点 NotReady 的后果**：① 该节点上的 Pod 停止接收新流量（Endpoints 摘除）；② 受控的 Pod 会被调度到其他节点重建。**注意**：这不是节点"坏了"，是 kubelet 没上报。

在 node2 上定位 kubelet 状态与日志

```bash
systemctl status kubelet
```

```bash
root@node2:~# systemctl status kubelet
● kubelet.service - kubelet: The Kubernetes Node Agent
   Loaded: loaded (/etc/systemd/system/kubelet.service; enabled)
   Active: inactive (dead)          # 服务停了
```

> **观察点**：`Active: inactive (dead)`——**服务根本没在运行**（这里是人为 stop 的）。真实故障里可能是 `activating (auto-restart)`（反复崩溃）或 `failed`——那时看 journalctl 找崩溃原因：

```bash
journalctl -u kubelet -n 50 --no-pager | tail -20
```

> **观察点**（kubelet 日志排查）：
> - `journalctl -u kubelet -n 50`——**最近 50 行 kubelet 日志**（`-n` 行数、`-u` 服务单元、`--no-pager` 不分页）
> - 真实场景常见报错：`failed to run Kubelet`（配置损坏）、`connection refused`（连不上 apiserver）、`failed to load kubelet config`（配置文件问题）——**报错行直接指向修复方向**（改配置/查网络/查证书）

在 node2 上恢复 kubelet

```bash
systemctl start kubelet
```

回到 master 验证节点恢复

```bash
kubectl get nodes
```

```bash
root@node1:~/k8slab/trouble# kubectl get nodes
NAME    STATUS   ROLES           AGE    VERSION
node1   Ready    control-plane   250d   v1.36.2
node2   Ready    <none>          250d   v1.36.2
node3   Ready    <none>          250d   v1.36.2
```

> **观察点**：node2 恢复 **`Ready`**——kubelet 一启动，心跳恢复，节点自动回群。**节点排障流程**：`kubectl get nodes` 看状态 → 上节点 `systemctl status kubelet` 看服务 → `journalctl -u kubelet -n 50` 看日志 → 修复后 `systemctl start kubelet`。**先查 kubelet，再看网络/证书**（节点类问题 80% 在 kubelet）。

## Lab 4 排查 Service 无法访问（Endpoints 与 DNS）

> **目标**：诊断两类常见网络故障——Service 没有后端（Endpoints 为空）、DNS 解析失败。
> **验证概念**：**Service 能不能访问，第一眼看 Endpoints**：`Service(selector) → Endpoints(匹配到的 Pod) → 流量转发`。Endpoints 为空 = selector 没匹配到任何 Pod（标签写错最常见）；DNS 解析由 **coredns** 提供，Pod 内 `nslookup <service名>` 可验证。

**故障一：Service 的 selector 写错（Endpoints 为空）**

```bash
# 创建一个 3 副本 Deployment（标签 app=web）
kubectl create deployment web --image=nginx --replicas=3

# 创建 Service，但 selector 故意写错（app=wrong）
kubectl create service clusterip web-svc --tcp=80:80
kubectl patch svc web-svc -p '{"spec":{"selector":{"app":"wrong"}}}'
```

查看 Endpoints

```bash
kubectl get endpoints web-svc
kubectl describe svc web-svc | grep -A3 Endpoints
```

```bash
root@node1:~/k8slab/trouble# kubectl get endpoints web-svc
NAME      ENDPOINTS   AGE
web-svc   <none>      30s
root@node1:~/k8slab/trouble# kubectl describe svc web-svc
...
Endpoints:          <none>
```

> **观察点**：`ENDPOINTS: <none>`——**Service 没有任何后端**。原因：selector 写的 `app=wrong`，而 Pod 的标签是 `app=web`（`kubectl get pod --show-labels` 可确认），**匹配不上 → Endpoints 空 → 访问 10.xx.x.x:80 全部超时**。修复：把 selector 改对（`app=web`）。

**故障二：DNS 解析失败排查**

```bash
# 修复 selector 后，从另一个 Pod 里解析 Service 名
kubectl patch svc web-svc -p '{"spec":{"selector":{"app":"web"}}}'
kubectl run dns-test --image=busybox --command -- sleep 3600
kubectl exec -it dns-test -- nslookup web-svc.default.svc
```

```bash
root@node1:~/k8slab/trouble# kubectl exec -it dns-test -- nslookup web-svc.default.svc
Server:    10.96.0.10
Address:   10.96.0.10:53

Name:      web-svc.default.svc
Address:   10.96.0.10  # （此处应显示 ClusterIP，若只有 Server 行则解析失败）
```

> **观察点**（DNS 排查）：
> - `Server: 10.96.0.10`——**coredns 的 ClusterIP**（固定），说明 DNS 服务可达
> - 完整域名格式：`<service名>.<命名空间>.svc`（跨命名空间访问必须写全，同命名空间可简写为 `web-svc`）
> - 如果 `nslookup` 报 `server can't find`——coredns 没解析出：先查 coredns 是否正常（`kubectl get pod -n kube-system | grep coredns`），再看 Service 是否真的存在（名字/命名空间拼写）
> - **DNS 排障链条**：coredns 活着吗 → Service 存在吗 → 名字/命名空间对了吗 → （实验 07 headless 实验还验证过 DNS 返回全部后端 IP）

验证修复后 Service 可访问

```bash
kubectl exec -it dns-test -- wget -q -O- http://web-svc | head -1
kubectl get endpoints web-svc
```

```bash
root@node1:~/k8slab/trouble# kubectl exec -it dns-test -- wget -q -O- http://web-svc | head -1
Welcome to nginx!
root@node1:~/k8slab/trouble# kubectl get endpoints web-svc
NAME      ENDPOINTS                                   AGE
web-svc   10.244.104.85:80,10.244.135.32:80,...       2m
```

> **观察点**（修复闭环）：selector 改对后 `ENDPOINTS` 出现 3 个 Pod IP，`wget http://web-svc`（Service 名直接解析）返回 nginx 页面——**Service 排障流程：先看 Endpoints（selector 对不对）→ 再查 DNS（coredns/名字对不对）→ 最后 curl 验证**。

**清理**

```bash
kubectl delete pod dns-test
kubectl delete deployment web
kubectl delete svc web-svc
```

## Lab 5 可靠性演练（发布不中断 / 下线不丢请求 / 驱逐有保护）

> **目标**：把"可靠性工程"三件套亲手演练一遍——**滚动更新策略调优**（发布不中断）、**优雅终止深化**（下线不丢请求）、**PDB 保护计算**（驱逐有保护）。
> **验证概念**：可靠性的三个关键机制（教材第 16 章对应）：① 滚动更新用 `maxUnavailable/maxSurge` 控制"新旧交替节奏"；② preStop + 宽限期保证旧 Pod 优雅下线（实验 02 Lab 9 的机制在滚动更新中的应用）；③ PDB 限制一次驱逐的副本数（实验 04 Lab 5 创建过，这里看计算与排空的配合）。

**① 滚动更新策略调优（发布不中断）**

```bash
cat > reliable-app.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reliable
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    maxUnavailable: 0        # 更新时允许 0 个不可用（新 Pod 先就绪）
    maxSurge: 1               # 允许超出期望 1 个（新旧并存峰值 4 个）
  selector:
    matchLabels:
      app: reliable
  template:
    metadata:
      labels:
        app: reliable
    spec:
      containers:
      - name: nginx
        image: nginx:1.27
        readinessProbe:       # 就绪才接管流量（实验 02 Lab 8）
          httpGet:
            path: /
            port: 80
EOF
kubectl apply -f reliable-app.yaml
kubectl set image deployment/reliable nginx=nginx:1.28
kubectl rollout status deployment/reliable
```

> **观察点**（新旧交替节奏）：`maxUnavailable: 0 + maxSurge: 1` 意味着更新时**先起新 Pod、就绪后才停旧 Pod**，任何时刻 3 个旧 Pod 都在服务——**零中断发布**。对比默认的 `25%/25%`（实验 03 Lab 2）：默认策略允许短暂少 1 个（25% 不可用）。核心服务用 `0/1` 或 `0/25%`。

**② 优雅终止深化（下线不丢请求）**

```bash
# 给 reliable 加 preStop（模拟排空连接 5 秒）
kubectl patch deployment reliable --type=json -p='[
  {"op":"add","path":"/spec/template/spec/containers/0/lifecycle","value":
    {"preStop":{"exec":{"command":["/bin/sh","-c","sleep 5"]}}}}
]'
# 再次触发滚动更新，观察旧 Pod 的优雅下线
kubectl set image deployment/reliable nginx=nginx:1.29
kubectl get pods -w      # 观察：新 Pod Running 后，旧 Pod 进入 Terminating 并停留约 5 秒
```

> **观察点**：旧 Pod 被替换时**不是瞬间消失**——进入 `Terminating` 后先执行 preStop（`sleep 5` 模拟排空），5 秒后才真正退出。**这就是滚动更新不丢请求的第二道保障**：新 Pod 就绪（readiness）+ 旧 Pod 排空（preStop）。日志佐证：`kubectl describe pod <旧Pod>` 的 Events 能看到 `Killing` 前的钩子执行。

**③ PDB 保护计算（驱逐有保护）**

```bash
kubectl create poddisruptionbudget reliable-pdb --selector=app=reliable --min-available=2
kubectl get pdb
```

```bash
root@node1:~# kubectl get pdb
NAME            MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS   AGE
reliable-pdb    2                N/A               1                     8s
```

> **观察点**（ALLOWED DISRUPTIONS 的计算）：`replicas=3`、`min-available=2` → 允许同时驱逐 `3-2=1` 个。**计算规则**：`ALLOWED = 当前可用副本数 - min-available`（或 `max-unavailable` 模式为上限值）。配合 drain：`kubectl drain node2 --ignore-daemonsets` 时一次只驱逐 1 个该应用的 Pod，服务始终有 ≥2 副本——**节点维护（实验 12 Lab 3）期间业务无损的机制**。

**清理**

```bash
kubectl delete deployment reliable
kubectl delete pdb reliable-pdb
```

## Lab 6 排障容器与 kubectl debug（推荐）

> **目标**：给"没有 shell/工具"的精简镜像 Pod 注入调试容器，用 kubectl debug 替代 SSH 进节点。
> **验证概念**：教材 §16.2.3——**临时容器（ephemeral containers）**可以往运行中的 Pod 注入新容器（共享进程/网络命名空间），排障后自动消失——生产安全（不用给 SSH 权限）。

```bash
# ① 先造一个"精简镜像"Pod（busybox 没有 curl/nslookup）
kubectl run debug-target --image=busybox --restart=Never -- sleep 3600

# ② 用 kubectl debug 注入带工具的临时容器（netshoot 预装全套网络工具）
kubectl debug -it debug-target --image=nicolaka/netshoot --target=debug-target -- sh
# 进入临时容器后：
#   nslookup kubernetes.default.svc   # 网络排障
#   curl -s http://kubernetes.default.svc | head -1   # HTTP 排障
#   exit   # 退出后临时容器自动清理（不影响原容器）
```

```bash
root@node1:~/k8slab/trouble# kubectl debug -it debug-target --image=nicolaka/netshoot --target=debug-target -- sh
Targeting container "debug-target". If you don't see a command prompt, try pressing enter.
~ # nslookup kubernetes.default.svc
Server:    10.96.0.10
Address:   10.96.0.10#53
Name:    kubernetes.default.svc.cluster.local
...
~ # exit
```

> **配置要点**（kubectl debug，教材 §16.2.3）：
> - `--target=debug-target`——指定共享哪个容器的命名空间（缺省用第一个容器）
> - `netshoot` 镜像预装 curl/nslookup/tcpdump 等全套排障工具（生产排障标配镜像）
> - 临时容器是 **v1.23+ 稳定特性**：注入不影响原容器，Pod 删除时一并消失
> - 查节点用 `kubectl debug node/<节点名> --image=ubuntu`（替代 SSH 进节点，教材 §16.2.3）

> **观察点**：在临时容器里能解析 `kubernetes.default.svc`（走的是原 Pod 的网络命名空间）——**"借壳排障"**：不改应用、不 SSH 节点，就能用完整工具链查网络。

**清理**

```bash
kubectl delete pod debug-target
```

## Lab 7 停节点主动演练（推荐）

> **目标**：真实停掉一台 worker，观察业务迁移与节点恢复（混沌演练核心动作）。
> **验证概念**：教材 §16.4.4——**主动演练验证"系统宣称的能力"**：停节点 → 控制面标记 NotReady → 节点上的 Pod 被驱逐重建到其他节点（自愈）；节点恢复后重新加入。

> ⚠️ **演练前准备**：确认业务有多副本 + PDB（否则停节点 = 业务中断）；演练对象选 node3（业务最少的节点）。

```bash
# ① 准备一个多副本应用
kubectl create deployment chaos-web --image=nginx --replicas=3
kubectl create poddisruptionbudget chaos-pdb --selector=app=chaos-web --min-available=2

# ② 记录当前分布
kubectl get pods -o wide | grep chaos-web

# ③ "停掉" node3（教学/云环境用停止 kubelet 模拟节点失联，可远程恢复；真实演练才直接关机）
ssh node3 "systemctl stop kubelet"
# 或安全演练：kubectl drain node3 --ignore-daemonsets

# ④ 观察自愈（实测：等 5 分钟驱逐窗口！NotReady 后控制面等 unreachable 容忍期 300s 才驱逐）
kubectl get nodes                  # node3 → NotReady（1 分钟内）
kubectl get pods -o wide | grep chaos-web   # 刚停时副本还在 node3（容器还活着）
sleep 300                          # 5 分钟驱逐窗口（unreachable 默认容忍 300s）
kubectl get pods -o wide | grep chaos-web   # 副本迁移到 node1/node2（旧的 Terminating）
```

```bash
root@node1:~/k8slab/trouble# kubectl get nodes
NAME    STATUS     ROLES           AGE    VERSION
node1   Ready      control-plane   5h     v1.36.3
node2   Ready      <none>          5h     v1.36.3
node3   NotReady   <none>          5h     v1.36.3     ← 失联
root@node1:~/k8slab/trouble# kubectl get pods -o wide | grep chaos-web
chaos-web-xxx1   1/1   Running   0   3m   10.244.x.x   node1
chaos-web-xxx2   1/1   Running   0   3m   10.244.x.x   node2
chaos-web-xxx3   1/1   Running   0   3m   10.244.x.x   node1   ← 迁移了
```

> **观察点**（主动演练的价值，教材 §16.4.4）：node3 NotReady 后——**① 节点控制器标记 NotReady**（第 2 章心跳机制，约 40-60s）；**② 驱逐不是立即的**：`unreachable` 污点默认容忍 **300s**（5 分钟），期间旧 Pod 继续跑（容器还活着），窗口到后**驱逐重建到健康节点**（自愈：控制器补副本，新 Pod 先起、旧的 Terminating 等待清理）；**③ 演练结论：多副本 + PDB 是"节点挂了业务不挂"的前提**。

恢复节点

```bash
# 恢复 kubelet 并等待重新加入（真实关机场景：启动 node3，kubelet 自动重连）
ssh node3 "systemctl start kubelet"
sleep 30
kubectl get nodes    # node3 恢复 Ready
kubectl uncordon node3   # 若之前 drain 过需要恢复调度
```

> **观察点**：节点恢复后 kubelet 自动重新注册（心跳恢复 → Ready）——**K8s 的节点自愈**（第 3 章 join 的机制在运行期持续生效）。

**清理**

```bash
kubectl delete deployment chaos-web
kubectl delete pdb chaos-pdb
```

## Lab 8 探针失败动态观察（推荐）

> **目标**：让 readinessProbe 失败/恢复，观察流量被摘除与恢复的完整过程。
> **验证概念**：教材 §4.4.2——readiness 失败 → **从 Service 摘除（不重启）**；恢复 → 重新接流量——"就绪才接流量"的动态实证。

```bash
# ① 带 readinessProbe 的应用 + Service
cat > probe-demo.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: probe-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: probe-demo
  template:
    metadata:
      labels:
        app: probe-demo
    spec:
      containers:
      - name: nginx
        image: nginx
        readinessProbe:
          httpGet:
            path: /healthz          # 故意用不存在的路径 → 探针失败
            port: 80
          initialDelaySeconds: 3
          periodSeconds: 5
EOF
kubectl apply -f probe-demo.yaml
kubectl expose deployment probe-demo --port=80
sleep 20

# ② 观察：探针失败 → 未就绪
kubectl get pods | grep probe-demo     # READY 0/2
kubectl get endpoints probe-demo       # ENDPOINTS 为空（被摘除）
kubectl describe pod -l app=probe-demo | grep -A2 "Readiness"
```

```bash
root@node1:~/k8slab/trouble# kubectl get pods | grep probe-demo
probe-demo-xxx1   0/2   Running   0   20s
root@node1:~/k8slab/trouble# kubectl get endpoints probe-demo
NAME         ENDPOINTS   AGE
probe-demo              20s     ← ENDPOINTS 为空
```

> **观察点**（readiness 摘除的实证，教材 §4.4.2）：探针路径 `/healthz` 不存在 → **READY 0/2（就绪失败）、Endpoints 为空（流量不进）**——但 Pod 仍是 Running（**不重启**，区别于 liveness）。`describe` 的 Readiness 段显示 `ProbeError`。

修复探针并观察恢复

```bash
kubectl patch deployment probe-demo --type=json -p='[{"op":"replace","path":"/spec/template/spec/containers/0/readinessProbe/httpGet/path","value":"/"}]'
kubectl rollout status deployment/probe-demo
kubectl get endpoints probe-demo    # ENDPOINTS 恢复 2 个 Pod IP
```

```bash
root@node1:~/k8slab/trouble# kubectl get endpoints probe-demo
NAME         ENDPOINTS                                   AGE
probe-demo   10.244.x.x:80,10.244.x.x:80                 1m
```

> **观察点**（恢复闭环）：探针路径改成 `/`（nginx 默认页）→ READY 2/2、Endpoints 恢复——**探针是"就绪开关"**：失败摘流量、恢复回流量，全程不重启容器（这正是滚动更新零中断的前提，教材 §5.2.3）。

**清理**

```bash
kubectl delete deployment probe-demo
kubectl delete svc probe-demo
```
## 本章小结

本章通过 8 个实验，把散落在前 12 章的排查手段系统化为"**三板斧 + 分层排查**"，并补齐了可靠性演练与主动演练：

| 实验 | 验证的知识点 | 关键命令/概念 | 级别 |
|---|---|---|:---:|
| Lab 1 排查三板斧 | describe（事件）/ logs（容器输出）/ events（集群事件） | `kubectl describe`、`kubectl logs`、`kubectl get events` | 必做 |
| Lab 2 崩溃循环排查 | ImagePullBackOff（镜像）/ CrashLoopBackOff（命令/配置）；退出码 | `ErrImagePull`、`logs --previous`、Exit Code 0/1/137/143 | 必做 |
| Lab 3 节点 NotReady 排查 | kubelet 心跳决定节点状态；服务与日志定位 | `systemctl status kubelet`、`journalctl -u kubelet -n 50` | 必做 |
| Lab 4 Service/DNS 排查 | Endpoints 为空（selector 错）；DNS 解析链 | `get endpoints`、`nslookup <svc>.<ns>.svc`、coredns | 必做 |
| Lab 5 可靠性演练 | 滚动更新调优（0/1 零中断）；preStop 优雅下线；PDB 计算 | `maxUnavailable/maxSurge`、`rollout status`、ALLOWED DISRUPTIONS | 必做 |
| Lab 6 排障容器与 kubectl debug | 临时容器注入调试工具（替代 SSH） | `kubectl debug`、`--target`、netshoot | 推荐 |
| Lab 7 停节点主动演练 | 混沌演练：NotReady 标记、Pod 迁移、节点恢复 | poweroff/drain、自愈观察 | 推荐 |
| Lab 8 探针失败动态观察 | readiness 摘流量 → 恢复回流量（不重启） | 0/2 READY、Endpoints 为空、patch 修复 | 推荐 |

**核心认知**：
1. **排查三板斧**：`describe`（这个对象发生了什么）→ `logs`（应用说了什么）→ `events`（集群在发生什么）——**按这个顺序取证，90% 的问题在前两步定位**
2. **报错信息就是答案**：`manifest not found`（镜像名错）、`violates PodSecurity`（PSA 拦）、`exceeded quota`（配额超）、`didn't match Pod's node affinity`（调度不上）——**每条报错都直说"差在哪"**，改对应配置即可
3. **按层排查**：节点级（NotReady → kubelet）→ Pod 级（ImagePullBackOff/CrashLoop → describe/logs）→ 网络级（Endpoints/DNS → selector/coredns）——**从外层往内层，每层都有专属命令**
4. **退出码速查**：`0` 正常、`1` 应用错误、`127` 命令不存在、`137` OOM 被杀、`143` SIGTERM——`kubectl logs --previous` 看崩溃前输出
5. **可靠性三件套**（Lab 5）：滚动更新 `maxUnavailable: 0` 零中断发布、preStop 优雅下线不丢请求、PDB 保护驱逐有保险——**"发布不中断、下线不丢、驱逐有保护"就是生产可用的底线**

**与前面章节的衔接**（本章是全书排查命令的"总装"）：
- `describe` 的 Events → 实验 04 FailedScheduling、实验 05 Forbidden/exceeded quota 都从这里看
- 退出码 → 实验 02 Lab 9 的优雅终止（143 SIGTERM）、实验 02 Lab 10 的内存超限（137 OOM）
- 可靠性三件套 → 实验 03 Lab 2 滚动更新、实验 02 Lab 9 钩子、实验 04 Lab 5 与实验 12 Lab 3 的 PDB/drain
- 本 Lab 的排查思路 → 实验 09 安全（PSA 拒绝/证书问题）、实验 11 综合演练（WordPress 全链路故障定位）
- drain/uncordon → 实验 01 集群升级、实验 07 节点维护
- Service/Endpoints/DNS → 实验 04 网络全链路
- kubelet/证书 → 实验 01 安装、实验 08 认证（kubelet 连 apiserver 的证书问题）

**CKA 实战提醒**：考试里故障排查题都是"给你一个异常集群，用 5-10 分钟定位修复"——**先 describe 再 logs，改完立即 get 验证**，与本章每个 Lab 的流程完全一致。


---


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


---


# 集群维护与运维

> 前置条件：已完成实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready），当前 kubectl 上下文为 `kubernetes-admin@kubernetes`（在 master 上操作）。
> 本章是"集群装好之后怎么管"的运维实验：**etcd 备份与恢复**（保命技能）、**kubeadm 升级**（版本跟进）、**节点维护综合演练**（维护窗口全流程）。

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 etcd 备份与恢复 | 快照/恢复五步，保命技能 | 必做 |
| Lab 2 kubeadm 集群升级 | 先控制面后 worker，不能跳版本 | 必做 |
| Lab 3 节点维护综合演练 | cordon/drain/uncordon + PDB | 必做 |
| Lab 4 证书续期演练 | kubeadm certs renew + 证书检查 | 可选·进阶 |
## Lab 1 etcd 备份与恢复

> **目标**：用 `etcdctl` 给 etcd 打快照（备份集群全部状态），并掌握恢复流程（CKA 必考）。
> **验证概念**：**etcd 存了集群的"全部家当"**（所有 API 对象：Pod/Deployment/ConfigMap 等），丢了 etcd = 丢了整个集群；备份 = 导出一份快照文件，恢复 = 用快照重建数据目录。生产上**每天备份 etcd** 是标准运维动作。

查看 etcd 运行状态与证书路径

```bash
kubectl get pods -n kube-system | grep etcd
ls /etc/kubernetes/pki/etcd/
```

```bash
root@node1:~# kubectl get pods -n kube-system | grep etcd
etcd-node1                          1/1     Running   0          243d
root@node1:~# ls /etc/kubernetes/pki/etcd/
ca.crt  ca.key  healthcheck-client.crt  healthcheck-client.key  peer.crt  peer.key  server.crt  server.key
```

> **观察点**：etcd 以静态 Pod 跑在 master（`etcd-node1`）；连接 etcd 需要三件套：`ca.crt`（校验 etcd 服务端）+ `server.crt/server.key`（客户端身份）——备份命令里都要用到。

创建备份目录并打快照

```bash
mkdir -p /backup/etcd
etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /backup/etcd/snapshot-$(date +%F).db
```

> **配置要点**（etcdctl 三件套参数，CKA 必背）：
> - `--endpoints=https://127.0.0.1:2379`——etcd 本地端点（2379 是客户端端口）
> - `--cacert/--cert/--key`——**TLS 三件套**：CA 证书 + 客户端证书/私钥（上面 ls 看到的那三个文件）
> - `snapshot save <文件>`——导出快照；文件名带日期便于区分（etcd 3.4+ 默认 v3 API，无需 `ETCDCTL_API=3`）
> - 若宿主机没有 etcdctl 二进制（kubeadm 不带），用 `kubectl -n kube-system exec etcd-node1 -- etcdctl ...`（etcd 容器内自带）

验证快照

```bash
etcdctl snapshot status /backup/etcd/snapshot-*.db -w table
```

```bash
root@node1:~# etcdctl snapshot status /backup/etcd/snapshot-*.db -w table
+----------+----------+------------+------------+
|   HASH   | REVISION | TOTAL KEYS | TOTAL SIZE |
+----------+----------+------------+------------+
| 8f9c1d2e |   482913 |      15230 |  4.1 MB    |
+----------+----------+------------+------------+
```

> **观察点**：`snapshot status` 显示快照健康：`REVISION`（etcd 修订号）、`TOTAL KEYS`（15230 个键 = 集群里所有对象）、`TOTAL SIZE`（4.1MB）——**快照有效，随时可以恢复**。

恢复流程（理解即可，**不要在正常集群上演练**——会覆盖现有数据）：

```bash
# 1. 停掉 apiserver（静态 Pod：移走 manifest 文件）
mv /etc/kubernetes/manifests/kube-apiserver.yaml /tmp/

# 2. 用快照恢复到新数据目录
etcdctl snapshot restore /backup/etcd/snapshot-2026-01-01.db \
  --data-dir=/var/lib/etcd-restore

# 3. 用恢复出的目录替换 etcd 数据目录（原目录备份后删除）
mv /var/lib/etcd /var/lib/etcd.orig
mv /var/lib/etcd-restore /var/lib/etcd

# 4. 恢复 apiserver manifest，etcd/apiserver 自动重启
mv /tmp/kube-apiserver.yaml /etc/kubernetes/manifests/

# 5. 验证集群恢复
kubectl get nodes
```

> **观察点**（恢复五步，理解每步目的）：
> - 第 1 步：先停 apiserver——**避免恢复期间它向 etcd 写入新数据**覆盖恢复结果
> - 第 2 步：`snapshot restore` 生成**新的数据目录**（恢复 ≠ 直接覆盖原目录，防止误操作）
> - 第 3-4 步：目录替换 + 恢复 manifest，etcd 用新数据重启、apiserver 重新连上
> - 第 5 步：`kubectl get nodes` 正常 = 恢复成功（数据回滚到快照时刻）
>
> **备份策略（生产认知）**：备份周期（每日 + 变更后）、保留策略（滚动保留 N 份）、**异地存放**（快照与集群分离）、定期**恢复演练**（备份能不能用，只有恢复过才知道）——恢复演练是 CKA 常考场景。

**清理**

```bash
# 本 Lab 无集群资源改动；快照文件保留在 /backup/etcd 供 Lab 2 后定期备份使用
echo "快照已保存：$(ls /backup/etcd/)"
```

## Lab 2 kubeadm 集群升级

> **目标**：用 kubeadm 把集群升级到下一个次要版本（先控制面后 worker），掌握升级流程（CKA 必考）。
> **验证概念**：kubeadm 升级有**固定顺序**：① 先升级 **kubeadm 本身** → ② 控制面节点（`kubeadm upgrade apply`）→ ③ worker 节点（drain → `kubeadm upgrade node` → uncordon）；每台节点上 kubelet/kubectl 的版本要**跟 kubeadm 一起升**。**不能跳版本**（1.36 → 1.37 → 1.38，不支持跨次要版本）。

> ⚠️ 本 Lab 为**可选演示**：升级会动正在运行的集群，教学环境请自行决定是否执行；以下版本号（1.37.x）仅为示例，**以 `kubeadm upgrade plan` 实际输出的可用版本为准**。升级前务必先做 Lab 1 的 etcd 备份（**升级 = 先备份，这是铁律**）。

查看当前版本与可用升级路径

```bash
kubeadm version
kubectl get nodes
```

```bash
root@node1:~# kubectl get nodes
NAME    STATUS   ROLES           AGE    VERSION
node1   Ready    control-plane   243d   v1.36.2
node2   Ready    <none>          243d   v1.36.2
node3   Ready    <none>          243d   v1.36.2
```

**控制面节点（node1）升级步骤**：

```bash
# 1. 升级 kubeadm（先升工具本身，再升级集群）
apt-mark unhold kubeadm && apt-get update && apt-get install -y kubeadm=1.37.x-* && apt-mark hold kubeadm

# 2. 查看升级路径（确认目标版本与依赖）
kubeadm upgrade plan

# 3. 执行升级（会迁移/更新控制面组件到新版本）
kubeadm upgrade apply v1.37.x
```

**更新该节点上的 kubelet/kubectl 并重启 kubelet**：

```bash
apt-mark unhold kubelet kubectl && apt-get update && apt-get install -y kubelet=1.37.x-* kubectl=1.37.x-* && apt-mark hold kubelet kubectl
systemctl daemon-reload && systemctl restart kubelet
```

**worker 节点（node2/node3）升级步骤**（每台节点执行）：

```bash
# 1. 先排空节点（实验 04 学过的 drain，业务 Pod 迁移到其他节点）
kubectl drain node2 --ignore-daemonsets

# 2. 在该节点上升级 kubeadm + kubelet + kubectl
apt-mark unhold kubeadm kubelet kubectl && apt-get update && apt-get install -y kubeadm=1.37.x-* kubelet=1.37.x-* kubectl=1.37.x-* && apt-mark hold kubeadm kubelet kubectl

# 3. 升级该节点的 kubelet 配置
kubeadm upgrade node

# 4. 重启 kubelet 并恢复调度
systemctl daemon-reload && systemctl restart kubelet
kubectl uncordon node2
```

验证升级结果

```bash
kubectl get nodes
```

```bash
root@node1:~# kubectl get nodes
NAME    STATUS   ROLES           AGE    VERSION
node1   Ready    control-plane   244d   v1.37.2
node2   Ready    <none>          244d   v1.37.2
node3   Ready    <none>          244d   v1.37.2
```

> **观察点**（升级完成的标志）：三个节点的 `VERSION` 列全部从 `v1.36.2` 变成 **`v1.37.2`**——**先 master 后 worker、逐台升级**；升级期间业务无感（drain 迁移 + 滚动重启，实验 03/实验 04 的知识都用上了）。
>
> **顺序口诀**：`kubeadm 先升级 → control-plane apply → worker 逐台 drain/upgrade/uncordon`；任何一步卡住先用 `kubeadm upgrade plan` 看兼容性提示。
>
> **回滚预案（生产认知）**：升级前 etcd 快照即回滚手段（Lab 1）；升级失败时先看 `kubeadm upgrade plan` 的兼容性提示，不要硬来。

**清理**

```bash
# 本 Lab 为集群级操作；升级完成后验证 kubectl get nodes 三节点 Ready 即可
kubectl get nodes
```

## Lab 3 节点维护综合演练（维护窗口全流程）

> **目标**：把"节点要维护（升级/换硬件/重启）"时的一套标准动作走一遍：**cordon 隔离 → drain 排空 → 维护 → uncordon 恢复**，并观察 PDB 对排空的保护（CKA 域 1 高频场景）。
> **验证概念**：节点维护三步曲——`cordon`（标记不可调度，**已有 Pod 不动**）→ `drain`（驱逐节点上全部 Pod，**业务无感迁移**）→ 维护 → `uncordon`（恢复调度）。`PodDisruptionBudget`（PDB）约束 drain 能一次驱逐几个副本——**保障业务可用性**（实验 04 Lab 5 学过 PDB 创建，本 Lab 看它在真实维护中的作用）。

部署一个有 PDB 保护的应用

```bash
kubectl create deployment web --image=nginx --replicas=3
kubectl expose deployment web --port=80 --target-port=80
kubectl create poddisruptionbudget web-pdb --selector=app=web --min-available=2
kubectl get pdb
```

```bash
root@node1:~# kubectl get pdb
NAME      MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS   AGE
web-pdb   2                N/A               1                     10s
```

> **观察点**：`ALLOWED DISRUPTIONS: 1`——PDB 允许**最多同时驱逐 1 个**副本（3 个副本保证最少 2 个可用）。这是 drain 时驱逐数量的"刹车"。

演练维护窗口（以 node2 为例）

```bash
# ① 隔离：标记 node2 不可调度（已有 Pod 继续运行）
kubectl cordon node2
kubectl get nodes                    # node2 显示 SchedulingDisabled

# ② 排空：驱逐 node2 上的业务 Pod（PDB 约束下逐个迁移）
kubectl drain node2 --ignore-daemonsets
kubectl get pods -o wide | grep web   # 3 个 web Pod 全部在 node1/node3

# ③ 模拟维护完成，恢复调度
kubectl uncordon node2
kubectl get nodes                    # node2 恢复 Ready/SchedulingEnabled
```

> **观察点**（维护三步曲与 PDB 的作用）：
> - `cordon` 后新 Pod 不再调度到 node2，但**已运行的 Pod 不受影响**（维护窗口内服务不中断）
> - `drain` 把业务 Pod 驱逐到其他节点（`--ignore-daemonsets` 因为 DaemonSet 的 Pod 由控制器重建回本节点，不需要驱逐）
> - **PDB 的作用**：如果没有 PDB，drain 可能把 3 个副本瞬间全驱逐；有 PDB（min-available=2）则**逐个驱逐**，服务始终有可用副本——这就是"排空不丢服务"的保障
> - 实际升级（Lab 2）中 worker 的 drain 步骤就是这里的第 ② 步

删除 PDB 观察无保护的排空（对比实验）

```bash
kubectl delete pdb web-pdb
kubectl drain node2 --ignore-daemonsets --force   # 无 PDB 时驱逐不受限（会全部快速驱逐）
kubectl uncordon node2
```

> **观察点**（对比）：删除 PDB 后 drain 不再受限——**PDB 就是业务可用性的保险丝**。生产上核心服务（数据库、网关）必须配 PDB（实验 04 Lab 5 的创建方法）。

**清理**

```bash
kubectl delete deployment web
kubectl delete svc web
```

## Lab 4 证书续期演练（可选·进阶）

> **目标**：用 `kubeadm certs renew` 手动续期控制面证书，掌握"证书过期前必须处理"的运维动作。
> **验证概念**：kubeadm 集群的**控制面证书默认 1 年有效**（etcd 证书 1 年、apiserver/kubelet 等 CA 签发的 1 年）；到期不处理 → apiserver 拒绝客户端连接、kubelet 无法注册——**证书管理是集群生命周期的定时炸弹**（教材 §14.x 集群运维深化）。

```bash
# ① 查看全部证书的过期时间（先体检）
kubeadm certs check-expiration
```

```bash
root@node1:~# kubeadm certs check-expiration
[check-expiration] Reading configuration from the cluster...
CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 Jan 04, 2027 15:04 UTC   356d            ca                      no
apiserver                  Jan 04, 2027 15:04 UTC   356d            ca                      no
...
kubelet.conf               Jan 04, 2027 15:04 UTC   356d            ca                      no
```

> **观察点**：每个证书一行，`RESIDUAL TIME` 是剩余天数——**生产巡检看这里**：剩余 < 90 天就该安排续期窗口。

```bash
# ② 手动续期全部证书（只续期不重启组件！）
kubeadm certs renew all
kubeadm certs check-expiration   # 再看一遍：EXPIRES 已刷新为 1 年后

# ③ 关键一步：重启控制面组件，让它们加载新证书（实测：证书文件变化不会触发自动重启，必须手动重启）
kubectl get pods -n kube-system | grep -E "kube-apiserver|kube-controller|kube-scheduler|etcd"
# 手动重启：先 stop 再 rm（直接 rm 会报 "container is running, please stop it first"）
for C in $(crictl ps | grep -E "kube-apiserver|kube-controller|kube-scheduler|etcd" | awk '{print $1}'); do
  crictl stop $C 2>/dev/null; crictl rm $C 2>/dev/null
done
sleep 75    # 等 kubelet 重建全部静态 Pod
kubectl get pods -n kube-system | grep -E "kube-apiserver|kube-controller|kube-scheduler|etcd"   # 全部 1/1

# ④ 更新 kubeconfig（admin.conf 也续期了，用新配置访问）
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
kubectl get nodes   # 正常返回 = 新证书生效
```

> **配置要点**：`kubeadm certs renew` 只重签证书，**不自动重启组件**（实测：证书文件变化不会触发静态 Pod 自动重启，必须手动 crictl stop/rm 重建，等 kubelet 拉起来）。**kubelet 客户端证书**（`kubelet.conf`）续期后需重启 kubelet：`systemctl restart kubelet`。`admin.conf` 更新后 `cp -i /etc/kubernetes/admin.conf ~/.kube/config`（覆盖旧配置）。

> ⚠️ 若需自动续期，可配置 `kubeadm certs renew` 定期任务（cron）或改用 kubelet 证书轮换（`rotateCertificates: true`）——生产推荐后者，见教材 §14 集群运维。

**清理**

```bash
# 本 Lab 无额外资源；检查集群状态确认一切正常
kubectl get nodes && kubectl get pods -A | grep -v Running | head
```
## 本章小结

本章通过 4 个实验，掌握了"集群装好之后怎么管"的完整运维技能：

| 实验 | 验证的知识点 | 关键命令/概念 | 级别 |
|---|---|---|---|
| Lab 1 etcd 备份与恢复 | 快照保存/验证/恢复五步；备份策略 | `etcdctl snapshot save/status/restore`、TLS 三件套 | 必做 |
| Lab 2 kubeadm 集群升级 | 先控制面后 worker 的固定顺序；不能跳版本 | `kubeadm upgrade plan/apply/node`、drain/uncordon | 必做 |
| Lab 3 节点维护综合演练 | cordon/drain/uncordon 三步曲；PDB 保护 | `kubectl cordon/drain/uncordon`、ALLOWED DISRUPTIONS | 必做 |
| Lab 4 证书续期演练 | 证书体检/续期/重启生效；过期是定时炸弹 | `kubeadm certs check-expiration/renew`、crictl 重启 | 可选·进阶 |

**核心认知**：
1. **etcd 备份是保命技能**：集群的全部状态都在 etcd——备份（每日+变更后）、异地存放、定期恢复演练
2. **升级铁律**：先备份 → kubeadm 先升 → 控制面 apply → worker 逐台 drain/upgrade/uncordon；**不能跳版本**
3. **维护三步曲**：cordon（隔离）→ drain（排空）→ uncordon（恢复）——升级/换硬件/重启的标准动作
4. **PDB 是业务保险丝**：排空/驱逐时保护副本数，核心服务必须配
5. **与前面实验的衔接**：drain/PDB 概念来自实验 04（调度），本实验看它们在运维中的真实组合

**与后续章节的衔接**：
- etcd 备份/升级/维护 → 教材第 14 章集群运维深化（HA 概念、备份策略、维护窗口规划）
- drain/PDB → 实验 10 Lab 5 可靠性演练（排空与可用性的关系）


---


# Helm 应用交付

> 前置条件：已完成实验 01 部署的 3 节点集群（node1=master，node2/node3=worker，均 Ready）；已掌握实验 09 Lab 6 的 helm 基本命令；本实验对应**教材第 17 章（Helm 与 Kustomize）**。
> 自包含说明：本实验所有 Chart 文件内嵌，无需克隆外部仓库。**Helm v3**（本实验全部命令基于 v3）。

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 认识 Chart 结构并打包 | Chart.yaml/values.yaml/templates 解剖 + helm create/package | 必做 |
| Lab 2 install / upgrade / rollback | Release 全生命周期（revision 回滚） | 必做 |
| Lab 3 values 多环境 + Kustomize | -f 环境覆盖 + kubectl apply -k | 推荐 |

## Lab 1 认识 Chart 结构并打包

> **目标**：解剖一个 Chart 的目录结构，理解"模板 + values"的渲染原理，并完成打包。
> **验证概念**：**Chart = 资源模板 + 默认值**（教材 §17.2.2）——`templates/` 里是带 `{{ .Values.xxx }}` 占位符的 yaml，`values.yaml` 提供默认值；`helm package` 把 Chart 打成可分发的 `.tgz` 安装包。

创建 Chart 骨架

```bash
helm create myapp
apt-get install -y tree 2>/dev/null   # tree 命令不存在时先装（或用 find myapp -type f 替代）
tree myapp
```

```bash
root@node1:~/k8slab/helm# helm create myapp
Creating myapp
root@node1:~/k8slab/helm# tree myapp
myapp/
├── Chart.yaml          # 元数据：name/version/appVersion
├── charts/             # （空）子 Chart 依赖
├── templates/          # 资源模板（Go template 语法）
│   ├── NOTES.txt       # 安装后的提示信息
│   ├── _helpers.tpl    # 公共模板片段
│   ├── deployment.yaml
│   ├── hpa.yaml
│   ├── ingress.yaml
│   ├── service.yaml
│   ├── serviceaccount.yaml
│   └── tests/          # 安装后测试
└── values.yaml         # 默认配置值
```

> **观察点**：`helm create` 生成了标准 Chart 骨架——`values.yaml` 是"默认值"，`templates/deployment.yaml` 是"模板"。这正对应教材 §17.2.2 的目录结构解剖。

解剖模板与 values 的对应关系

```bash
grep -n "replicaCount\|image:" myapp/values.yaml
grep -n "Values" myapp/templates/deployment.yaml | head -5
```

```bash
root@node1:~/k8slab/helm# grep -n "replicaCount\|image:" myapp/values.yaml
replicaCount: 1
image:
  repository: nginx
  tag: ""
root@node1:~/k8slab/helm# grep -n "Values" myapp/templates/deployment.yaml | head -5
replicas: {{ .Values.replicaCount }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
```

> **配置要点**（模板与 values 的对应，教材 §17.2.3）：
> - `values.yaml` 里的 `replicaCount: 1`、`image.repository: nginx` → 模板里 `{{ .Values.replicaCount }}`、`{{ .Values.image.repository }}`
> - `{{ .Values.image.tag | default .Chart.AppVersion }}`——管道语法：tag 为空时用 Chart 的 appVersion
> - **模板不写死数值，values 提供默认值**——这就是"一套 Chart 跑所有环境"的基础

渲染检查（不安装，先看渲染结果）

```bash
helm template myapp ./myapp | grep -A3 "replicas:\|image:"
```

```bash
root@node1:~/k8slab/helm# helm template myapp ./myapp | grep -A3 "replicas:\|image:"
# Source: myapp/templates/deployment.yaml
replicas: 1
...
        image: "nginx:1.16.0"
```

> **观察点**：`helm template` 把模板渲染成最终 yaml——`replicas: 1`（来自 values）、`image: "nginx:1.16.0"`（tag 为空时用了 Chart 默认 AppVersion）。**先渲染后安装**是排障利器（教材 §17.2.3）。

打包 Chart

```bash
helm package ./myapp
ls -la myapp-*.tgz
```

```bash
root@node1:~/k8slab/helm# helm package ./myapp
Successfully packaged chart and saved it to: /root/k8slab/helm/myapp-0.1.0.tgz
```

> **观察点**：`myapp-0.1.0.tgz` 生成——版本号来自 `Chart.yaml` 的 `version: 0.1.0`。**打包后的 .tgz 就是可分发/可上传仓库的"安装包"**（教材 §17.4.1 的 CI 产物）。

**清理**

```bash
rm -f myapp-*.tgz
```

> 说明：Chart 目录 myapp/ 保留（Lab 2 继续用）。

## Lab 2 install / upgrade / rollback

> **目标**：完成 Release 的完整生命周期——安装、升级（改 values）、回滚（revision 机制）。
> **验证概念**：**Release 是 Chart 的一次部署实例**（教材 §17.2.1）——`helm install` 创建 revision 1；`helm upgrade` 生成 revision 2；`helm rollback` 一键回到旧 revision——与 Deployment 的 revision 机制同源，但粒度是"整个应用包"。

安装 Release

```bash
helm install myapp ./myapp
helm list
```

```bash
root@node1:~/k8slab/helm# helm install myapp ./myapp
NAME: myapp
LAST DEPLOYED: ...
NAMESPACE: default
STATUS: deployed
root@node1:~/k8slab/helm# helm list
NAME    NAMESPACE  REVISION  UPDATED  STATUS   CHART        APP VERSION
myapp   default    1         ...      deployed myapp-0.1.0 1.16.0
```

> **观察点**：`helm list` 显示 `REVISION: 1`——**安装即 revision 1**。`kubectl get all | grep myapp` 能看到 Chart 里模板生成的全部资源（Deployment/Service 等）。

升级（改 values）

```bash
helm upgrade myapp ./myapp --set replicaCount=3
helm list
kubectl get deploy myapp   # 副本变 3
```

```bash
root@node1:~/k8slab/helm# helm upgrade myapp ./myapp --set replicaCount=3
Release "myapp" has been upgraded...
root@node1:~/k8slab/helm# helm list
NAME    NAMESPACE  REVISION  UPDATED  STATUS   CHART        APP VERSION
myapp   default    2         ...      deployed myapp-0.1.0 1.16.0
root@node1:~/k8slab/helm# kubectl get deploy myapp
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
myapp   3/3     3            3           1m
```

> **观察点**：`REVISION` 变 2，`kubectl get deploy` 副本 3/3——`--set replicaCount=3` 覆盖了 values 默认值（教材 §17.2.3 的 values 优先级：`--set` > values 文件 > 默认值）。

回滚

```bash
helm history myapp
helm rollback myapp 1
helm history myapp
kubectl get deploy myapp   # 副本回到 1
```

```bash
root@node1:~/k8slab/helm# helm history myapp
REVISION UPDATED  STATUS     CHART         APP VERSION  DESCRIPTION
1        ...      superseded myapp-0.1.0  1.16.0       Install complete
2        ...      superseded myapp-0.1.0  1.16.0       Upgrade complete
root@node1:~/k8slab/helm# helm rollback myapp 1
Rollback was a success!
root@node1:~/k8slab/helm# kubectl get deploy myapp
NAME    READY   UP-TO-DATE   AVAILABLE   AGE
myapp   1/1     1            1           3m
```

> **观察点**（回滚机制，教材 §17.2.5）：`helm history` 显示两次变更历史；`rollback myapp 1` 回到 revision 1——`kubectl get deploy` 副本回到 1。**升级出问题，一条命令回滚整个应用包**（对比第 5 章 `kubectl rollout undo` 的资源级回滚，Helm 是应用级回滚）。

**清理**

```bash
helm uninstall myapp
helm list
```

> 说明：`helm uninstall` 删除该 Release 创建的全部资源（Deployment/Service 等连带删除）。

## Lab 3 values 多环境 + Kustomize（推荐）

> **目标**：用 values 文件实现 dev/prod 多环境部署，并体验 Kustomize 的 base/overlay 定制。
> **验证概念**：**一套 Chart 跑所有环境**（教材 §17.4.2）——`-f values-prod.yaml` 覆盖默认值；**Kustomize** 是另一条路线：base + overlay 覆盖，`kubectl apply -k` 直接应用（教材 §17.3）。

准备多环境 values 文件

```bash
cat > myapp/values-dev.yaml <<'EOF'
replicaCount: 1
service:
  type: ClusterIP
EOF
cat > myapp/values-prod.yaml <<'EOF'
replicaCount: 3
service:
  type: NodePort
EOF
helm install myapp-dev ./myapp -f myapp/values-dev.yaml
helm install myapp-prod ./myapp -f myapp/values-prod.yaml
kubectl get deploy,svc | grep myapp
```

```bash
root@node1:~/k8slab/helm# kubectl get deploy,svc | grep myapp
deployment.apps/myapp-dev    1/1    ...   1
deployment.apps/myapp-prod   3/3    ...   3
service/myapp-dev            ClusterIP  10.96.x.x  ...
service/myapp-prod           NodePort   10.96.x.x  80:3xxxx/TCP
```

> **观察点**：同一 Chart 装了**两个 Release**（myapp-dev/myapp-prod）——dev 1 副本 ClusterIP、prod 3 副本 NodePort——**环境差异全部由 values 文件表达**（教材 §17.4.2 的"一套 Chart 跑所有环境"）。

Kustomize 体验（base + overlay）

```bash
mkdir -p kustomize-demo/base kustomize-demo/overlays/prod
kubectl create deployment kz-web --image=nginx --dry-run=client -o yaml > kustomize-demo/base/deployment.yaml
cat > kustomize-demo/base/kustomization.yaml <<'EOF'
resources:
- deployment.yaml
EOF
cat > kustomize-demo/overlays/prod/kustomization.yaml <<'EOF'
resources:
- ../../base
replicas:
- name: kz-web
  count: 3
EOF
kubectl apply -k kustomize-demo/overlays/prod
kubectl get deploy kz-web
```

```bash
root@node1:~/k8slab/helm# kubectl apply -k kustomize-demo/overlays/prod
deployment.apps/kz-web created
root@node1:~/k8slab/helm# kubectl get deploy kz-web
NAME     READY   UP-TO-DATE   AVAILABLE   AGE
kz-web   3/3     3            3           10s
```

> **配置要点**（Kustomize，教材 §17.3）：
> - `base/kustomization.yaml` 声明"包含哪些标准资源"（一份 base）
> - `overlays/prod/kustomization.yaml` 声明"基于 base + 差异补丁"（`replicas` 覆盖副本数）
> - `kubectl apply -k`（k 即 kustomize）直接渲染并应用——**无模板语言，base + 差异**（对比 Helm 的模板 + values）
> - 与 Helm 的定位差异（教材 §17.3.3）：**装第三方/发布应用包用 Helm；自己项目多环境定制用 Kustomize**

**清理**

```bash
helm uninstall myapp-dev myapp-prod
kubectl delete -k kustomize-demo/overlays/prod
rm -rf kustomize-demo
```

## 本章小结

本章通过 3 个实验，掌握了企业级应用交付工具链：Helm（打包与发布）与 Kustomize（环境定制）：

| 实验 | 验证的知识点 | 关键命令/概念 | 级别 |
|---|---|---|---|
| Lab 1 认识 Chart 结构并打包 | Chart 目录结构；模板 + values 渲染原理；打包 | `helm create/package/template`、`{{ .Values.xxx }}` | 必做 |
| Lab 2 install/upgrade/rollback | Release 生命周期；revision 机制与回滚 | `helm install/upgrade/rollback/history/list/uninstall`、`--set` | 必做 |
| Lab 3 values 多环境 + Kustomize | 一套 Chart 跑所有环境；base/overlay 定制 | `-f values-prod.yaml`、`kubectl apply -k` | 推荐 |

**核心认知**：
1. **Chart = 模板 + 默认值**：`templates/` 写结构、`values.yaml` 写变化——`helm template` 先渲染后安装是排障利器
2. **Release 有 revision**：install=rev1、upgrade=rev2、rollback 一键回——**应用级回滚**（对比第 5 章资源级 rollout）
3. **values 优先级**：`--set` > `-f` 文件 > 默认值
4. **Helm vs Kustomize**：分发/装第三方 → Helm；项目内多环境 → Kustomize（`apply -k`，无模板语言）
5. **与教材衔接**：ch17 的 Chart 模型/CI 流水线/多环境发布在此落地；实验 09 Lab 6（dashboard）是 Helm 装第三方应用的实例

**与后续章节的衔接**：
- Chart 打包/发布 → 教材 ch17 §17.4 企业发布流程（CI/CD + 私有仓库）
- 模板渲染 → 教材 ch18 的 CRD/Operator 展望（Helm 装的是资源，Operator 管的是运维逻辑）
- 回滚机制 → 第 5 章 Deployment revision 的对照复习


---


# 生产可观测性（可选·进阶）

> 前置条件：已完成实验 01 部署的 3 节点集群；已掌握实验 13（Helm）基本操作；本实验对应**教材第 15 章（可观测性）**。
> **本实验整体为「可选·进阶」**：需要安装额外组件（Prometheus/Grafana/Loki），资源占用较大，进阶学员选做；核心概念（三支柱）已在实验 05/10 通过 metrics-server 与排障三板斧验证，本实验补齐**生产级监控与日志收集**。

| Lab | 主题 | 级别 |
|---|---|---|
| Lab 1 安装 Prometheus + Grafana | kube-prometheus-stack（Helm）一键装；指标抓取验证 | 可选·进阶 |
| Lab 2 ServiceMonitor 与 PromQL | 自定义指标采集声明；rate() 典型查询 | 可选·进阶 |
| Lab 3 日志收集（DaemonSet 模式） | filebeat 每节点采集；收集模式验证 | 可选·进阶 |

## Lab 1 安装 Prometheus + Grafana

> **目标**：用 Helm 安装 kube-prometheus-stack（Prometheus + Grafana + Alertmanager 一体），验证集群指标被采集。
> **验证概念**：教材 §15.2.2 的 Prometheus 体系落地——**主动抓取**（scrape）各指标源；Grafana 提供可视化大盘；Helm（实验 13）是安装方式。

安装（版本以官方 release 为准）

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set prometheus.prometheusSpec.replicas=1 \
  --set alertmanager.alertmanagerSpec.replicas=1 \
  --set grafana.replicas=1
kubectl get pods -n monitoring
```

> ⚠️ **国内网络实测经验**：
> - `helm repo add` 拉 index.yaml 可能长时间卡住（index 几十 MB）——可改从 GitHub Releases 直接下载 chart 包安装：`curl -fsSL -o kps.tgz https://ghfast.top/https://github.com/prometheus-community/helm-charts/releases/download/kube-prometheus-stack-69.8.2/kube-prometheus-stack-69.8.2.tgz`（版本号以 releases 页为准），再 `helm install kube-prometheus-stack ./kps.tgz --namespace monitoring ...`
> - **kube-state-metrics 镜像在 registry.k8s.io**（国内拉不动）：要么按实验 01 的 containerd 加速/预拉方案处理，要么先禁用：`--set kubeStateMetrics.enabled=false`（它只是"集群对象状态指标"，不影响核心监控）
> - **kubeEtcd 监控默认开启但本环境 etcd 未暴露 metrics**：加 `--set kubeEtcd.enabled=false`（否则 servicemonitor 渲染报错或空抓取）
> - 若报 `spec.maximumStartupDurationSeconds: 0 应 >= 60`：加 `--set prometheus.prometheusSpec.maximumStartupDurationSeconds=600`
> - 验证要点：`kubectl -n monitoring exec prometheus-kube-prometheus-stack-prometheus-0 -- wget -q -T 5 -O - "http://localhost:9090/api/v1/query?query=count(up)"`——返回 `25` 左右 = 全部抓取目标正常（实测 3 节点环境 25 个 up）

```bash
root@node1:~/k8slab/obs# kubectl get pods -n monitoring
NAME                                                     READY   STATUS    RESTARTS   AGE
alertmanager-kube-prometheus-stack-alertmanager-0        2/2     Running   0          2m
kube-prometheus-stack-grafana-5f7d9c77d9-xxxxx           3/3     Running   0          2m
kube-prometheus-stack-kube-state-metrics-xxx             1/1     Running   0          2m
kube-prometheus-stack-prometheus-node-exporter-xxxxx     1/1     Running   0          2m   # 每节点一个
prometheus-kube-prometheus-stack-prometheus-0            2/2     Running   0          2m
```

> **观察点**（对照教材 §15.2.2 架构图）：`prometheus-0`（时序库 + PromQL）、`grafana`（展示）、`alertmanager`（告警）、`node-exporter`（每节点一个，DaemonSet——第 5 章知识）——**一套 Helm Chart 装齐整个监控体系**（实验 13 的 Helm 价值）。

访问 Grafana

```bash
kubectl -n monitoring get svc | grep grafana
kubectl -n monitoring port-forward svc/kube-prometheus-stack-grafana 3000:80 &
# 浏览器打开 http://localhost:3000（默认账号 admin / prom-operator）
```

> **观察点**：Grafana 默认带 Kubernetes 大盘（节点 CPU/内存/网络）——**数据来自 Prometheus 对 kubelet 等指标源的抓取**。`port-forward` 是访问集群内服务的最简方式（第 9 章知识）。

**清理**

```bash
helm uninstall kube-prometheus-stack -n monitoring
kubectl delete ns monitoring
```

> 说明：后续 Lab 需要本 Lab 组件，**做 Lab 2/3 前不要清理**；全部完成后统一卸载。

## Lab 2 ServiceMonitor 与 PromQL

> **目标**：让 Prometheus 采集一个应用的指标，并用 PromQL 查询。
> **验证概念**：教材 §15.2.3——Prometheus Operator 用 **ServiceMonitor** 声明"抓哪些服务的 /metrics"；PromQL 的 `rate()` 处理计数器指标。

部署带指标的应用

```bash
kubectl create deployment demo-app --image=nginx --replicas=2
kubectl expose deployment demo-app --port=80 --target-port=80
```

创建 ServiceMonitor（声明抓取 demo-app）

```bash
cat > demo-servicemonitor.yaml <<'EOF'
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: demo-app
spec:
  selector:
    matchLabels:
      app: demo-app        # 选 Service
  endpoints:
  - port: http             # Service 端口名
    path: /metrics         # nginx 的 stub_status 可配 /metrics（此处演示声明方式）
EOF
kubectl apply -f demo-servicemonitor.yaml
kubectl get servicemonitor -n default
```

> **配置要点**（ServiceMonitor，教材 §15.2.3）：`selector.matchLabels` 选目标 Service、`endpoints.port` 指定指标端口、`path` 指定指标路径——**Prometheus Operator 看到 ServiceMonitor 就自动把它加入抓取配置**（第 17 章 Helm 装的 operator 帮你做了配置管理）。

PromQL 查询（Prometheus UI）

```bash
kubectl -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090 &
# 浏览器打开 http://localhost:9090，在查询框输入：
#   1. rate(node_cpu_seconds_total{mode="idle"}[5m])   → 节点 CPU idle 速率
#   2. sum(rate(node_cpu_seconds_total[5m])) by (instance) → 各节点 CPU 使用率
```

> **观察点**（PromQL 极简，教材 §15.2.3）：`rate(x[5m])` 是**计数器指标**（只增不减，如 cpu_seconds_total）的标准处理——换算成"每秒增量"；`by (instance)` 按节点聚合。**会写这两条，就掌握了 PromQL 的核心套路**。

**清理**

```bash
kubectl delete servicemonitor demo-app
kubectl delete deployment demo-app
kubectl delete svc demo-app
```

## Lab 3 日志收集（DaemonSet 模式）

> **目标**：用 filebeat DaemonSet 演示"每节点一个采集器"的日志收集模式。
> **验证概念**：教材 §15.3.3 模式一（daemonset 收集）——**每个节点一个日志采集 Pod，读该节点所有容器日志**（/var/log/containers/），发送到集中后端；应用无感知（不用改应用）。

部署 filebeat DaemonSet（简化版：输出到日志验证采集）

```bash
cat > filebeat-ds.yaml <<'EOF'
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: filebeat
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: filebeat
  template:
    metadata:
      labels:
        app: filebeat
    spec:
      containers:
      - name: filebeat
        image: docker.elastic.co/beats/filebeat:8.13.0
        args: ["-e", "-E", "output.console.pretty=false"]
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
EOF
kubectl apply -f filebeat-ds.yaml
kubectl get pods -n kube-system | grep filebeat
kubectl logs -n kube-system ds/filebeat --tail=5
```

```bash
root@node1:~/k8slab/obs# kubectl get pods -n kube-system | grep filebeat
filebeat-9zq4p   1/1   Running   0   30s   node1
filebeat-k2m7x   1/1   Running   0   30s   node2
filebeat-xx3y9   1/1   Running   0   30s   node3
```

> **观察点**（收集模式，教材 §15.3.3）：**每节点恰好一个 filebeat**（DaemonSet 按节点分布，第 5 章知识）——它读取该节点 `/var/log/containers/` 下所有容器的日志文件。**生产里把 output 指向 ES/Loki 就完成集中收集**；本实验演示"采集器 + 模式"，完整链路（Loki/ES）属进阶。

**清理**

```bash
kubectl delete -f filebeat-ds.yaml
```

## 本章小结

本章通过 3 个可选实验，补齐了教材第 15 章的生产级可观测性实操：

| 实验 | 验证的知识点 | 关键命令/概念 | 级别 |
|---|---|---|---|
| Lab 1 安装 Prometheus + Grafana | kube-prometheus-stack 一键装；抓取模型；Grafana 大盘 | `helm upgrade --install`、node-exporter DaemonSet | 可选·进阶 |
| Lab 2 ServiceMonitor 与 PromQL | 声明式抓取配置；rate() 查询 | `ServiceMonitor`、`rate(x[5m])`、`by (instance)` | 可选·进阶 |
| Lab 3 日志收集（DaemonSet 模式） | 每节点采集器模式；/var/log/containers | DaemonSet + hostPath、filebeat | 可选·进阶 |

**核心认知**：
1. **生产监控 = 采集 + 存储 + 告警 + 展示**：kube-prometheus-stack 一个 Chart 全包（Helm 的价值）
2. **ServiceMonitor 是声明式抓取**：应用只需暴露 /metrics，operator 自动接入
3. **PromQL 核心套路**：计数器用 `rate()`、按维度 `by ()` 聚合
4. **日志收集默认 daemonset 模式**：每节点一个采集器，应用零改造（教材 §15.3.3）
5. **与教材衔接**：ch15 三支柱（指标/日志/事件）中，指标与日志的生产级实现在此落地；事件已在实验 10 三板斧验证

**与后续章节的衔接**：
- 指标/告警 → 教材 ch16 排障与 ch14 运维日历（告警巡检是每日动作）
- 日志收集 → 教材 ch13 审计日志（audit 日志同样走集中管道）
- 监控体系 → 教材 ch17 Helm（本实验就是 Helm 装复杂系统的实例）


---


## 附录：实验镜像清单与国内下载指引

# 实验镜像清单与国内下载指引

> 用途：授课/环境准备时对照本表预拉镜像；标注了每个镜像的下载难度与国内可拉方案（2026-08 在 3 节点阿里云环境逐镜像实测）。
> 原则：**除两个标注"受限"的镜像外，其余在国内均可正常拉取**（docker.io 系走 containerd 加速配置，见实验 01 步骤 3；registry.k8s.io 走阿里云 google_containers；quay.io 走 daocloud 加速）。

## 一、镜像难度总览

| 难度 | 含义 | 镜像 |
|---|---|---|
| ✅ 可拉 | docker.io 主流镜像，配了加速即可 | busybox、nginx（1.25/1.26/1.27/latest）、mysql:5.7、wordpress:php8.2-apache、redis:7、ubuntu、memcached、registry:2、netshoot、ubuntu-bc、perl |
| 🟡 需配置 | 非 docker.io 源，需按实验 01 的加速方案 | registry.k8s.io 控制面全家（kube-apiserver 等）、calico、metrics-server、ingress-nginx、coredns、etcd、pause、local-path、dashboard、quay.io 监控系（prometheus/grafana/alertmanager/node-exporter） |
| 🔴 受限 | 实测国内公共渠道拉不动 | `nginx:1.7.9`（已弃用，03 章改用 1.25→1.26→1.27 链）、`ghcr.io/kedacore/*`（KEDA，可选实验，可跳过） |

## 二、按实验分组的镜像清单

### 实验 01 集群安装（必做）
| 镜像 | 来源 | 难度 | 说明 |
|---|---|---|---|
| kube-apiserver / kube-controller-manager / kube-scheduler / kube-proxy / pause | registry.k8s.io | 🟡 | 阿里云 `registry.aliyuncs.com/google_containers` 替代（01 章已教） |
| etcd | registry.k8s.io | 🟡 | 同上 |
| coredns | registry.k8s.io | 🟡 | 同上 |
| calico/cni、calico/node、calico/kube-controllers | docker.io/calico | ✅ | 或 quay.io/calico（daocloud 加速） |
| metrics-server | registry.k8s.io/metrics-server | 🟡 | 阿里云替代或 docker.io 镜像 |
| ingress-nginx-controller、kube-webhook-certgen | registry.k8s.io/ingress-nginx | 🟡 | 用 dyrnq 镜像或阿里云替代（07 章已教） |
| rancher/local-path-provisioner | docker.io | ✅ | 08 章 |
| busybox | docker.io/library | ✅ | 全程通用 |

### 实验 02 Pod（12 Lab，必做为主）
busybox、nginx、memcached、redis —— 全部 ✅ docker.io

### 实验 03 工作负载调度（8 Lab）
- nginx:1.25 / nginx:1.26 / nginx:1.27 —— ✅（升级链演示，**2026-08 从 1.7.9/1.8/1.9.1 更换**，老镜像公共渠道拉不动）
- resouer/ubuntu-bc（Job pi 计算）—— ✅（实测 1panel 可拉）
- nginx:latest、nginx:1.16.0 —— ✅

### 实验 04 资源调度（9 Lab）
nginx —— ✅

### 实验 05 性能与监控（6 Lab）
busybox、redis:7 —— ✅；**KEDA（ghcr.io）—— 🔴 可选·进阶，可跳过**

### 实验 06 ConfigMap/Secret（8 Lab）
busybox、mysql:5.7、registry:2（本地私有仓库实验）—— ✅

### 实验 07 网络与服务（7 Lab）
busybox、busybox:1.28、nginx —— ✅；ingress-nginx（见 01）

### 实验 08 存储（7 Lab）
busybox、nginx、mysql:5.7 —— ✅

### 实验 09 认证与授权（12 Lab）
nginx、busybox、kubernetesui/dashboard + kubernetesui/metrics-scraper（Lab 6）—— ✅ docker.io

### 实验 10 故障排查（8 Lab）
busybox、nginx:1.27、nginx:notexist（故意写错的 tag，用于排障演示，**不要预拉**）、ubuntu、nicolaka/netshoot —— ✅（netshoot 实测 daocloud 加速可拉）

### 实验 11 WordPress 综合（6 Lab）
wordpress:php8.2-apache、mysql:5.7、nginx —— ✅

### 实验 12 集群维护（4 Lab）
nginx —— ✅

### 实验 13 Helm 交付（3 Lab）
nginx（helm create 骨架默认值）—— ✅

### 实验 14 可观测性（3 Lab，可选·进阶）
| 镜像 | 来源 | 难度 | 说明 |
|---|---|---|---|
| quay.io/prometheus/prometheus、alertmanager、node-exporter | quay.io | 🟡 | daocloud 加速（quay.m.daocloud.io），14 章已注记 |
| grafana/grafana | docker.io | ✅ | |
| registry.k8s.io/kube-state-metrics、ingress-nginx/kube-webhook-certgen | registry.k8s.io 子路径 | 🔴 | 14 章注记：禁用 kubeStateMetrics 或预拉替代 |
| docker.elastic.co/beats/filebeat | docker.elastic.co | 🟡 | 实测可拉（无加速也通），无保障时预拉一次 |

## 三、预拉/离线准备建议

1. **不需要离线包**：除 nginx:1.7.9（已弃用）和 KEDA（可选跳过）外，全部镜像国内可拉。
2. **授课前预拉**：在每台节点上按本表把 ✅/🟡 镜像 `crictl pull` 一遍（一条 for 循环即可），上课时零等待。
3. **可选实验镜像**（Prometheus 全套、filebeat）按需预拉；KEDA 跳过。
4. `nginx:notexist` 是排障演示用假 tag——**不要预拉**，否则演示"拉不到镜像"的效果就没了。

> 配套：containerd 加速配置（hosts.toml：docker.io→1panel/daocloud、registry.k8s.io→阿里云、quay.io→daocloud）见实验 01 步骤 3 与 14 章注记。

