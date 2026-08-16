// slide-03.js — 分隔页 6.1 调度器
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "调度器：Pod 落点的决策者" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "6.1", "调度器：Pod 落点的决策者", [
      "调度的本质：只发生在新 Pod（Pending）上——写 nodeName，kubelet Watch 后拉起",
      "两阶段决策：过滤（一票否决）→ 打分（择优录取）",
      "调度器可替换：schedulerName 指定自定义调度器",
      "Descheduler：补上“运行期再平衡”，闭环资源生命周期"
    ]);
  }
};
