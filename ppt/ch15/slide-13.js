// slide-13.js — 分隔页 15.4/15.5 事件、审计与追踪
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 13, title: "事件 · 审计 · 分布式追踪" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "15.4", "事件 · 审计 · 分布式追踪", [
      "事件：apiserver 记录的对象变化流水账（get events）",
      "审计：记录访问 apiserver 的所有请求（谁/何时/做了什么）",
      "追踪：一个请求的完整路径（Trace/Span，慢在哪一环）",
      "三支柱 + 追踪齐备，才能高效定位微服务故障"
    ]);
  }
};
