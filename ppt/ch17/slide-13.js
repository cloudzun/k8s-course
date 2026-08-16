// slide-13.js — 17.3.3 Helm vs Kustomize 对比表
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 13, title: "Helm vs Kustomize 对比" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Helm vs Kustomize（决策逻辑）", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const mkF = (i, bold) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: !!bold, valign: "middle", align: "center" });
    const rows = [
      [{ text: "维度", options: hdr }, { text: "Helm", options: hdr }, { text: "Kustomize", options: hdr }],
      [{ text: "核心机制", options: mkF(0, true) }, { text: "模板 + values（渲染）", options: celA }, { text: "base + overlay（覆盖）", options: celB }],
      [{ text: "学习曲线", options: mkF(1, true) }, { text: "需学 Go template", options: celB }, { text: "平缓（无模板语言）", options: celA }],
      [{ text: "分发/复用", options: mkF(0, true) }, { text: "强（Chart 可发布到仓库）", options: celA }, { text: "弱（目录内使用）", options: celB }],
      [{ text: "回滚", options: mkF(1, true) }, { text: "强（Release revision）", options: celB }, { text: "无（靠 git）", options: celA }],
      [{ text: "依赖管理", options: mkF(0, true) }, { text: "支持（charts 依赖）", options: celA }, { text: "无", options: celB }],
      [{ text: "适用", options: mkF(1, true) }, { text: "应用打包分发、第三方应用安装", options: celB }, { text: "项目内多环境定制", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.25, w: 8.8, colW: [1.6, 3.7, 3.5],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.47,
    });
    s.addText("决策逻辑：装别人的应用 / 发布自己的应用包 → Helm；自己项目 dev/prod 差异化 → Kustomize。生产常见组合：Helm 装基础组件（如 Prometheus Operator），Kustomize 管业务应用的环境差异。", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.6,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
  }
};
