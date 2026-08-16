// slide-03.js — 分隔页 16.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "排障方法论" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "16.1", "排障方法论：先有框架，再动手", [
      "分层排查框架：从外到内五层，每层专属命令",
      "证据链思维：现象 → 事件 → 日志 → 指标 → 根因",
      "排障三条铁律：报错即答案 / 先恢复再排查 / 一次只改一个",
    ]);
  }
};
