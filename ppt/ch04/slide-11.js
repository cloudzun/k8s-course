// slide-11.js — 分隔页 4.3
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 11, title: "Init 容器" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "4.3", "Init 容器：先决条件执行器", [
      "为什么需要：等待依赖、预置数据、预热缓存",
      "工作机制：顺序执行 · 失败从头重跑 · 共享卷",
      "vs sidecar：“做完就撤”还是“长期伴随”"
    ]);
  }
};
