// slide-05.js — 分隔页 3.2 安装前必须想清楚的事
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 5, title: "安装前必须想清楚的事" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "3.2", "安装前必须想清楚的事", [
      "形态与资源：单节点 / 标准 3 节点 / 生产高可用",
      "版本策略：kubelet/kubeadm/kubectl 三件套同版本、装后锁定",
      "网络规划：节点 / Pod / Service 三个网段互不重叠",
      "环境前置：swap、内核模块、ip_forward、主机名——每项都有“为什么”"
    ]);
  }
};
