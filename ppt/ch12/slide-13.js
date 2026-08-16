// slide-13.js — 12.3.2 四个关键字段
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 13, title: "四个关键字段" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "四个关键字段：作用与防什么");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "字段", options: hdr }, { text: "作用", options: hdr }, { text: "防什么", options: hdr }],
      [{ text: "runAsNonRoot + runAsUser", options: mkF(0) }, { text: "非 root 运行", options: celA }, { text: "容器逃逸、root 权限滥用", options: celB }],
      [{ text: "readOnlyRootFilesystem", options: mkF(1) }, { text: "根文件系统只读", options: celB }, { text: "恶意文件写入（挂载卷仍可写）", options: celA }],
      [{ text: 'capabilities.drop: ["ALL"]', options: mkF(0) }, { text: "丢弃能力", options: celA }, { text: "危险内核能力（SYS_ADMIN 等）", options: celB }],
      [{ text: "allowPrivilegeEscalation: false", options: mkF(1) }, { text: "禁止提权", options: celB }, { text: "子进程提权", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.35, w: 8.8, colW: [3.2, 2.4, 3.2],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.55,
    });
    card(s, 0.6, 4.3, 8.8, 0.9, C.accent);
    s.addText("生产常用组合：drop: [\"ALL\"] + add: [\"NET_BIND_SERVICE\"]（只留绑低端口的能力）——最小能力原则。", {
      x: 0.9, y: 4.35, w: 8.2, h: 0.8,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
  }
};
