# CONTRIBUTING — 贡献指南

感谢对本课程包的贡献。本仓库遵循严格的规范与流程，请先阅读：

1. **`agent.md`** —— 工作契约（规范文件、硬性约定、课件维护、教材更新指南）
2. **`manual/STYLE-GUIDE.md`** —— 实验编写规范（六要素 + 分级体系）
3. **`textbook/TEXTBOOK-STYLE-GUIDE.md`** —— 教材编写规范

## 许可证提醒

本仓库采用 **CC BY-NC-ND 4.0**：可以署名分享，**禁止商用、禁止演绎后分发**。你的贡献将按此协议授权。

## 提交前必做

- [ ] 修改完成后在 `CHANGELOG.md` 追加一条 `### vX.Y 标题`（做了什么 + 为什么 + 验证结果）
- [ ] 所有 .md 代码围栏为偶数（`python ci/ci_validate.py` 会自动检查）
- [ ] 命令/镜像改动已在真实集群实测（`tools/r.ps1.example` 模板，真实凭据不入库）
- [ ] 三件套（教材/实验/课件）版本基线一致
- [ ] 不触碰「决策红线」（见 `agent.md` 第 8 节）

## CI

Push/PR 会自动运行 `tools/ci_validate.py`（fence 校验 + 敏感信息扫描 + PPTX 越界检查）。本地可先跑：

```bash
python ci/ci_validate.py
```

## 分支与提交

- 主分支：`main`
- 提交信息：`<类型>(<范围>): <摘要>`，如 `docs(textbook): 更新第 7 章 HPA 参数`、`fix(manual): 修正实验 08 扩容命令`
- 一次提交只做一件事；涉及多文件的版本升级请拆分为多个提交
