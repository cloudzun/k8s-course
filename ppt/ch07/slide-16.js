// slide-16.js — 7.4.4 三层协作与设计建议
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 16, title: "三层协作与设计建议" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "三层协作与设计建议");
    // 三层递进图
    const layers = [
      { t: "第一层", b: "Requests/Limits\n（Pod 声明，自觉）", f: "E8F4FD", l: "4A90D9" },
      { t: "第二层", b: "LimitRange\n（单 Pod 上下限 + 默认值，强制）", f: "FFF3E0", l: "E08A3C" },
      { t: "第三层", b: "ResourceQuota\n（命名空间总量，防膨胀）", f: "FDECEA", l: "D94F4F" },
    ];
    layers.forEach((b, i) => {
      const bx = 0.6 + i * 3.1;
      s.addShape("rect", { x: bx, y: 1.35, w: 2.6, h: 1.05, fill: { color: b.f }, line: { color: b.l, width: 1 } });
      s.addText(b.t, {
        x: bx + 0.05, y: 1.43, w: 2.5, h: 0.35,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, align: "center", margin: 0
      });
      s.addText(b.b, {
        x: bx + 0.05, y: 1.78, w: 2.5, h: 0.55,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", margin: 0
      });
      if (i < 2) {
        s.addText("→", {
          x: bx + 2.62, y: 1.67, w: 0.45, h: 0.4,
          fontSize: 16, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0
        });
      }
    });
    // 读图要点
    s.addShape("rect", { x: 0.6, y: 2.62, w: 8.8, h: 0.55, fill: { color: C.bgCard } });
    s.addShape("rect", { x: 0.6, y: 2.62, w: 0.06, h: 0.55, fill: { color: C.primary } });
    s.addText("三层是“递进约束”：自觉声明 → 命名空间内强制单 Pod 默认值与上下限 → 兜底总量；后两层都在准入控制执行（创建时拦截，第 12 章展开原理）。", {
      x: 0.85, y: 2.62, w: 8.3, h: 0.55,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, valign: "middle", margin: 0
    });
    // 设计建议
    s.addText("设计建议（生产视角）", {
      x: 0.6, y: 3.32, w: 8.8, h: 0.35,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    card(s, 0.6, 3.72, 4.3, 1.5, C.primary);
    s.addText("▸ 每个生产命名空间都配 ResourceQuota（总量兜底）\n▸ 配 LimitRange 的 default——强制每个 Pod 都有 requests（HPA 依赖它、调度依赖它）", {
      x: 0.86, y: 3.84, w: 3.9, h: 1.25,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, valign: "top", margin: 0
    });
    card(s, 5.1, 3.72, 4.3, 1.5, C.accent);
    s.addText("▸ 测试命名空间配额可以小（倒逼省资源）；生产按业务量评估\n▸ 拒绝机制都在准入控制：Forbidden / exceeded quota（创建时拦截）", {
      x: 5.36, y: 3.84, w: 3.9, h: 1.25,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, valign: "top", margin: 0
    });
  }
};
