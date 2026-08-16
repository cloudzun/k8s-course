// slide-16.js — 分隔页 5.4 DaemonSet
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 16, title: "DaemonSet" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "5.4", "DaemonSet：每节点一个", [
      "按节点分布：每个节点上恰好运行一个该应用的 Pod",
      "新节点加入自动补 Pod；节点删除对应 Pod 一并消失",
      "cordon 不可调度 → 该节点上不创建",
      "典型场景：CNI 网络插件 / 监控采集 / 日志采集 / CSI 存储组件"
    ]);
  }
};
