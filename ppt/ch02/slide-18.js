// slide-18.js — 三种操作模式（表格）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 18, title: "三种操作模式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "三种具体操作模式（kubectl 层面）");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "模式", options: hdr }, { text: "方式", options: hdr }, { text: "特点", options: hdr }],
      [{ text: "命令式命令", options: mkF(0) }, { text: "kubectl run / scale / delete", options: celA }, { text: "最快，但无状态记录", options: celA }],
      [{ text: "命令式对象", options: mkF(1) }, { text: "kubectl create / replace -f file.yaml", options: celB }, { text: "把 yaml 当一次性指令，覆盖执行", options: celB }],
      [{ text: "声明式对象（推荐）", options: { fill: { color: C.bgAccent }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.accent, bold: true, valign: "middle" } }, { text: "kubectl apply -f file.yaml", options: { fill: { color: C.bgAccent }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" } }, { text: "以文件为唯一事实来源，可重复应用、幂等", options: { fill: { color: C.bgAccent }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" } }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.4, w: 8.8, colW: [2.2, 3.6, 3.0],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.6,
    });
    s.addText("生产标准是 apply：create 在资源已存在时报错（只能建一次）；apply 幂等更新（可反复执行）", {
      x: 0.6, y: 3.9, w: 8.8, h: 0.5,
      fontSize: 13.5, fontFace: "Microsoft YaHei", color: C.primary, bold: true, margin: 0
    });
  }
};
