// slide-03.js — 分隔页 19.1 考试概览
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "考试概览" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "19.1", "考试概览", [
      "在线实操：2 小时 · 约 15-20 道题 · 每题一个集群场景",
      "多集群终端：每题先 use-context 切换——答错集群 = 白做",
      "无外网：kubectl explain 是唯一字典 · 按结果评分（部分得分）"
    ]);
  }
};
