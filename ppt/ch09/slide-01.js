// slide-01.js — 封面
const { C, topAccentBar, bottomAccentBar } = require("./common");
module.exports = {
  slideConfig: { type: "cover", index: 1, title: "服务、负载均衡与网络" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.darkBg };
    topAccentBar(s);
    bottomAccentBar(s);
    s.addShape("rect", { x: 0.8, y: 1.1, w: 0.05, h: 2.4, fill: { color: C.accent } });
    s.addText("第 9 章 服务、负载均衡与网络", {
      x: 1.2, y: 1.2, w: 8.0, h: 1.0,
      fontSize: 38, fontFace: "Microsoft YaHei", bold: true, color: C.textLight, margin: 0
    });
    s.addText("四层网络全景 · Service 机制 · 集群 DNS · Ingress · NetworkPolicy · 完整走查", {
      x: 1.2, y: 2.4, w: 8.0, h: 0.6,
      fontSize: 17, fontFace: "Microsoft YaHei", italic: true, color: "9DB8E8", margin: 0
    });
    s.addText("Kubernetes 容器云原生实战课程 · 配套实验手册（实验 07）", {
      x: 1.2, y: 4.3, w: 8.0, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: "A8B8D8", margin: 0
    });
  }
};
