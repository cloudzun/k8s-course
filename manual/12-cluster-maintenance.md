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
