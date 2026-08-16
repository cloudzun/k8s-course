// slide-05.js — 12.1.2 两类控制器
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 5, title: "两类控制器" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "两类控制器：Mutating 与 Validating", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "类型", options: hdr }, { text: "行为", options: hdr }, { text: "例子", options: hdr }],
      [{ text: "Mutating（修改型）", options: mkF(0) }, { text: "修改请求内容（如自动填默认值）", options: celA }, { text: "LimitRange 给没写 requests 的 Pod 补默认值", options: celB }],
      [{ text: "Validating（校验型）", options: mkF(1) }, { text: "校验请求，不合法拒绝", options: celB }, { text: "LimitRange 超限拒绝、PSA 违规拒绝", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.35, w: 8.8, colW: [2.2, 2.8, 3.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.6,
    });
    s.addText("流程顺序：先 Mutating（补默认）→ 再 Validating（按补完的值校验）——LimitRange“先填默认值、再校验是否超限”是同一步里的两个阶段。", {
      x: 0.6, y: 3.3, w: 8.8, h: 0.55,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.accent, bold: true, valign: "middle", margin: 0
    });
    card(s, 0.6, 4.0, 8.8, 1.0, C.accent);
    s.addText("认知：第 7 章看到的“自动填 requests”和“Forbidden 拒绝”都是准入控制器的功劳——资源被拒绝时的报错（Forbidden / exceeded quota / violates PodSecurity）都来自这一关。", {
      x: 0.9, y: 4.05, w: 8.2, h: 0.9,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true,
      valign: "middle", margin: 0
    });
  }
};
