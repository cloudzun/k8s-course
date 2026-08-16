// slide-04.js — 14.1 运维四大对象（表格）
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 4, title: "运维的四大对象" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "运维思维：从“命令”到“流程”");
    s.addText("前 13 章的每个机制（drain/备份/证书）在运维中不是孤立命令，而是流程的一部分——集群运维围绕四个对象：", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "运维对象", options: hdr }, { text: "例行动作", options: hdr }, { text: "机制来源", options: hdr }],
      [{ text: "节点", options: mkF(0) }, { text: "维护窗口（cordon/drain/uncordon）、污点隔离", options: celA }, { text: "第 6 章", options: celA }],
      [{ text: "控制面", options: mkF(1) }, { text: "证书续期、etcd 备份、升级", options: celB }, { text: "第 13 章、本章", options: celB }],
      [{ text: "数据", options: mkF(0) }, { text: "备份策略、恢复演练", options: celA }, { text: "本章", options: celA }],
      [{ text: "版本", options: mkF(1) }, { text: "升级、回滚预案", options: celB }, { text: "本章", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.65, w: 8.8, colW: [1.6, 5.2, 2.0],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    calloutBar(s, "运维铁律：先备份再动集群（升级/维护/恢复前），先演练再上生产（恢复演练、升级演练）——流程的价值在于“出事时有预案”。", 4.5);
  }
};
