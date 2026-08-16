// slide-19.js — 5.5.1 Job：一次性任务
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 19, title: "Job 一次性任务" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Job：一次性任务");
    const cards = [
      { t: "成功 = 完成", d: "Pod 正常退出（exit 0）→ Job 标记 Completed，不再重跑", c: C.primary },
      { t: "失败 = 重试", d: "异常退出 → 按 backoffLimit 重试（默认 6 次），超限标记 Failed", c: C.accent },
      { t: "并行控制", d: "parallelism 决定同时跑几个 Pod（如 10 个任务并发 3 个）", c: C.accentWarm },
    ];
    cards.forEach((cd, i) => {
      const x = 0.6 + i * 2.98;
      card(s, x, 1.2, 2.83, 1.15, cd.c);
      s.addText(cd.t, {
        x: x + 0.2, y: 1.28, w: 2.45, h: 0.32,
        fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: cd.c, margin: 0
      });
      s.addText(cd.d, {
        x: x + 0.2, y: 1.66, w: 2.45, h: 0.62,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("Job 保证“一个任务成功完成”——与 Deployment（长期运行）完全不同的语义", {
      x: 0.6, y: 2.5, w: 8.8, h: 0.32,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    codeBlock(s, 0.6, 2.92, 8.8, 1.4,
`kubectl create job my-job --image=busybox -- sh -c "echo done"
kubectl get job        # COMPLETIONS 1/1、STATUS Completed

spec:
  ttlSecondsAfterFinished: 3600   # 完成 1 小时后自动清理（含其 Pod）`, 11);
    // 自定义警示条（加高，容纳两行）
    s.addShape("rect", { x: 0.6, y: 4.5, w: 8.8, h: 0.72, fill: { color: C.bgAccent } });
    s.addShape("rect", { x: 0.6, y: 4.5, w: 0.05, h: 0.72, fill: { color: C.accentWarm } });
    s.addText("⚠ 生产必配 ttlSecondsAfterFinished：不配置，已完成的 Job 及其 Pod 会无限堆积（CronJob 每天跑一次 → 一年 365 个历史残留），导致 etcd 性能衰退\nCronJob 场景再配合 successfulJobsHistoryLimit / failedJobsHistoryLimit 限制历史记录——任务型负载的“垃圾回收”是生产必做项", {
      x: 0.85, y: 4.56, w: 8.3, h: 0.62,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    s.addText("典型场景：数据迁移、批量处理、初始化任务、CI 中的一次性步骤", {
      x: 0.6, y: 5.3, w: 8.8, h: 0.28,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
