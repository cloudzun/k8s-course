// slide-15.js — 8.4 Downward API：注入"自己是谁"
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 15, title: "Downward API：注入自己是谁" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Downward API：注入“自己是谁”");
    s.addText("第 4 章 §4.5.4 已讲过 Downward API（实验 06 补充实操）——本章对比，建立“三种注入”的完整图景", {
      x: 0.6, y: 1.05, w: 8.8, h: 0.3,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const mkA = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" });
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "注入来源", options: hdr }, { text: "对象", options: hdr }, { text: "典型内容", options: hdr }, { text: "使用", options: hdr }],
      [{ text: "ConfigMap", options: mkF(0) }, { text: "外部配置", options: mkA(1) }, { text: "数据库地址、开关、配置文件", options: mkA(0) }, { text: "应用“要什么”", options: mkA(1) }],
      [{ text: "Secret", options: mkF(1) }, { text: "外部敏感配置", options: mkA(0) }, { text: "密码、Token、证书", options: mkA(1) }, { text: "应用“凭什么”", options: mkA(0) }],
      [{ text: "Downward API", options: mkF(0) }, { text: "Pod 自身元数据", options: mkA(1) }, { text: "Pod 名、命名空间、节点名、labels", options: mkA(0) }, { text: "应用“我是谁”", options: mkA(1) }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.5, w: 8.8, colW: [1.8, 1.9, 3.1, 2.0],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    card(s, 0.6, 3.65, 8.8, 1.0, C.primary);
    s.addText("应用容器（env / 卷 两种注入通道）：ConfigMap → 外部配置（8.2） · Secret → 敏感配置（8.3） · Downward API → 自身元数据（§4.5.4）", {
      x: 0.85, y: 3.75, w: 8.3, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("判断标准：数据是“环境给的”（CM / Secret）还是“我自己身上的”（Downward）？", {
      x: 0.85, y: 4.18, w: 8.3, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("注入字段：fieldRef env（Pod 名 / 命名空间 / 节点名）+ downwardAPI 卷（labels / annotations 写进文件）", {
      x: 0.6, y: 4.9, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
