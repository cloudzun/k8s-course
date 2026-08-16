// slide-13.js — 4.3.3 Init vs sidecar
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 13, title: "Init 容器 vs sidecar" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Init 容器 vs sidecar 容器", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "维度", options: hdr }, { text: "Init 容器", options: hdr }, { text: "sidecar 容器", options: hdr }],
      [{ text: "运行时机", options: mkF(0) }, { text: "主容器之前，跑完即退出", options: celA }, { text: "与主容器并行，长期运行", options: celB }],
      [{ text: "生命周期", options: mkF(1) }, { text: "一次性", options: celA }, { text: "与 Pod 同生共死", options: celB }],
      [{ text: "典型场景", options: mkF(0) }, { text: "等待依赖、预置数据、预热缓存", options: celA }, { text: "日志采集、本地代理、指标暴露", options: celB }],
    ];
    s.addTable(rows, {
      x: 0.6, y: 1.5, w: 8.8, colW: [1.8, 3.5, 3.5],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.6, fontFace: "Microsoft YaHei"
    });
    card(s, 0.6, 3.85, 8.8, 1.0, C.accent);
    s.addText("判断口诀：“做完就撤”用 Init 容器，“长期伴随”用 sidecar 容器", {
      x: 0.9, y: 3.95, w: 8.2, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("（实验 02 Lab 2 多容器 / Lab 3 Init：对照验证两种容器的运行时机差异）", {
      x: 0.9, y: 4.4, w: 8.2, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
