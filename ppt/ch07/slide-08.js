// slide-08.js — 7.2.3/7.2.4 伸缩节奏与 behavior 策略
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 8, title: "伸缩节奏与 behavior" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "伸缩节奏与 behavior 策略", C.bgLight);
    s.addText("指标是波动的——利用率在 59%/61% 间跳会让副本不停增减（抖动）。HPA 用稳定窗口平滑：", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 左列：稳定窗口
    card(s, 0.6, 1.7, 3.9, 1.15, C.primary);
    s.addText("scaleUp 稳定窗口（扩容）", {
      x: 0.86, y: 1.82, w: 3.5, h: 0.35,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("默认 0 秒，可配置如 60s：利用率持续超目标这么久才扩容", {
      x: 0.86, y: 2.2, w: 3.5, h: 0.58,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, valign: "top", margin: 0
    });
    card(s, 0.6, 3.0, 3.9, 1.35, C.accentWarm);
    s.addText("scaleDown 稳定窗口（缩容）", {
      x: 0.86, y: 3.12, w: 3.5, h: 0.35,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0
    });
    s.addText("默认 5 分钟：利用率持续低于目标这么久才缩容", {
      x: 0.86, y: 3.5, w: 3.5, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("缩容比扩容谨慎——扩错了最多多花钱，缩错了会扛不住流量", {
      x: 0.86, y: 3.88, w: 3.5, h: 0.42,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, lineSpacingMultiple: 1.25, valign: "top", margin: 0
    });
    // 右列：behavior 代码
    codeBlock(s, 4.7, 1.7, 4.7, 2.65, `behavior:
  scaleUp:
    stabilizationWindowSeconds: 60     # 扩容稳定窗口
    policies:
    - type: Percent
      value: 100                       # 一次最多翻倍
      periodSeconds: 60
  scaleDown:
    stabilizationWindowSeconds: 300    # 缩容稳定窗口（默认 5 分钟）
    policies:
    - type: Percent
      value: 50                        # 一次最多缩一半`, 10.5);
    // 底部生产要点
    card(s, 0.6, 4.5, 8.8, 0.78, C.accent);
    s.addText("生产要点：默认行为（5 分钟缩容稳定窗口）通常够用；关键业务可收紧 scaleUp 窗口（更快扩容）、拉长 scaleDown 窗口（更稳的缩容）。", {
      x: 0.9, y: 4.58, w: 8.2, h: 0.62,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, valign: "middle", margin: 0
    });
  }
};
