// slide-17.js — 14.5.4 高可用与灾备架构（HA/DR）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 17, title: "高可用与灾备架构（HA/DR）" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "高可用与灾备架构（HA/DR）", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "灾备等级", options: hdr }, { text: "RTO", options: hdr }, { text: "RPO", options: hdr }, { text: "实现方案", options: hdr }],
      [{ text: "L1 基础", options: mkF(0) }, { text: "< 4h", options: celA }, { text: "< 24h", options: celA }, { text: "etcd 快照 + 异地存储（§14.4）", options: celA }],
      [{ text: "L2 标准", options: mkF(1) }, { text: "< 1h", options: celB }, { text: "< 1h", options: celB }, { text: "etcd 快照 + PV 快照（第 10 章）+ Velero", options: celB }],
      [{ text: "L3 高级", options: mkF(0) }, { text: "< 15min", options: celA }, { text: "≈ 0", options: celA }, { text: "多集群主备 + 数据同步 + DNS 切换", options: celA }],
      [{ text: "L4 同城双活", options: mkF(1) }, { text: "≈ 0", options: celB }, { text: "0", options: celB }, { text: "跨 AZ 集群 + 全局负载均衡", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.2, w: 8.8, colW: [1.6, 1.2, 1.2, 4.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.48,
    });
    s.addText("故障域设计：故障域从小到大（容器 → Pod → 节点 → 机架 → AZ → 区域）——单个故障域失败不应导致服务完全不可用；控制面跨 2 个故障域，核心业务 Pod 跨 2 个 AZ（topologyKey: zone）。", {
      x: 0.6, y: 3.75, w: 8.8, h: 0.55,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addText("Velero = 集群对象备份（Deployment/ConfigMap/…）+ PV 数据备份 → 整应用级恢复、跨集群迁移、集群级灾难恢复（etcd 都丢了也能救回应用）。", {
      x: 0.6, y: 4.4, w: 8.8, h: 0.55,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addShape("rect", { x: 0.6, y: 5.05, w: 8.8, h: 0.45, fill: { color: C.bgAccent } });
    s.addShape("rect", { x: 0.6, y: 5.05, w: 0.05, h: 0.45, fill: { color: C.accent } });
    s.addText("决策逻辑：etcd 快照保“集群本身”、Velero 保“业务应用”——生产灾备是两者组合（L2 及以上等级标配 Velero）。", {
      x: 0.85, y: 5.05, w: 8.3, h: 0.45,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
  }
};
