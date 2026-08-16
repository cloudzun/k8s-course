// slide-20.js — 思考题
const { C, sectionTitle, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 20, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "“签发一张用户证书”在 Kubernetes 里相当于“创建一个用户”——为什么？",
      "v1.24 之前 SA 自动创建长期 token，为什么被改掉？",
      "Role 与 ClusterRole、RoleBinding 与 ClusterRoleBinding 的交叉组合，生效范围分别是什么？",
      "自定义 Role 里 apiGroups: [\"\"] 是什么意思？写成 core/v1 会怎样？",
      "用户 train 证书有效但 get pods 报 Forbidden——问题出在哪道门？怎么修？",
      "给一个“只能看 default 命名空间 Pod 和日志”的账号，写出完整的 RBAC 方案（Role + Binding + 验证命令）。",
    ];
    qs.forEach((q, i) => {
      const y = 1.25 + i * 0.58;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.52,
        fontSize: 12, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    warnBar(s, "CKA 考点（域 1/2/3，考试高频）：必考 kubectl create role/clusterrole/rolebinding/clusterrolebinding；机制考 RBAC 三要素与范围、rules 三要素、认证 vs 授权；高频场景题：给用户/SA 配权限、跨命名空间失败排查；排障用 kubectl auth can-i（域 5）。", 5.05);
  }
};
