// slide-03.js — 分隔页 7.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "指标链路：扩缩容的数据基础" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "7.1", "指标链路：扩缩容的数据基础", [
      "metrics-server：集群内的指标采集器（kube-system 里的 Deployment）",
      "链路：kubelet（cAdvisor）→ metrics-server → metrics API",
      "消费方：kubectl top（人看）与 HPA 控制器（机器用）",
    ]);
  }
};
