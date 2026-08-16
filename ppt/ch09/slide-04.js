// slide-04.js — 分隔页 9.2
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 4, title: "Service：稳定入口的完整原理" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "9.2", "Service：稳定入口的完整原理", [
      "为什么需要 Service：Pod IP 是临时的",
      "机制：Endpoints 选后端 + kube-proxy 写规则",
      "四种类型与 headless、多端口与端口命名",
    ]);
  }
};
