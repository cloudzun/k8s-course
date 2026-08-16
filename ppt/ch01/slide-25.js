// slide-25.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 25, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "容器与虚拟机共享内核，容器内执行 reboot 会发生什么？为什么？",
      "为什么说“容器没有持久化”？镜像分层中哪一层解释了这一点？",
      "单机 Docker 的痛点中，哪一个对生产影响最大？Kubernetes 用什么机制解决它？",
      "云原生的“声明式”与传统“命令式”运维的区别是什么？举一个生活中的例子。",
    ];
    qs.forEach((q, i) => {
      const y = 1.3 + i * 0.85;
      s.addShape("ellipse", { x: 0.7, y: y + 0.05, w: 0.42, h: 0.42, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.05, w: 0.42, h: 0.42,
        fontSize: 14, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.35, y, w: 8.0, h: 0.7,
        fontSize: 14.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "CKA 考点：本章为前置基础、无直接考点；但容器原理是理解第 3 章运行时、第 4 章 Pod 的前提——排障题常考容器生命周期。", 4.85);
  }
};
