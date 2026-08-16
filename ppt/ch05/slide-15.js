// slide-15.js — 5.3.5 StatefulSet vs Deployment
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 15, title: "StatefulSet vs Deployment" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "StatefulSet vs Deployment（选型对照）", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "维度", options: hdr }, { text: "Deployment", options: hdr }, { text: "StatefulSet", options: hdr }],
      [{ text: "Pod 名称", options: mkF(0) }, { text: "随机后缀（web-abc12）", options: celA }, { text: "稳定有序（web-0/1/2）", options: celB }],
      [{ text: "存储", options: mkF(1) }, { text: "副本共享 / 无绑定", options: celB }, { text: "每副本独立 PVC（volumeClaimTemplates）", options: celA }],
      [{ text: "顺序", options: mkF(0) }, { text: "无", options: celA }, { text: "创建 / 删除 / 更新都有序", options: celB }],
      [{ text: "网络标识", options: mkF(1) }, { text: "仅 Service", options: celB }, { text: "headless + 稳定 DNS 名", options: celA }],
      [{ text: "适用", options: mkF(0) }, { text: "无状态（Web/API）", options: celA }, { text: "有状态（数据库/消息队列/协调器）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.3, w: 8.8, colW: [1.7, 3.4, 3.7],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.56,
    });
    s.addText("决策逻辑：应用需要“被点名”（固定名字/固定存储）→ StatefulSet；应用无身份需求 → Deployment（更简单）。判断标准：删掉这个 Pod，它的“身份/数据”需不需要保留？", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.45,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
