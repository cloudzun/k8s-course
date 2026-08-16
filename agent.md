# agent.md — AI 协作代理工作约定

> 本文件是给维护本课程包（教材/实验手册/课件/大纲）的 AI 代理或协作者的**工作契约**。动手前先读本文件与对应 STYLE-GUIDE；任何修改完成后必须更新 `CHANGELOG.md`。
> **最重要的场景：半年后更新教材**——届时直接跳到第 7 节「教材更新指南」，按其中的版本基线快照、易过时清单、数据源与验证流程执行。

## 1. 仓库定位

本目录 `02-Kubernetes核心知识/` 是一套完整的 K8s 授课课程包：**教材（textbook/）+ 实验手册（manual/）+ 授课课件（ppt/）**。三者关系：

- **教材**：讲"是什么、为什么"（概念、原理、设计决策、生产基线）
- **实验手册**：讲"怎么做"（六要素结构：目标/验证概念/配置要点/观察点/清理/本章小结）——**实验手册从属于教材，不是教材的扩展说明**
- **课件**：授课 PPT，内容忠实教材（保留章节编号与术语），由 pptxgenjs 源码生成
- **课程大纲.md**：对外交付的标准模式大纲（概述/目标/受众/三层目录/教学安排/考核），章节结构变更时必须同步

## 2. 关键规范文件（修改前必读）

| 文件 | 约束内容 |
|---|---|
| `manual/STYLE-GUIDE.md` | 实验六要素、**实验分级标注体系 §2.2.1**（必做/推荐/可选·进阶，标注在 Lab 标题 + 实验准备分级表 + 小结级别列 三处）、fence 偶数等 |
| `textbook/TEXTBOOK-STYLE-GUIDE.md` | 教材只写 what/why；术语统一查 `GLOSSARY.md`；引用用 §X.Y 格式 |
| `textbook/mermaid_specification.md` | 教材图表 Mermaid 规范（配色/模板/读图要点） |
| `课程大纲.md` / `textbook/COURSE-OUTLINE.md` | 章节 ↔ 实验 ↔ 课件 ↔ CKA 映射（改章节结构时同步更新） |

## 3. 硬性约定

1. **CHANGELOG 留痕**：每次实质性修改（教材/实验/课件/镜像/大纲）在 `CHANGELOG.md` 追加一条 `### vX.Y 标题`（版本号递增，当前 v2.44）。格式：做了什么 + 为什么 + 验证结果。
2. **fence 偶数**：改任何 .md 后检查 ` ``` ` 代码围栏数量为偶数（工具：`([regex]::Matches($c,'(?m)^```')).Count`）。
3. **UTF-8 无 BOM**：写中文文件用 UTF-8（PowerShell 用 `New-Object System.Text.UTF8Encoding($false)`；write 工具默认 OK）。
4. **不改用户已锁定的决策**（红线，见第 8 节）。
5. **镜像改动**：涉及镜像（换 tag/新增/移除）必须同步更新 `manual/00-实验镜像清单.md`，并在集群实测（`tools/r.ps1`）。
6. **三件套联动**：改概念 → 教材/课件/大纲/实验四者对应内容一起改，禁止只改一处造成版本割裂。

## 4. 课件维护（ppt/）

工程结构：每章 `ppt/chXX/` 下 `common.js`（样式库，全课程共用一份拷贝）+ `compile.js` + `slide-NN.js`（一页一文件）+ `output/*.pptx`。

- **重新生成单章**：`$env:NODE_PATH="C:\Users\cheng\AppData\Roaming\npm\node_modules"; node compile.js`（在该章目录）
- **越界自检**：`python tools/check_ppt.py <pptx路径>`，必须 0 越界才能交付
- **完整版刷新**：改完章节后跑 `python tools/merge_ppt.py`（顺序：总封面+目录 → ch01..ch19 → 课程结尾；母版在 `ppt/course-master/`）
- **页面规范**：
  - 坐标系 10×5.625 英寸（LAYOUT_16x9），所有元素必须在画布内
  - 配色用 `common.js` 的 C 对象（primary #326CE5 K8s 蓝）
  - 标题**不带 "x.x / x.x.x" 章节编号前缀**（分隔页大节号是版式元素，保留）
  - 中文引号一律用 “ ”（不要用「」）
  - 底部金句条 `calloutBar` **克制使用**（每章 ≤3 处，仅真结论/警示/CKA 考点；禁止讲师提示/衔接性质的话）
  - 内容忠实教材，可压缩合并；实验相关只标"（实验 NN）"，不写实验步骤

## 5. 集群实测（tools/）

- `tools/r.ps1 -Machine 1|2|3 -Cmd "..."`：SSH 到云主机执行（机器信息见 `tools/r.ps1.example`，真实 `r.ps1` 含密码、被 .gitignore 排除、不入库）
- 长命令用 base64 包裹：`echo <b64> | base64 -d | bash`
- 修改实验手册中的命令/镜像后，**必须在真实集群验证**，把实测结果写进 CHANGELOG（参考 v2.40 的修正记录格式：问题→修正表）

## 6. 常见任务速查

| 任务 | 步骤 |
|---|---|
| 改教材一章 | 读 TEXTBOOK-STYLE-GUIDE → 改 chXX → 检查引用/术语/fence → 同步课件该章 → CHANGELOG |
| 改实验一个 Lab | 读 STYLE-GUIDE §2.2 → 改 manual/XX → 六要素齐全 + 分级三处一致 + fence 偶数 → 集群验证 → CHANGELOG |
| 新增实验 | 建 manual/XX-xxx.md → 分级表/标题后缀/小结级别列 → 镜像清单补充 → COURSE-OUTLINE 映射更新 → 课件对应章加"（实验 NN）" → CHANGELOG |
| 改一页 PPT | 改 slide-NN.js → 编译 → check_ppt.py → merge_ppt.py → CHANGELOG |
| 课件换风格 | 只改 common.js（各章是拷贝，需同步 19 份 + course-master）→ 全量重编译 → merge → 自检 |
| **升级教材版本** | 见第 7 节完整流程 |

## 7. 教材更新指南（半年后更新时执行）

> 目标：把教材/实验/课件从当前基线（K8s **v1.36**）对齐到新版本（如 v1.38），保证**命令可复现、概念不过时、CKA 考点准确**。

### 7.1 更新前：读取版本基线快照（当前 v1.36 记录）

| 项 | 当前值（本课程锁定） |
|---|---|
| Kubernetes | v1.36.3（kubeadm 安装） |
| 容器运行时 | containerd 2.2.x |
| CNI | Calico v3.29.1 |
| 指标 | metrics-server v0.9.0（kubectl top 数据源） |
| 集群 DNS | CoreDNS（v1.14.x） |
| Ingress | ingress-nginx v1.12.0 |
| 本地存储 | local-path-provisioner（默认 StorageClass） |
| 考试对接 | CKA 五大域（架构 25% / 工作负载 15% / 网络 20% / 存储 10% / 排障 30%） |
| 操作系统 | Ubuntu 24.04 LTS |
| 实验环境 | 3 节点云主机（1 控制面 + 2 worker），阿里云内网 192.168.0.x |
| 镜像加速 | docker.io→1panel / registry.k8s.io→阿里云 google_containers / quay.io→daocloud |

### 7.2 已知的"易过时内容"清单（按章核对）

| 章 | 易过时点 | 更新时检查什么 |
|---|---|---|
| 1 | OCI 标准本身稳定；Docker 命令 | 无大改；确认 Docker Hub 政策变化不影响叙述 |
| 2 | 架构/组件稳定；**CKA 域权重**可能调整 | 对照 CKA 官网最新考试大纲（kubernetes.io 的 CKA 页面） |
| 3 | **版本号**（v1.36.3）、kubeadm init 参数、**镜像 tag**（pause/coredns/etcd/calico/metrics-server）、containerd 配置路径 | 全部以新版本实测输出为准重写输出示例 |
| 4 | API 版本（Pod v1 稳定）、探针字段、**Downward API 新字段** | 对照官方 API 参考 |
| 5 | Deployment/STS 机制稳定；**rolling update 参数默认值**可能变 | 对照官方文档 §deployment |
| 6 | 调度机制稳定；**内置污点/PDB API 版本**（policy/v1 已稳定） | 无大改 |
| 7 | **HPA autoscaling/v2 已是主流**；`kubectl autoscale` 参数（v1.36 用 --cpu=60% 而非 --cpu-percent）；KEDA 版本 | 对照官方 autoscaling 文档 + 集群实测 |
| 8 | ConfigMap/Secret 稳定；immutable 已是正式特性 | 无大改 |
| 9 | **Gateway API 进展**（可能转正）；ingress-nginx 版本；**kube-proxy 默认模式**（iptables→IPVS 是否切换） | 对照官方网络文档 + release notes |
| 10 | **local-path/CSI** 生态；Volume Snapshot API 版本 | 对照官方 CSI 文档 |
| 11 | **SA Token 机制**（v1.24+ 已无长期 token）；OIDC 配置参数 | 对照官方认证文档 |
| 12 | **PSA 版本**（enforce-version 标签要随版本更新，如 v1.36）；Seccomp 默认值 | 对照官方 PSA 文档 |
| 13 | **证书有效期**（kubeadm 1 年）；etcd 静态加密配置格式；审计 API 版本 | kubeadm 实测 `certs check-expiration` |
| 14 | **kubeadm upgrade 路径**（不能跳版本）；etcd 备份命令（etcdctl 版本） | 实测升级流程 |
| 15 | **Prometheus/KEDA 等第三方版本**；metrics-server 参数（--kubelet-insecure-tls 是否仍需） | 对照各项目 release |
| 16 | 排障命令稳定；kubectl debug 已是正式特性 | 无大改 |
| 17 | **Helm v3 版本**（当前 v3.18）；Kustomize 内置 kubectl | 对照 helm releases |
| 18 | 综合实战稳定 | 重跑实验 11 验证 |
| 19 | **CKA 考试内容与权重、考试环境**（版本/多集群/无外网） | 必须查 CKA 官网最新信息 + kubernetes.io 培训页 |

### 7.3 官方数据源（更新时核对用）

1. **Kubernetes 官方文档**：kubernetes.io（概念/任务/参考——API 参考、kubectl 命令、组件配置）
2. **Release Notes**：github.com/kubernetes/kubernetes/releases（新版本特性与弃用）
3. **CKA 考试大纲**：kubernetes.io 的 CKA 页面（域与权重以官网为准）
4. **kubeadm 文档**：kubernetes.io/docs/setup（安装参数/升级路径）
5. **第三方项目**：Calico/containerd/metrics-server/ingress-nginx/local-path/Helm/KEDA 各自的 GitHub releases
6. **CKA 社区**：killercoda 沙盒、官方模拟题（考试环境体验）

### 7.4 更新执行流程（六步）

1. **定基线**：确定目标 K8s 版本 → 读该版本 release notes + 官方文档变更点 → 列出"影响本课程的命令/参数/镜像/API"清单（对照 7.2 表）
2. **实验先行（实测为准）**：在 3 节点集群升级/重装到新版本 → 重跑实验 01 全流程 → 逐章重跑受影响实验（02-14）→ 用**实测输出替换**教材与手册中的终端输出示例（这是准确性的根本：不猜、不抄旧版）
3. **改实验手册**：命令/参数/镜像 tag/输出 → 六要素与分级标注保持 → 更新 `00-实验镜像清单.md`（新增/失效镜像、国内可拉性实测）
4. **改教材**：概念部分除非官方行为变化否则不动；改版本号、参数、输出示例、API 版本引用；**CKA 章节必须按官网最新大纲修订**
5. **改课件**：同步教材改动（每章 slide 中出现的版本号/命令/输出）→ 编译 → check_ppt.py → merge_ppt.py
6. **联动收尾**：更新 `课程大纲.md`（版本基线、学时不变）、`README.md` 环境基线、`CHANGELOG.md`（v2.45+ 记录：目标版本、改动范围、实测结果）

### 7.5 交付检查清单（更新完成后）

- [ ] 实验手册所有命令在新版本集群**实测通过**（终端输出已替换为实测）
- [ ] 教材版本号/参数/镜像 tag 与实验手册一致（grep 新旧版本号确认无残留，如 `1.36`、`v0.9.0`）
- [ ] 镜像清单更新且国内可拉（KEDA/ghcr 例外已注明）
- [ ] 课件编译 0 越界、完整版已 merge、无"x.x"标题、引号为 “ ”
- [ ] CKA 章节与官网最新大纲一致
- [ ] 课程大纲/README 环境基线更新
- [ ] CHANGELOG 已记录：目标版本、改动范围、实测结果、遗留问题
- [ ] fence 全偶数、三件套版本一致（无"教材 v1.38、实验还 v1.36"割裂）

## 8. 决策红线（用户已锁定，不要擅自更改）

1. 版本基线策略：跟随"当前最新稳定版"（实验 01 动态获取），但一旦锁定某版本（如 v1.36），三件套统一
2. 实验手册**不配图片**（文字+终端输出）
3. 实验分级体系（必做/推荐/可选·进阶）及三处标注位置
4. 实验称"实验 NN"，不称"第 N 章"；课程↔实验 1:1 映射
5. StorageClass 教学安排在实验 08 Lab 4 安装（不在实验 01）
6. 教材是"讲清原理"，不是实验手册的扩展说明
7. 中文标点：正文与 PPT 用 “ ”；「」不用（已全局替换）
8. 课件标题不带章节编号前缀；金句条克制

## 9. 质量自检清单（交付前）

- [ ] 实验：六要素完整、分级三处一致、fence 偶数、镜像可拉（国内）
- [ ] 教材：无"后面会介绍"指针、术语统一、章节编号连续、引用格式 §X.Y
- [ ] 课件：0 越界、无编号标题、金句条克制、编译通过
- [ ] 文档：CHANGELOG 已记录、README/大纲中的数字与实际一致
- [ ] 版本：三件套同一基线（无割裂）
