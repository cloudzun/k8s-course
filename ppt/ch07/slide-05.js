// slide-05.js — 分隔页 7.2
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 5, title: "HPA：水平自动扩缩" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "7.2", "HPA：水平自动扩缩", [
      "原理：控制循环 + 指标 → 期望副本数（周期约 15 秒）",
      "指标类型（autoscaling/v2）：Utilization / AverageValue / Value / 自定义",
      "伸缩节奏：稳定窗口防抖动，behavior 精细控制",
      "局限与注意：指标延迟、只认 requests、与手动 scale 的关系",
    ]);
  }
};
