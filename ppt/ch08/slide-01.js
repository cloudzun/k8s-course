// slide-01.js — 封面
const { C, topAccentBar, bottomAccentBar } = require("./common");
module.exports = {
  slideConfig: { type: "cover", index: 1, title: "配置管理：ConfigMap 与 Secret" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.darkBg };
    topAccentBar(s);
    bottomAccentBar(s);
    s.addShape("rect", { x: 0.8, y: 1.1, w: 0.05, h: 2.4, fill: { color: C.accent } });
    s.addText("第 8 章 配置管理：ConfigMap 与 Secret", {
      x: 1.2, y: 1.2, w: 8.0, h: 1.0,
      fontSize: 38, fontFace: "Microsoft YaHei", bold: true, color: C.textLight, margin: 0
    });
    s.addText("配置外部化 · ConfigMap 卷挂载与 env 注入 · Secret 与 base64 · Downward API · 生产实践", {
      x: 1.2, y: 2.4, w: 8.0, h: 0.6,
      fontSize: 17, fontFace: "Microsoft YaHei", italic: true, color: "9DB8E8", margin: 0
    });
    s.addText("Kubernetes 容器云原生实战课程 · 配套实验手册（实验 06）", {
      x: 1.2, y: 4.3, w: 8.0, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: "A8B8D8", margin: 0
    });
  }
};
