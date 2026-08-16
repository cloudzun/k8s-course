// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "从需求出发设计一个 Web 应用的集群架构（数据/应用分离原则）",
      "用全书机制逐层落地：Secret/PVC → Deployment/探针 → Service/Ingress → HPA → PDB",
      "说出“为什么前端无状态、数据库有状态”的架构决策依据",
      "执行三层验证（全链路/持久化/扩展）并解释每个验证证明什么",
      "说出多副本共享存储的限制与应对（local-path 的边界认知）",
      "按规范顺序清理整套应用（先入口后数据）",
    ];
    goals.forEach((g, i) => {
      const y = 1.25 + i * 0.62;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.45,
        fontSize: 13, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("本章 = 全书机制的“总装”：用一个真实应用（WordPress 站点）把第 4-16 章核心机制串成完整链路——配套实验 11“综合演练：WordPress 应用发布”（5 个 Lab）。", {
      x: 0.7, y: 5.0, w: 8.6, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
