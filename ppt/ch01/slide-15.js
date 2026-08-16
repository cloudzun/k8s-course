// slide-15.js — 分隔页 1.3
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 15, title: "容器化的价值与挑战" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "1.3", "容器化的价值与挑战", [
      "容器化的四大价值",
      "单机场景的挑战——编排器的需求来源"
    ]);
  }
};
