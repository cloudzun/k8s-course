// slide-19.js — 9.5.3-9.5.4 典型策略设计与 CNI 依赖
const { C, sectionTitle, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 19, title: "典型策略设计与 CNI 依赖" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "典型策略设计 · CNI 依赖", C.bgLight);
    s.addText("生产基线（先想“谁必须能访问我”，逐条写 from / to）：", {
      x: 0.6, y: 1.15, w: 8.8, h: 0.32,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const steps = [
      "① 数据库层：只允许业务 Pod 访问（podSelector: app=web）+ 监控网段（ipBlock）",
      "② 业务层：只允许 Ingress 入口访问 + 放行 DNS",
      "③ 拒绝一切兜底：空规则 NetworkPolicy（podSelector: {} + 空 ingress）",
    ];
    steps.forEach((st, i) => {
      const y = 1.52 + i * 0.52;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.44, fill: { color: i % 2 ? C.bgLight : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.06, h: 0.44, fill: { color: C.primary } });
      s.addText(st, {
        x: 0.85, y, w: 8.3, h: 0.44,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("NetworkPolicy 必须由支持它的 CNI 实现（重要）：", {
      x: 0.6, y: 3.18, w: 8.8, h: 0.32,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "CNI 插件", options: hdr }, { text: "NetworkPolicy 支持", options: hdr }, { text: "说明", options: hdr }],
      [{ text: "Calico（本课程）", options: mkF(0) }, { text: "原生支持 ✓", options: celA }, { text: "第 3 章选 Calico 的原因之一", options: celA }],
      [{ text: "Flannel", options: mkF(1) }, { text: "不支持", options: celB }, { text: "无网络策略能力", options: celB }],
      [{ text: "Cilium", options: mkF(0) }, { text: "支持（更强）", options: celA }, { text: "eBPF 方案，能力更强", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 3.52, w: 8.8, colW: [2.4, 2.4, 4.0],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.34,
    });
    warnBar(s, "决策逻辑：宁缺毋滥但要有——生产至少给数据库加隔离；验证：kubectl apply 策略后实际访问被拒（实验 07 Lab 6 用 nginx 实测）。", 5.0);
  }
};
