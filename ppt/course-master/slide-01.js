// slide-01.js — 课程总封面
const { C, topAccentBar, bottomAccentBar } = require("./common");
module.exports = {
  slideConfig: { type: "cover", index: 1, title: "课程总封面" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.darkBg };
    topAccentBar(s);
    bottomAccentBar(s);
    s.addShape("rect", { x: 0.8, y: 1.0, w: 0.05, h: 2.9, fill: { color: C.accent } });
    s.addText("Kubernetes 容器云原生实战课程", {
      x: 1.2, y: 1.1, w: 8.2, h: 1.0,
      fontSize: 40, fontFace: "Microsoft YaHei", bold: true, color: C.textLight, margin: 0
    });
    s.addText("教材 · 实验手册 · 授课课件 三件套", {
      x: 1.2, y: 2.3, w: 8.2, h: 0.6,
      fontSize: 18, fontFace: "Microsoft YaHei", italic: true, color: "9DB8E8", margin: 0
    });
    s.addText("19 章教材 ｜ 14 个实验（93 个 Lab）｜ 412 页课件 ｜ CKA 五大域全覆盖", {
      x: 1.2, y: 3.15, w: 8.2, h: 0.5,
      fontSize: 15, fontFace: "Microsoft YaHei", color: "C9D8F6", margin: 0
    });
    s.addText("基线版本：Kubernetes v1.36 · containerd · Ubuntu 24.04 · 3 节点真实集群实测", {
      x: 1.2, y: 4.3, w: 8.2, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: "A8B8D8", margin: 0
    });
  }
};
