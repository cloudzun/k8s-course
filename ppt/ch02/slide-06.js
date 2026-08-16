// slide-06.js — 2.1.3 核心承诺（四卡片）
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 6, title: "核心承诺" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "核心承诺（设计宣言）", C.bgLight);
    const items = [
      { t: "声明式，而非命令式", d: "你描述“最终要什么”，K8s 负责“如何达成并持续维持”", strip: C.primary },
      { t: "自愈", d: "系统永不停止地把自己调和到期望状态——崩溃、驱逐、扩容都自动处理", strip: C.secondary },
      { t: "可移植", d: "同样的集群和应用可跑在裸机、虚拟机、任意公有云上", strip: C.accent },
      { t: "可扩展", d: "CRD、Operator、CNI/CSI 插件机制——不只是编排器，更是“可编程的平台底座”", strip: C.accentWarm },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + (i % 2) * 4.55;
      const y = 1.4 + Math.floor(i / 2) * 1.8;
      card(s, x, y, 4.3, 1.6, it.strip);
      numBadge(s, x + 0.15, y + 0.15, i + 1, it.strip);
      s.addText(it.t, {
        x: x + 0.75, y: y + 0.12, w: 3.4, h: 0.45,
        fontSize: 16, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(it.d, {
        x: x + 0.2, y: y + 0.65, w: 3.9, h: 0.85,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.3, margin: 0, valign: "top"
      });
    });
  }
};
