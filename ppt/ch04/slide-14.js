// slide-14.js — 分隔页 4.4
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 14, title: "容器生命周期管理" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "4.4", "容器生命周期管理", [
      "三种状态与退出码：137 = OOM 强杀",
      "三种探针：readiness / liveness / startup",
      "探测方式：httpGet / tcpSocket / exec / grpc",
      "生命周期钩子与优雅终止流程"
    ]);
  }
};
