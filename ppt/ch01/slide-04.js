// slide-04.js — 1.1.1 虚拟机 vs 容器（表格）
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 4, title: "虚拟机 vs 容器" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "虚拟机 vs 容器");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 13 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const rows = [
      [{ text: "维度", options: hdr }, { text: "虚拟机（VM）", options: hdr }, { text: "容器", options: hdr }],
      [{ text: "隔离级别", options: { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: true, valign: "middle" } }, { text: "硬件级（Hypervisor 虚拟整机）", options: celA }, { text: "操作系统级（内核共享）", options: celA }],
      [{ text: "每个实例", options: { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: true, valign: "middle" } }, { text: "完整 Guest OS（GB 级）", options: celB }, { text: "仅应用 + 依赖（MB 级）", options: celB }],
      [{ text: "启动时间", options: { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: true, valign: "middle" } }, { text: "分钟级", options: celA }, { text: "秒级（进程级启动）", options: celA }],
      [{ text: "密度", options: { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: true, valign: "middle" } }, { text: "低（每台机几十个）", options: celB }, { text: "高（每台机成百上千）", options: celB }],
      [{ text: "性能", options: { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: true, valign: "middle" } }, { text: "有虚拟化开销", options: celA }, { text: "接近原生", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.25, w: 8.8, colW: [1.5, 3.65, 3.65],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.55,
    });
    calloutBar(s, "为什么容器更快更轻：容器共享宿主机内核，不虚拟硬件和操作系统——它只是宿主上的“一组受约束的进程”。", 4.85);
  }
};
