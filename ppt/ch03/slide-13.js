// slide-13.js — 分隔页 3.4-3.5 kubeadm 安装流程与控制面初始化
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 13, title: "kubeadm 安装流程与控制面初始化" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "3.4-3.5", "kubeadm 安装流程与控制面初始化", [
      "三阶段流水线：准备 → 控制面 init → 加入与联网",
      "kubeadm init 七步：预检 / PKI 证书 / kubeconfig / 静态 Pod / 拉起 / 附加组件 / join 命令",
      "关键参数：--pod-network-cidr、--apiserver-advertise-address、--image-repository",
      "失败排查：wait-control-plane 十有八九是镜像拉不下来"
    ]);
  }
};
