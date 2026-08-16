// slide-09.js — 11.2.4 ServiceAccount 与 Token（v1.24+）
const { C, sectionTitle, card, codeBlock, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 9, title: "ServiceAccount 与 Token" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "ServiceAccount 与 Token（v1.24+ 的重要变化）", C.bgLight);
    card(s, 0.6, 1.15, 8.8, 0.75, C.primary);
    s.addText("SA 是给 Pod/程序用的身份：Pod 指定 serviceAccountName，容器内自动挂载 SA 的 token 文件——应用用它调 apiserver（实验 09 Lab 2 实测）", {
      x: 0.9, y: 1.22, w: 8.2, h: 0.6, fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "", options: hdr }, { text: "旧机制（v1.24 之前）", options: hdr }, { text: "新机制（v1.24+）", options: hdr }],
      [{ text: "Token 怎么来", options: mkF(0) }, { text: "SA 创建时自动生成一个长期 token secret（永不过期）", options: celA }, { text: "不再自动创建 token secret；用 kubectl create token <sa> 动态签发", options: celB }],
      [{ text: "有效期", options: mkF(1) }, { text: "长期有效——泄露就永远有效（安全风险）", options: celB }, { text: "短期 token（默认 1 小时），过期重新签发——安全得多", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 2.05, w: 8.8, colW: [1.7, 3.55, 3.55],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.55,
    });
    codeBlock(s, 0.6, 3.85, 8.8, 0.75,
`kubectl create token chengzh          # 动态签发（1 小时有效）
eyJhbGciOiJSUzI1NiIsImtpZCI6...      # JWT 格式（第 3 章见过）`, 11);
    warnBar(s, "考试/实操注意：用 kubectl describe secret 翻 token 是旧版做法；v1.24+ 已不再自动创建长期 token secret——考试按新机制作答。", 4.8);
  }
};
