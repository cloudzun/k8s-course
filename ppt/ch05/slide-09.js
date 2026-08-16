// slide-09.js — 5.2.3 滚动更新：节奏控制
const { C, sectionTitle, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 9, title: "滚动更新机制" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "滚动更新：发布不中断的节奏控制");
    card(s, 0.6, 1.15, 4.3, 0.95, C.primary);
    s.addText("maxUnavailable", {
      x: 0.85, y: 1.22, w: 3.8, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("更新过程中最多允许多少个副本不可用（默认 25%）", {
      x: 0.85, y: 1.56, w: 3.8, h: 0.48,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    card(s, 5.1, 1.15, 4.3, 0.95, C.accent);
    s.addText("maxSurge", {
      x: 5.35, y: 1.22, w: 3.8, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("更新过程中最多允许超出期望多少个副本（默认 25%）", {
      x: 5.35, y: 1.56, w: 3.8, h: 0.48,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("分批替换：新版本 Pod 先起来、就绪后，再停旧版本 Pod，循环直到全部替换——一次性全删全建会中断服务", {
      x: 0.6, y: 2.2, w: 8.8, h: 0.32,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 六阶段流水线
    const stages = [
      { label: "阶段1", cells: [0, 0, 0], green: true },
      { label: "阶段2", cells: [1, 0, 0, 0], green: false },
      { label: "阶段3", cells: [1, 0, 0], green: false },
      { label: "阶段4", cells: [1, 1, 0, 0], green: false },
      { label: "阶段5", cells: [1, 1, 0], green: false },
      { label: "阶段6", cells: [1, 1, 1], green: true },
    ];
    const x0 = 0.4, bw = 1.3, gap = 0.28, by = 2.62, bh = 1.3;
    stages.forEach((st, i) => {
      const x = x0 + i * (bw + gap);
      const fill = st.green ? "E8F8E8" : "FFF3E0";
      const stroke = st.green ? "5BA85B" : "E08A3C";
      s.addShape("rect", { x, y: by, w: bw, h: bh, fill: { color: fill }, line: { color: stroke, width: 1.25 } });
      s.addText(st.label, {
        x, y: by + 0.06, w: bw, h: 0.28,
        fontSize: 9.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, align: "center", margin: 0
      });
      st.cells.forEach((isNew, j) => {
        s.addShape("rect", {
          x: x + 0.1 + j * 0.28, y: by + 0.45, w: 0.25, h: 0.34,
          fill: { color: isNew ? "5BA85B" : "AEB6BF" }
        });
      });
      if (i < stages.length - 1) {
        s.addText("→", {
          x: x + bw + 0.02, y: by + 0.4, w: gap - 0.04, h: 0.4,
          fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, align: "center", margin: 0
        });
      }
    });
    s.addText("读图（示例：3 副本，maxUnavailable=1，maxSurge=1）：“新起一个 → 就绪 → 停一个旧的”循环交替（阶段 2-5）；任何时刻 ≥2 个可用、不超 4 个；新旧并存 = 黄色阶段", {
      x: 0.6, y: 4.02, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    warnBar(s, "关键依赖：新 Pod 必须配 readinessProbe（实验 02 Lab 8）——就绪才停旧的；没有它，新 Pod 一启动就被认为可用，更新可能在应用未就绪时切换流量。", 4.45);
    s.addText("生产调优：核心服务用 maxUnavailable: 0 + maxSurge: 1 —— 零中断发布（实验 10 Lab 5 演练）", {
      x: 0.6, y: 5.08, w: 8.8, h: 0.32,
      fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
  }
};
