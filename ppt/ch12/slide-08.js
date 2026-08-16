// slide-08.js — 12.2.1/12.2.2 为什么需要 PSA · 三个安全级别
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 8, title: "为什么需要 PSA · 三个安全级别" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "为什么需要 PSA · 三个安全级别", C.bgLight);
    s.addText("SecurityContext 靠 Pod“自觉”——谁能保证每个 Pod 都写了非 root？PSA 把安全标准变成“命名空间级的强制规则”：违规的 Pod 创建即被拒绝（准入校验）。", {
      x: 0.6, y: 1.15, w: 8.8, h: 0.65,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "级别", options: hdr }, { text: "含义", options: hdr }, { text: "典型限制", options: hdr }],
      [{ text: "privileged", options: mkF(0) }, { text: "无限制（默认，相当于没有 PSA）", options: celA }, { text: "无", options: celB }],
      [{ text: "baseline", options: mkF(1) }, { text: "最小限制（默认建议）", options: celB }, { text: "禁止 privileged、hostPath、hostNetwork / hostPID / hostIPC、特权端口等", options: celA }],
      [{ text: "restricted", options: mkF(0) }, { text: "最严格（生产核心）", options: celA }, { text: "baseline 全部 + 非 root（runAsNonRoot）、只读根文件系统、drop ALL、seccompProfile: RuntimeDefault 等", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.95, w: 8.8, colW: [1.5, 3.1, 4.2],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: [0.5, 0.45, 0.8, 0.95],
    });
    s.addText("级别选择：baseline 是生产默认（挡住最常见的高危配置）；restricted 给核心 / 多租户场景（要求苛刻，可能影响正常应用——需要应用配合加固）。", {
      x: 0.6, y: 4.8, w: 8.8, h: 0.7,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.accent, bold: true, valign: "middle", margin: 0
    });
  }
};
