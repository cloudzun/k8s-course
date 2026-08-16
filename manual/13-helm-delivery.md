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
