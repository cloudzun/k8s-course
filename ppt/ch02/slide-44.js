// slide-44.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 44, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "Kubernetes = 容器编排平台：声明式、自愈、弹性、可移植、可扩展",
      "六概念：集群/节点、Pod（最小调度单元）、工作负载、Service（稳定入口）、命名空间、标签选择器",
      "声明式（告诉要什么）vs 命令式（告诉怎么做）——生产标准 kubectl apply",
      "控制循环：期望状态 ↔ 当前状态持续调和——自愈与弹性的根源",
      "控制面四组件 + 数据面三组件：各司其职、只与 apiserver 通信（星型拓扑）",
      "对象模型：GVK 定位 + metadata（身份）+ spec（期望）+ status（当前）",
    ];
    items.forEach((g, i) => {
      const y = 1.3 + i * 0.65;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.6,
        fontSize: 13, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
