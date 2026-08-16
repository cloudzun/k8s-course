// slide-06.js — 15.2.1 实时指标：metrics-server
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 6, title: "实时指标 metrics-server" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "实时指标：metrics-server（第 7 章回顾）", C.bgLight);
    s.addText("指标链路：kubelet → metrics-server → metrics API——运维视角的用途：", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.55, 8.8, 0.9,
      "kubectl top node          # 每个节点的 CPU/内存用量\nkubectl top pod -A        # 每个 Pod 的用量", 13);
    // 特点 / 边界两张卡片
    card(s, 0.6, 2.75, 4.3, 1.35, C.primary);
    s.addText("特点", { x: 0.85, y: 2.88, w: 3.8, h: 0.35, fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    s.addText("实时快照、零配置、够 HPA 用", { x: 0.85, y: 3.28, w: 3.8, h: 0.6, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    card(s, 5.1, 2.75, 4.3, 1.35, C.accentWarm);
    s.addText("边界", { x: 5.35, y: 2.88, w: 3.8, h: 0.35, fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0 });
    s.addText("不存历史（看不了趋势）、不告警、粒度粗（节点 / Pod 级）", { x: 5.35, y: 3.28, w: 3.8, h: 0.6, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    s.addText("“实时”的含义：metrics-server 只保留当前快照——历史趋势要靠 Prometheus 体系（§15.2.2）", {
      x: 0.6, y: 4.35, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("（实验 05 Lab 1：安装 metrics-server → kubectl top node/pod 有数）", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
