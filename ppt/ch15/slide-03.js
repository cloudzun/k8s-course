// slide-03.js — 分隔页 15.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "可观测性三支柱" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "15.1", "可观测性三支柱", [
      "三个问题对应三个数据源：指标 / 日志 / 事件",
      "互相印证：事件指方向、日志给细节、指标做佐证",
      "生产可观测性 = 三者组合（Traces 见 §15.5）"
    ]);
  }
};
