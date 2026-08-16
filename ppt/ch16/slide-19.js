// slide-19.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 19, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "本章小结");
    const items = [
      "分层框架：节点 → Pod → 容器 → 网络 → 存储，从外到内、每层专属命令",
      "证据链：现象 → 事件（describe/get events）→ 日志（logs --previous）→ 指标（top）→ 根因",
      "三条纪律：报错即答案、先恢复再排查、一次只改一个",
      "故障图谱：12 类典型故障的现象 → 第一步 → 根因 → 修复（速查表）",
      "可靠性三件套：滚动更新 0/1（发布不中断，前提是 readiness）+ 优雅终止（下线不丢请求，preStop + grace）+ PDB（驱逐有保护）",
      "主动演练：杀 Pod/杀节点验证自愈——“宣称的能力”要演练过才算数",
    ];
    items.forEach((g, i) => {
      const y = 1.25 + i * 0.62;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.58,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addShape("rect", { x: 0.6, y: 5.05, w: 8.8, h: 0.45, fill: { color: C.bgBlue } });
    s.addText("衔接：第 18 章综合实战——用 WordPress 把全书机制串成真实应用，排障方法论将用于全链路故障定位", {
      x: 0.85, y: 5.05, w: 8.3, h: 0.45,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      valign: "middle", margin: 0
    });
  }
};
