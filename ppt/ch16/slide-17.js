// slide-17.js — 16.5 SRE 运营规范：SLO / 复盘
const { C, sectionTitle, card, bigCallout } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 17, title: "SRE 运营规范" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "SRE 运营规范：把可靠性“制度化”");
    card(s, 0.6, 1.3, 4.3, 3.1, C.primary);
    s.addText("SLO / Error Budget", {
      x: 0.86, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("SLI（指标）→ SLO（目标）→ SLA（对外承诺）", {
      x: 0.86, y: 1.88, w: 3.9, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("常见 SLI：可用性（成功/总请求）、延迟（P99）、吞吐", {
      x: 0.86, y: 2.3, w: 3.9, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("核心交易：可用性 ≥99.95%，P99 < 500ms\n内部工具：可用性 ≥99.9%，P99 < 2s", {
      x: 0.86, y: 2.72, w: 3.9, h: 0.65,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addText("Error Budget：99.95% SLO = 每月允许 21.9 分钟不可用", {
      x: 0.86, y: 3.42, w: 3.9, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("预算耗尽 → 冻结新功能发布聚焦稳定性；充足 → 可激进发布", {
      x: 0.86, y: 3.84, w: 3.9, h: 0.45,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    card(s, 5.1, 1.3, 4.3, 3.1, C.accent);
    s.addText("故障复盘（Post-mortem）", {
      x: 5.36, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("模板：① 事件概要（何时/多久/影响范围）② 时间线（精确到分钟）③ 根因分析（5 Whys）④ 影响评估 ⑤ 改进措施（每条有 Owner + Deadline）⑥ 经验教训", {
      x: 5.36, y: 1.88, w: 3.9, h: 1.2,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addText("文化：对事不对人（Blameless）；72 小时内完成初稿；改进项进入排期跟踪", {
      x: 5.36, y: 3.15, w: 3.9, h: 0.7,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    bigCallout(s, "核心认知：复盘的价值不在“追责”而在“系统改进”——每个改进措施闭环，SLO 才会逐年提高（配合第 14 章 §14.6 运维日历执行）。", 4.62, 0.8);
  }
};
