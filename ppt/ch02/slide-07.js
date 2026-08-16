// slide-07.js — 分隔页 2.2
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 7, title: "六个核心概念" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "2.2", "六个核心概念详解", [
      "集群/节点 · Pod · 工作负载控制器",
      "Service · 命名空间 · 标签选择器",
      "每个概念讲清原理，不满足于一句话定义"
    ]);
  }
};
