# Kubernetes 容器云原生实战课程（课程包根目录）

![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg)
![CI](https://github.com/cloudzun/k8s-course/actions/workflows/validate.yml/badge.svg)

一套可直接授课的 Kubernetes 课程：**教材 + 实验手册 + 授课课件** 三件套一体化交付，基于 **Kubernetes v1.36** 在 3 节点真实集群上全实验实测。

> **许可**：本仓库采用 [CC BY-NC-ND 4.0](LICENSE)（署名-非商业-禁止演绎）。引用/分享请注明出处；禁止商用与修改后分发。

## 目录结构

```
02-Kubernetes核心知识/
├── 课程大纲.md            # 标准模式课程大纲：概述/目标/受众/三层目录课程内容/教学安排/考核
├── README.md              # 本文档
├── agent.md               # AI 协作代理工作约定（含教材半年更新指南——更新前必读）
├── CHANGELOG.md           # 全部修改历史（v1.23 → v2.44）
│
├── textbook/              # 教材（19 章 + 大纲 + 术语表 + 编写规范）
│   ├── ch01~ch19-*.md
│   ├── COURSE-OUTLINE.md          # 教材章 ↔ 实验 Lab 逐条映射
│   ├── GLOSSARY.md                # 统一术语表
│   ├── TEXTBOOK-STYLE-GUIDE.md    # 教材编写规范
│   └── mermaid_specification.md   # 图表规范
│
├── manual/                # 实验手册（14 个实验）
│   ├── 00-实验镜像清单.md         # 全部镜像 + 国内下载指引
│   ├── 01-cluster-installation.md ～ 14-observability-optional.md
│   ├── STYLE-GUIDE.md             # 实验编写规范（含实验分级体系 §2.2.1）
│   └── （实验 13/14 为新增实验）
│
├── ppt/                   # 授课课件（pptxgenjs 源码 + PPTX）
│   ├── Kubernetes-容器云原生实战课程-完整版.pptx   # 416 页完整版（推荐直接使用）
│   ├── course-master/             # 总封面 + 目录 + 结尾母版
│   └── ch01~ch19/                 # 每章：common.js + compile.js + slide-NN.js + output/*.pptx
│
└── misc/                  # 存档：原始飞书草稿 + 历轮评审文档（备查）
```

## 快速开始

**讲师**：
1. 课件直接用 `ppt/Kubernetes-容器云原生实战课程-完整版.pptx`（总封面 → 目录 → 19 章 → 结尾）
2. 按 `课程大纲.md`（课程概述/目标/受众/三层目录内容/学时规划）排课；实验按分级（必做/推荐/可选·进阶）取舍
3. 授课环境：3 台云主机按实验 01 安装集群；镜像预拉见 `manual/00-实验镜像清单.md`

**学员**：
1. 读教材对应章节 → 做对应实验（先必做）→ 用课件复习
2. 排障/考试冲刺：实验 10 + 第 19 章 CKA 指南

## 关键约定

| 约定 | 位置 |
|---|---|
| 实验分级标注体系（必做/推荐/可选·进阶） | `manual/STYLE-GUIDE.md` §2.2.1 |
| 教材"是什么/为什么"定位（非实验手册扩展说明） | `textbook/TEXTBOOK-STYLE-GUIDE.md` |
| 术语统一 | `textbook/GLOSSARY.md` |
| 章节↔实验↔课件↔CKA 映射 | `课程大纲.md` + `textbook/COURSE-OUTLINE.md` |
| 所有修改留痕 | `CHANGELOG.md`（版本号递增，当前 v2.44） |

## 环境基线（实测）

- Kubernetes v1.36.3 · containerd 2.2 · Ubuntu 24.04 · Calico v3.29 · metrics-server v0.9
- 3 节点（1 控制面 + 2 工作节点）；etcd 静态加密开启；local-path 默认 StorageClass
- 国内网络：docker.io 走 1panel 加速、registry.k8s.io 走阿里云、quay.io 走 daocloud（实验 01 与镜像清单有完整配置）

## 维护与再生成

- **改课件**：编辑对应 `ppt/chXX/slide-NN.js` → 在该章目录运行 `node compile.js`（需全局 pptxgenjs，Windows 下先 `$env:NODE_PATH="C:\Users\cheng\AppData\Roaming\npm\node_modules"`）→ 用 `tools/check_ppt.py` 自检越界 → 重跑 `tools/merge_ppt.py` 刷新完整版
- **改教材/实验**：遵循对应 STYLE-GUIDE，完成后在 CHANGELOG 记一条
- **定期更新教材**（如半年后对齐新 K8s 版本）：完整流程见 `agent.md` 的「教材更新指南」——包含版本基线快照、易过时内容清单、官方数据源、验证方法与交付检查清单

## 分发与在线阅读

- **飞书在线文档**（云空间「Kubernetes 实战课程」文件夹）：
  - [教材合集（19 章）](https://zsyhjtnsa5.feishu.cn/docx/Ye0BdZfuGo5tsExLOAucRrxjn58)
  - [实验手册合集（14 实验 · 93 Lab）](https://zsyhjtnsa5.feishu.cn/docx/Fp6odXRKmof6CHxkKy8cu4Zunpf)
- **本地合集**：合集/Kubernetes-教材合集.md、合集/Kubernetes-实验手册合集.md（重新生成：python tools/merge_docs.py）

## 版本一致性原则

教材 / 实验手册 / 课件三者必须保持**同一版本基线**：升级 K8s 版本时，先更新实验手册并集群实测（命令与输出为准），再同步教材概念与课件页面，最后更新 `课程大纲.md` / `00-实验镜像清单.md` / `CHANGELOG.md`。任何一处改动都要三件套联动，防止"教材讲了新版本、实验还是旧命令"的割裂。
