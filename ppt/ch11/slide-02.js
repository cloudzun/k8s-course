// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "说出 Kubernetes 安全模型的三道门（认证/授权/准入）与各自回答的问题",
      "区分两种身份（User 给人、ServiceAccount 给程序）与两种认证凭据（证书/Token）",
      "解释 X.509 证书认证的机制（CA 签发、CN 即用户名、kubeconfig 携带）",
      "解释 v1.24+ 的 SA Token 机制（动态签发，无长期 token）",
      "完整解释 RBAC 三要素（Subject/Role/ClusterRole/Binding）与两种范围",
      "写出自定义 Role 的 rules（apiGroups / resources / verbs）",
      "解释“认证 ≠ 授权”（能登录但 Forbidden）并用实例说明",
      "应用最小权限原则设计授权方案（含 kubectl auth can-i 验证）",
    ];
    goals.forEach((g, i) => {
      const y = 1.2 + i * 0.52;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.46,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
