// slide-17.js — 分隔页 9.5
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 17, title: "NetworkPolicy：网络隔离" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "9.5", "NetworkPolicy：网络隔离", [
      "默认全通：扁平网络的风险",
      "原理：podSelector / ipBlock + ingress / egress 白名单",
      "典型策略设计：数据库层 · 业务层 · 拒绝兜底",
      "依赖 CNI：Calico 支持、Flannel 不支持",
    ]);
  }
};
