// slide-18.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 18, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "三支柱各自回答什么问题？“Pod 一直在重启”分别可以从哪个支柱看到什么？",
      "metrics-server 与 Prometheus 的定位差异？（实时 vs 历史 / 告警）",
      "为什么应用要把日志打到 stdout 而不是写文件？写文件会有什么问题？",
      "daemonset 收集和 sidecar 收集各自的取舍？默认选哪个？",
      "事件默认保留多久？为什么排障要“趁热看”？",
      "事件与审计日志的区别是什么？",
    ];
    qs.forEach((q, i) => {
      const y = 1.25 + i * 0.62;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.55,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "CKA 考点（域 5：故障排查 30%）：kubectl logs --previous、stdout 日志架构、事件、metrics 链路；Prometheus/审计了解级。", 5.0);
  }
};
