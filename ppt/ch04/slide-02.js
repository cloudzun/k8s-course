// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "解释“Pod 为什么是调度的最小单元”，说清多容器共享什么、为什么要共享",
      "描述多容器 Pod 三种协作模式（sidecar / 适配器 / 大使）与各自场景",
      "解释镜像拉取策略三种取值，以及“默认策略由镜像 tag 决定”",
      "说清 command / args 与 Dockerfile ENTRYPOINT / CMD 的覆盖关系",
      "解释 Init 容器的工作机制（顺序 / 失败 / 共享卷）与适用场景",
      "完整讲解三种探针（startup / liveness / readiness）的职责与配合关系",
      "描述容器优雅终止完整流程：preStop → SIGTERM → 宽限期 → SIGKILL",
      "区分 requests（调度承诺）与 limits（运行上限），CPU 与内存超限的不同后果",
      "解释 Downward API 注入哪些元数据，走查 Pod 从提交到删除的完整生命周期",
    ];
    goals.forEach((g, i) => {
      const y = 1.2 + i * 0.46;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.44,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
