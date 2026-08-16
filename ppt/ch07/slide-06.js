// slide-06.js — 7.2.1 HPA 原理：控制循环 + 计算示例
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 6, title: "HPA 原理" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "原理：又一个控制循环");
    s.addText("HPA（HorizontalPodAutoscaler）把第 2 章的控制循环应用在“副本数”上——声明目标 CPU 60%、副本 2-10，剩下的交给它。", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.45,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 控制循环四框
    const loop = [
      { t: "① 读指标", b: "（当前利用率）", f: "E8F4FD", l: "4A90D9" },
      { t: "② 计算期望副本", b: "当前 × 利用率比", f: "FFF3E0", l: "E08A3C" },
      { t: "③ 期望 ≠ 当前？", b: "是 → 修改 replicas", f: "FDECEA", l: "D94F4F" },
      { t: "④ 修改 replicas", b: "ReplicaSet 补齐/缩减", f: "E8F8E8", l: "5BA85B" },
    ];
    loop.forEach((b, i) => {
      const bx = 0.6 + i * 2.25;
      s.addShape("rect", { x: bx, y: 1.72, w: 2.0, h: 1.05, fill: { color: b.f }, line: { color: b.l, width: 1 } });
      s.addText(b.t, {
        x: bx + 0.05, y: 1.8, w: 1.9, h: 0.35,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, align: "center", margin: 0
      });
      s.addText(b.b, {
        x: bx + 0.05, y: 2.15, w: 1.9, h: 0.55,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", margin: 0
      });
      if (i < 3) {
        s.addText("→", {
          x: bx + 2.03, y: 2.05, w: 0.2, h: 0.4,
          fontSize: 16, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0
        });
      }
    });
    s.addText("循环永不停止（周期约 15 秒）——只有“期望 ≠ 当前”才修改 replicas；“否”→ 回到 ① 继续观察", {
      x: 0.6, y: 2.92, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0
    });
    // 计算示例
    card(s, 0.6, 3.45, 8.8, 1.05, C.primary);
    s.addText("计算示例：副本 3 · 目标 CPU 60% · 当前利用率 90%", {
      x: 0.9, y: 3.55, w: 8.2, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("期望副本 = 3 × (90% / 60%) = 4.5 → 取整 5 → replicas 3 → 5（扩容）", {
      x: 0.9, y: 3.98, w: 8.2, h: 0.45,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("注意：修改 replicas 只是改“期望状态”——真正补齐/缩减 Pod 的是 ReplicaSet（第 5 章）", {
      x: 0.6, y: 4.65, w: 8.8, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, margin: 0
    });
  }
};
