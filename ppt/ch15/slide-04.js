// slide-04.js — 15.1 三支柱：三个问题三个数据源
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 4, title: "可观测性三支柱" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "可观测性三支柱：三个问题三个数据源");
    s.addText("“集群出问题了吗？出在哪？为什么？”——三个问题对应三个数据源", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle", align: "center" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle", align: "center" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "支柱", options: hdr }, { text: "回答", options: hdr }, { text: "数据来源", options: hdr }, { text: "典型工具", options: hdr }],
      [{ text: "指标 Metrics", options: mkF(0) }, { text: "现在用量如何？", options: celA }, { text: "kubelet / 应用暴露数字", options: celA }, { text: "kubectl top、Prometheus", options: celA }],
      [{ text: "日志 Logs", options: mkF(1) }, { text: "应用说了什么？", options: celB }, { text: "容器 stdout / stderr", options: celB }, { text: "kubectl logs、ELK/Loki", options: celB }],
      [{ text: "事件 Events", options: mkF(0) }, { text: "集群发生了什么？", options: celA }, { text: "apiserver 对象变化记录", options: celA }, { text: "kubectl get events", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.6, w: 8.8, colW: [2.0, 2.2, 2.4, 2.2],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    s.addText("读图要点：三支柱各回答一个问题、互相印证——事件指方向（哪里变了）、日志给细节（应用内部）、指标做佐证（资源层面）", {
      x: 0.6, y: 3.85, w: 8.8, h: 0.45,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    calloutBar(s, "排障分工：事件指方向（哪里变了）→ 日志给细节（应用内部）→ 指标做佐证（资源层面）——互相印证，第 16 章展开。", 4.45);
    s.addText("（实验 05 Lab 1/2：指标链路实操；实验 10 Lab 1：describe / logs / events 三板斧）", {
      x: 0.6, y: 5.1, w: 8.8, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
