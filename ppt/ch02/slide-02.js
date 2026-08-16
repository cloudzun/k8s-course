// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "说清 Kubernetes 是什么、解决什么、核心承诺是什么",
      "完整解释 6 个核心概念：集群/节点、Pod、工作负载、Service、命名空间、标签选择器",
      "理解命令式 vs 声明式的本质区别与适用场景",
      "解释控制循环：期望状态与当前状态如何被持续调和",
      "讲解控制面四组件与数据面三组件：做什么、怎么做、为什么",
      "说清组件间通信全流程（一次请求的旅程、TLS 安全、端口）",
      "理解对象模型：Group/Version/Kind 与 metadata/spec/status",
      "熟练 kubectl 高频命令与 kubeconfig 上下文切换",
    ];
    goals.forEach((g, i) => {
      const y = 1.25 + i * 0.52;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.45,
        fontSize: 13.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
