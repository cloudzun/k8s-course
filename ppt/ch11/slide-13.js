// slide-13.js — 11.3.3 RoleBinding vs ClusterRoleBinding（生效范围）
const { C, sectionTitle, bigCallout } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 13, title: "两种 Binding 的生效范围" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "RoleBinding vs ClusterRoleBinding（生效范围）", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "", options: hdr }, { text: "RoleBinding", options: hdr }, { text: "ClusterRoleBinding", options: hdr }],
      [{ text: "生效范围", options: mkF(0) }, { text: "一个命名空间", options: celA }, { text: "全集群", options: celB }],
      [{ text: "授权对象", options: mkF(1) }, { text: "该命名空间内的资源权限", options: celB }, { text: "所有命名空间 + 集群级资源", options: celA }],
      [{ text: "可绑定的角色", options: mkF(0) }, { text: "Role 或 ClusterRole", options: celA }, { text: "只能绑 ClusterRole（绑 Role 会报错）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.35, w: 8.8, colW: [1.5, 3.4, 3.9],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    bigCallout(s, "准确规则：RoleBinding 可以绑 Role 或 ClusterRole（绑 ClusterRole 时限制在命名空间内）；ClusterRoleBinding 只能绑 ClusterRole（全集群生效）。", 3.65, 1.1);
    s.addText("实战：实验 09 Lab 4 用 RoleBinding 给 SA 授权——跨命名空间访问即失败，正是“绑定方式决定范围”的直接验证。", {
      x: 0.6, y: 4.95, w: 8.8, h: 0.35, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
