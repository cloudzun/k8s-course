# -*- coding: utf-8 -*-
"""构建 GitHub Pages 文档站点：把教材/实验手册/大纲/答案同步到 docs/ 目录
用法: python tools/build_docs.py   （本地与 CI 通用）
"""
import glob
import os
import re
import shutil

# 仓库根 = 本文件(scripts/build_docs.py)的上两级目录
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")

# 清空重建 docs/
if os.path.isdir(DOCS):
    shutil.rmtree(DOCS)
os.makedirs(DOCS)
os.makedirs(os.path.join(DOCS, "textbook"))
os.makedirs(os.path.join(DOCS, "manual"))


def copy_md(src, dst_dir):
    os.makedirs(dst_dir, exist_ok=True)
    shutil.copy2(src, os.path.join(dst_dir, os.path.basename(src)))


# 1. 教材 19 章
for f in sorted(glob.glob(os.path.join(ROOT, "textbook", "ch*.md")),
                key=lambda p: int(re.search(r"ch(\d+)", os.path.basename(p)).group(1))):
    copy_md(f, os.path.join(DOCS, "textbook"))

# 2. 教材辅助文档
for name in ["COURSE-OUTLINE.md", "GLOSSARY.md", "思考题参考答案.md"]:
    src = os.path.join(ROOT, "textbook", name)
    if os.path.exists(src):
        copy_md(src, os.path.join(DOCS, "textbook"))

# 3. 实验手册（00 镜像清单放 manual 下，STYLE-GUIDE 不入站）
for f in sorted(glob.glob(os.path.join(ROOT, "manual", "*.md"))):
    base = os.path.basename(f)
    if base == "STYLE-GUIDE.md":
        continue
    copy_md(f, os.path.join(DOCS, "manual"))

# 4. 课程大纲
copy_md(os.path.join(ROOT, "课程大纲.md"), DOCS)

# 5. 自定义样式
os.makedirs(os.path.join(DOCS, "assets"), exist_ok=True)
extra_css = """/* 站点自定义样式 */
.md-typeset h1 { font-weight: 700; }
.md-typeset table { font-size: 0.85em; }
.md-typeset pre > code { max-height: 480px; overflow: auto; }
.md-typeset .admonition { font-size: 0.9em; }
"""
with open(os.path.join(DOCS, "assets", "extra.css"), "w", encoding="utf-8") as fh:
    fh.write(extra_css)

# 6. 首页（README 精简版）
readme = open(os.path.join(ROOT, "README.md"), encoding="utf-8").read()
index = f"""# Kubernetes 容器云原生实战课程

> 一套可直接授课的 Kubernetes 课程：**教材（19 章）+ 实验手册（14 个实验 / 93 个 Lab）+ 授课课件（19 章 / 412 页）** 三件套一体化交付，基于 Kubernetes **v1.36** 在 3 节点真实集群上全实验实测，全面对接 **CKA** 认证。

## 📚 内容导航

- **[课程大纲](课程大纲.md)** — 课程概述 / 目标 / 受众 / 三层目录 / 教学安排 / 考核
- **教材**（19 章）：
  - [第 1 章 容器与云原生基础](textbook/ch01-containers-and-cloud-native.md)
  - [第 2 章 Kubernetes 概述与架构](textbook/ch02-kubernetes-overview-and-architecture.md)
  - [第 3 章 集群安装与配置](textbook/ch03-cluster-installation-and-configuration.md)
  - [第 4 章 Pod 与容器](textbook/ch04-pod-and-containers.md)
  - [第 5 章 工作负载控制器](textbook/ch05-workload-controllers.md)
  - [第 6 章 调度与 Pod 放置](textbook/ch06-scheduling-and-pod-placement.md)
  - [第 7 章 自动扩缩与资源治理](textbook/ch07-autoscaling-and-resource-governance.md)
  - [第 8 章 配置管理](textbook/ch08-configuration-management.md)
  - [第 9 章 服务、负载均衡与网络](textbook/ch09-services-load-balancing-networking.md)
  - [第 10 章 存储](textbook/ch10-storage.md)
  - [第 11 章 认证与授权](textbook/ch11-authentication-and-authorization.md)
  - [第 12 章 准入与容器安全](textbook/ch12-admission-and-container-security.md)
  - [第 13 章 集群安全加固](textbook/ch13-cluster-security-hardening.md)
  - [第 14 章 集群维护与运维](textbook/ch14-cluster-maintenance-and-operations.md)
  - [第 15 章 可观测性](textbook/ch15-observability-monitoring-logging-events.md)
  - [第 16 章 故障排查与可靠性](textbook/ch16-troubleshooting-and-reliability.md)
  - [第 17 章 Helm 与 Kustomize](textbook/ch17-helm-and-kustomize.md)
  - [第 18 章 综合实战](textbook/ch18-comprehensive-practical-wordpress.md)
  - [第 19 章 CKA 考试指南](textbook/ch19-cka-exam-guide.md)
- **实验手册**（14 个实验 / 93 Lab）：
  - [实验 01 集群安装](manual/01-cluster-installation.md) · [实验 02 Pod](manual/02-pod.md) · [实验 03 工作负载调度](manual/03-workload-scheduling.md) · [实验 04 资源调度](manual/04-resource-scheduling.md) · [实验 05 性能监控](manual/05-performance-and-monitoring.md) · [实验 06 配置管理](manual/06-configmap-and-secret.md) · [实验 07 网络服务](manual/07-network-and-service.md) · [实验 08 存储](manual/08-storage.md) · [实验 09 认证授权](manual/09-authentication-and-authorization.md) · [实验 10 故障排查](manual/10-troubleshooting.md) · [实验 11 WordPress 综合演练](manual/11-wordpress-app.md) · [实验 12 集群维护](manual/12-cluster-maintenance.md) · [实验 13 Helm 交付](manual/13-helm-delivery.md) · [实验 14 可观测性（可选）](manual/14-observability-optional.md)
- **其他**：教材↔实验[映射](textbook/COURSE-OUTLINE.md) · [术语表](textbook/GLOSSARY.md) · [思考题参考答案](textbook/思考题参考答案.md) · [实验镜像清单](manual/00-实验镜像清单.md)

## ⚙️ 站点信息

- 版本基线：Kubernetes v1.36 · containerd 2.2 · Ubuntu 24.04 · Calico v3.29
- 许可：CC BY-NC-ND 4.0（署名-非商业-禁止演绎）
- 源码仓库：github.com/cloudzun/k8s-course（教材/实验/课件源码与 CI 校验）
"""
with open(os.path.join(DOCS, "index.md"), "w", encoding="utf-8") as fh:
    fh.write(index)

print("docs/ 已生成：", len(os.listdir(os.path.join(DOCS, "textbook"))) - 0, "教材文件 +",
      len(os.listdir(os.path.join(DOCS, "manual"))), "实验文件 + index + 大纲")
