// slide-10.js — 12.2.3 实施方式：命名空间标签
const { C, sectionTitle, codeBlock, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 10, title: "实施方式：命名空间标签" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "实施方式：命名空间标签", C.bgLight);
    s.addText("PSA 通过在命名空间上打标签实施（不是 Pod 上）——按命名空间定标准。", {
      x: 0.6, y: 1.15, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 0.6, 1.65, 8.8, 0.8, "kubectl label ns psa-demo pod-security.kubernetes.io/enforce=baseline", 13);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "标签动作", options: hdr }, { text: "行为", options: hdr }],
      [{ text: "enforce", options: mkF(0) }, { text: "强制：违规 Pod 创建被拒（最常用）", options: celA }],
      [{ text: "audit", options: mkF(1) }, { text: "允许创建，但记录审计日志（先观察再强制）", options: celB }],
      [{ text: "warn", options: mkF(0) }, { text: "允许创建，但给用户警告", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 2.6, w: 8.8, colW: [1.7, 7.1],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    card(s, 0.6, 4.75, 8.8, 0.6, C.accent);
    s.addText("渐进式落地建议：先 warn / audit 观察哪些应用会违规 → 修好后再切 enforce——避免一上来强制把现有应用全拒了。", {
      x: 0.9, y: 4.8, w: 8.2, h: 0.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
  }
};
