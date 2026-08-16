// slide-27.js — 分隔页 2.5
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 27, title: "数据面组件" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "2.5", "数据面组件详解", [
      "kubelet：节点上的 Kubernetes 代理",
      "kube-proxy：Service 的交通警察",
      "容器运行时与 CRI：真正跑容器的引擎"
    ]);
  }
};
