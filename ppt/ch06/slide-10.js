// slide-10.js — 6.2.3/6.2.4 表达式语法与手段选型
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 10, title: "matchExpressions 语法与手段选型" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "表达式语法（operators）与手段选型");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    // 表一：operators
    const rows1 = [
      [{ text: "operator", options: hdr }, { text: "含义", options: hdr }, { text: "示例", options: hdr }],
      [{ text: "In", options: mkF(0) }, { text: "值在列表里", options: celA }, { text: "匹配多个值（如 ssd、nvme）", options: celA }],
      [{ text: "NotIn", options: mkF(1) }, { text: "值不在列表里", options: celB }, { text: "排除某些节点", options: celB }],
      [{ text: "Exists", options: mkF(0) }, { text: "键存在（不管值）", options: celA }, { text: "节点有该标签", options: celA }],
      [{ text: "DoesNotExist", options: mkF(1) }, { text: "键不存在", options: celB }, { text: "节点没有该标签", options: celB }],
      [{ text: "Gt / Lt", options: mkF(0) }, { text: "值大于 / 小于（数值标签）", options: celA }, { text: "按数值筛选节点", options: celA }],
    ];
    s.addTable(rows1, {
      fontFace: "Microsoft YaHei", x: 0.6, y: 1.15, w: 8.8, colW: [1.7, 3.4, 3.7],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.34,
    });
    // 表二：三种手段选型
    const rows2 = [
      [{ text: "手段", options: hdr }, { text: "能力", options: hdr }, { text: "适用", options: hdr }],
      [{ text: "nodeName", options: mkF(0) }, { text: "指定唯一节点", options: celA }, { text: "特殊调试（生产不推荐：节点挂了 Pod 就困死）", options: celA }],
      [{ text: "nodeSelector", options: mkF(1) }, { text: "等值匹配", options: celB }, { text: "简单场景（如“只上 GPU 节点”）", options: celB }],
      [{ text: "nodeAffinity", options: mkF(0) }, { text: "表达式 + 软硬约束", options: celA }, { text: "需要“或 / 非 / 软偏好”的复杂场景", options: celA }],
    ];
    s.addTable(rows2, {
      fontFace: "Microsoft YaHei", x: 0.6, y: 3.6, w: 8.8, colW: [1.7, 3.0, 4.1],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.42,
    });
    s.addText("决策逻辑：简单等值 → nodeSelector；需要表达式或软偏好 → nodeAffinity；nodeName 只在调试时用", {
      x: 0.6, y: 5.3, w: 8.8, h: 0.25, fontSize: 10.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.accent, margin: 0
    });
  }
};
