// slide-19.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 19, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "指标链路：kubelet（cAdvisor）→ metrics-server → metrics API → kubectl top / HPA——没 metrics-server 就没有 HPA",
      "HPA：控制循环 + 指标 → 期望副本数（当前 × 利用率比）；Utilization 分母是 requests；稳定窗口防抖动（缩容默认 5 分钟）",
      "三种扩缩：HPA 水平（加副本，首选）/ VPA 垂直（调 requests，需重建）/ CA 节点级（云环境加机器）——生产组合 HPA + CA",
      "三层防线：requests/limits（自觉）→ LimitRange（单 Pod 默认值/上下限，强制有 requests）→ ResourceQuota（命名空间总量）",
      "拒绝机制都在准入控制：超限 Forbidden、超配额 exceeded quota——创建时拦截",
      "HPA 与资源模型联动：requests 设得准 → 调度准、HPA 准、配额准",
    ];
    items.forEach((g, i) => {
      const y = 1.22 + i * 0.62;
      numBadge(s, 0.7, y + 0.05, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.55,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("衔接：第 8 章配置管理（ConfigMap/Secret）——资源治理管“用多少”，配置管理管“怎么配”。", {
      x: 0.6, y: 4.98, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
