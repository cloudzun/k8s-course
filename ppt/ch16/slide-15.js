// slide-15.js — 16.4.1 滚动更新调优 + 16.4.2 优雅终止
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 15, title: "发布 + 16.4.2 下线可靠性" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "发布可靠性 + 16.4.2 下线可靠性");
    card(s, 0.6, 1.3, 4.3, 2.9, C.primary);
    s.addText("发布：滚动更新策略调优", {
      x: 0.86, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 14.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("默认 25%/25%：允许短暂少 1 个副本（快速但有小中断）", {
      x: 0.86, y: 1.88, w: 3.9, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    codeBlock(s, 0.86, 2.38, 3.9, 0.72,
`maxUnavailable: 0
maxSurge: 1`, 11);
    s.addText("核心服务 0/1：任何时刻不少服务 + 多起一个 → 新 Pod 就绪（readiness）→ 才停旧的 → 零中断发布", {
      x: 0.86, y: 3.2, w: 3.9, h: 0.85,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    card(s, 5.1, 1.3, 4.3, 2.9, C.accent);
    s.addText("下线：优雅终止深化（§4.4.4）", {
      x: 5.36, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 14.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("完整流程：摘流量 → preStop → SIGTERM → grace period → SIGKILL", {
      x: 5.36, y: 1.88, w: 3.9, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addText("preStop 做反注册/排空（sleep 或调注册中心 API）", {
      x: 5.36, y: 2.5, w: 3.9, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("grace period 要够：默认 30s，不够调大 terminationGracePeriodSeconds", {
      x: 5.36, y: 2.9, w: 3.9, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addText("验证：发布/缩容时观察旧 Pod 是否“优雅退出”（describe 看 Killing 事件时间线）", {
      x: 5.36, y: 3.45, w: 3.9, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addShape("rect", { x: 0.6, y: 4.5, w: 8.8, h: 0.9, fill: { color: C.bgAccent } });
    s.addShape("rect", { x: 0.6, y: 4.5, w: 0.07, h: 0.9, fill: { color: C.accent } });
    s.addText("前提：新 Pod 必须配 readinessProbe——没有探针的滚动更新是“盲更新”；优雅终止的配置是生产标准动作", {
      x: 0.95, y: 4.5, w: 8.2, h: 0.9,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark,
      valign: "middle", margin: 0
    });
  }
};
