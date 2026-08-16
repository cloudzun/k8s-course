// slide-13.js — 14.4.1 备份三决策（表格）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 13, title: "etcd 备份策略的三决策" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "etcd 备份策略：不只是“存个快照”", C.bgLight);
    s.addText("第 13 章 / 实验 12 已实操快照命令，本章讲策略——备份的三个决策：", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12.5, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "决策", options: hdr }, { text: "建议", options: hdr }, { text: "原因", options: hdr }],
      [{ text: "频率", options: mkF(0) }, { text: "每日 + 每次重大变更（升级/迁移）后", options: celA }, { text: "恢复丢失窗口最小化", options: celA }],
      [{ text: "保留", options: mkF(1) }, { text: "滚动保留 N 份（如 7 天）+ 月度归档", options: celB }, { text: "防磁盘膨胀 + 可回退到更早", options: celB }],
      [{ text: "存放", options: mkF(0) }, { text: "异地（与集群分离：另一台机器/对象存储）", options: celA }, { text: "集群整体故障（机房挂）时备份还能用", options: celA }],
      [{ text: "加密", options: mkF(1) }, { text: "备份文件加密存储", options: celB }, { text: "备份里有 Secret（第 13 章 §13.3.3）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.6, w: 8.8, colW: [1.3, 4.7, 2.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.55,
    });
    s.addText("（实验 12 · Lab 1 etcd 备份与恢复：snapshot save/status/restore 五步 + 备份策略认知）", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
