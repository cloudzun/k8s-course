// slide-10.js — 分隔页 15.3 日志
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 10, title: "日志（Logs）" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "15.3", "日志（Logs）", [
      "kubectl logs 的边界：单 Pod、当前容器、不持久",
      "日志架构：stdout 是标准（运行时捕获 + 轮转）",
      "收集模式：daemonset（主流）vs sidecar（文件化老应用）",
      "生产实践：分级采样 / 敏感脱敏 / 保留策略"
    ]);
  }
};
