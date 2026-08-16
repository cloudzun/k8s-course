// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "说出可观测性三支柱（指标/日志/事件）各自回答什么问题",
      "区分实时指标（metrics-server / kubectl top）与完整监控（Prometheus 体系）的定位",
      "画出 Prometheus 体系的最小架构（采集/存储/告警/展示）——不深挖 PromQL",
      "解释 Kubernetes 的日志架构（stdout 标准）与两种收集模式（sidecar / daemonset）",
      "知道事件的来源与用途（kubectl get events）",
      "理解审计日志的概念（apiserver 请求全记录）",
      "用三支柱配合定位一个故障（哪个支柱回答哪一步）",
    ];
    goals.forEach((g, i) => {
      const y = 1.25 + i * 0.62;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.55,
        fontSize: 13, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
