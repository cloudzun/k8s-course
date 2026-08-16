// slide-16.js — 11.3.6 认证 vs 授权（核心辨析）
const { C, sectionTitle, bigCallout, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "steps", index: 16, title: "认证 vs 授权" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "认证 vs 授权（核心辨析）");
    bigCallout(s, "证书有效（认证通过）≠ 有权限（授权通过）", 1.15, 0.55);
    s.addText("实例（实验 09 Lab 1/3）：", {
      x: 0.6, y: 1.85, w: 3.0, h: 0.3, fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textMid, margin: 0
    });
    const steps = [
      "签发用户证书 train → kubectl 能连上 apiserver（认证通过）",
      "但 get pods → Forbidden：pods is forbidden: User \"train\" cannot list resource \"pods\"（授权未配置——train 没有任何 Role/Binding）",
      "创建 ClusterRoleBinding（cluster-admin → train）→ 立刻能操作（授权即时生效，不需要重启任何组件）",
    ];
    steps.forEach((st, i) => {
      const y = 2.25 + i * 0.95;
      card(s, 0.6, y, 8.8, 0.82, i === 1 ? C.accentWarm : C.primary);
      s.addText(String(i + 1) + ". " + st, {
        x: 0.9, y: y + 0.06, w: 8.2, h: 0.7,
        fontSize: 11.5, fontFace: i === 1 ? "Consolas" : "Microsoft YaHei", italic: i === 1,
        color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.1
      });
    });
    calloutBar(s, "一句话：认证回答“你是谁”，授权回答“你能干啥”——“能登录”和“能操作”是两件独立的事，这是本章最重要的认知。", 5.1);
  }
};
