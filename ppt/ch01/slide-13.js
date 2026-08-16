// slide-13.js — 1.2.1 三大概念（表格）
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 13, title: "Docker 三大概念" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "三大概念", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 14 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 13, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 13, color: C.textDark, valign: "middle" };
    const rows = [
      [{ text: "概念", options: hdr }, { text: "类比", options: hdr }, { text: "说明", options: hdr }],
      [{ text: "镜像（Image）", options: { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 13, color: C.primary, bold: true, valign: "middle" } }, { text: "安装包 / 模板", options: celA }, { text: "只读的打包产物，包含应用 + 依赖 + 配置", options: celA }],
      [{ text: "容器（Container）", options: { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 13, color: C.primary, bold: true, valign: "middle" } }, { text: "运行中的进程", options: celB }, { text: "镜像的运行实例，独立命名空间与 cgroups", options: celB }],
      [{ text: "仓库（Registry）", options: { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 13, color: C.primary, bold: true, valign: "middle" } }, { text: "应用商店", options: celA }, { text: "存放和分发镜像（Docker Hub / 私有仓库）", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.5, w: 8.8, colW: [2.2, 2.2, 4.4],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.6,
    });
    calloutBar(s, "本课程不要求精通 Docker，但 K8s 使用 OCI 兼容的容器运行时（containerd），理解三要素有助于后续章节。", 4.6);
  }
};
