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
