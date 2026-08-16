# 手册逐章修改记录（01-09 · v1.23 → v1.36 讲师视角改造）

> 用途：记录各章相对原始飞书文档的全部改动，供 review 对照。
> 原始基线：飞书 wiki 文档拆分后的 01-09 章 + 用户提供的 2026 实测安装文档。
> 修改周期：跨多轮完成，本文按章节汇总最终状态。

---

## 01-cluster-installation.md（重写为主）

### 结构变化
- **删除**：原「手动安装 1.23」「手动安装 1.27」「使用 sealyun 快速安装」三个旧章节（用户决策：以 2026 实测版替换）
- **新增**：「手动安装（3 节点·国内网络版）」——来自用户提供的 2026-07-22 华为云实测文档，调整为 3 节点主线
- **保留**：「使用在线沙盒」（Killercoda 版本 1.26 → **1.36**，删除旧终端输出）、「(可选) 基本操作」（分组为 5 个三级小节，修正 `kubect` 拼写）
- **新增**：「本章目标」「实验环境与时间预估」「本章验收清单」

### 教学要素（讲师视角）
| 项 | 内容 |
|---|---|
| 本章目标 | 4 条（部署 3 节点集群/理解 kubeadm 流程/国内网络镜像加速/熟悉 kubectl） |
| 环境与时长 | 3 节点规格表（node1=192.168.0.11 等约定）+ 90~120 分钟 |
| 就地纠错 | 9 处「如果失败看这里」（覆盖步骤 1-9） |
| 验收清单 | 8 项达标检查（节点就绪/系统组件/CNI/镜像链路/跨节点调度/StorageClass/kubectl/连通性） |

### 部署步骤调整（3 节点主线）
- 步骤 1-4：标注「3 台节点执行」
- 步骤 5-6：kubeadm init + kubeconfig（仅 master），INNER_IP 示例对齐 192.168.0.11
- 步骤 7：worker join（原附录 D 内容提升为正文）
- 步骤 8-10：CNI/StorageClass/验证（仅 master）
- 移除原「单节点去污点」正文步骤 → 降为附录 E

### 附录
- 附录 A/B/C：保留（加速站清单/原理/版本）
- 附录 D：改为「worker 节点一键就绪脚本」（原「新增 Worker」重定位）
- 附录 E：新增「单节点快速安装（可选）」，警示与后续章节环境不一致

---

## 02-pod.md

| 改动 | 详情 |
|---|---|
| 实验准备 | 新增（前置条件/脚本仓库/输出示例说明） |
| 版本 | `git checkout v1.23` → **v1.36**，加 v1.36 分支依赖说明 |
| 输出示例 | v1.23.0 → v1.36.2（9 处）；192.168.1.x → 192.168.0.x（38 行）；Ubuntu 20.04 → 24.04；docker:// → containerd://（13 处）；内核 5.4.0 → 6.8.0 |
| 代码块 | Bash/YAML/Plaintext → bash/yaml/text（258 处） |

---

## 03-workload-scheduling.md

| 改动 | 详情 |
|---|---|
| 实验准备 | 新增（前置条件/脚本仓库/工作目录） |
| Lab 编号 | 第二个「Lab 5 使用 DaemonSet」→ **Lab 6**（规范 §4） |
| 输出示例 | v1.23.0 → v1.36.2；IP/OS/运行时对齐 |
| 代码块 | 语言标注统一小写（97 处） |
| 镜像 | nginx:1.7.9 / resouer/ubuntu-bc 保留（教学版本对比，已确认可拉取） |
| 交叉引用 | k8slab 克隆引用改为「按 02 章实验准备」 |

---

## 04-network-and-service.md

| 改动 | 详情 |
|---|---|
| 实验准备 | 新增 |
| URL 引用 | `k8slab/v1.23` → `k8slab/v1.36`（注释行） |
| 输出示例 | IP/OS 对齐（10 行） |
| Ingress 对话残留 | 「您在创建 Kubernetes Ingress 资源时收到了一个警告…」（AI 对话口吻）→ 操作手册口吻步骤说明，更新为 ingressClassName 写法 |
| 「for 1.27」标注 | 更新为 v1.36 基线说明 |
| 备注·ingress 备用方案 | k8s.gcr.io + v1.0.0 + 个人镜像 → 官方 controller-v1.12.0 + 加速站方案 |
| 代码块 | 语言标注统一（66 处） |

---

## 05-storage.md

| 改动 | 详情 |
|---|---|
| 实验准备 | 新增（前置条件/脚本仓库/工作目录） |
| 对话残留 | 「与之前提供的配置文件相比」×3 → 直接描述当前文件 |
| Killercoda hosts | 标注为沙盒可选步骤（3 节点环境跳过），说明 node2=nfs 已在 01 章配置 |
| 输出示例 | IP/OS 对齐（5 行） |
| 代码块 | 语言标注统一（97 处） |

---

## 06-configmap-and-secret.md

| 改动 | 详情 |
|---|---|
| 实验准备 | 新增 |
| 对话残留 | 「相对于您之前提供的配置文件」×2 → 直接描述（ConfigMap 挂载 mysql-cnf + wordpress 库名） |
| 代码块 | 语言标注统一（73 处） |

---

## 07-resource-scheduling.md

| 改动 | 详情 |
|---|---|
| 实验准备 | 新增 |
| taint/label | `node-role.kubernetes.io/master` → `control-plane`（1.25+ 变更，4 处：describe 输出/提示文字/删除污点命令/全部节点命令） |
| 调度警告输出 | FailedScheduling 消息中 master taint → control-plane |
| 输出示例 | v1.23.0 → v1.36.2；IP 对齐 |
| drain 实验 | 补充 emptyDir 场景说明（--delete-emptydir-data） |
| 代码块 | 语言标注统一（88 处） |

---

## 08-authentication-and-authorization.md

| 改动 | 详情 |
|---|---|
| 实验准备 | 新增（前置条件/脚本仓库/**操作位置**：/etc/kubernetes/pki + ~/.kube） |
| SA token | `{.secrets[0].name}` 旧方式（v1.24+ 失效）→ `kubectl -n lab create token lab-sa`，保留旧版说明 |
| 输出示例 | IP/OS 对齐（12 行） |
| 代码块 | 语言标注统一（66 处） |

---

## 09-performance-and-monitoring.md

| 改动 | 详情 |
|---|---|
| 实验准备 | 新增（工作目录修复反斜杠） |
| HPA（Lab 2） | **移除已废弃的 kube-controller-manager flag**（use-rest-clients/downscale-delay/upscale-delay 在 1.26+ 移除，1.36 启动会失败）→ 直接创建 HPA；补充 `spec.behavior` 教学扩展（stabilizationWindowSeconds 等效旧版 delay） |
| HPA API | `autoscaling/v2beta2` → `autoscaling/v2`（4 处 YAML/输出）；删除废弃警告输出行 |
| AI 解释段落 | 5 处逐条解说删除/压缩为 1~2 句（HPA 参数/HPA 定义/LimitRange 定义/LimitRange 报错/ResourceQuota 定义） |
| metrics-server（Lab 1） | 镜像 `k8s.gcr.io/...v0.4.1` 失效 → 适配说明 + sed 替换 `registry.k8s.io/...v0.7.2` |
| dashboard（Lab 5） | helm 3.3.0 + incubator repo（废弃）→ 官方 helm 脚本 + 官方 chart；NodePort 暴露改为 `patch svc kubernetes-dashboard-web`（v3 多 service 架构）；token 获取改为 `kubectl create token`（v1.24+ SA 无自动 secret）；登录步骤改为浏览器说明 |
| 输出示例 | IP/OS 对齐（3 行）；svc 输出更新为 v3 多 service |
| 代码块 | 语言标注统一（94 处） |

---

## k8slab-v136-upgrade-checklist.md（新增）

仓库 v1.36 分支升级清单，精化后结论：
- **必改 2 个文件**：`perfmon/podinfo-hpa.yaml`（autoscaling/v2beta2 → v2，附完整修正内容）、`perfmon/metrics-server.yaml`（k8s.gcr.io 镜像 → registry.k8s.io v0.7.2）
- 可选升级 10 个文件（手册未引用）
- 已确认兼容 50 个文件（逐一对账）

---

## STYLE-GUIDE.md（更新）

- 基线 v1.23 → **v1.36**
- 环境约定：3 节点 node1=192.168.0.11/12/13、Ubuntu 24.04、containerd
- 兼容性处理记录（HPA v2、control-plane taint）
- 决策清单归档（A 镜像保留 / B 实录保留 / C AI 段落删除 / D 图片高亮 / E 无 README）

---

## 遗留待办（需用户操作）

1. **k8slab 仓库**：创建 v1.36 分支 + 改 2 个文件（清单已备）
2. **失效图片 review**：5 处（03×2、04×1、09×2）已高亮标记 `> ⚠️ 【失效图片·待 review】`

---

## v2.0 重构（用户决议 · 讲师视角二次改造）

### 决议内容
1. **公共基础章节**：01 章「基本操作」→「Kubectl 基础与公共操作」（kubectl 体系/yaml 语法/ns/标签/选择器/上下文），02-09 章引用之
2. **02 章瘦身**：删除 4 个死知识点（hostNetwork/hostAliases/initContainer/静态pod）；volume 并入 05、resources 并入 09、健康检查并入 03
3. **命令行化**：简单操作改 kubectl run（env/args），复杂结构保留 yaml（写入规范 §6.5）
4. **自包含**：移除 git clone/k8slab 仓库依赖，yaml 内嵌 + 官方 manifest 下载（ingress-nginx/metrics-server）；废弃升级清单
5. **版本基线**：v1.36

### 章节变化
| 章节 | 变化 |
|---|---|
| 01 | 基本操作 → 公共基础章节（6 小节：命令体系/ns/yaml/标签/Pod 操作/清理） |
| 02 | 3370→1487 行：Lab 9-16 移除（4 删 + volume/resources/健康检查并入他章）；Lab 6/7 命令行化；exec 加 `--` 分隔符 |
| 03 | 新增 Lab 3 Pod 健康检查（探针）；原 Lab 3-6 顺延为 4-7 |
| 05 | 新增 Lab 1 卷基础（hostPath/emptyDir，原 02 Lab 10/11）；原 Lab 1-4 顺延为 2-5 |
| 09 | 新增 Lab 3 Pod 资源请求与限制；原 Lab 3-5 顺延为 4-6；metrics-server 改官方下载 |
| 04 | ingress-nginx 改官方 manifest 下载；updated-ingress 补 nano 创建 |
| 全部 | 实验准备改为自包含说明，移除克隆/仓库引用 |

### 废弃
- `k8slab-v136-upgrade-checklist.md`（仓库依赖已移除）

### v2.0 后续清理（Round 15）
- 05 章卷基础：移除 `hostNetwork: false` 无意义字段（2 处）
- 03/05/09 章：迁移说明（"原在 02 章"等历史表述）改为正式教学定位
- 02 章末尾多余空行规范化
- 断链检查：无引用已删除 Lab 的残留

### v2.1 yaml 精简（用户反馈：滚雪球冗余清理）
- **问题**：02 章原为"滚雪球"式写法，yaml 越积越大（每个 Lab 叠加之前所有字段）；拆分后冗余字段残留
- **精简的 yaml**：
  - 05 章 Lab 1 `nginx-volume-hostpath.yaml`：移除 env/ports/annotations/dnsPolicy（仅保留卷+挂载+command）
  - 05 章 Lab 1 `nginx-volume-emptydir.yaml`：移除 env/ports/annotations + 混入的 hostPath 卷（只留 emptyDir）；同步修正 df 输出示例
  - 02 章 Lab 5 `nginx-imagePullPolicy.yaml`：移除 ports/hostPort（聚焦拉取策略，消除端口冲突）
  - 02 章 Lab 8 `nginx-annotation.yaml`：移除 env/ports（聚焦标签注解）
  - 09 章 `podinfo.yaml`：移除注释掉的 command 块
- **AI 段落清理**：05 章 mysql.deploy 解释（L472-501）、NFS 解释（L727-735）、PVC 解释（L836-847）、06 章 mysql.deploy 解释（L180-223）全部压缩为 1-2 句
- **保留**：mysql env/ports（运行必需）、podinfo annotations/ports/volumeMounts（应用必需）、hostPort（Lab 4 核心教学）、StatefulSet ports（探针依赖）

### v2.2 02 章二次瘦身（用户确认）
- **删除 Lab 3 定义 pod 的 DNS**（dnsPolicy: Default）：实际生产少用手动 dnsPolicy，DNS 主教学点在 04 章 Service 名称解析
- **删除 Lab 4 定义 pod 的监听端口**（hostPort）：hostPort 实际极少用，正确方式为 Service/NodePort（04 章），消除端口冲突警告
- **保留 Lab 2 多容器**（用户确认）
- 结果：8 个 Lab → 6 个（Lab 1 极简 / 2 多容器 / 3 拉取策略 / 4 env / 5 command-args / 6 标签注解），1281 行

### v2.3 公共内容提取（用户反馈）
- 02 章 Lab 1 的公共 kubectl 操作移到 01 章「Kubectl 基础与公共操作」§3：
  - `--dry-run=client -o yaml`（生成骨架）
  - `kubectl api-resources`（资源类型/简称/API 版本，83 行输出截取为示例）
  - `kubectl explain pods`（字段定义）
- 01 章新增「资源类型与字段查询」小节（含截取输出示例 + 完整写 yaml 流程说明）
- Lab 1 只保留：kubectl run 创建/查看/删除 → nano 最简 yaml → apply → curl 访问
- 02 章 1132 行（原 1281）

### v2.4 02 章逐 Lab 讲师视角重构（用户反馈）
- **每个 Lab 增加「目标 / 验证概念」开头**（6/6 全覆盖）
- **输出示例增加「观察点」标注**（12 处），明确学生重点看哪些属性：
  - Lab 1：STATUS/1-1、IP/NODE、describe 重点（Node/IP/State/Conditions/Events）、get yaml 默认值
  - Lab 2：READY 3/3、多容器共享 Pod IP
  - Lab 3：Always 拉取验证方式
  - Lab 4：宿主机 env vs 容器 env 对比、--env 注入生效
  - Lab 5：PID 1 从 nginx 变 sleep（command 覆盖生效）
  - Lab 6：labels 可选 vs annotations 不可选
- **精简冗余输出**：Lab 4 宿主机 env 长输出（LS_COLORS 等）截断为 head 示例；Lab 2 memcached --help 125 行截断为 6 行
- **Lab 1 移除与 01 章重复的 exec/logs**（01 章公共基础 §5 已有），加"见 01 章"指引
- **Lab 6 修正 describe 输出示例**（去掉旧 yaml 的 env 残留、Pending 状态）
- 修复 Lab 2 截断时产生的重复 ```bash fence（代码块闭合问题）
- 02 章最终 882 行（原 1281）

### v2.5 02 章终端输出精简（用户反馈）
- 精简 5 个超长输出块（882 → 712 行）：
  - curl nginx 欢迎页（25 → 9 行）
  - `kubectl get pods -o yaml`（110 → 26 行）：保留核心 spec 默认值展示 + status，省略 tolerations/volumes/annotations 长值
  - `describe pod nginx`（54 → 26 行）：保留 Node/IP/Containers State/Ready/Conditions/Events
  - `describe pod many-pods`（88 → 33 行）：三个容器只保留 Image/State/Ready
- 补充 Lab 2 exec 部分观察点（默认进入第一个容器 / -c redis / -c memcached）
- 修复替换产生的重复标题/重复命令块

### v2.6 02 章实验小结 + 规范更新
- 02 章末尾新增「本章小结」：表格总结 6 个 Lab 验证的知识点 + 4 条核心认知 + 与后续章节衔接
- STYLE-GUIDE §2 章节骨架模板更新：新增「实验准备」「目标/验证概念」「观察点」「本章小结」为强制结构；移除已废弃的 k8slab 仓库引用
- 后续章节（03-09）将按新模板补「本章小结」

### v2.7 03 章按骨架规范调整
- 7 个 Lab 全部补「目标 / 验证概念」开头（原仅 Lab 3 有）
- 关键输出补「观察点」10 处：
  - Lab 1：get deployment 表格含义（READY/UP-TO-DATE/AVAILABLE）、scale 后副本变化
  - Lab 2：rollout history 版本、回滚后 IMAGES 变化
  - Lab 3：探针配置查看、Unhealthy 事件
  - Lab 4：StatefulSet 稳定有序命名（webserver-0/1/2）
  - Lab 5：Job Pod 状态 ContainerCreating → Completed
  - Lab 6：CronJob 每分钟生成 Job、SCHEDULE 列
  - Lab 7：DaemonSet 每节点一个、master 污点说明
- 结尾新增「本章小结」：7 Lab 知识点表 + 4 条核心认知 + 后续衔接

### v2.8 03 章 describe/超长输出精简（用户反馈）
- `describe deployment webserver`（33→18行）：保留 Replicas/Strategy/Conditions/NewReplicaSet/Events，补观察点
- `get deployment -o yaml`（72→27行）：保留核心 spec（strategy 默认值展示），补观察点
- `describe sts webserver`（29→17行）：保留 Replicas/Pods Status/Events，补观察点
- `describe jobs/pi`（35→15行）：保留 Parallelism/Completions/Duration/Pods Statuses，补观察点
- 滚动更新 `get pod -o wide -w`（40→12行）：保留新旧版本并存的关键快照，补观察点
- 修复 describe 精简后遗漏的命令块引导（"查看 deployment 的 yaml 定义"）
- 03 章最终 1141 行，观察点 15 处

### v2.9 03 章 watch 说明 + 图片清理（用户反馈）
- 5 组 `kubectl get pod -o wide -w` 全部补「-w 参数说明」（持续监听、Ctrl+C 退出）+ 引导文字
- 为原先无观察点的 2 组补观察点：
  - Lab 2 滚动更新：新旧版本 Pod 状态迁移（Terminating/ContainerCreating→Running）
  - Lab 4 StatefulSet 更新：逆序逐个更新（webserver-2→1→0），与 Deployment 不同
- 删除 2 处失效图片标记（「待 review」提示 + 图片引用，用户决定不配图）

### v2.10 03 章 get/describe/explain 输出全量审计（用户明确要求）
- 全量审计所有 get/describe/explain 输出块，补齐最后 6 处观察点：
  - get pod（Lab 1 Pod 命名规则/自愈验证/副本 5 个）
  - get deployment（Lab 2 初始 6/6、升级后 IMAGES 变化）
  - get sts（3/3 就绪）
  - get jobs（COMPLETIONS 1/1）
  - get pod（CronJob hello Pod Completed）
- 精简输出：explain cronjob（34→13行）、rollout history --revision（28→15行）、logs pi（17→5行）
- 修复 1 处数据损坏（get pod 输出 NAME 列被 killercoda URL 污染）
- 删除「如下图所示」图片残留文字
- 03 章最终：get/describe/explain 输出 100% 有观察点（28 处），无图片残留

### v2.11 03 章 nano yaml 配置要点解释（用户反馈）
- 8 个 nano 创建的配置文件全部补「配置要点」解释块：
  - deployment.yaml：replicas/selector/template/strategy 结构 + template 与 selector 标签匹配原则
  - webserver-strategy.yaml：RollingUpdate 的 maxUnavailable/maxSurge 含义 + 两种策略对比（先删后建 vs 先建后删）
  - nginx-healthcheck.yaml：探针通用参数（initialDelay/period/timeout/failureThreshold）+ 三种探测方式
  - webserver.yaml（StatefulSet）：serviceName 必填、无 strategy、稳定有序标识
  - job.yaml：restartPolicy 必须 Never/OnFailure、backoffLimit、跑完即结束
  - cronjob.yaml：schedule cron 表达式、jobTemplate 嵌套、OnFailure
  - katacoda-daemonsets.yaml：无 replicas、每节点一个、典型用途
- 03 章最终 1159 行：目标 7/验证 7/观察点 28/配置要点 8

### v2.12 教学结构模式固化 + 02 章升级（用户反馈）
- **STYLE-GUIDE §2 重构**：定义「完整教学结构六要素」为强制标准——
  - Lab 内：①目标 → ②验证概念 → ③配置要点（nano yaml 逐字段解释）→ ④观察点（get/describe/explain 输出必配）→ ⑤清理
  - 章节级：⑥本章小结
  - §2.3 强制矩阵表明确每要素的强制程度
- **02 章按六要素升级**：
  - 补 3 个 nano yaml 的「配置要点」：many-pods（多容器并列）、nginx-imagePullPolicy（三种策略）、nginx-annotation（labels vs annotations）
  - 验证：目标 6/验证 6/配置要点 3/观察点 18/清理 6/小结 1 全部齐全
- 03 章已完成六要素（目标 7/验证 7/配置要点 8/观察点 28/清理/小结 1）
- 后续章节（04-09）按此标准执行

### v2.13 04 章按六要素标准处理
- 5 个 Lab 全部补「目标 / 验证概念」（0→5）
- 6 个 nano yaml 补「配置要点」：katacoda（Deployment 结构）、katasvc（ClusterIP/selector/port/targetPort）、katasvc2（NodePort 端口范围）、katasvc3（clusterIP: None）、katacoda.ingress（host/path/backend 路由）、updated-ingress（ingressClassName）
- 所有 get/describe/explain 输出补「观察点」15 处（Pod IP 直达 vs Service 负载均衡、NodePort 端口、headless DNS 返回全部 IP、Ingress ADDRESS/域名路由、完整链路）
- 删除 Lab 3 的失效图片残留
- 章节末尾新增「本章小结」：5 Lab 知识点表 + 4 条核心认知（Service 稳定入口/三种类型/四层vs七层/Ingress 链路）+ 衔接
- 04 章最终 699 行：目标 5/验证 5/配置要点 6/观察点 15/小结 1，无图片残留

### v2.14 05 章框架重构（用户决议：去 NFS，用 local-path）
- **框架确认**（用户决策）：
  - Lab 1 卷基础（hostPath/emptyDir）——保留
  - Lab 2 hostpath 实现方式（mysql+hostPath）——保留（与 Lab 1 教学点不同：Pod 级 vs 应用级）
  - Lab 3 使用 PVC 和 PV——原 Lab 4，PV 从 NFS 改为 **hostPath**（node2 /mysql-data）
  - Lab 4 使用存储类动态交付——原 Lab 5，**NFS CSI 整个删除**，改用 01 章已装的 **local-path** 默认 StorageClass
- **删除**：原 Lab 3（NFS 服务器搭建：nfs-kernel-server//etc/exports/hosts 解析）、原 Lab 5 的 NFS CSI（csi-nfs-controller/node、nfs-sc.yaml）
- **NFS 实际引用清零**（64 处 → 仅剩 3 处概念对比说明文字）
- 补 Lab 1/2/3 目标/验证块（Lab 4 已有）
- 修复 describe 替换产生的重复 ```bash fence
- 05 章最终 1161 行，4 个 Lab
- 六要素格式规范（配置要点/观察点/小结补全）下一步进行

### v2.15 05 章 Lab 4 补充 local-path 安装（用户反馈）
- Lab 4 新增「补充：如果集群没装 local-path」步骤（与 01 章第 9 步相同的安装命令 + 设为默认 StorageClass + 验证方式）
- 作为条件分支：正常学员用 01 章已装的 local-path；未装的集群按补充步骤安装
- 05 章最终 1170 行

### v2.16 05 章六要素格式规范完成
- 配置要点补全至 8 个：nginx-volume-hostpath（volumes+volumeMounts 两级）、nginx-volume-emptydir（emptyDir 不指定路径）、mysql.deploy（hostPath 应用级）、mysql.deploy3（PVC 解耦）、mysql.pvc（PVC 结构）、mysql.pv（PV 容量/访问模式匹配）、pvc002、mysql.pvc2（storageClassName: local-path）
- 观察点补全至 22 处（全部 get/describe 输出）：
  - Lab 1：hostPath pod 调度节点、drain 后 SchedulingDisabled、换节点数据丢失、emptyDir 重建清空
  - Lab 2：mysql pod 节点、宿主机 /mysql 数据文件（持久化验证）
  - Lab 3：PVC Pending（无 PV）、FailedScheduling/FailedBinding 报错、PV Bound、PVC Bound
  - Lab 4：local-path 自动创建 PV（pvc-uid 命名）、多 PVC 各自动态交付
- 修正 local-path 目录路径残留（/data → /opt/local-path-provisioner）
- 章节末尾新增「本章小结」：4 Lab 知识点表 + 4 条核心认知（卷的演进逻辑/解耦价值/StorageClass 生产默认）+ 衔接
- 05 章最终 1233 行：目标 4/验证 4/配置要点 8/观察点 22/小结 1

### v2.17 05 章查看类输出观察点补全（用户反馈）
- 补齐非 kubectl 的查看类输出（df/cd/touch/ls/ll/cat）观察点 5 处：
  - Lab 1 hostPath：df 显示 /data 挂载宿主机磁盘、写文件后到 node2 验证（数据在宿主机）、换节点后 /data 为空（hostPath 局限）
  - Lab 1 emptyDir：df 看不到 /www 挂载、写文件后 Pod 重建 /www 清空（临时性）
- 删除旧格式说明（"\*重点关注 /data 目录"），统一为「观察点」格式
- 保留原文幽默教学点（"emptyDir就是一场空"）并补充规范观察点
- 05 章观察点 22 → 27，最终 1243 行

### v2.18 06 章六要素格式规范完成（用户确认：结构不变，仅改格式）
- 5 个 Lab 全部补「目标 / 验证概念」（0→5）：
  - Lab 1 文件型 configmap（--from-file + 卷挂载进 mysql）、Lab 2 键值对（键→文件）、Lab 3 env 注入（configMapKeyRef）、Lab 4 secret 存密码（对比明文/密文）、Lab 5 文件型 secret（挂载自动还原）
- 配置要点补全至 7 个：mysqld.cnf 源文件、configmap yaml（data 区 `|` 块标量）、mysql.deploy.yaml（configMap 卷定义+挂接）、test-conf.pod.yaml（键→文件）、test-conf-2.pod.yaml（env valueFrom.configMapKeyRef）、mysql.deploy2.yaml（secretKeyRef 替代明文密码）、test-secret.pod.yaml（secret 卷）
- 观察点补全至 17 处（全部 get/describe/-o yaml/exec 输出）：
  - Lab 1：DATA=1（键=文件名）、describe Data 区原文、-o yaml `|` 块标量、Pod 名=Deployment+RS 哈希、容器内 cat 一致
  - Lab 2：2 键明文、字符串无块标量、卷内 ls 键名即文件名
  - Lab 3：USER/PASSWORD 环境变量（env 一次性 vs 卷热更新）
  - Lab 4：ConfigMap 明文密码（引 secret 动机）、Opaque/describe 只显示字节数、-o yaml base64 密文、base64 -d 还原（编码≠加密）
  - Lab 5：文件封装为 1 键、整串 base64、解码还原原文、容器内自动明文（完整对比链）
- **v1.36 兼容**：5 处 `kubectl exec` 全部加 `--` 分隔符、删除 DEPRECATED 警告行；Lab 4 env 长输出精简为 `grep -E 'MYSQL_ROOT|MYSQL_DATABASE'` 两行
- 修正术语：「被加密」→「被编码（base64）」（Lab 5 原文错误）
- 清理小节规范化：`kubectl delete -f .` + 单独清理 4 个 create 出的 ConfigMap/Secret（跨 blog/default 命名空间）
- 章节末尾新增「本章小结」：5 Lab 知识点表 + 4 条核心认知（ConfigMap/Secret 分工、两种消费方式、base64≠加密、配置外部化）+ 衔接
- 06 章最终 873 行：目标 5/验证 5/配置要点 7/观察点 17/清理 1/小结 1

### v2.19 07 章六要素格式规范完成（资源调度，5 Lab）
- **标题修正**：「群集资源调度」→「集群资源调度」（繁体/旧写法 → 简体）
- 5 个 Lab 全部补「目标 / 验证概念」（0→5）：
  - Lab 1 labels/nodeSelector（定向调度 + 存量不动）、Lab 2 taint/tolerations（NoExecute 驱逐 vs 容忍豁免）、Lab 3 drain/uncordon（cordon+驱逐两步、DaemonSet 不驱逐）、Lab 4 master 承载负载（control-plane 污点、DaemonSet 每节点一个）、Lab 5 master 上的 daemonset（Exists 容忍）
- 配置要点补全至 5 个：katacoda.yaml（基础对照组）、katacoda3.yaml（nodeSelector 与 containers 平级）、katacoda2.yaml（tolerations 四字段对应污点）、katacoda-daemonsets.yaml（无 replicas 的每节点一个）、katacoda-daemonsets2.yaml（operator: Exists vs Equal）
- 观察点补全至 26 处（全部 get/describe 输出）：
  - Lab 1：master 不承载原因、打标签后无变化、滚动更新换 RS 哈希、Labels 出现/消失 proxy=enable、存量不动、scale 后 Pending、FailedScheduling 报错逐条解读
  - Lab 2：对照组分布、Taints 字段 + 三种 effect、NoExecute 驱逐存量、容忍后回 node3、删污点存量不动
  - Lab 3：首次 drain 报错（cordon 已生效+DaemonSet 不驱逐）、drain 成功（ignore-daemonsets）、SchedulingDisabled、pod 全迁、扩副本全在 node3、uncordon 后新增到 node2、缩副本负载均衡
  - Lab 4：describe node1 Taints（无 value 污点）、untainted、三节点分布、DaemonSet 三节点各一、删除即清场（曲终人散）、恢复污点后 node1 无 pod
  - Lab 5：node1 出现 daemonset pod + 旧 pod Terminating
- **describe node 输出精简**：4 处 `describe node` 去掉 Annotations/CreationTimestamp 等无关字段（顺带清除旧环境 **NFS CSI annotation 残留**）
- **drain 输出精简**：去掉环境特有的 ingress-nginx evicting 行，保留 katacoda + drained（观察点说明其他负载也会被逐出）
- **输出修正**：Lab 1 `get pods` 首行 `<none` 缺右括号 → `<none>`；Lab 2 输出块 ```text → ```bash 统一；Lab 5 原文「增加针对master的taint增加容忍」措辞修正；describe Pending pod Events 重复 "0/3 nodes are available" 笔误修正
- 每个 Lab 补「清理」小节（5 个）+ 备注规范化（「备注：删除所有 master 污点」，标注单节点学习场景）
- 章节末尾新增「本章小结」：5 Lab 知识点表 + 5 条核心认知（匹配本质/主动选择 vs 被动排斥/存量不动原则/drain 运维标准动作/master 默认不跑业务）+ 衔接
- 07 章最终 925 行：目标 5/验证 5/配置要点 5/观察点 26/清理 5/备注 1/小结 1

### v2.20 09 章六要素格式规范完成（性能管理和监控，6 Lab）
- 6 个 Lab 全部补「目标 / 验证概念」（0→6）：
  - Lab 1 metrics-server（kubectl top 数据来源）、Lab 2 HPA（自动扩缩容机制）、Lab 3 requests/limits（调度依据 vs 运行上限）、Lab 4 LimitRange（单 Pod 限额）、Lab 5 ResourceQuota（总量配额）、Lab 6 dashboard（helm + NodePort + SA/Token 安全链路）
- 配置要点补全至 10 个：metrics-server 安装命令链（3 条命令各司其职）、podinfo.yaml（requests 决定 HPA 灵敏度）、podinfo-hpa.yaml（autoscaling/v2 结构 + behavior 扩展）、Lab 3 命令行与 yaml 两种 resources 写法、limitrange.yaml（Container/PVC 两类限制）、lrpod2 故意超限字段、修改后合规字段、resourcequota.yaml（hard 总量）、dashboard 的 SA+clusterrolebinding 两步
- 观察点补全至 28 处（全部 get/describe/top 输出）：
  - Lab 1：top node 三节点对比、top pod、top pod -A 全集群视角（apiserver 最高）、sort/head/awk 命令链（CKA 真题）
  - Lab 2：基线 2 副本、TARGETS <unknown>（指标延迟）、-o yaml 的 status.currentMetrics、扩容到 5 个、describe hpa Events（New size 3→4→5→7）、describe deploy 对照（HPA 决策→Deployment 执行闭环）
  - Lab 3：describe Requests/Limits 与声明一一对应
  - Lab 4：describe limitrange 表格、lrpod1 默认值自动套用、Forbidden 报错逐条解读、修正后通过
  - Lab 5：Used/Hard 两列、exceeded quota 报错（requested/used/limited 三段解读）、删 Pod 释放配额、重建成功闭环
  - Lab 6：helm 就绪、patch 后 NodePort 端口、dashboard pod、v3 多 service 架构（web/auth/kong-proxy 协作）、describe sa（v1.24+ Tokens <none> 正常）、create token（eyJ JWT）、登录页界面文字说明
- **删除 2 处失效图片残留**（dashboard 登录界面 / 命名空间界面，原为飞书内部时效链接）→ 替换为文字版观察点说明（用户决策：手册不含图片）
- **修复 podinfo.yaml 缩进错误**：`prometheus.io/scrape: "true"` 从 0 缩进修正为 8 空格（annotations 下），否则 yaml 解析失败
- **精简长输出**：`get hpa -o yaml` 从 71 行精简为 ~35 行（去掉 last-applied-configuration 大 JSON 和 conditions 细节，保留 spec + status.currentMetrics）
- 每个 Lab 补「清理」小节（metrics-server/dashboard 标注"建议保留"）；Lab 4 末尾说明 lrpod1/lrpod2 留给 Lab 5 复用
- 章节末尾新增「本章小结」：6 Lab 知识点表 + 5 条核心认知（观测先行/HPA 扩副本不扩资源/单 Pod→总量三层约束/拒绝机制报错即答案/dashboard 即安全链路演练）+ 衔接（08 章 RBAC 主线）
- 09 章最终 1161 行：目标 6/验证 6/配置要点 10/观察点 28/清理 4/小结 1，无图片残留

### v2.21 08 章六要素大改造 + 09 章 Lab 6 迁移（用户决策：一次性到位）
- **09 章 Lab 6（dashboard）迁移到 08 章 Lab 5**（用户指出 9.6 教学核心是安全链路而非监控）：
  - 09 章删除 Lab 6（helm/NodePort/SA/Token 全部移走），标题「性能管理和监控」→「资源管理和监控」，小结改 5 Lab 版（衔接指向 08 章 Lab 5）
  - 08 章新增 Lab 5「综合演练：安装 dashboard 并用 SA/Token 登录」——教学点重新定位为 Lab 2（SA+token）+ Lab 3（ClusterRoleBinding）的综合应用，内容与 09 原版一致
- **08 章标题**：「验证和授权」→「认证与授权」（对齐官方 Authentication/Authorization 术语）
- **08 章全章六要素**（Lab 0-7，8 个 Lab）：
  - Lab 0 证书目录：目标/验证/观察点×4；修复排版错误（`ca.key 是验证 key` 反引号错位）；ca.crt 长输出精简
  - Lab 1 用户证书：六要素；`config.20210204` → `config.bak`；修重复 cd 行；**新增「官方推荐的 CSR API 签发方式」对比小节**（CertificateSigningRequest + kubectl certificate approve，v1.22+ GA）
  - Lab 2 创建 SA：六要素（v1.36 create token 适配已有，纳入配置要点）
  - Lab 3 用户授权：六要素；clusterroles 70 行输出精简为 16 行；**新增「自定义 Role（rules 三段式 apiGroups/resources/verbs）」小节**（CKA 必考）；补 clusterrolebinding yaml 输出
  - Lab 4 SA 授权：六要素；与 Lab 3 的 RoleBinding vs ClusterRoleBinding 对照
  - Lab 5 dashboard 综合演练：六要素（从 09 迁入，教学点改为安全链路落地）
  - Lab 6 SecurityContext（新增）：runAsUser/readOnlyRootFilesystem/capabilities drop，基线 root vs 降权对比（whoami/touch 验证）
  - Lab 7 Pod Security Admission（新增）：命名空间 enforce=baseline 标签，privileged/hostPath 违规 Pod 被拒（violates PodSecurity 报错解读）
- 本章小结：8 Lab 知识点表 + 5 条核心认知（认证≠授权/RBAC 三要素/两种身份/自觉到强制/安全链路）+ 衔接
- 08 章最终约 1115 行：目标 8/验证 8/配置要点 11/观察点 28/清理 7/小结 1

### v2.22 补齐 A/B 级缺口（对照官方文档 + CKA 大纲，用户决策：全部补齐）
- **01 章**新增两个维护小节（CKA 必考）：
  - 「集群维护（可选）A：etcd 备份与恢复」——etcdctl snapshot save/status（TLS 三件套参数）、恢复五步流程（停 apiserver→restore→换目录→重启）
  - 「集群维护（可选）B：kubeadm 集群升级」——升级顺序口诀（kubeadm 先升→control-plane apply→worker 逐台 drain/upgrade/uncordon）、apt-mark unhold/hold
- **02 章**新增 Lab 3「使用 Init 容器完成初始化」（原 Lab 3-6 重编号为 4-7）：initContainers 顺序执行、Init:0/2 状态观察、exit 0 语义、emptyDir 共享卷传数据；小结更新为 7 Lab
- **03 章**新增 Lab 4「容器生命周期钩子（postStart/preStop）与优雅终止」（原 Lab 4-7 重编号为 5-8）：postStart/preStop 钩子、terminationGracePeriodSeconds、time kubectl delete 观察 5 秒宽限、--grace-period 对比；小结更新为 8 Lab
- **04 章**：
  - Lab 5 内补「Ingress 加 HTTPS（TLS）」：create secret tls + spec.tls 引用（衔接 06 章）
  - 新增 Lab 6「NetworkPolicy 网络策略」：默认全通→白名单隔离、podSelector/policyTypes/ingress.from/egress 含 DNS 放行（新手坑）、client-allowed 通 vs client-blocked 超时对比
  - 补「Service 进阶用法」：多端口（ports 必须命名）+ ExternalName（DNS CNAME）
  - 小结更新为 6 Lab
- **06 章**补「Secret 的常见类型」：kubernetes.io/tls（证书）、dockerconfigjson（imagePullSecrets）、service-account-token；小结加"按类型使用"认知
- **07 章**新增两个 Lab（原 Lab 2-5 重编号为 3-6）：
  - Lab 2「节点亲和 nodeAffinity / Pod 亲和反亲和」：required vs preferred、matchExpressions 操作符、podAntiAffinity + topologyKey=hostname 高可用三副本跨节点
  - Lab 5「PodDisruptionBudget（PDB）」：minAvailable、ALLOWED DISRUPTIONS、drain 被 violates budget 拦截
  - 小结更新为 7 Lab
- **09 章**补「Downward API」：env 注入（fieldRef）vs 卷挂载（downwardAPI 卷，呼应 podinfo.yaml）；小结加认知点
- **新增 10 章「故障排查」**（CKA 30% 权重）：
  - Lab 1 排查三板斧（describe/logs/events）
  - Lab 2 CrashLoopBackOff/ImagePullBackOff（退出码速查 0/1/127/137/143、logs --previous）
  - Lab 3 节点 NotReady（systemctl status kubelet、journalctl -u kubelet）
  - Lab 4 Service/DNS（Endpoints 空=selector 错、nslookup 解析链）
  - 小结：分层排查方法论 + CKA 实战提醒
- 各章 fence 均偶数闭合（01:148 / 02:168 / 03:224 / 04:168 / 06:158 / 07:216 / 09:158 / 10:72）

### v2.23 01 章实测加固（用户要求：3 台国内云主机从零实测，将踩坑固化进手册，确保通用可复现）
> 实测环境：3 台阿里云 Ubuntu 24.04.4 / 4核8G，从空白机器到集群 + 冒烟测试全通过（v1.36.3、containerd 2.2.1、calico v3.29.1、metrics-server v0.9.0、local-path）
- **前置检查新增「3. 镜像加速站预测试 + K8s 版本探测」（关键，用户要求"镜像站点最开始就测试"）**：
  - 探测当前最新稳定版（`dl.k8s.io/release/stable.txt`，默认装最新版，不照抄历史版本）
  - 候选加速站逐个预测试（1panel/daocloud/jiaxin/vvvv/hubfast，200/401/403 语义区分）
  - 输出三张关键选择表：主加速站 ACCEL_HOST / 备用站 / 镜像仓库 IMAGE_REPO（registry.k8s.io 可达则用官方源）
  - 实测教训：加速站对**不同镜像可用性不同**（1panel 对 calico/cni 403）；可用性随时间变化需重测
- **步骤 5 kubeadm init 加固**：
  - init 前新增「注入 pause 沙箱镜像」（关键预防）：kubeadm 的 `--image-repository` **不覆盖** kubelet 的沙箱镜像，kubelet 默认从 registry.k8s.io 拉 pause 导致 init 卡 wait-control-plane；解法 = ctr 拉国内 pause + tag 成常见版本（3.10/3.10.1/3.10.2 全覆盖，实测 kubeadm 拉 3.10.2 而 kubelet 要 3.10.1）
  - 失败处理补充：pause 报错的识别与修复（不要急着 reset）；**init 失败后 admin Forbidden**（v1.36 用 kubeadm:cluster-admins 组走 RBAC，中断时 binding 缺失）→ super-admin.conf 救急 + 补建 binding
- **步骤 7 worker join**：补 pause 镜像注入（worker kubelet 同样要拉）+ join 后 NotReady 的 sandbox 排查
- **步骤 8 calico 加固**：改为「3 台节点先预拉 calico 三件套（cni/node/kube-controllers）+ 多加速站 fallback 链」（1panel 对 cni 403 → daocloud 备选）+ tag 成 docker.io 名，避免 apply 后 ImagePullBackOff 逐个排查
- **步骤 3 补充**：hosts.toml **引号不能丢**（TOML 引号丢失 → containerd 静默回退直连，实测踩坑）；crictl 未装时的替代验证方案（用步骤 10 的 busybox 验证）
- **常见故障排查清单**：新增 5 条实测故障（pause 沙箱、Forbidden、worker sandbox、calico 403、hosts.toml 引号）
- **附录 C**：更新为 2026-08 实测版本组合（v1.36.3 + metrics-server v0.9.0 + 双加速站），强调动态获取版本
- **附录 D worker 一键脚本**：补 pause 注入步骤 + 可配置项（ACCEL_HOST/IMAGE_REPO）
- 01 章最终 1095 行，fence 152 偶数闭合

### v2.24 worker 重装端到端验证（用更新后手册重装 node3，验证"拿到就能用"）
- **验证过程**：node3 完全重置（kubeadm reset + 清空 containerd 全部镜像 + 清 /var/lib/kubelet）→ 跑更新后的附录 D 一键脚本 → 预拉 calico（多站 fallback）→ join → Ready
- **验证结果**：全部通过——附录 D 脚本可用、pause 注入预防生效（join 后 kubelet 无 sandbox 报错）、步骤 8 多站 fallback 实测复现（1panel 对 calico/cni 403 → daocloud 兜底成功）、node3 重新加入后三节点 Ready + calico-node 三台正常 + 跨节点调度成功
- **发现并修正 2 个手册细节**：
  - `gpg` 命令加 `--batch`（无 TTY 的自动化/脚本环境必需，否则报 `cannot open '/dev/tty'`）——正文步骤 4 与附录 D 脚本同步修正
  - 补充 `Release.key` 下载损坏的重试提示（`gpg: no valid OpenPGP data` → 删 keyring 重跑，网络波动所致）
- 附录 D 脚本实测备注：已标注"本脚本已验证可让一台全新 worker 直接加入集群"

### v2.25 全章节实操验证 + 手册细节修正（在真实集群上跑完 02-10 章 Lab）
> 在 3 节点集群（v1.36.3）上逐章实操 02-10 章全部 Lab，验证手册命令可用性，修正实测发现的 4 处手册问题：
- **04 章 Lab 5（实测修正）**：
  - ingress-nginx 镜像方案失效：`docker.1panel.live/registry.k8s.io/ingress-nginx/...` 实测 **403**（加速站不代理 registry.k8s.io）→ 改为 **Docker Hub 同步仓库 `dyrnq/`**（digest 与官方完全一致）+ 3 台预拉 + tag + `sed 去 @sha256 digest`（本地 tag 无官方 digest 引用，不去掉会强制走 registry.k8s.io 解析）
  - controller 副本数修正：baremetal manifest 默认 **1 副本**（原文误写 2 副本）
  - Ingress 完整链路实测通过（Host 头路由 + 负载均衡）
- **05 章 Lab 3（实测修正）**：PVC 必须加 **`storageClassName: ""`**——本集群有默认 SC（local-path），不加会导致 PVC 绑定默认 SC 走动态供应（Pending 等 WaitForFirstConsumer），**不会匹配手动 PV**；空字符串 = 禁用动态供应强制静态绑定（实测修正后 PV Bound）
- **08 章 Lab 7（细节修正）**：PSA 报错实测格式为 `violates PodSecurity "baseline:latest": privileged (must not set securityContext.privileged=true)`（原文格式过简）
- **09 章 Lab 3（实测修正）**：`kubectl run --requests/--limits` 在 **v1.36 已移除**（报 unknown flag），且 **Pod 的 resources 创建后不可改**（kubectl set resources pod 也被拒）→ 改为**纯 yaml 声明方式**创建（v1.36 唯一途径）
- **验证通过无需修改**：02 章（7 Lab：run/apply/多容器/Init/策略/env/command/标签注解）、03 章（8 Lab：deployment 扩缩容/滚动更新回滚/探针/钩子 5.8s/STS/Job/CronJob/DaemonSet）、06 章（5 Lab：文件 CM/env 注入/Secret base64）、07 章（7 Lab：nodeSelector/亲和/taint 驱逐/PDB 拦截 drain/NodePort）、08 章（用户证书 Forbidden→授权放行/SecurityContext uid 1000/PSA）、10 章（ImagePullBackOff/CrashLoopBackOff/Exit Code 1）
- 集群实操后的修复：metrics-server 在 07 章 drain 后被驱逐到缺镜像节点 → 补镜像重建（提醒：DaemonSet 类组件镜像需保证所有节点就位）

### v2.26 教学顺序调整：StorageClass 延迟到 05 章 Lab 4 安装（用户决策）
- **调整内容**：01 章安装阶段**不再装 local-path StorageClass**——"存储类"概念在 05 章 Lab 4 才讲，讲概念时再安装（避免"没学过就先装好了"）
- **01 章修改**：
  - 步骤 9 改为「装默认 StorageClass —— 本手册【延迟到 05 章 Lab 4】安装」：说明教学顺序 + 可选提前安装命令（保留）
  - 验收清单第 6 项改为"（延迟项）本阶段为空属正常"
  - 附录 E 单节点、附录 C 版本表、附录 F 最终版本、本章目标——同步标注"05 章 Lab 4 安装"
  - 故障清单 local-path 条目标注"（05 章 Lab 4 安装时）"
- **05 章修改**：
  - Lab 4 重构：**安装 local-path 成为主流程第 ① 步**（原"补充：如果集群没装"块提升），② 查看 SC，说明改为"本手册刻意留到讲概念时才装"
  - Lab 3 `storageClassName: ""` 说明改为通用表述（任何环境都稳妥：无论有无默认 SC 都强制手动匹配 PV，不再说"01 章已装"）
  - Lab 4 后续注释 "01 章已装的默认 StorageClass" → "本 Lab 刚安装的"
  - 小结 Lab 4 行 + 核心认知：标注"刻意在 Lab 4 才装 StorageClass"的教学逻辑
- **集群实测验证新顺序**（完整跑通）：
  - 删除 local-path（模拟 01 章未装状态）→ `kubectl get sc` 为空
  - 无 SC 时 Lab 3 静态绑定正常（storageClassName: "" + 手动 PV → Bound）
  - Lab 4 安装 local-path → `local-path (default)` 就绪 → 动态交付 PVC（Pending 等 Pod 消费，正常）
  - 集群当前保留 local-path（已装回，供后续章节使用）

### v2.27 新增 11 章「综合演练：WordPress 应用发布」（全书收官，全链路实测通过）
- **设计**：把 02-09 章核心知识串成真实应用发布链路——`域名 → Ingress → Service → Deployment(Pod) → PVC/MySQL`，含数据持久化、水平扩展、域名发布三大验证
- **5 个 Lab**：
  - Lab 1 MySQL 数据库（Secret 密码 + PVC 持久化 + Service 暴露，实测：库自动创建）
  - Lab 2 发布 WordPress（env 连库 + PVC 挂 /var/www/html + readinessProbe，实测：安装页 title 返回）
  - Lab 3 水平扩展（多副本 + HPA，实测：2 副本同节点 + `cpu: 0%/60%`）
  - Lab 4 Ingress 域名发布（wp.example.com，实测：302 → install.php，Host 头路由通）
  - Lab 5 数据持久化验证 + 按序清理（实测：写入 persist.txt → 删全部 Pod → 新 Pod 读回 ✓）
- **实测发现并固化**：
  - **wordpress 镜像（~600MB）免费加速站限速卡死**（1panel 实测 1.5KiB/s）→ 固化 daocloud 后台拉取方案（实测 3 分钟完成 + tag）
  - WordPress 首次访问 **302 重定向**到 install.php → 验证命令用 `-L` 或直接访问安装页路径（--resolve 有端口限制）
  - `kubectl autoscale --cpu-percent` 已弃用（告警）→ 用 `--cpu=60%`（01 章附录 F 同步修正）
- 11 章最终 504 行，fence 72 偶数闭合；集群已按 Lab 5 清理干净（wordpress 命名空间删除，系统组件完好）

### v2.28 实验手册重编号对齐教材 + 新增 09 章 Lab 8 集群安全加固（用户决策）
- **重编号（对齐教材 COURSE-OUTLINE 18 章顺序）**：
  - 新 04 集群资源调度 ← 旧 07；新 05 资源管理和监控 ← 旧 09；新 06 ConfigMap 和 Secret（不变）
  - 新 07 网络和服务 ← 旧 04；新 08 实现基本存储 ← 旧 05；新 09 认证与授权 ← 旧 08
  - 01/02/03/10/11 编号不变；00 底稿、CHANGELOG 历史保留
- **交叉引用全量更新**（82 处 + STYLE-GUIDE + COURSE-OUTLINE）：一次性原子映射替换（旧 04→07、05→08、07→04、08→09、09→05）
- **修复过程中的内容破坏**（PowerShell 嵌套数组展平事故）：
  - 02-pod.md "标签"→"签签"、"目标"→"目签" → 已修复（10 处标签/7 处目标恢复）
  - 07-network.md 大写 S→e（Service→eervice、Secret→eecret、DNS→DNe、StatefulSet→etatefuleet 等 12 个词形）→ 已修复
  - 教训：批量脚本用数组遍历需避免嵌套数组展平（用 `,@(...)` 或函数参数）
- **新增 09 章 Lab 8「集群安全加固」（对应教材第 13 章）**：
  - ① 证书检查（kubeadm certs check-expiration，默认 1 年有效期）
  - ② 证书续期（certs renew all + 组件重启说明，可选实操）
  - ③ etcd 静态加密（EncryptionConfiguration 配置 + apiserver 挂载 + 验证方法，生产实操标注）
  - ④ kubelet 安全配置（anonymous:false + webhook 认证 + Webhook 授权）
  - 小结更新为 9 Lab（Lab 0-8），核心认知加"集群安全三道防线"
- 09 章最终 1236 行；COURSE-OUTLINE 第 13 章映射补 Lab 8
- 全手册 fence 校验通过（01-11 章全部偶数闭合）

### v2.29 09 章 Lab 8 etcd 静态加密实测验证（命令全链路可用）
- **实测过程**（3 节点集群 v1.36.3）：
  - ① 创建 `/etc/kubernetes/enc/enc.yaml`（aescbc + identity 兜底，`openssl rand -base64 32` 生成密钥）
  - ② 用 **python3** 修改 apiserver manifest（加 `--encryption-provider-config` 参数 + enc volumeMount + hostPath volume；**比 sed 更稳**，避免插错位置导致 apiserver 起不来）
  - ③ kubelet 自动重建 apiserver 静态 Pod（42s 后 1/1 Running，三节点 Ready）
  - ④ 创建 test-enc Secret → **etcdctl 读取显示 `k8s:enc:aescbc:v1:key1:` 加密前缀**（无明文）；API 读取正常解密（topsecret）
- **实测发现并修正手册**：
  - **etcdctl 不在 master 宿主机**（kubeadm 不带）→ 修正为 **`kubectl -n kube-system exec etcd-node1 -- etcdctl ...`**（etcd 静态 Pod 走 hostNetwork，容器内 127.0.0.1 即宿主 etcd；证书路径 /etc/kubernetes/pki/etcd/ 已挂载）
  - manifest 修改方式从 `sed -i` 改为 python3（附三处修改点说明）
  - 补充验证观察点（密文前缀 + API 透明解密 + 旧 Secret 明文对比）
- 集群现状：静态加密**保留启用**（生产最佳实践，对应用透明），test-enc 已清理，三节点 Ready

### v2.31 Pod 主题实验统一归并到 02 章（用户决策）
- **背景**：Pod 相关实验分散在 03 章（探针 Lab 3/钩子 Lab 4）与 05 章（requests/limits Lab 3）——统一归并到 02 章「解析 Pod」
- **02 章**：新增 Lab 8 探针、Lab 9 钩子与优雅终止、Lab 10 资源请求与限制（从 03/05 章迁移，引用同步修正），共 **10 个 Lab**；小结更新（10 实验表格 + 核心认知加探针三兄弟/优雅终止/资源声明 3 条）
- **03 章**：删除 Lab 3/4，Lab 5-8 重编号为 **Lab 3-6**（StatefulSet/Job/CronJob/DaemonSet），共 6 个 Lab；小结与核心认知同步（探针/钩子引用改为 02 章 Lab 8/9）；顺带修正 2 处原引用笔误（"02 章 Lab 3"→"Lab 4"拉取策略、"Lab 4 观察点"→"本 Lab 观察点"）
- **05 章**：删除 Lab 3，Lab 4/5 重编号为 **Lab 3/4**（LimitRange/ResourceQuota），共 4 个 Lab；小结同步（requests 基础注明见 02 章 Lab 10）
- **跨文件同步**：07 章 StatefulSet serviceName 引用（"03 章 Lab 4"→"Lab 3"，原引用本身就是错的）、COURSE-OUTLINE 教材第 4 章映射（"02 章 7 Lab + 03 Lab 3/4 + 05 Lab 3"→"02 章 10 Lab"）、ch04 三处（配套说明/优雅终止引用/演练指引）
- 划分更清晰：**02=Pod 配置与生命周期（10 Lab）、03=纯控制器（6 Lab）、05=纯资源治理（4 Lab）**
- 验证：三章 fence 全部偶数（208/196/150），无残留旧标题

### v2.32 实验手册改称「实验 NN」（用户决策，避免与教材「第 N 章」混淆）
- **指称规范**：实验手册一律用 **「实验 NN」**（如 实验 02、实验 04 Lab 8），不再用「NN 章」；教材保持「第 N 章」——两者彻底区分
- **全局替换**（manual/ 全部 11 章 + STYLE-GUIDE + textbook/ 全部 5 个文件 + COURSE-OUTLINE）：
  - "NN 章 Lab N" → "实验 NN Lab N"；"NN 章"（单独引用）→ "实验 NN"
  - 范围引用 "02-09 章" → "实验 02-09"
  - "NN 章"后接中文时补空格（"实验 01 部署的"）
  - 教材引用 "实验手册 NN 章" → "实验手册（实验 NN）"
  - **保护教材自身引用**：lookbehind 排除"第 N 章"（如"第 16 章"不被误伤）
- 验证：无残留 "NN 章" 指称（除教材"第 N 章"），全部文件 fence 偶数

### v2.33 课程与实验 1:1 对齐（用户决策：一章教材只对应一个实验文件）
- **新增实验 12「集群维护与运维」**（对应教材第 14 章）：
  - Lab 1 etcd 备份与恢复（从实验 01 迁移 + 补 etcdctl 容器 exec 提示 + 备份策略认知）
  - Lab 2 kubeadm 集群升级（从实验 01 迁移 + 补"升级前先备份"铁律 + 回滚预案）
  - Lab 3 节点维护综合演练（cordon/drain/uncordon 三步曲 + PDB 保护观察，引用实验 04 知识）
- **实验 01 瘦身**：删除「集群维护 A/B」两节（已迁实验 12），实验 01 = 纯安装（含 Kubectl 基础与附录）
- **Downward API 补充迁移**：实验 05 → 实验 06（配置管理主题归位；实验 05 的 podinfo 保留 downwardAPI 卷并注明指向实验 06）
- **实验 10 扩展为 5 Lab**：新增 Lab 5 可靠性演练（滚动更新 0/1 零中断调优 + preStop 优雅下线 + PDB 计算）——对应教材第 16 章（排障+可靠性）
- **COURSE-OUTLINE 映射全面 1:1 修正**（每章教材 → 唯一实验文件）：
  - ch5→实验 03（8→6 Lab）；ch7→实验 05（Lab 1-4）；ch8→实验 06（含 Downward）
  - ch11→实验 09 Lab 1-6（含 dashboard 综合）；ch13→实验 09 Lab 1/7/8/9（去掉实验 01/07 引用）
  - ch14→实验 12；ch16→实验 10（5 Lab）；ch15 与 ch7 共享实验 05（注明）
  - 学时表实验编号修正（第三部分→07/08、第四部分→09、第五部分→12/10）
- **修复误伤**：v2.32 范围替换误改教材"第 9-10 章"→"第 9-实验 10"（COURSE-OUTLINE 6 处 + 实验 09 小结 1 处）已全部修复
- **教材 ch03 同步**：3.10 节与演练指引的维护引用 → 实验 12
- 验证：全部文件 fence 偶数；manual/ 现有 01-12 + STYLE-GUIDE
- **09 章 Lab 重编号**：Lab 0-8 → **Lab 1-9**（从 1 开始编号）：
  - Lab 0 证书目录→1、生成用户证书→2、创建 SA→3、用户授权→4、SA 授权→5、dashboard→6、SecurityContext→7、PSA→8、集群安全加固→9
  - 章内全部 Lab 引用 +1 同步（含 "Lab 0-8"→"Lab 1-9"、"Lab 0-4"→"Lab 1-5"、"Lab 2/3"→"Lab 3/4" 等组合引用）
  - 跨章引用同步：05 章 "09 章 Lab 5"→"Lab 6"；COURSE-OUTLINE 4 处 09 章 Lab 引用 +1
- **清理格式统一**：所有章节 `### 清理` 标题 → **正文加粗 `**清理**`**（用户规范）；STYLE-GUIDE §2.2 模板与规范描述、检查项同步更新（"三级标题"→"正文加粗"）
- **修复 09 章 fence 奇数（233→234）**：clusterroles 长输出精简时丢失的闭 fence 已补回（L464 输出块在 "（其余 system:*..." 后缺 ` ``` `，导致后续全部开闭颠倒）

### v2.34 教材 18 章全部完成 + 三轮校对（用户 goal 任务）
- **教材全部 18 章编写完成**（textbook/ 目录，共 5706 行）：
  - ch01 容器云原生、ch02 架构（样板）、ch03 安装、ch04 Pod、ch05 控制器、ch06 调度、ch07 扩缩资源、ch08 配置管理、ch09 网络、ch10 存储、ch11 认证授权、ch12 准入容器安全、ch13 集群加固、ch14 运维、ch15 可观测性、ch16 排障可靠性、ch17 综合实战、ch18 CKA 指南
  - 每章含：学习目标/概念讲解/原理图解/设计决策/实验演练指引（1:1 映射实验 01-12）/本章小结/思考题/CKA 考点标注
- **第一轮校对（体例与规范）**：✅ 全部章节 fence 偶数、无"后面会介绍"指针、结构要素齐全；修复 ch02 小结编号不一致（2.10 → 无编号，与其他章统一）
- **第二轮校对（知识准确性与 CKA）**：双子代理分工校对（ch01-09 / ch10-18）+ 独立自查，**10 处修正全部落地**：
  - ch02：CNCF 毕业项目时间线修正（K8s 是 2018 首个毕业项目，Prometheus/containerd 其后）
  - ch05：`kubectl set image` 语法修正（`nginx=nginx:1.28`，原缺镜像名）
  - ch06：DaemonSet 容忍范围修正（自动容忍仅节点故障类污点，**不含 control-plane**——calico-node 上 master 靠清单显式 tolerations）
  - ch07：metrics-server 描述修正（单副本 Deployment，非 DaemonSet）
  - ch08：base64 交叉引用修正（第 2 章 kubeconfig，非第 3 章）
  - ch11：RoleBinding 实验引用修正（实验 09 Lab 4，非 Lab 5/第 12 章）
  - ch13：etcd 备份章节引用修正（第 14 章，非第 10.4 章）
  - ch16：selector 排障实验引用修正（实验 10 Lab 4，非"第 9 章 Lab 4"）；退出码补 127（命令不存在）
  - ch18：`kubectl explain` 字段名修正（`containers.livenessProbe`，原 `probe` 不存在）
  - 子代理确认无问题章节：ch01/ch03/ch04/ch09/ch10/ch12/ch14/ch15/ch17
- **第三轮校对（交叉引用）**：✅ 教材内部"第 N 章"引用主题对应正确；"实验 NN"引用与实验 01-12 一致（含 Lab 级抽查）；实验手册对教材引用正确；章节编号全部连续

### v2.35 教材升级：资深编辑评审整改（用户决策：新增 Helm 章 + ch04 加 SC + MySQL 改 StatefulSet）
- **大纲与规范先行**：
  - COURSE-OUTLINE：第六部分扩展为第 17-19 章——新增第 17 章「Helm 与 Kustomize」；原 17（综合实战）→ 18、原 18（CKA）→ 19；各章要点增补（topologySpreadConstraints/审计日志/容量规划/多租户/发布策略/命名规范/SRE 等 11 处）；学时 50→52
  - TEXTBOOK-STYLE-GUIDE v1.1：版本基准声明（v1.36）、GLOSSARY 术语表规范、"设计指南"小节规范、图示规范（Mermaid 可选）
  - 新增 GLOSSARY.md（术语对照表，40+ 术语）
- **新章节**：ch17-helm-and-kustomize.md（Chart/Release/Repository 模型、Chart 结构解剖、values 渲染、install/upgrade/rollback、Kustomize base/overlay、企业发布流程）
- **ch18（原 17）综合实战**：
  - **MySQL 从 Deployment 改为 StatefulSet**（稳定标识 + volumeClaimTemplates，标注"Deployment 跑数据库是反模式"；实验 11 保留简化版并注明差异）
  - 新增 18.5「展望：CRD 与 Operator 模式」（CRD 数据层 + 控制器行为层，cert-manager/Prometheus Operator 实例）
  - 小节编号 17.x → 18.x 全量更新
- **ch19（原 18）CKA 指南**：新增 jsonpath 速查（含 custom-columns）与 tmux 分屏；小节编号 18.x → 19.x
- **各章知识增补**：
  - ch04：4.2.5 SecurityContext 概览（runAsNonRoot/capabilities 等，与 ch12 呼应）；4.4.3 补 gRPC 探针
  - ch06：6.3.5 topologySpreadConstraints（与 podAntiAffinity 对比、maxSkew）；6.1.4 Descheduler 概念
  - ch08：8.2.6 subPath 挂载陷阱（丧失热更新）；8.2.7 immutable 与 Reloader
  - ch12：PSP 废弃声明（v1.25 移除）；Seccomp Profile（RuntimeDefault，restricted 强制项）；12.5 策略即代码（OPA Gatekeeper/Kyverno）
  - ch13：13.5 API Server 审计日志专节（Audit Policy + 四阶段 level + 存储用途）；后续小节重编号
- 验证：19 章全部 fence 偶数、关键新增内容全部就位、无编号残留

### v2.36 教材升级：专家评审 44 项行动项全部落地（goal 任务）
> 按 textbook_comprehensive_review.md 的 P0/P1/P2 三级行动项逐章修订，本轮完成全部剩余项（P0-9/10 + P1 全部 14 项 + P2 剩余 11 项）：
- **厚度项（设计指南小节）**：
  - ch03 新增 3.2.5「设计指南：集群容量规划与节点选型」（节点规格决策树/CIDR 容量推演/etcd 性能基线/内核调优基线）
  - ch02 新增 2.2.7「设计指南：企业级命名与标签规范」（官方推荐标签/命名空间与对象命名规范）
  - ch05 新增 5.2.6「设计指南：生产发布策略」（蓝绿/金丝雀/A-B 矩阵 + 变更窗口与回滚标准）
  - ch07 新增 7.4.5「设计指南：多租户治理体系」（命名空间规划模型/四层隔离/超卖策略）
  - ch14 新增 14.5.4「设计指南：HA/DR 架构」（HA 检查清单/RTO-RPO 四级/故障域）+ 14.6「运维日历」
  - ch16 新增 16.5「SRE 运营规范」（SLO/Error Budget/故障复盘模板）
- **广度项（知识增补）**：
  - ch01：1.1.5 OCI 标准（Image Spec/Runtime Spec，为第 3 章 containerd 伏笔）
  - ch02：iptables O(n) vs IPVS O(1) 性能根因
  - ch03：证书 1 年有效期警示（init 步骤②）；CNI IPAM 说明
  - ch05：ttlSecondsAfterFinished（Job 自动清理，防 etcd 膨胀）；podManagementPolicy: Parallel
  - ch07：In-place Pod Resource Updates（v1.27+）；KEDA 事件驱动扩缩；7.3.3 表更新
  - ch09：IPv6 双栈说明；9.4.6 Gateway API 展望（GatewayClass/Gateway/HTTPRoute）
  - ch10：10.4.5 PVC 在线扩容（allowVolumeExpansion）；10.4.6 Volume Snapshots（与 etcd 快照区别）；Rook-Ceph 部署模式
  - ch11：11.2.2 OIDC 企业 SSO 集成（--oidc-* 参数/流程）；11.3.1 Group 组绑定（system:masters 等）
  - ch13：TLS 密码套件加固（--tls-min-version/--tls-cipher-suites）
  - ch14：14.2.1 Drain 异常处理表（local storage/PDB 卡住/force）；14.3.6 Addons 升级管理（CNI/CoreDNS 兼容矩阵）；14.5.4 Velero 应用级灾备
  - ch15：15.2.3 PromQL 极简实战（rate 查询/告警规则/ServiceMonitor 示例）；15.5 分布式追踪（Trace/Span/OpenTelemetry）
  - ch16：16.2.3 排障容器与临时容器（kubectl debug：临时容器/副本调试/节点调试，替代 SSH）
- **验证**：19 章全部 fence 偶数、小节编号连续（含重排的 ch14/ch15/ch16）、教材总行数 6685

### v2.37 出版级格式修复：审阅组复审 9 项问题全部清零（goal 任务）
> 按 revision_audit_report.md 复审意见（内容深度已达标，格式存在出版级红线）执行：
- **S-1 元注释泄露（致命）**：清除 6 处"（评审建议的厚度项）"内部标注（比审阅组发现的 4 处多 2 处：ch02/ch16），重写过渡语自然融入
- **S-2 死链**：ch06 §6.5.3 → §6.5.2（PDB）；顺带全局三级节引用跨章校验，发现并修复 ch04 §4.5.5 → §4.5.4（Downward API）
- **A-1 代码块语言标记**：146 处裸开块补齐标记（bash 命令类 / yaml 声明类 / promql 查询类 / text 文字流程类），裸开块清零
- **A-2 交叉引用格式**：8 处中式节号（"第 X.Y 节"）→ §X.Y；ch19 全部 chN 缩写 → "第 N 章"（表格 16 处 + 正文 2 处）
- **A-3 Callout 统一**：认知类变体统一为"核心认知"（关键认知/认知/核心认知（易错点）→ 10 个文件）；决策逻辑/排障关联已统一；警告类保留"注意"（语义多样不强改，报告说明）
- **B-1** ch02 六概念关系图补编号（2.2.7），命名规范顺延 2.2.8
- **B-2** 增厚小节前缀统一：ch04 §4.2.5 → "生产基线：SecurityContext 概览"（设计指南类 5 处已带前缀）
- **B-3 术语一致性**：master → 控制面/控制面节点（叙述性全改，保留图内 master1-3 标签与"旧称 master"说明）；Requests/Limits 正文首字母大写（147 行，代码块与反引号内联代码保持小写）
- **B-4 GLOSSARY 扩充**：新增 JSONPath/cert-manager/Endpoints-EndpointSlice/Mutating-Validating Webhook/ServiceMonitor 5 术语；修正 etcd/Service 为"保留英文"；维护规则强化
- **出版级终验**：元注释/裸块/引用格式/死链/fence/认知变体 6 项全部通过 + GLOSSARY 完整 + ch02 编号连续；教材总行数 6685 不变（纯格式修复不增删知识内容）

### v2.38 教材图表 Mermaid 化（按 mermaid_specification.md 规范，goal 任务）
- **转换规模**：**32 处**图表从 ASCII/文字转为 Mermaid（规范清单 ~30 处 + 附加 2 处：ch06 调度两阶段、ch07 三层治理均为规范明确要求项）
- **分章分布**：ch02×6（六概念/控制循环/副本走查/CRI 链/通信旅程×2）、ch03×1（init 七步）、ch04×2（探针协作/优雅终止）、ch05×2（控制器选型/滚动更新）、ch06×1、ch07×2（HPA 链路/三层治理）、ch08×1（挂载决策）、ch09×2（kube-proxy 流量/综合走查）、ch10×1（存储选型）、ch11×1（三道门）、ch12×1（准入链）、ch13×2（信任链/审计四阶段）、ch14×3（节点维护/升级/多控制面 HA）、ch15×2（三支柱/监控架构）、ch16×1（分层排障）、ch17×3（Helm 模型/CI 流水线/多环境）、ch18×1（WordPress 架构）
- **规范遵循**：
  - 6 种模板：flowchart（TD/LR/TB）、sequenceDiagram（ch02 旅程/副本走查）、stateDiagram 未用到（无匹配场景）
  - 配色体系：控制面浅蓝 #E8F4FD/数据面浅绿 #E8F8E8/外部浅橙 #FFF3E0/危险浅红 #FDECEA/中性浅灰 #F5F5F5
  - 节点形状约定（菱形判断/圆角起止/圆柱存储/平行四边形外部实体）、英文 ID、中文标签引号包裹、subgraph ≤2 层、每图 ≤15 节点
  - 每图上方保留 `<!-- 原 ASCII 图已转为 Mermaid -->` 注释 + 图后保留"读图要点"文字说明
- **保留 ASCII**（规范允许）：镜像分层堆叠图、目录树（Chart/挂载）、单列线性步骤（Init 机制/污点对比）、极简对照、清晰概念框图（Downward 三源/稳定 DNS/Tracing span）——共 9 处确认保留
- **顺带修复 3 处笔误**：ch04 探针参数名（initialDelaySeconds×5 → periodSeconds/timeoutSeconds 等）、ch05 maxUnavailable→maxSurge、ch06 排障关联报错示例（FailedScheduling 具体信息）
- **验证**：32 处 mermaid 块 + 注释一一对应、fence 全偶数、无转换遗漏（ASCII 残留均为允许保留类型）
### v2.39 实验补充清单 28 项全覆盖 + 实验分级标注体系（goal 任务）
> 用户要求："全覆盖（28 个建议），对实验做一个表示，把可选的标出来"。执行内容分两部分：

#### 一、28 项补充建议全覆盖（新增实验/内容落位）
- **高优先 8 项**：
  - Helm 全流程 → **新增实验 13「Helm 交付」**（3 Lab：Chart 结构/打包发布/升级回滚 + values 多环境 + Kustomize）
  - StatefulSet 独立 PVC → 实验 03 Lab 4（volumeClaimTemplates，推荐）
  - ConfigMap 热更新对比 → 实验 06 Lab 6（卷挂载 vs env 注入，推荐）
  - topologySpreadConstraints → 实验 04 Lab 8（maxSkew，推荐）
  - kubectl debug → 实验 10 Lab 6（netshoot 临时容器，推荐）
  - 审计日志 → 实验 09 Lab 10（Audit Policy 实操，推荐）
  - PVC 在线扩容 → 实验 08 Lab 5（allowVolumeExpansion，推荐）
  - PSA 三动作 → 实验 09 Lab 11（enforce/audit/warn 对比，推荐）
- **中优先 12 项**：NFS 共享存储（08-7）、podAffinity（04-9）、停 worker 演练（10-7）、subPath+immutable（06-7）、NetworkPolicy egress（07-7）、auth can-i（09-12）、sidecar 模式（02-11）、QoS 观察（02-12）、rollout pause/resume（03-8）、PV 回收策略（08-6）、探针动态观察（10-8）、HPA 稳定窗口（05-5）——全部落位并标"推荐"
- **可选 8 项**：kube-prometheus-stack（**实验 14 Lab 1**）、filebeat 日志收集（**实验 14 Lab 3**）、KEDA（05-6）、imagePullSecrets（06-8）、证书续期（12-4）、WordPress 生产化（11-6）、Init 等依赖标准写法（02 Lab 3 扩展）——标"可选·进阶"
- **新增实验 14「可观测性（可选·进阶）」**（3 Lab：kube-prometheus-stack / ServiceMonitor+PromQL / filebeat DaemonSet）——整体可选·进阶，文件标题与小结均标注

#### 二、实验分级标注体系（STYLE-GUIDE §2.2.1 v1.1）
- **三级制**：必做（无后缀）/ 推荐（`（推荐）`）/ 可选·进阶（`（可选·进阶）`）
- **三处标注**：Lab 标题后缀 + 实验准备「实验分级」表（| Lab | 主题 | 级别 |）+ 本章小结表新增「级别」列
- **落位**：14 个实验文件全部补齐分级表与小结级别列（02/03/07/08/09 补分级表；07 小结表列错位修复；05 小结表重写）

#### 三、教材与大纲对齐
- COURSE-OUTLINE.md：第 15 章 → 实验 05 Lab 1/2 + 实验 14；第 17 章 → 实验 13（全部 3 Lab）；各章配套 Lab 数更新（02:12/03:8/04:9/05:6/06:8+补充/07:7+补充/08:7/10:8/11:6/12:4）
- ch15 演练指引：增加实验 14 说明；ch17 演练指引：改为实验 13 三 Lab 主线
- **验证**：28/28 项落位核对通过；14 文件 fence 全偶数；分级表行数=Lab 数=小结表行数；标题后缀与级别一致
### v2.40 新增实验真实集群逐项实测 + 修正（goal 任务后半）
> 用户要求："使用昨天的 k8s 群集把新增的实验场景逐个测试一遍，并进行必要的修正"。3 节点集群（v1.36.3，node1 控制面含默认 NoSchedule taint）全量实测 28 项新增内容，发现并修正以下问题：

#### 实测通过（无需修正）
- 02 Lab 11 sidecar（2/2）、Lab 12 QoS 三档（Guaranteed/Burstable/BestEffort，须用 yaml 声明 resources——`kubectl run --requests/--limits` 在 v1.36 静默忽略）、Lab 3 扩展 until 循环（Init:0/1 正确）
- 03 Lab 4 STS 独立 PVC（www-web-0/1 各一 PVC，删 Pod 数据保留）、Lab 8 rollout pause/resume（pause 时 UP-TO-DATE=0，resume 后滚动完成）
- 04 Lab 9 podAffinity（compute 与 cache 同节点聚合）
- 06 Lab 6 CM 热更新（env 不变/卷文件变）、Lab 7 immutable（更新被 Forbidden）、Lab 8 registry:2 部署
- 07 Lab 7 egress（DNS 被拦 → 补 53/UDP 恢复）
- 08 Lab 6 PV 回收（Retain→Released 保数据 / Delete→PV 连带删除）
- 09 Lab 10 审计日志全流程（启用→记录 secrets 访问→还原）、Lab 11 PSA 三动作（enforce 拒绝/audit 允许/warn 警告）、Lab 12 can-i
- 10 Lab 8 探针动态（失败→Endpoints 空→修复→恢复）、Lab 7 停节点（kubelet stop → NotReady → 5 分钟驱逐窗口后迁移 → start 恢复）
- 11 Lab 6 PDB/配额/liveness/preStop（ALLOWED DISRUPTIONS 1、rollout 成功）
- 12 Lab 4 证书续期全流程（renew all → 重启控制面 → 新证书生效）
- 13 Lab 1-3 Helm 全流程（create/package/install/upgrade/rollback/values/Kustomize apply -k）
- 14 Lab 1 kube-prometheus-stack（prometheus/grafana/alertmanager/node-exporter 全 Running，count(up)=25）

#### 实测发现并修正的手册问题
| 文件 | 问题 | 修正 |
|---|---|---|
| 05 Lab 5 | 压测用独立 Pod，HPA 不统计其指标（HPA 只看目标 Deployment 副本） | 改为容器内后台压测 `kubectl exec deploy/cpu-app -- sh -c "while true; do :; done >/dev/null 2>&1 &"` + `pkill -f "while true"` 停止（重定向防 busybox 卡住） |
| 08 Lab 5 | expand-app 未挂载 PVC（WaitForFirstConsumer 下 PVC 永远 Pending）；"local-path v2.2 实测支持扩容"错误 | Deployment 挂载 PVC；观察点改为：patch 后 ExternalExpanding 等待外部控制器，**local-path（hostPath）不会真正扩容**（数据在节点根分区无独立设备），真实扩容依赖 CSI ExpandVolume（云盘 SC） |
| 08 Lab 6 | `kubectl create pvc --storage-class-name=` 参数错误 | v1.36 已移除 `kubectl create pvc` 子命令（--help 无此命令），改为 yaml 方式创建 |
| 08 Lab 7 | 客户端依赖只提了一句无命令；PV server IP 192.168.0.11 为旧环境 | 补 node2/node3 `apt-get install -y nfs-common`（缺则 Pod 挂载报 exit status 32，实测确认）+ 云安全组 2049 放行；IP 改 192.168.0.114 |
| 10 Lab 7 | 云主机 `poweroff` 后无法远程恢复；"等 1-2 分钟"不符合驱逐机制 | 改 `systemctl stop kubelet`（可远程恢复）；实测驱逐需 **300s unreachable 容忍窗口**，补 sleep 300 步骤与说明 |
| 10 Lab 8 | （验证顺序误报）手册本身正确：先演示失败（/healthz 404）再 patch 恢复 | 无修改 |
| 12 Lab 4 | `crictl rm` 直接删运行中容器报错；"静态 Pod 会因文件变化自动重启"不实 | 补 `crictl stop` 先行 + 75s 等待；明确证书变化不触发自动重启（实测），须手动重建 |
| 13 Lab 1 | `tree` 命令可能不存在 | 补 `apt-get install -y tree`（或 find 替代） |
| 14 Lab 1 | 国内网络：github.io index 卡死、registry.k8s.io 拉取失败（kube-webhook-certgen/kube-state-metrics） | 补实测注记：GitHub Releases 直下 tgz + ghfast.top 代理；`--set kubeStateMetrics.enabled=false`/`--set kubeEtcd.enabled=false`；`maximumStartupDurationSeconds=600` 修 CRD 校验；containerd hosts.toml 加速（registry.k8s.io→aliyuncs、quay.io→daocloud，参照实验 01） |
| 02 Lab 12 | （验证命令误用）手册正确 | 无修改（补充知识：kubectl run --requests/--limits 在 v1.36 静默忽略，须 yaml 声明） |
| 04 Lab 8 | （验证误用 DoNotSchedule）手册用 ScheduleAnyway 正确；实测确认 master 控制面 taint 使业务 Pod 只落 worker（2/2 分布） | 无修改 |

#### 环境备注（教学集群）
- 集群升级后状态：3 节点 Ready v1.36.3；helm v3.18 已装（09 Lab 6 依赖）；node2/node3 已装 nfs-common（08 Lab 7 依赖）；containerd hosts.toml 新增 registry.k8s.io/quay.io 加速（实验 01 同款配置）；证书已续期至 2027-08
### v2.41 镜像可用性实测 + 03 章镜像版本更换 + 镜像清单文档（用户决策）
> 用户决策：放弃离线镜像包方案（传文件/解包对学员麻烦）；支持 03 章换版本链；KEDA 保持可选跳过。

#### 全量镜像实测结论（3 节点阿里云环境逐镜像）
- ✅ 可拉：busybox、nginx(1.25/1.26/1.27/latest/1.16)、mysql:5.7、wordpress:php8.2-apache、redis:7、ubuntu、memcached、registry:2、netshoot（daocloud）、ubuntu-bc（1panel）、calico、local-path、dashboard 等
- 🟡 需加速配置：registry.k8s.io 控制面全家（阿里云 google_containers，01 章已教）、quay.io 监控系（daocloud）、filebeat（实测直连可拉）
- 🔴 公共渠道实测拉不动（仅 2 个）：`nginx:1.7.9`（2015 年 schema1 老镜像，1panel/daocloud/1ms/xuanyuan 全失败）、`ghcr.io/kedacore/*`（KEDA，无国内加速）

#### 03 章镜像版本更换（用户确认）
- 升级链 `nginx:1.7.9 → 1.8 → 1.9.1` 更换为 **`nginx:1.25 → 1.26 → 1.27`**（16 处 1.7.9、8 处 1.8、5 处 1.9.1 全部替换，含 yaml/命令/终端输出/观察点叙述；升级与回滚语义不变）
- 实测验证：三个版本 1panel 均可拉；Deployment 滚动更新链 1.25→1.26→1.27→rollback 1.26 全部通过
- 说明：`nginx:notexist`（实验 10 排障演示假 tag）刻意保留，**不要预拉**

#### KEDA 注记（05 Lab 6）
- 加"国内网络提示"：ghcr.io 镜像无公开加速、实测拉取失败；可选·进阶实验网络受限可跳过（概念见教材 §7.3.4）

#### 新增《实验镜像清单》文档（manual/00-实验镜像清单.md）
- 按实验分组的全部镜像表 + 难度分级（可拉/需配置/受限）+ 预拉建议（授课前一条 for 循环预拉 ✅/🟡 镜像）
- 明确"不需要离线包"：除已弃用的 nginx:1.7.9 与可选 KEDA 外全部国内可拉
### v2.42 授课 PPT 全 19 章产出（用户要求，参照 FDE 课程范例格式）
- **技术栈**：pptxgenjs（Node.js），每章一目录（common.js + compile.js + slide-NN.js 一页一文件 + output/*.pptx），版式与 FDE 课程范例完全一致（封面/分隔页/卡片/表格/代码块/数字圆标体系）
- **配色**：K8s 官方蓝 #326CE5 主色 + 灰绿强调 + 琥珀警示，白底/浅灰蓝交替
- **金句条克制原则**（用户反馈）：底部 calloutBar 只在真结论/警示/CKA 考点处使用（每章 ≤3 处），去除讲师提示/衔接性质的话
- **规模**：19 章共 412 页（ch01:25、ch02:45、ch03:26、ch04:26、ch05:24、ch06:24、ch07:20、ch08:18、ch09:22、ch10:20、ch11:20、ch12:18、ch13:18、ch14:20、ch15:18、ch16:20、ch17:16、ch18:16、ch19:16）
- **验证**：全部章节 check_ppt.py 越界自检 0 问题；工具 tools/check_ppt.py 供后续维护
- 章节 3-19 由并行子代理按统一规格生成（教材内容忠实、保留章节编号、实验标注"（实验 NN）"）
### v2.43 完整版课件整合 + 课程大纲/README/agent.md（用户要求）
- **完整版课件**：ppt/Kubernetes-容器云原生实战课程-完整版.pptx（416 页 = 总封面 1 + 课程目录 2 + 19 章 412 + 课程结尾 1）；母版页在 ppt/course-master/（slide-01 总封面 / 02-03 目录 / 04 课程总结）
- **合并工具**：tools/merge_ppt.py（python-pptx 深拷贝合并，保留背景/表格/形状；顺序 封面+目录 → ch01..ch19 → 结尾）；tools/check_ppt.py 越界自检通过（416 页 0 越界）
- **PPT 标题去编号**（用户要求）：全部 19 章页面标题去除 "x.x / x.x.x" 前缀（914 处开头编号 + 12 处中间分隔编号），分隔页大节号保留；重编译后验证残留 0
- **新增文档**：课程大纲.md（章节/学时/实验/课件/CKA 五域映射 + 分级统计 + 学习路径）、README.md（课程包总览与快速开始）、agent.md（AI 协作代理工作契约：规范文件、硬性约定、课件/集群维护流程、交付自检清单）
### v2.44 课程大纲重写为标准模式（用户要求）
- 按标准大纲结构重写 课程大纲.md：课程概述 / 课程目标（知识+技能+认证三层）/ 课程受众 / 课程内容（六大部分 → 19 章 → 节 → 小节，条目化三层目录，全部取自教材真实标题）/ 教学安排（学时表+教学方法+实验分级）/ 考核与认证 / 教学环境与资源
- 章节标题从教材自动提取核对（tools/extract_toc.py，已删除临时输出）
### v2.45 README/agent 同步更新 + agent 增加教材更新指南（用户要求）
- README.md：课程大纲描述更新为标准模式；CHANGELOG 版本号更新；新增「版本一致性原则」节（三件套必须同一基线）
- agent.md：重构为 9 节（新增第 7 节「教材更新指南」+ 第 8 节决策红线 + 第 9 节质量自检）
  - 教材更新指南内容：①版本基线快照表（v1.36 全套组件版本/镜像加速/考试权重）②按章易过时内容清单（19 章逐章核对点）③官方数据源清单（kubernetes.io/release notes/CKA 官网/第三方 releases）④六步更新流程（定基线→实验先行实测→改手册→改教材→改课件→联动收尾）⑤交付检查清单
  - 目的：半年后更新教材时，agent 有足够信息把更新做得准确（命令可复现、概念不过时、CKA 考点准确）
### v2.46 教材/实验手册合并合集 + 飞书分发（用户要求）
- tools/merge_docs.py：合并教材 19 章 → 合集/Kubernetes-教材合集.md（358KB，含封面+目录）；合并实验手册 14 个 → 合集/Kubernetes-实验手册合集.md（548KB，含封面+目录+镜像清单附录）；fence 全偶数
- 已导入飞书云空间「Kubernetes 实战课程」文件夹（folder WP9bfdXFWlVkMXd6midc9TCTnib）：
  - 教材合集：https://zsyhjtnsa5.feishu.cn/docx/Ye0BdZfuGo5tsExLOAucRrxjn58
  - 实验手册合集：https://zsyhjtnsa5.feishu.cn/docx/Fp6odXRKmof6CHxkKy8cu4Zunpf
- 重新生成合集：python tools/merge_docs.py（tools/ 本地目录）
