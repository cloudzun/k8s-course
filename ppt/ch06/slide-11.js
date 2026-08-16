// slide-11.js — 分隔页 6.3 Pod 亲和/反亲和
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 11, title: "Pod 亲和/反亲和" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "6.3", "Pod 亲和/反亲和：Pod 之间的位置关系", [
      "反亲和分散副本保高可用；亲和聚合缓存与计算",
      "拓扑域 topologyKey：hostname（节点）/ zone（可用区）/ region（地域）",
      "podAntiAffinity / podAffinity：结构与节点亲和几乎一样",
      "生产标配：topologySpreadConstraints 跨可用区均匀分布"
    ]);
  }
};
