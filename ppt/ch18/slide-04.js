// slide-04.js — 18.1.1 需求拆解
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 4, title: "需求拆解" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "需求拆解：一个需求，四个子问题");
    s.addText("需求：发布一个 WordPress 博客站——域名访问、可注册发文、数据不能丢、流量大了能扛。\n拆成四个子问题，每个都对应前面某章机制。", {
      x: 0.6, y: 1.05, w: 8.8, h: 0.6,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "子问题", options: hdr }, { text: "技术决策", options: hdr }, { text: "机制来源", options: hdr }],
      [{ text: "数据放哪？", options: mkF(0) }, { text: "MySQL 数据库（独立有状态）", options: celA }, { text: "第 5 章 StatefulSet 思想、第 10 章存储", options: celB }],
      [{ text: "密码怎么管？", options: mkF(1) }, { text: "Secret 注入（不落 yaml）", options: celB }, { text: "第 8 章", options: celA }],
      [{ text: "前端怎么跑？", options: mkF(0) }, { text: "WordPress 多副本 Deployment", options: celA }, { text: "第 5 章", options: celB }],
      [{ text: "怎么访问？", options: mkF(1) }, { text: "Service + Ingress（域名）", options: celB }, { text: "第 9 章", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.8, w: 8.8, colW: [2.2, 3.9, 2.7],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: [0.45, 0.5, 0.5, 0.5, 0.5],
    });
    s.addText("→ 需求拆解 = 把业务问题翻译成技术选型：数据（第 5/10 章）、凭据（第 8 章）、应用（第 5 章）、访问（第 9 章）。", {
      x: 0.6, y: 4.55, w: 8.8, h: 0.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
