// slide-12.js — 分隔页 1.2
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 12, title: "Docker 快速回顾" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "1.2", "Docker 快速回顾（镜像 / 容器 / 仓库）", [
      "三大概念：镜像 / 容器 / 仓库",
      "常用命令速查",
      "与 Kubernetes 的衔接：K8s 用 containerd（OCI 兼容）替代 Docker"
    ]);
  }
};
