// slide-22.js — 分隔页 2.4
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 22, title: "控制面组件" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "2.4", "控制面组件详解", [
      "kube-apiserver：集群的唯一入口",
      "etcd：集群的状态存储",
      "kube-scheduler：调度器（过滤 + 打分）",
      "kube-controller-manager：控制器集合"
    ]);
  }
};
