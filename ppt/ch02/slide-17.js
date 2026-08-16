// slide-17.js — 2.3.1 命令式 vs 声明式
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "comparison", index: 17, title: "命令式 vs 声明式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "命令式 vs 声明式：两种操作哲学", C.bgLight);
    card(s, 0.6, 1.3, 4.3, 3.0, C.secondary);
    s.addText("命令式（Imperative）——告诉我怎么做", {
      x: 0.86, y: 1.45, w: 3.9, h: 0.5,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.secondary, margin: 0
    });
    s.addText("你一步步下达具体指令，系统只执行、不记忆\n\n例：docker run nginx\n\n特点：直接、快速、适合临时操作；但不记录意图——下次还要重新敲一遍", {
      x: 0.86, y: 2.0, w: 3.9, h: 2.1,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    card(s, 5.1, 1.3, 4.3, 3.0, C.accent);
    s.addText("声明式（Declarative）——告诉我要什么", {
      x: 5.36, y: 1.45, w: 3.9, h: 0.5,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("你提交一份期望状态的描述（YAML），系统自己决定怎么做、并持续维持\n\n例：kubectl apply -f web.yaml（3 副本、nginx:1.27）\n\n特点：意图明确、可版本化、可重复、系统持续保证状态（自愈）", {
      x: 5.36, y: 2.0, w: 3.9, h: 2.1,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
  }
};
