// slide-14.js — 6.3.5 Pod 拓扑分布约束（topologySpreadConstraints）
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 14, title: "Pod 拓扑分布约束" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Pod 拓扑分布约束（topologySpreadConstraints）", C.bgLight);
    s.addText("问题：podAntiAffinity 只能按单一 topologyKey 写死“有则避开”；要“跨可用区均匀分布、任何 zone 的 Pod 数差 ≤ 1”→ topologySpreadConstraints（生产高可用的标配，常与 PDB、反亲和组合）。注意 maxSkew 过严可能导致调度不上（与 required 反亲和同样受节点数约束）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.68, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    codeBlock(s, 0.6, 1.95, 8.8, 1.55,
      "spec:\n" +
      "  topologySpreadConstraints:\n" +
      "  - maxSkew: 1                          # 允许的最大分布偏差（≤1 = 尽量均匀）\n" +
      "    topologyKey: topology.kubernetes.io/zone   # 按可用区分组\n" +
      "    whenUnsatisfiable: DoNotSchedule     # 无法满足：不调度（硬）/ ScheduleAnyway（软）\n" +
      "    labelSelector:\n" +
      "      matchLabels:\n" +
      "        app: web", 10);
    // 对比表
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const mkC = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10, bold: true, color: C.primary, valign: "middle" });
    const rows = [
      [{ text: "维度", options: hdr }, { text: "podAntiAffinity", options: hdr }, { text: "topologySpreadConstraints", options: hdr }],
      [{ text: "语义", options: mkC(0) }, { text: "“避开已有同标签 Pod”", options: celA }, { text: "“按拓扑域均匀分布”（偏差 ≤ maxSkew）", options: celA }],
      [{ text: "多维度", options: mkC(1) }, { text: "单一 topologyKey", options: celB }, { text: "可配多个约束（跨 zone + 跨节点同时约束）", options: celB }],
      [{ text: "软硬", options: mkC(0) }, { text: "required / preferred", options: celA }, { text: "DoNotSchedule / ScheduleAnyway", options: celA }],
      [{ text: "适用", options: mkC(1) }, { text: "简单分散", options: celB }, { text: "跨可用区高可用、节点池均衡（生产最佳实践）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei", x: 0.6, y: 3.65, w: 8.8, colW: [1.1, 3.2, 4.5],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.38,
    });
  }
};
