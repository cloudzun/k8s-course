// slide-05.js — 17.1.2 工具链的定位
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 5, title: "工具链的定位" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "工具链的定位（两个互补的工具）", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 13 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 12.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 13, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "工具", options: hdr }, { text: "定位", options: hdr }, { text: "类比", options: hdr }],
      [{ text: "Helm", options: mkF(0) }, { text: "打包与发布：把一组资源打包成 Chart（应用包），带模板和默认值，一条命令安装 / 升级 / 回滚", options: celA }, { text: "Linux 的 apt / yum", options: celB }],
      [{ text: "Kustomize", options: mkF(1) }, { text: "配置定制：不引入模板语言，用 overlay 覆盖 base——“原样 + 差异”", options: celB }, { text: "配置补丁", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.35, w: 8.8, colW: [1.5, 5.5, 1.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.75,
    });
    card(s, 0.6, 3.95, 8.8, 1.15, C.accent);
    s.addText("决策逻辑：应用要分发 / 复用 → Helm；自己项目的多环境定制 → Kustomize；两者也可组合（Helm 渲染后 Kustomize 再补丁，生产常见）。", {
      x: 0.9, y: 4.12, w: 8.2, h: 0.45,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("本教材重点讲 Helm（更常用、CKAD 考点），Kustomize 讲清定位与机制。", {
      x: 0.9, y: 4.62, w: 8.2, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
