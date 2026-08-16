// slide-35.js — 分隔页 2.7
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 35, title: "对象模型" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "2.7", "对象模型详解", [
      "Group / Version / Kind：如何定位一个资源",
      "metadata：对象的身份",
      "spec vs status：期望 vs 当前",
      "完整示例：Deployment 对象逐字段"
    ]);
  }
};
