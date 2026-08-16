// slide-04.js — 11.1 三道门流程图与拒绝出口
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 4, title: "安全模型三道门" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "安全模型总览：三道门");
    // 流程四框
    const boxes = [
      { x: 0.6, t: "① 认证", d: "Authentication\n（你是谁？）", fill: "E8F4FD", line: "4A90D9" },
      { x: 2.95, t: "② 授权", d: "Authorization\n（你能干什么？）", fill: "E8F4FD", line: "4A90D9" },
      { x: 5.3, t: "③ 准入控制", d: "Admission\n（请求合法吗？）", fill: "E8F4FD", line: "4A90D9" },
      { x: 7.65, t: "写入 etcd", d: "", fill: "E8F8E8", line: "5BA85B" },
    ];
    boxes.forEach(b => {
      s.addShape("rect", { x: b.x, y: 1.25, w: 2.0, h: 1.15, fill: { color: b.fill }, line: { color: b.line, width: 1 } });
      const dt = b.d ? b.t + "\n" + b.d : b.t;
      s.addText(dt, {
        x: b.x + 0.08, y: 1.32, w: 1.84, h: 1.0,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
        align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.05
      });
    });
    // 箭头
    [2.63, 4.98, 7.33].forEach((ax) => {
      s.addText("→", { x: ax, y: 1.62, w: 0.3, h: 0.4, fontSize: 18, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    });
    // 拒绝出口
    s.addText("401\nUnauthorized", { x: 0.85, y: 2.52, w: 1.55, h: 0.5, fontSize: 9.5, fontFace: "Consolas", color: "C0392B", align: "center", valign: "middle", margin: 0 });
    s.addText("403\nForbidden", { x: 3.2, y: 2.52, w: 1.55, h: 0.5, fontSize: 9.5, fontFace: "Consolas", color: "C0392B", align: "center", valign: "middle", margin: 0 });
    s.addText("拒绝\n（策略不符）", { x: 5.55, y: 2.52, w: 1.55, h: 0.5, fontSize: 9.5, fontFace: "Microsoft YaHei", color: "C0392B", align: "center", valign: "middle", margin: 0 });
    s.addText("读图要点：三道门依次通过、各自有独立的拒绝出口——认证失败 401、授权失败 403、准入失败策略不符；“能登录但不让操作”就是第一道门过了、第二道门没过。", {
      x: 0.6, y: 3.1, w: 8.8, h: 0.3, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    // 对照表
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "门", options: hdr }, { text: "回答的问题", options: hdr }, { text: "拒绝结果", options: hdr }, { text: "对应实验", options: hdr }],
      [{ text: "认证", options: mkF(0) }, { text: "你是谁？", options: celA }, { text: "401 Unauthorized", options: celB }, { text: "Lab 1/2", options: celA }],
      [{ text: "授权", options: mkF(1) }, { text: "你能干什么？", options: celB }, { text: "403 Forbidden", options: celA }, { text: "Lab 3/4/5", options: celB }],
      [{ text: "准入", options: mkF(0) }, { text: "请求本身合法吗？", options: celA }, { text: "拒绝（策略不符）", options: celB }, { text: "实验 09 Lab 7/8", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 3.42, w: 8.8, colW: [0.9, 2.7, 2.6, 2.6],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.38,
    });
    calloutBar(s, "核心认知：三道门依次通过——认证通过但授权不足 → Forbidden（“能登录但不让操作”）；授权通过但准入拦截 → 也拒绝（第 12 章）。", 5.12);
  }
};
