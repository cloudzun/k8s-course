// slide-18.js — 分隔页 5.5 Job 与 CronJob
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 18, title: "Job 与 CronJob" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "5.5", "Job 与 CronJob：任务型工作负载", [
      "Job：成功 = Completed（exit 0），失败按 backoffLimit 重试（默认 6 次）",
      "parallelism 控制并行度；ttlSecondsAfterFinished 自动清理（生产必配）",
      "CronJob：cron 表达式定时触发 Job + 并发策略（Allow / Forbid / Replace）",
      "restartPolicy 必须 OnFailure / Never——任务型 vs 服务型的本质差异"
    ]);
  }
};
