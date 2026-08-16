// slide-12.js — 分隔页 9.4
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 12, title: "Ingress：七层入口" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "9.4", "Ingress：七层入口", [
      "为什么需要：四层的 NodePort / LB 没有域名与路径路由",
      "原理：Ingress 对象声明规则 + 控制器真正转发",
      "host/path 路由 · TLS 终止 · 与 Service 的分工",
      "展望：Gateway API——标准化的演进方向",
    ]);
  }
};
