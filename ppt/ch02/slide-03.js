// slide-03.js — 分隔页 2.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "Kubernetes 是什么" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "2.1", "Kubernetes 是什么", [
      "定义与来历：开源版 Borg，CNCF 毕业项目",
      "它解决什么：承接第 1 章的七大痛点",
      "核心承诺：声明式、自愈、可移植、可扩展"
    ]);
  }
};
