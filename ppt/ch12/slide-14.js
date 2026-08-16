// slide-14.js — 12.3.3/12.3.4 生效范围 · 自觉 vs 强制
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 14, title: "Pod 级 vs 容器级 · 自觉 vs 强制" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "生效范围 · 自觉 vs 强制", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "对比项", options: hdr }, { text: "Pod 级（spec.securityContext）", options: hdr }, { text: "容器级（containers[].securityContext）", options: hdr }],
      [{ text: "生效范围", options: mkF(0) }, { text: "Pod 内所有容器", options: celA }, { text: "本容器", options: celB }],
      [{ text: "典型字段", options: mkF(1) }, { text: "runAsUser / runAsNonRoot / fsGroup", options: celB }, { text: "readOnlyRootFilesystem / capabilities", options: celA }],
      [{ text: "覆盖关系", options: mkF(0) }, { text: "容器级可以覆盖 Pod 级", options: celA }, { text: "—", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.3, w: 8.8, colW: [1.6, 3.6, 3.6],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    card(s, 0.6, 3.5, 4.3, 1.0, C.primary);
    s.addText("SecurityContext：Pod 自己声明安全要求（“我自觉”）——不写就没人管。", {
      x: 0.8, y: 3.55, w: 3.9, h: 0.9,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    card(s, 5.1, 3.5, 4.3, 1.0, C.accent);
    s.addText("PSA：命名空间强制标准（“你必须安全”）——不达标创建即拒。", {
      x: 5.3, y: 3.55, w: 3.9, h: 0.9,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    s.addText("生产配合：PSA 定红线（baseline / restricted 标签）+ SecurityContext 落实细节（非 root / 只读 / 丢能力）——restricted 要求的正是 SecurityContext 那套字段（循环关系：先学 SC 才知道 restricted 要求什么）。", {
      x: 0.6, y: 4.7, w: 8.8, h: 0.7,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.accent, bold: true, valign: "middle", margin: 0
    });
  }
};
