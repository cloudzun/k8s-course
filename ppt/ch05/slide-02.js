// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "解释“为什么需要控制器”——裸 Pod 的三个致命问题，说出控制器的共同骨架",
      "解释 Deployment 的三层结构（Deployment → ReplicaSet → Pod）与职责分层",
      "详细描述滚动更新的机制（maxUnavailable / maxSurge 如何控制节奏）与回滚原理",
      "解释 StatefulSet 如何解决有状态应用的三个难题（稳定标识 / 稳定存储 / 有序性）",
      "解释 DaemonSet 的机制与典型场景，说出它与 Deployment 的本质区别",
      "解释 Job 与 CronJob 的机制（成功语义、backoffLimit、并发策略）",
      "根据应用类型（无状态 / 有状态 / 守护 / 任务）做出控制器选型决策",
      "知道扩缩容与暂停机制背后的原理（修改期望状态）",
    ];
    goals.forEach((g, i) => {
      const y = 1.2 + i * 0.52;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.46,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
