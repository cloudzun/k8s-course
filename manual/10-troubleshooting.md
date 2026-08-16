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
