// slide-17.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 17, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "三支柱：指标（用量）/ 日志（说了什么）/ 事件（发生了什么）——互相印证",
      "指标：metrics-server（实时、零配置、供 HPA）→ Prometheus 体系（历史 + 告警 + 大盘，生产标准）",
      "日志：stdout 是标准（运行时捕获 + 轮转）；收集默认 daemonset 模式，sidecar 用于文件化老应用",
      "事件：对象状态变化流水账（describe 的 Events 段 / get events）——临时性（约 1 小时）要趁热看",
      "审计：apiserver 请求全记录（谁、何时、做了什么）——默认不启用，安全 / 合规用",
      "追踪：Trace / Span——请求“慢在哪一环”（生产可观测性完整版）",
      "排障分工：事件指方向 → 日志给细节 → 指标做佐证；第 16 章整合成完整排障方法论",
    ];
    items.forEach((g, i) => {
      const y = 1.25 + i * 0.62;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.55,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
