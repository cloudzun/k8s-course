// slide-01.js — 封面
const { SHAPE, C, topAccentBar, bottomAccentBar } = require("./common");
module.exports = {
  slideConfig: { type: "cover", index: 1, title: "容器与云原生基础" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.darkBg };
    topAccentBar(s);
    bottomAccentBar(s);
    s.addShape(SHAPE.RECT, { x: 0.8, y: 1.1, w: 0.05, h: 2.4, fill: { color: C.accent } });
    s.addText("第 1 章 容器与云原生基础", {
      x: 1.2, y: 1.2, w: 8.0, h: 1.0,
      fontSize: 38, fontFace: "Microsoft YaHei",
      bold: true, color: C.textLight, margin: 0
    });
    s.addText("容器原理 · Docker 三要素 · 编排器选型 · 云原生与 CNCF", {
      x: 1.2, y: 2.4, w: 8.0, h: 0.6,
      fontSize: 17, fontFace: "Microsoft YaHei",
      italic: true, color: "9DB8E8", margin: 0
    });
    s.addText("Kubernetes 容器云原生实战课程 · 配套实验手册（实验 01-14）", {
      x: 1.2, y: 4.3, w: 8.0, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: "A8B8D8", margin: 0
    });
  }
};
