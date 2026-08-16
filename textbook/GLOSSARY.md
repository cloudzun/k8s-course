# 教材术语对照表（Glossary）

> 本书核心名词**按惯例保留英文**（Pod/Node/Namespace 等不翻译）；以下为全书统一译法与对照，编写与修订时保持一致。首次出现章节供检索。

| 英文术语 | 中文对照/说明 | 首次出现 |
|---|---|---|
| Pod | 容器组（**保留英文**，不翻译） | 第 2 章 |
| Node | 节点（**保留英文**） | 第 2 章 |
| Namespace | 命名空间 | 第 2 章 |
| Control Plane | 控制面（旧称 master） | 第 2 章 |
| Worker Node | 工作节点 | 第 2 章 |
| kube-apiserver | API 服务器（**组件名保留英文**） | 第 2 章 |
| etcd | 状态存储（组件名保留） | 第 2 章 |
| kube-scheduler | 调度器 | 第 2 章 |
| kube-controller-manager | 控制器管理器 | 第 2 章 |
| kubelet | 节点代理（组件名保留） | 第 2 章 |
| kube-proxy | 网络代理（组件名保留） | 第 2 章 |
| Container Runtime | 容器运行时 | 第 3 章 |
| CRI | 容器运行时接口 | 第 3 章 |
| CNI | 容器网络接口 | 第 3 章 |
| Deployment | 部署控制器（**保留英文**） | 第 5 章 |
| ReplicaSet | 副本集 | 第 5 章 |
| StatefulSet | 有状态控制器（保留英文） | 第 5 章 |
| DaemonSet | 守护控制器（保留英文） | 第 5 章 |
| Job / CronJob | 一次性/定时任务 | 第 5 章 |
| Service | **保留英文**（集群内负载均衡入口，不译作"服务"） | 第 2 章 |
| Ingress | 入口（七层路由，保留英文） | 第 9 章 |
| Gateway API | 网关 API（Ingress 继任者） | 第 9 章 |
| NetworkPolicy | 网络策略 | 第 9 章 |
| Volume | 卷 | 第 10 章 |
| PV / PVC | 持久卷 / 持久卷声明 | 第 10 章 |
| StorageClass | 存储类 | 第 10 章 |
| ConfigMap | 配置映射（**保留英文**） | 第 8 章 |
| Secret | 密钥（**保留英文**） | 第 8 章 |
| Downward API | 下行 API（元数据注入） | 第 8 章 |
| RBAC | 基于角色的访问控制 | 第 11 章 |
| ServiceAccount | 服务账号（保留英文） | 第 11 章 |
| PSA | Pod 安全准入 | 第 12 章 |
| SecurityContext | 安全上下文 | 第 4/12 章 |
| HPA | 水平 Pod 自动扩缩器 | 第 7 章 |
| VPA | 垂直 Pod 自动扩缩器 | 第 7 章 |
| LimitRange | 资源范围限制 | 第 7 章 |
| ResourceQuota | 资源配额 | 第 7 章 |
| Taint / Toleration | 污点 / 容忍 | 第 6 章 |
| PDB | Pod 中断预算 | 第 6 章 |
| topologySpreadConstraints | Pod 拓扑分布约束 | 第 6 章 |
| Helm / Chart | 包管理器 / 打包单元（保留英文） | 第 17 章 |
| Kustomize | 配置定制工具（保留英文） | 第 17 章 |
| Operator / CRD | 操作器 / 自定义资源定义 | 第 18 章 |
| Liveness/Readiness/Startup Probe | 存活/就绪/启动探针 | 第 4 章 |
| etcd snapshot | etcd 快照（备份） | 第 14 章 |
| SLI / SLO / SLA | 服务级别指标/目标/协议 | 第 16 章 |
| Error Budget | 故障预算 | 第 16 章 |
| Post-mortem | 故障复盘 | 第 16 章 |
| OIDC | 开放身份连接（企业 SSO） | 第 11 章 |
| Audit Log | 审计日志 | 第 13 章 |
| Tracing / OpenTelemetry | 分布式追踪 / 可观测性框架 | 第 15 章 |
| PromQL | Prometheus 查询语言 | 第 15 章 |
| Velero | 应用级灾备工具（保留英文） | 第 14 章 |
| KEDA | 事件驱动自动扩缩器 | 第 7 章 |
| Seccomp / AppArmor | 系统调用过滤 / 强制访问控制 | 第 12 章 |
| OPA Gatekeeper / Kyverno | 策略引擎（保留英文） | 第 12 章 |
| kubectl debug | 临时容器排障 | 第 16 章 |
| JSONPath | 查询 JSON 的路径表达式（kubectl -o jsonpath） | 第 19 章 |
| cert-manager | 证书自动签发/续期 Operator（保留英文） | 第 18 章 |
| Endpoints / EndpointSlice | 服务后端列表 / 下一代后端切片 | 第 9 章、第 16 章 |
| Mutating / Validating Webhook | 准入 Webhook（修改型 / 校验型） | 第 12 章 |
| ServiceMonitor | Prometheus Operator 的抓取声明 | 第 15 章 |

> 维护规则：新增术语先查本表；同一术语全书统一译法；**核心组件/资源名（Pod/Node/Namespace/Service/Deployment/etcd 等）一律保留英文，不译作中文**。
