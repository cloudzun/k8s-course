// slide-16.js — 分隔页 2.3
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 16, title: "命令式 vs 声明式 + 控制循环" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "2.3", "命令式 vs 声明式，与控制循环", [
      "两种操作哲学：告诉怎么做 vs 告诉要什么",
      "期望状态与当前状态",
      "控制循环：自愈与弹性的根源"
    ]);
  }
};
