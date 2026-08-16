// slide-03.js — 分隔页 10.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "存储问题全景" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "10.1", "存储问题全景", [
      "容器文件系统为什么“靠不住”：可写层随 Pod 一起消失",
      "三个存储需求：持久化 / 共享 / 解耦",
      "K8s 的答案：卷 → PV/PVC → StorageClass 层层抽象"
    ]);
  }
};
