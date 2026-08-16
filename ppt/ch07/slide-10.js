// slide-10.js — 分隔页 7.3
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 10, title: "垂直扩缩与集群扩缩" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "7.3", "垂直扩缩与集群扩缩：另外两个维度", [
      "VPA：自动调整 requests/limits（垂直），需重建 Pod（v1.27+ 可原地）",
      "ClusterAutoscaler：节点级扩缩，云环境自动增减机器",
      "三种扩缩的定位与决策逻辑",
      "KEDA：事件驱动自动扩缩（进阶）",
    ]);
  }
};
