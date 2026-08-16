// slide-03.js — 分隔页 4.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "Pod 的本质" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "4.1", "Pod 的本质：最小调度单元", [
      "逻辑主机：紧密耦合的进程必须同机共存",
      "共享边界：网络 / UTS / 存储卷 / 生命周期",
      "单容器 vs 多容器：sidecar / 适配器 / 大使"
    ]);
  }
};
