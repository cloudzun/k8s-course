// slide-18.js — 分隔页 1.4
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 18, title: "云原生与 CNCF" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "1.4", "云原生与 CNCF", [
      "云原生的定义与五大要素",
      "CNCF 项目全景与本课程的对应"
    ]);
  }
};
