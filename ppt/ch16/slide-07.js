// slide-07.js — 分隔页 16.2
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 7, title: "各层排障详解" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "16.2", "各层排障详解", [
      "节点层：NotReady —— kubelet 心跳与节点资源",
      "Pod 层：Pending / ImagePullBackOff / CrashLoopBackOff",
      "容器层：logs / exec / kubectl debug",
      "网络层：Endpoints / DNS / 连通性",
      "存储层：PVC Pending / FailedMount",
    ]);
  }
};
