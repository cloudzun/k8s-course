// slide-09.js — 10.3.2 访问模式与回收策略
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 9, title: "访问模式与回收策略" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "访问模式 · 回收策略");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    s.addText("访问模式（Access Modes）：一块 PV 能被几个节点/几个 Pod 同时用", {
      x: 0.6, y: 1.12, w: 4.2, h: 0.3,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("回收策略（Reclaim Policy）：PVC 删除后，PV 怎么处理", {
      x: 5.2, y: 1.12, w: 4.2, h: 0.3,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addTable([
      [{ text: "访问模式", options: hdr }, { text: "含义", options: hdr }],
      [{ text: "ReadWriteOnce（RWO）", options: mkF(0) }, { text: "单节点读写（数据库标配）", options: celA }],
      [{ text: "ReadOnlyMany（ROX）", options: mkF(1) }, { text: "多节点只读", options: celB }],
      [{ text: "ReadWriteMany（RWX）", options: mkF(0) }, { text: "多节点读写（共享存储如 NFS 才支持）", options: celA }],
    ], {
      fontFace: "Microsoft YaHei", x: 0.6, y: 1.5, w: 4.2, colW: [1.9, 2.3],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.52
    });
    s.addTable([
      [{ text: "策略", options: hdr }, { text: "行为", options: hdr }],
      [{ text: "Retain", options: mkF(0) }, { text: "保留数据（PV 变 Released，管理员手动处理——数据安全）", options: celA }],
      [{ text: "Delete", options: mkF(1) }, { text: "自动删除底层存储（云盘等可自动删）", options: celB }],
      [{ text: "Recycle（已废弃）", options: mkF(0) }, { text: "清理后复用", options: celA }],
    ], {
      fontFace: "Microsoft YaHei", x: 5.2, y: 1.5, w: 4.2, colW: [1.6, 2.6],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.52
    });
    card(s, 0.6, 3.85, 8.8, 0.95, C.accent);
    s.addText("核心认知：访问模式是“底层存储能力”的约束——hostPath 只能 RWO；NFS 支持 RWX。应用声明 PVC 时选的模式必须 PV 支持。", {
      x: 0.9, y: 3.95, w: 8.2, h: 0.75,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark,
      lineSpacingMultiple: 1.2, margin: 0
    });
    s.addText("（实验 08 Lab 3：静态绑定验证访问模式与容量匹配）", {
      x: 0.6, y: 5.0, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
