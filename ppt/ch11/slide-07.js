// slide-07.js — 11.2.2 OIDC 企业集成
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 7, title: "OIDC 企业集成" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "OIDC：企业人员认证的事实标准");
    // 四步流程框
    const steps = [
      "用户登录企业 SSO\n（Keycloak/AD/Okta）\n拿 ID Token（JWT）",
      "kubectl 用 token\n访问 apiserver",
      "OIDC 认证器验证签名\n提取 username / groups\n（来自 token 声明）",
      "之后的 RBAC 照常工作\n（username/groups\n参与授权）",
    ];
    steps.forEach((t, i) => {
      const x = 0.6 + i * 2.27;
      s.addShape("rect", {
        x, y: 1.2, w: 2.0, h: 1.5,
        fill: { color: i === 3 ? "E8F8E8" : "E8F4FD" },
        line: { color: i === 3 ? "5BA85B" : "4A90D9", width: 1 }
      });
      s.addText(String(i + 1), {
        x: x + 0.6, y: 1.25, w: 0.8, h: 0.3,
        fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.primary, align: "center", margin: 0
      });
      s.addText(t, {
        x: x + 0.08, y: 1.55, w: 1.84, h: 1.05,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark,
        align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.05
      });
    });
    for (let i = 0; i < 3; i++) {
      s.addText("→", { x: 2.63 + i * 2.27, y: 1.72, w: 0.28, h: 0.4, fontSize: 16, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    }
    // 配置
    codeBlock(s, 0.6, 2.95, 8.8, 0.8,
`apiserver 配置（kubeadm 环境改 manifest）：
--oidc-issuer-url / --oidc-client-id / --oidc-username-claim / --oidc-groups-claim`, 10.5);
    // 好处
    card(s, 0.6, 3.95, 8.8, 1.05, C.accent);
    s.addText("好处：统一账号体系（员工离职一个按钮禁用）· 支持 MFA · 组（groups）随 SSO 自动映射到 RBAC；实操：kubectl oidc-login 插件完成登录换 token 流程（进阶）", {
      x: 0.9, y: 4.05, w: 8.2, h: 0.85, fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.15
    });
    s.addText("核心认知：证书认证适合“少量管理员”，OIDC 适合“大量企业用户”——考试不考 OIDC 配置，但真实企业环境绕不开。", {
      x: 0.6, y: 5.12, w: 8.8, h: 0.4, fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
  }
};
