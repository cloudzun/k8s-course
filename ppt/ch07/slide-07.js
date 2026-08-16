// slide-07.js — 7.2.2 指标类型（autoscaling/v2）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 7, title: "指标类型" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "指标类型（autoscaling/v2）");
    s.addText("autoscaling/v2 支持四种指标类型——前三种内置，自定义/外部指标需要适配器（进阶）。", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "指标类型", options: hdr }, { text: "含义", options: hdr }, { text: "示例", options: hdr }],
      [{ text: "Utilization（利用率）", options: mkF(0) }, { text: "实际用量 / requests 的百分比", options: celA }, { text: "CPU 利用率 60%（最常用）", options: celA }],
      [{ text: "AverageValue（平均值）", options: mkF(1) }, { text: "每副本的平均绝对用量", options: celB }, { text: "每副本内存 200Mi", options: celB }],
      [{ text: "Value（总值）", options: mkF(0) }, { text: "整个工作负载的总量", options: celA }, { text: "总请求数", options: celA }],
      [{ text: "自定义/外部指标", options: mkF(1) }, { text: "Prometheus 等来源（需适配器）", options: celB }, { text: "QPS、队列长度（进阶）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.6, w: 8.8, colW: [2.5, 3.5, 2.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.55,
    });
    s.addText("核心：Utilization 的分母是 requests（不是节点容量）——HPA 的准确性依赖 requests 设置合理（第 4 章资源模型的意义又一处体现）。", {
      x: 0.6, y: 4.5, w: 8.8, h: 0.6,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
  }
};
