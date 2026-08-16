// slide-20.js — 分隔页 4.5
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 20, title: "资源模型" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "4.5", "资源模型：requests 与 limits", [
      "requests 管调度承诺，limits 管运行上限",
      "CPU 可压缩（节流）vs 内存不可压缩（OOM）",
      "QoS 三档：Guaranteed / Burstable / BestEffort",
      "Downward API：注入 Pod 自身元数据"
    ]);
  }
};
