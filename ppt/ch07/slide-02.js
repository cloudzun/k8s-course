// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "解释指标链路：kubelet → metrics-server → metrics API，知道 HPA 与 kubectl top 的数据来源",
      "解释 HPA 工作原理（控制循环 + 指标 → 期望副本数），说出指标类型与计算公式",
      "解释 HPA 伸缩节奏（稳定窗口/冷却）与 behavior 精细控制策略",
      "区分三种扩缩的定位：HPA 水平 / VPA 垂直 / ClusterAutoscaler 节点级",
      "解释资源治理三层防线：requests/limits → LimitRange → ResourceQuota 的管辖范围",
      "解释 LimitRange 与 ResourceQuota 的拒绝机制（准入控制，Forbidden / exceeded quota）",
      "说出“没有限制”与“限制过严”的风险，能设计合理的资源治理方案",
    ];
    goals.forEach((g, i) => {
      const y = 1.2 + i * 0.55;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.5,
        fontSize: 13, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
