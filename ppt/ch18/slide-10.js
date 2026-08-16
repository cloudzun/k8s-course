// slide-10.js — 18.2.5 保护层：探针 / 优雅终止 / PDB
const { C, sectionTitle, numBadge, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 10, title: "保护层：探针 / 优雅终止 / PDB" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "保护层：探针 / 优雅终止 / PDB（生产加配）");
    s.addText("生产版还应有（本课程实验为教学简化版）：", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const items = [
      { t: "readinessProbe + livenessProbe", d: "readinessProbe（已配）+ livenessProbe 防死锁 → 第 4 章" },
      { t: "preStop 排空", d: "发布不丢请求 → 第 4 章" },
      { t: "PDB（PodDisruptionBudget）", d: "min-available=1，节点维护有保护 → 第 6 章" },
      { t: "ResourceQuota / LimitRange", d: "命名空间治理 → 第 7 章" },
    ];
    items.forEach((it, i) => {
      const y = 1.55 + i * 0.62;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText([
        { text: it.t + "　", options: { bold: true, color: C.primary } },
        { text: it.d, options: { color: C.textDark } },
      ], { x: 1.35, y, w: 8.0, h: 0.5, fontSize: 12.5, fontFace: "Microsoft YaHei", valign: "middle", margin: 0 });
    });
    calloutBar(s, "“能跑”与“生产可用”的差距就在保护层——演练跑通链路后，对照保护层清单逐项补配。", 4.55);
  }
};
