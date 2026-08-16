// slide-39.js — 分隔页 2.8
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 39, title: "kubectl 与 kubeconfig" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "2.8", "kubectl 与 kubeconfig", [
      "kubectl 命令体系：动词 + 资源 + 选项",
      "kubeconfig 三段结构：集群 / 用户 / 上下文"
    ]);
  }
};
