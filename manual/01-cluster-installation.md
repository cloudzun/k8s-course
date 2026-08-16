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
