// slide-12.js — 11.3.2 Role vs ClusterRole（权限的范围）
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 12, title: "Role 与 ClusterRole" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Role vs ClusterRole（权限的范围）");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "", options: hdr }, { text: "Role", options: hdr }, { text: "ClusterRole", options: hdr }],
      [{ text: "作用域", options: mkF(0) }, { text: "命名空间内（如 default 里）", options: celA }, { text: "全集群（所有命名空间 + 集群级资源）", options: celB }],
      [{ text: "管理什么", options: mkF(1) }, { text: "该命名空间的 Pod/Svc 等", options: celB }, { text: "全部命名空间 + Node/PV/Namespace 等集群资源", options: celA }],
      [{ text: "创建时", options: mkF(0) }, { text: "必须指定命名空间", options: celA }, { text: "无命名空间", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.35, w: 8.8, colW: [1.5, 3.4, 3.9],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    card(s, 0.6, 3.6, 8.8, 1.15, C.accentWarm);
    s.addText("易混点：Role 是“权限集合”，范围由绑定方式决定——ClusterRole 被 RoleBinding 绑定时，只在那个命名空间生效（实验 09 Lab 4 实测：权限范围被限制在绑定命名空间）。", {
      x: 0.9, y: 3.72, w: 8.2, h: 0.9, fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.15
    });
    s.addText("记忆：Role 管“一个命名空间的家务”，ClusterRole 管“整个集群的事”", {
      x: 0.6, y: 4.9, w: 8.8, h: 0.35, fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
  }
};
