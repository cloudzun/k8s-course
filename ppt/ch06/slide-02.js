// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "解释调度器的两阶段决策过程（过滤 → 打分），知道哪些因素参与过滤与打分",
      "对比四种节点选择手段（nodeSelector / 节点亲和 / 污点容忍 / 手动指定），说出各自适用场景",
      "解释节点亲和与反亲和的软硬约束（required / preferred）与表达式语法",
      "解释 Pod 亲和 / 反亲和的原理与 topologyKey（拓扑域），能设计多副本高可用分布",
      "解释污点与容忍的机制、三种 effect 的语义（含 NoExecute 驱逐时间）",
      "说出控制面节点“不跑业务”的实现机制（内置污点）",
      "解释 cordon / drain / uncordon 维护流程与 drain 的驱逐逻辑",
      "解释 PDB 如何保护驱逐（ALLOWED DISRUPTIONS 计算）",
      "综合运用：为一个 Pod 规划完整的落点控制方案",
    ];
    goals.forEach((g, i) => {
      const y = 1.18 + i * 0.48;
      numBadge(s, 0.7, y + 0.02, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.46,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
