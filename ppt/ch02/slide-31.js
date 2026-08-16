// slide-31.js — 分隔页 2.6
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 31, title: "组件通信全流程" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "2.6", "组件通信全流程", [
      "旅程一：kubectl get pods 读请求",
      "旅程二：kubectl apply 创建 Deployment",
      "通信安全：TLS 双向证书与关键端口"
    ]);
  }
};
