# Kubernetes 课程教材大纲（与实验手册配套）

> **课程定位**：本课程面向**Kubernetes 管理员**，目标是让学生：① 理解 Kubernetes 的概念、组件与设计原理；② 独立完成集群的搭建与日常管理；③ 掌握容器化应用的编排、运维与管理；④ 具备通过 **CKA（Certified Kubernetes Administrator）** 认证考试的能力。
>
> **教材与实验手册的关系**：教材是**独立的理论体系**（概念、组件、原理、设计决策），不是实验手册的说明文档；实验手册（实验 00-11）**从属于教材**，每章教材末尾的「实验演练」小节把本章重要知识点映射到实验手册对应 Lab——**先学原理，再动手验证**。
>
> **权威依据**：本大纲对标 [Kubernetes 官方文档 Concepts 体系](https://kubernetes.io/docs/concepts/) 与 [CKA 考试大纲](https://training.linuxfoundation.org/certified-kubernetes-administrator-cka-program-changes/)（5 域权重：集群架构/安装/配置 25%、工作负载与调度 15%、服务与网络 20%、存储 10%、故障排查 30%），章节组织参考 [《Kubernetes in Action》](https://www.manning.com/books/kubernetes-in-action-second-edition)（Marko Lukša）等权威教材的认知顺序。

---

## 第一部分：Kubernetes 基础（第 1-3 章）

### 第 1 章 容器与云原生基础
- **目标**：建立容器与云原生的前置认知，理解"为什么需要 Kubernetes"
- **要点**：
  - 容器技术原理（命名空间、cgroups、镜像分层）；Docker 快速回顾（镜像/容器/仓库）
  - 容器化的痛点：单机编排、健康检查、网络、存储、多副本
  - 云原生概念与 CNCF 生态；编排器的对比（K8s/Docker Swarm/Mesos）
- **实验演练**：无（前置知识，可使用 Docker 快速体验）
- **CKA 覆盖**：—（基础铺垫）

### 第 2 章 Kubernetes 概述与架构
- **目标**：理解 K8s 的核心概念与组件架构——**本书最重要的基础章**
- **要点**：
  - 核心概念：集群、节点、Pod、控制器、Service、命名空间；**声明式 API 与期望状态**（控制循环）
  - 控制面组件：kube-apiserver（API 入口）、etcd（状态存储）、kube-scheduler（调度）、kube-controller-manager（控制器）
  - 节点组件：kubelet、kube-proxy、容器运行时（CRI：containerd）
  - 对象模型：API 分组与版本、`kind/apiVersion/metadata/spec/status`、YAML 声明、kubectl 工作流（get/describe/apply/explain）
  - **企业级命名与标签规范**：K8s 官方推荐标签体系（app.kubernetes.io/*）、命名空间/对象命名规范
- **实验演练**：实验手册（实验 01） 「手动安装」装集群后，用 `kubectl get pods -n kube-system` 观察各组件 Pod
- **CKA 覆盖**：域 1（架构）

### 第 3 章 集群安装与配置
- **目标**：掌握用 kubeadm 从零搭建多节点集群，并能验证、维护
- **要点**：
  - 安装前置：资源规划、系统准备（swap/内核参数/CRI）、网络连通性评估（镜像源选择）
  - **容量规划与节点选型**：控制面/Worker 规格决策树、CIDR 容量推演、etcd 性能基线（SSD/IOPS）、内核调优基线
  - kubeadm 全流程：init → 加入 worker → 部署 CNI → 验证
  - 证书与 kubeconfig 体系（CA、admin.conf、节点证书）
  - 集群维护初探：节点管理、etcd 备份与恢复、kubeadm 升级（详见第 14 章深化）
- **实验演练**：实验手册（实验 01） 「手动安装（10 步）」「附录 A-F」
- **CKA 覆盖**：域 1（安装与配置，**核心域**）

---

## 第二部分：工作负载（第 4-8 章）

### 第 4 章 Pod 与容器
- **目标**：理解 Pod 作为最小调度单元的设计，掌握容器配置的方方面面
- **要点**：
  - Pod 设计：单/多容器、共享网络与存储、sidecar 模式、**Init 容器**
  - 容器配置：镜像与拉取策略、命令与参数、环境变量、标签与注解
  - 生命周期管理：**探针**（startup/liveness/readiness，含 gRPC 探针）、**生命周期钩子**（postStart/preStop）、优雅终止
  - **SecurityContext 概览**（安全基线）：runAsNonRoot/runAsUser、readOnlyRootFilesystem、capabilities——第 12 章深入
  - 资源模型：requests/limits（调度依据与运行时上限）、Downward API
- **实验演练**：实验手册（实验 02） （全部 10 Lab）
- **CKA 覆盖**：域 2（工作负载）

### 第 5 章 工作负载控制器
- **目标**：掌握各类控制器的原理与适用场景
- **要点**：
  - Deployment 与 ReplicaSet：副本管理、自愈、**滚动更新与回滚**（maxUnavailable/maxSurge）、扩缩容
  - StatefulSet：有序部署、稳定标识与网络、有状态应用
  - DaemonSet：每节点一个、系统组件模式
  - Job 与 CronJob：一次性/定时任务、backoffLimit、并发策略
  - 控制器选择决策树（无状态/有状态/守护/任务）
  - **生产发布策略设计**：滚动更新调优、蓝绿部署、金丝雀发布、变更窗口与回滚标准
- **实验演练**：实验手册（实验 03） （全部 6 Lab）
- **CKA 覆盖**：域 2（工作负载与调度）

### 第 6 章 调度器与调度策略
- **目标**：理解调度器决策过程，掌握控制 Pod 落点的机制
- **要点**：
  - 调度器原理：过滤（Filtering）与打分（Scoring）两阶段
  - 节点选择：nodeSelector → **节点亲和/反亲和**（required/preferred、matchExpressions）
  - Pod 亲和/反亲和：topologyKey、多副本高可用分布
  - 污点与容忍：三种 effect（NoSchedule/NoExecute/PreferNoSchedule）、驱逐语义
  - 节点维护：cordon/uncordon/drain；**PodDisruptionBudget**
  - **Pod 拓扑分布约束（topologySpreadConstraints）**：跨可用区/节点均衡打散的最佳实践；Descheduler 重调度概念
- **实验演练**：实验手册（实验 04） （全部 7 Lab）
- **CKA 覆盖**：域 2（调度）

### 第 7 章 自动扩缩与资源治理
- **目标**：掌握水平/垂直扩缩与命名空间资源约束
- **要点**：
  - metrics-server 与指标链路；**HPA**（autoscaling/v2、指标类型、behavior）
  - VPA 简介；ClusterAutoscaler 概念
  - 资源治理三层：requests/limits → **LimitRange**（单 Pod 约束）→ **ResourceQuota**（命名空间总量）
  - **多租户治理体系**：命名空间规划模型、四层隔离（逻辑/资源/网络/节点）、超卖策略；Pod 资源原地更新（1.27+）
- **实验演练**：实验手册（实验 05） （全部 4 Lab）
- **CKA 覆盖**：域 2/5（扩缩与资源相关）

### 第 8 章 配置管理（ConfigMap 与 Secret）
- **目标**：掌握配置与敏感信息的外部化管理（承接第 4 章"容器怎么配置"，本课讲"配置怎么外部化"）
- **要点**：
  - ConfigMap：创建方式（字面量/文件/目录）、消费方式（卷挂载 vs 环境变量）、热更新语义
  - Secret：类型（Opaque/tls/dockerconfigjson）、base64 本质（编码≠加密）、RBAC 保护
  - 与 Downward API 的对比（外部配置 vs Pod 自身元数据）
  - **subPath 挂载陷阱警示**（丧失热更新）；immutable 配置与热更新工具（Reloader）
  - 安全最佳实践：最小权限、etcd 加密（详见第 13 章）、外部密钥管理简介
- **实验演练**：实验手册（实验 06） （5 Lab + Secret 类型 + Downward API 补充）
- **CKA 覆盖**：域 1/2（配置相关）

---

## 第三部分：网络与存储（第 9-10 章）

### 第 9 章 服务、负载均衡与网络
- **目标**：理解 Service 与网络模型，掌握服务暴露与网络隔离
- **要点**：
  - Service 原理：kube-proxy（iptables/IPVS）、Endpoints、ClusterIP/NodePort/LoadBalancer/ExternalName、headless
  - 集群 DNS 与名称解析（coredns、命名空间作用域）
  - **Ingress**：七层路由（host/path）、TLS 终止、ingress-nginx
  - **NetworkPolicy**：默认全通与白名单隔离、ingress/egress、CNI 支持（calico）
  - CNI 与 Pod 网络模型（每 Pod 一 IP）
- **实验演练**：实验手册（实验 07） （全部 6 Lab + 补充）
- **CKA 覆盖**：域 3（服务与网络，**核心域**）

### 第 10 章 存储
- **目标**：理解存储抽象层次，掌握持久化配置
- **要点**：
  - 卷（Volume）类型：emptyDir/hostPath/configMap/secret 等
  - **PV 与 PVC**：生命周期（Provision/Bind/Use/Reclaim）、访问模式、回收策略
  - **StorageClass** 与动态供应：provisioner、默认类、WaitForFirstConsumer
  - CSI 与共享存储（NFS/云盘）对比；存储选型
- **实验演练**：实验手册（实验 08） （全部 4 Lab，StorageClass 在 Lab 4 安装）
- **CKA 覆盖**：域 4（存储）

---

## 第四部分：安全（第 11-13 章）

### 第 11 章 认证与授权
- **目标**：理解 K8s 安全模型的信任边界，掌握身份与权限管理——**管理员核心技能**
- **要点**：
  - 认证机制：用户证书（CA 签发）、ServiceAccount、Token（v1.24+ `create token`）、kubeconfig 多上下文
  - 授权模型：**RBAC**（Subject/Role/ClusterRole/Binding）、内置角色（view/edit/admin/cluster-admin）、最小权限设计
  - 认证 vs 授权：两个独立环节（能登录 ≠ 有权限）
  - 自定义 Role 的 rules 写法（apiGroups/resources/verbs）
- **实验演练**：实验手册（实验 09） Lab 1-6（证书/SA/授权/dashboard 综合演练）
- **CKA 覆盖**：域 1/2/3（安全贯穿，**考试高频**）

### 第 12 章 准入控制与容器安全
- **目标**：理解"创建时把关"与"运行时加固"两道防线
- **要点**：
  - Admission Controllers 原理（Mutating/Validating、准入时机）
  - **Pod Security Admission**：privileged/baseline/restricted 三级、命名空间标签实施（PSP 已废弃声明）
  - **Seccomp Profile**（RuntimeDefault，restricted 强制项）；OPA Gatekeeper / Kyverno 策略即代码简述
  - **SecurityContext**：runAsUser/readOnlyRootFilesystem/capabilities、Pod 级与容器级
  - 镜像安全：私有仓库凭据（imagePullSecrets）、镜像签名简介、最小镜像原则
- **实验演练**：实验手册（实验 09） Lab 7/8（SecurityContext/PSA）
- **CKA 覆盖**：域 1/2/3

### 第 13 章 集群安全加固
- **目标**：理解集群级信任链（证书、数据、节点），掌握加固手段
- **要点**：
  - 集群 TLS 体系：组件证书、kubeconfig、`kubeadm certs renew` 续期
  - etcd 安全：TLS、备份加密（静态加密 EncryptionConfiguration）
  - kubelet 认证授权（Webhook 模式）；ServiceAccount 令牌安全
  - **API Server 审计日志**：Audit Policy 配置与四个阶段（RequestReceived/ResponseStarted/ResponseComplete/Panic）、审计存储与合规用途
  - 密钥安全：base64 ≠ 加密、RBAC 保护 Secret、NetworkPolicy 网络隔离深化
- **实验演练**：实验手册（实验 09） Lab 1/7/8/9（证书体系/SC/PSA/集群加固）
- **CKA 覆盖**：域 1/3

---

## 第五部分：集群运维（第 14-16 章）

### 第 14 章 集群日常管理与维护
- **目标**：掌握生产集群运维的**完整流程**（从"命令"到"流程"）
- **要点**：
  - 节点管理：cordon/drain/uncordon、污点隔离、维护窗口；**PDB 保护业务**
  - 集群升级：完整流程（排空→升级→验证→回滚预案、控制面先行、worker 逐台）、版本兼容窗口
  - **etcd 备份策略**：备份周期与保留、异地存放、**恢复演练**（何时需要恢复、恢复会丢什么）
  - **高可用概念**：控制面多 master（--control-plane-endpoint）、etcd Raft（为何奇数节点）
  - 命名空间与配额治理、对象清理
  - **应用级灾备（Velero）**；运维日历（日/周/月/季巡检项）；Addons 升级管理；Cluster Autoscaler/Karpenter 节点自动扩缩
- **实验演练**：实验手册（实验 12） （全部 4 Lab，Lab 4 可选·进阶）
- **CKA 覆盖**：域 1/5

### 第 15 章 可观测性：监控、日志与事件
- **目标**：建立"指标 + 日志 + 事件"三支柱的可观测性体系
- **要点**：
  - 指标：metrics-server、kubectl top、Prometheus/Grafana 体系概念（不深挖 PromQL）
  - 日志：kubectl logs、日志收集模式（sidecar / daemonset）、Kubernetes 日志架构
  - 事件：kubectl get events、审计日志概念
  - 生产可观测性怎么落地（指标告警、日志聚合、排障入口）
- **实验演练**：实验手册（实验 05） Lab 1/2 + 实验 14（可选·进阶：Prometheus 监控体系）
- **CKA 覆盖**：域 5

### 第 16 章 故障排查与可靠性
- **目标**：建立分层排障方法论与可靠性工程思维（**CKA 最高权重域 30%**）
- **要点**：
  - **分层排障框架**：节点层 → Pod 层 → 容器层 → 网络层 → 存储层，每层的关键命令与判断依据
  - **证据链思维**：describe（事件）→ logs（输出）→ events（全局），从现象定位根因
  - 可靠性工程：滚动更新策略调优（maxUnavailable/maxSurge）、优雅终止深化（preStop + grace period）、**PDB 保护计算**（ALLOWED DISRUPTIONS）
  - **主动演练**：杀节点/杀 Pod/断网络验证自愈
  - **SRE 运营规范**：SLO/SLI/Error Budget、故障复盘（Post-mortem）模板；临时容器（kubectl debug）排障
- **实验演练**：实验手册（实验 10） （8 Lab，含可靠性演练）
- **CKA 覆盖**：域 5（故障排查，**30% 权重**）

---

## 第六部分：综合与扩展（第 17-19 章）

### 第 17 章 Helm 与 Kustomize（应用打包与部署）
- **目标**：掌握企业级应用交付工具链——用 Helm 打包/发布应用，用 Kustomize 做环境化定制
- **要点**：
  - Helm 核心模型：Chart（打包）→ Release（实例）→ Repository（仓库）；模板化与 values 覆盖
  - 常用命令：`helm install/upgrade/rollback/uninstall`、`helm repo add`、`helm search`
  - Kustomize：`kustomization.yaml`、overlay 环境定制（与 Helm 的定位差异）
  - Chart 结构解剖（Chart.yaml/values.yaml/templates）；生产发布流程（Chart 版本化、CI/CD 集成）
  - CRD 与 Operator 模式展望（扩展集群能力：自定义资源 + 控制器，如 cert-manager/Prometheus Operator）——**见第 18 章末展望小节**
- **实验演练**：实验手册（实验 13） （全部 3 Lab：Chart 打包/发布/升级/回滚 + values 多环境 + Kustomize）
- **CKA 覆盖**：域 1/2（辅助；Helm 是 CKAD 考点）

### 第 18 章 综合实战：应用发布全流程
- **目标**：综合运用全书知识发布真实应用（WordPress 案例）
- **要点**：
  - 应用架构设计（数据/应用分离、无状态前端 + **有状态数据库用 StatefulSet**）
  - 全链路：Ingress → Service → Deployment（HPA）→ PVC → Secret
  - 持久化验证、扩展验证、域名发布验证
  - **展望：CRD 与 Operator 模式**——自定义资源扩展集群、Operator = CRD + 控制器（cert-manager/Prometheus Operator 实例）
- **实验演练**：实验手册（实验 11） （全部 6 Lab，Lab 6 生产化可选·进阶）
- **CKA 覆盖**：综合运用

### 第 19 章 CKA 考试指南
- **目标**：备考冲刺与考试策略
- **要点**：
  - 考试环境与题型（终端实操、kubectl 快捷键、不可用外网）
  - 五大域考点速查表（命令/对象/场景）
  - 时间管理与答题策略（先易后难、dry-run 技巧、上下文切换、jsonpath 速查）
  - 模拟演练与常见陷阱（版本差异、镜像源、对象参数变化）
- **实验演练**：全书 Lab 按 CKA 域重刷 + 模拟题
- **CKA 覆盖**：全部 5 域

---

## 课程安排建议

| 部分 | 章节 | 建议学时（理论+实验） | CKA 域覆盖 |
|---|---|---|---|
| 一、基础 | 第 1-3 章 | 8 学时 + 实验手册（实验 01） | 域 1 |
| 二、工作负载 | 第 4-8 章 | 12 学时 + 实验手册 02/03/07/09/06 | 域 2 |
| 三、网络与存储 | 第 9-10 章 | 8 学时 + 实验手册（实验 07/08） | 域 3、域 4 |
| 四、安全 | 第 11-13 章 | 8 学时 + 实验手册（实验 09） | 域 1/2/3 |
| 五、集群运维 | 第 14-16 章 | 8 学时 + 实验手册（实验 12/10） | 域 1/5 |
| 六、综合与扩展 | 第 17-19 章 | 8 学时 + 实验手册（实验 13/实验 14 可选/实验 11） | 全部 + CKAD 部分 |

**合计**：约 52 学时（理论 24 + 实验 28）+ 课后 CKA 模拟刷题

---

## 教材与实验手册映射速查

| 教材章节 | 配套实验手册演练 |
|---|---|
| 第 2 章 架构 | 实验 01 （装完观察组件） |
| 第 3 章 安装 | 实验 01 全部 + 附录 A-F |
| 第 4 章 Pod | 实验 02 （12 Lab） |
| 第 5 章 控制器 | 实验 03 （8 Lab） |
| 第 6 章 调度 | 实验 04 （9 Lab） |
| 第 7 章 扩缩与资源 | 实验 05 （6 Lab） |
| 第 8 章 配置管理 | 实验 06 （8 Lab + 补充） |
| 第 9 章 网络 | 实验 07 （7 Lab + 补充） |
| 第 10 章 存储 | 实验 08 （7 Lab） |
| 第 11 章 认证授权 | 实验 09 Lab 1-6 |
| 第 12 章 准入与容器安全 | 实验 09 Lab 7/8 |
| 第 13 章 集群加固 | 实验 09 Lab 1/7/8/9 |
| 第 14 章 日常运维 | 实验 12 （4 Lab） |
| 第 15 章 可观测性 | 实验 05 Lab 1/2 + 实验 14 （可选·进阶） |
| 第 16 章 排障与可靠性 | 实验 10 （8 Lab） |
| 第 17 章 Helm 与 Kustomize | 实验 13 （全部 3 Lab） |
| 第 18 章 综合 | 实验 11 （全部 6 Lab） |
| 第 19 章 备考 | 全书按 CKA 域重刷 |

---

> **说明**：本大纲为总纲，教材正文按此展开（每章含：学习目标 → 概念讲解 → 原理图解 → 设计决策 → 最佳实践 → 实验演练指引 → CKA 考点标注 → 思考题）。后续可按章节逐步编写教材正文。
