# 第 19 章 CKA 考试指南

> 配套资源：全书 18 章教材 + 实验 01-12（手册）。本章是**备考冲刺**——把前 17 章的知识转化为考试能力：考试形式、五大域考点浓缩、时间与操作技巧、常见陷阱、备考路线图。**CKA 是实操考试——会做比会背重要，本章的所有技巧都建立在前面章节的动手基础上**。

## 学习目标

学完本章，你应该能够：

1. 说出 CKA 的考试形式与规则（时长/题型/环境/评分）
2. 按五大域列出考点浓缩清单（命令/机制/对应章节）
3. 掌握考试中的效率技巧（dry-run 生成 yaml、上下文切换、时间分配）
4. 识别 v1.36 的语法差异与高频易错点
5. 制定自己的备考路线图并执行模拟演练

---

## 19.1 考试概览

### 19.1.1 考试形式

| 项目 | 说明 |
|---|---|
| 形式 | **在线实操**（真实集群终端，不是选择题） |
| 时长 | **2 小时**（约 15-20 道题，每题一个集群场景） |
| 环境 | 浏览器内终端 + 多个预置集群（不同 context） |
| 网络 | **无外网**（镜像/文档都取不到——靠记忆和命令补全） |
| 评分 | 按操作结果（对象是否正确创建/配置）——**部分得分** |

### 19.1.2 考试环境要点（提前适应）

- **多集群**：考试提供多个集群，每题开头会给 `kubectl config use-context <xxx>`——**切换上下文是第一动作**（答错集群 = 白做）
- **kubectl 补全**：默认可用（`kubectl` 命令补全已配置）——记住资源类型名即可
- **编辑器**：vi/nano 可用（yaml 手写要快）
- **无外网**：不能用在线文档——**`kubectl explain` 和 `kubectl explain` 是唯一字典**（第 2 章就强调过）

### 19.1.3 评分思路

- 每题按"期望对象是否达标"给分（如 Deployment 副本数/标签/探针）——**partial credit 存在，做一半有一半分**
- **先做会做的**：2 小时 17 题，每题平均 7 分钟——卡住 5 分钟就跳过（时间策略 §19.3.1）

---

## 19.2 五大域考点浓缩（全书速查）

### 域 1：集群架构、安装与配置（25%）

| 考点 | 关键命令/机制 | 教材/实验 |
|---|---|---|
| 组件职责与通信 | apiserver 唯一入口、etcd 状态存储、kubelet 心跳 | 第 2 章/第 3 章 |
| kubeadm 流程 | `kubeadm init/join`、token 续发（`kubeadm init/join`） | 第 3 章/实验 01 |
| **etcd 备份恢复** | `etcdctl snapshot save/status/restore`（**必考实操**） | 第 14 章/实验 12 |
| 证书 | `kubeadm certs check-expiration/renew` | 第 13 章/实验 09 |
| 升级 | `kubeadm upgrade plan/apply`、worker 逐台 | 第 14 章/实验 12 |
| 节点管理 | `cordon/drain/uncordon`、PDB | 第 6 章/第 14 章 |
| RBAC | `kubectl create role/clusterrole/rolebinding/clusterrolebinding` | 第 11 章/实验 09 |
| 静态加密 | EncryptionConfiguration（aescbc/identity） | 第 13 章/实验 09 |

### 域 2：工作负载与调度（15%）

| 考点 | 关键命令/机制 | 教材/实验 |
|---|---|---|
| Pod 配置 | 探针三件套、resources、restartPolicy、imagePullPolicy | 第 4 章/实验 02 |
| 控制器 | Deployment 滚动更新/回滚（`rollout status/undo`）、STS/DS/Job/CronJob | 第 5 章/实验 03 |
| 调度 | nodeSelector、亲和（required/preferred）、污点容忍（三种 effect）、PDB | 第 6 章/实验 04 |
| HPA | `kubectl autoscale --cpu=60% --min --max` | 第 7 章/实验 05 |

### 域 3：服务与网络（20%）

| 考点 | 关键命令/机制 | 教材/实验 |
|---|---|---|
| Service | expose、类型（ClusterIP/NodePort/headless）、Endpoints | 第 9 章/实验 07 |
| Ingress | host/path 规则、TLS（tls Secret）、ingressClassName | 第 9 章/实验 07 |
| NetworkPolicy | podSelector/ipBlock、ingress/egress、**放行 DNS** | 第 9 章/实验 07 |
| DNS | `svc.ns.svc` 解析、nslookup | 第 9 章 |

### 域 4：存储（10%）

| 考点 | 关键命令/机制 | 教材/实验 |
|---|---|---|
| PV/PVC | 静态绑定（容量/访问模式/SC 匹配）、`storageClassName: ""` | 第 10 章/实验 08 |
| StorageClass | provisioner、默认类、WaitForFirstConsumer | 第 10 章/实验 08 |
| 卷 | emptyDir/hostPath 的边界 | 第 10 章/实验 08 |

### 域 5：故障排查（30%——**第一重**）

| 考点 | 关键命令/机制 | 教材/实验 |
|---|---|---|
| 三板斧 | describe（Events）/logs（--previous）/events | 第 15 章/第 16 章/实验 10 |
| 典型故障 | CrashLoop（退出码）、ImagePullBackOff、NotReady（kubelet）、Service/DNS、PVC、Forbidden | 第 16 章/实验 10 |
| 排障纪律 | 报错即答案、先恢复再排查、一次只改一个 | 第 16 章 |

> **备考重心**：域 5（30%）+ 域 1（25%）= 55%——**实验 10 与实验 01/12 的实操价值最高**。

---

## 19.3 考试技巧

### 19.3.1 时间管理

- **先易后难**：快速扫一遍题目，先做有把握的（拿分再说），难题最后啃
- **每题限时**：平均 7 分钟；卡住 5 分钟 → 标记跳过，回头再补（部分得分也好过全丢）
- **留 15 分钟复查**：检查每题的对象是否创建成功（`kubectl get` 扫一遍）

### 19.3.2 kubectl 效率技巧（核心）

**dry-run 生成 yaml 骨架**（考试最省时的技巧）：

```bash
# 生成 yaml 再改（比手写快且不易错）
kubectl create deployment web --image=nginx --dry-run=client -o yaml > web.yaml
kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml
kubectl create job myjob --image=busybox --dry-run=client -o yaml > job.yaml

# 改完应用
kubectl apply -f web.yaml
```

**别名与补全**（考试环境默认配置好）：

```bash
alias k=kubectl        # 考试环境通常已配；没有就自己配
kubectl get pods -o wide    # 高信息量输出
```

**写 yaml 查字段**：

```bash
kubectl explain pod.spec.containers.livenessProbe   # 字典（无外网时的唯一参考）
```

**jsonpath 速查**（CKA 常考 1-2 题要求提取字段）：

```bash
# 提取节点内部 IP：kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'
kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'

# 提取所有 Pod 名：-o jsonpath='{.items[*].metadata.name}'
kubectl get pods -o jsonpath='{.items[*].metadata.name}'

# 带格式的常用组合：jsonpath + -o wide 互补；记不住复杂表达式就用
#   kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName
kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName
```

> jsonpath 记忆要点：`{.items[*].<字段路径>}` 是遍历列表的标准写法；`{.items[*].<字段路径>}` 先看全量结构再挑路径；custom-columns 是提取多列的轻量替代。

**tmux 终端复用**（分屏操作，考试利器）：

```bash
# 考试终端若支持 tmux：Ctrl+B 后按 % 左右分屏 / " 上下分屏
# 左屏敲命令、右屏看 yaml——不用反复切换
```

### 19.3.3 上下文切换（每题的"第一动作"）

```bash
kubectl config get-contexts                  # 看有哪些集群
kubectl config use-context <题目指定的>       # 切到目标集群
kubectl get nodes                            # 确认切对了（验证）
```

> **答错集群 = 白做**——养成"每题开头切换 + 验证"的习惯。

### 19.3.4 保存进度

- **apply 后立即验证**：`kubectl get <对象>` 确认创建成功（尤其 RBAC/Ingress 这类容易静默失败的）
- 修改类操作（scale/set image）后验证结果（`get pods` 数量/镜像）
- 删除类操作确认已删除（`get` 无结果）

---

## 19.4 常见陷阱

### 19.4.1 v1.36 语法差异（本课程基线实测）

| 旧习惯（教程常见） | v1.36 正确做法 | 后果 |
|---|---|---|
| `kubectl exec -it pod bash` | `kubectl exec -it pod bash` | **必须 `kubectl exec -it pod bash` 分隔** |
| `kubectl autoscale --cpu-percent=50` | `kubectl autoscale --cpu-percent=50` | `kubectl autoscale --cpu-percent=50` 已弃用（告警但可用） |
| `kubectl run --requests/--limits` | **不支持**（yaml 唯一方式） | unknown flag |
| 找 SA token：describe secret | `kubectl create token <sa>` | v1.24+ 无长期 token |
| `kubectl run` 创建 Deployment | `kubectl run` | 语义更准确 |

### 19.4.2 配置易错点（考试高频扣分项）

1. **selector 与标签不匹配**：Deployment/Service 的 selector 与 Pod 标签必须一致——**Service 后端为空（Endpoints 空）的根因**
2. **命名空间**：创建对象没带 `-n` → 建到 default（题目可能要求别的命名空间）
3. **apiGroups 写错**：核心组是 `""` 不是 `""`（RBAC 题）
4. **RBAC 范围**：RoleBinding vs ClusterRoleBinding（题目要求"命名空间内"还是"全集群"）
5. **探针忘配 readiness**：滚动更新/Service 相关题的关键
6. **镜像名**：题目给的镜像名照抄（`nginx:1.27` vs `nginx:1.27`——tag 影响拉取策略）
7. **PVC 忘写 storageClassName**：有默认 SC 时走动态供应（题目可能要求静态绑定）

### 19.4.3 心理与操作

- **不要慌**：报错先读（报错即答案，第 16 章）；`kubectl describe` 是万能排障
- **多集群别串**：每题的 context 切换是纪律
- **保存不丢**：yaml 文件放当前目录即可（不需要提交什么，对象在集群里就计分）

---

## 19.5 备考路线图（考前 4-6 周）

```text
阶段一（2 周）：体系建立
   教材 第 1-16 章 通读 + 实验 01-12 全部亲手做一遍
   重点：实验 01（装集群）、实验 02（Pod）、实验 10（排障）
   → 产出：自己的"故障图谱"与"命令速查"

阶段二（1-2 周）：按域强化
   按 §19.2 五大域重刷对应实验：
   域 1 → 实验 01/09/12（etcd 备份恢复反复练）
   域 2 → 实验 02/03/04/05
   域 3 → 实验 07
   域 4 → 实验 08
   域 5 → 实验 10（+实验 02 Lab 9/实验 04 Lab 5）
   → 产出：每域 30 分钟内完成对应实验

阶段三（1 周）：模拟冲刺
   卡时间做模拟题（每题 7 分钟纪律）
   dry-run 生成 yaml 练到肌肉记忆
   考前 1-2 天：过 §19.2 速查表 + §19.4 陷阱清单
```

> **核心认知**：CKA 考的是**操作熟练度**——"会"不是"看过"，是**手速 + 正确率**。实验手册 12 个实验就是最好的题库。

---

## 19.6 模拟演练指引

- **实验 11（WordPress 综合演练）**：不看手册独立完成 = 全书实操达标
- **按域重刷**（§19.5 阶段二）的每项都计时完成
- **自测问题**：每个考点能不看教材说出"命令 + 关键参数 + 验证方式"（对照 §19.2 表格自查）
- **排障自测**：实验 10 的 5 个 Lab 重做一遍，限时 45 分钟

---

## 本章小结

- **考试形式**：2 小时实操、多集群、无外网——`kubectl explain` 是唯一字典
- **考点浓缩**：域 5（30%）+ 域 1（25%）是重心；etcd 备份恢复是必考实操
- **三大技巧**：dry-run 生成 yaml、每题先切 context、先易后难 + 留复查时间
- **陷阱清单**：v1.36 语法（`--` 分隔/create token/--cpu）、selector 匹配、apiGroups、命名空间
- **备考路线图**：体系建立 → 按域强化 → 模拟冲刺——**实验手册就是题库**

> **最后的话**：这本书的每一章、每个实验，最终都指向一个能力——**给你一个真实集群，你能把它搭起来、把应用跑上去、把问题查出来**。CKA 只是这个能力的证明。祝考试顺利。

## 思考题（自测）

1. 考试开始后第一件事是什么？（提示：不是做题）
2. 无外网环境里，写 yaml 忘了字段结构怎么办？
3. 一道 RBAC 题要求"只读 default 命名空间的 Pod 和日志"，写出完整命令序列（含验证）。
4. etcd 备份恢复的完整命令序列？（写到能背的程度）
5. 2 小时 17 题，一道题卡了 12 分钟，你怎么办？
6. 用自己的话列出 v1.36 与旧教程的 5 个语法差异。

> **CKA 考点标注**：本章即备考本身——五大域考点浓缩（§19.2）是考前的最终速查清单。
