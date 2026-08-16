// slide-14.js — 11.3.4 rules 写法（自定义权限）
const { C, sectionTitle, card, codeBlock, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 14, title: "rules 三要素写法" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "rules 写法（自定义权限）");
    codeBlock(s, 0.6, 1.2, 5.6, 3.4,
`apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: dev-role
  namespace: default
rules:
- apiGroups: [""]                 # 核心组（Pod/Svc/ConfigMap）
  resources: ["pods", "pods/log"] # pods/log 是子资源
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]             # apps 组（Deployment 等）
  resources: ["deployments"]
  verbs: ["get","list","watch","create","update","patch","delete"]
- apiGroups: ["batch"]
  resources: ["jobs"]
  verbs: ["get", "list", "watch", "create"]`, 10);
    // 右侧三要素卡片
    const items = [
      ["apiGroups", "API 组：核心组用 \"\"（空字符串）；查法：kubectl api-resources 看 APIGROUP 列"],
      ["resources", "资源名（复数）：pods / services / deployments / nodes…；子资源如 pods/log"],
      ["verbs", "get / list / watch / create / update / patch / delete；* 表示全部"],
    ];
    items.forEach((it, i) => {
      const y = 1.2 + i * 1.12;
      card(s, 6.35, y, 3.05, 1.0, i === 0 ? C.primary : (i === 1 ? C.accent : C.secondary));
      s.addText(it[0], {
        x: 6.5, y: y + 0.07, w: 2.75, h: 0.28,
        fontSize: 12.5, fontFace: "Consolas", bold: true, color: C.primary, margin: 0
      });
      s.addText(it[1], {
        x: 6.5, y: y + 0.37, w: 2.8, h: 0.56,
        fontSize: 9, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.08
      });
    });
    warnBar(s, "常见错误：apiGroups 写错（核心组写成 core/v1）→ 权限不生效（返回 Forbidden）——先 kubectl api-resources 确认 APIGROUP（CKA 高频考点）。", 4.85);
  }
};
