// slide-03.js — 分隔页 3.1 安装方式的抉择
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "安装方式的抉择" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "3.1", "安装方式的抉择：为什么是 kubeadm", [
      "三类主流方式：云托管（EKS/AKS/GKE）、轻量单机（minikube/kind/k3s）、kubeadm",
      "学习阶段必须选“过程可见”的方式——kubeadm 把每个组件一步步摆到你面前",
      "托管服务控制面是黑盒，学不到集群怎么运转，出了问题只能提工单",
      "CKA 考试直接考察 kubeadm 流程（域 1，权重 25%）"
    ]);
  }
};
