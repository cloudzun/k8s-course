// slide-15.js — 分隔页 6.4 污点与容忍
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 15, title: "污点与容忍" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "6.4", "污点与容忍：节点的“排斥力”与 Pod 的“通行证”", [
      "污点 = 节点主动排斥；容忍 = Pod 的通行证",
      "三种 effect：NoSchedule / PreferNoSchedule / NoExecute（含驱逐时间）",
      "内置污点：control-plane、not-ready、disk-pressure",
      "与亲和是两个独立维度，配合使用（要什么节点 + 能上什么节点）"
    ]);
  }
};
