// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "解释容器存储的痛点：写入发生在可写层，容器删除数据即消失",
      "区分三种卷类型：emptyDir / hostPath / 配置卷的适用边界",
      "解释 PV/PVC 解耦设计的价值：应用声明需求、管理员提供资源",
      "描述 PV/PVC 生命周期（Provision→Bind→Use→Reclaim）与访问模式、回收策略",
      "区分静态绑定（手动建 PV）与动态供应（StorageClass 自动建）",
      "解释 StorageClass 机制：provisioner / 默认类 / 绑定模式 / 回收策略",
      "理解 local-path 的单节点局限，为有状态应用做出存储选型决策",
    ];
    goals.forEach((g, i) => {
      const y = 1.2 + i * 0.52;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.45,
        fontSize: 13, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
