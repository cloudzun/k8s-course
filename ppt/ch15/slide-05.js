// slide-05.js — 分隔页 15.2 指标
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 5, title: "指标（Metrics）" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "15.2", "指标（Metrics）", [
      "实时指标：metrics-server + kubectl top（第 7 章回顾）",
      "完整监控：Prometheus 体系（历史 + 告警 + 可视化）",
      "PromQL 极简实战：至少会看一条典型查询",
      "生产指标实践：利用率 / 应用指标 / 告警分层"
    ]);
  }
};
