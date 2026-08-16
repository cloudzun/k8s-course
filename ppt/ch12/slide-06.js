// slide-06.js — 12.1.3 常见准入控制器
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 6, title: "常见准入控制器" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "常见准入控制器：本章知识点的汇聚点");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "控制器", options: hdr }, { text: "拦截 / 修改什么", options: hdr }, { text: "对应章节", options: hdr }],
      [{ text: "LimitRange", options: mkF(0) }, { text: "单 Pod 资源上下限（填默认 + 校验）", options: celA }, { text: "第 7 章", options: celB }],
      [{ text: "ResourceQuota", options: mkF(1) }, { text: "命名空间总量配额", options: celB }, { text: "第 7 章", options: celA }],
      [{ text: "PodSecurity", options: mkF(0) }, { text: "Pod 安全标准（§12.2）", options: celA }, { text: "本章", options: celB }],
      [{ text: "ServiceAccount", options: mkF(1) }, { text: "自动挂 SA token", options: celB }, { text: "第 11 章", options: celA }],
      [{ text: "NamespaceLifecycle", options: mkF(0) }, { text: "阻止在删除中的命名空间建资源", options: celA }, { text: "—", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.35, w: 8.8, colW: [2.4, 4.6, 1.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    s.addText("本章的“汇聚点”：PSA（§12.2）将在此执行 Pod 安全标准；LimitRange / ResourceQuota 的“拒绝”效果已在第 7 章亲手验证。", {
      x: 0.6, y: 4.55, w: 8.8, h: 0.6,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.accent, bold: true, valign: "middle", margin: 0
    });
  }
};
