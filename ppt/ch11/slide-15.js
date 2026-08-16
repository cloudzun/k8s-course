// slide-15.js — 11.3.5 内置角色（现成的权限模板）
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 15, title: "内置角色" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "内置角色（现成的权限模板）", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11.5, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "角色", options: hdr }, { text: "范围", options: hdr }, { text: "能力", options: hdr }],
      [{ text: "cluster-admin", options: mkF(0) }, { text: "全集群", options: celA }, { text: "超级管理员（绑给 admin.conf）", options: celB }],
      [{ text: "admin", options: mkF(1) }, { text: "命名空间", options: celB }, { text: "命名空间内全权（含 RBAC 管理）", options: celA }],
      [{ text: "edit", options: mkF(0) }, { text: "命名空间", options: celA }, { text: "读写（不含 RBAC）", options: celB }],
      [{ text: "view", options: mkF(1) }, { text: "命名空间", options: celB }, { text: "只读", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.3, w: 8.8, colW: [2.3, 2.0, 4.5],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    card(s, 0.6, 3.85, 8.8, 1.15, C.primary);
    s.addText("常用组合：普通开发 → view / edit；项目负责人 → admin；运维/管理员 → cluster-admin。\n原则：优先用内置角色，不够再自定义——内置角色是社区打磨过的权限模板。", {
      x: 0.9, y: 3.95, w: 8.2, h: 0.95, fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.2
    });
  }
};
