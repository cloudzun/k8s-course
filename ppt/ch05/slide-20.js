// slide-20.js — 5.5.2-5.5.3 CronJob 与任务型 vs 服务型
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 20, title: "CronJob 与 restartPolicy" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "CronJob：定时触发 Job · 任务型 vs 服务型", C.bgLight);
    codeBlock(s, 0.6, 1.15, 4.55, 1.35,
`# cron 语法：分 时 日 月 周
schedule: "0 2 * * *"     # 每天凌晨 2 点
schedule: "*/5 * * * *"   # 每 5 分钟`, 11);
    card(s, 5.35, 1.15, 4.05, 1.35, C.primary);
    s.addText("关键配置", {
      x: 5.6, y: 1.24, w: 3.6, h: 0.32,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("· 并发策略 concurrencyPolicy：Allow 允许并发 / Forbid 上次没跑完就不起新的 / Replace 替换上次\n· 历史保留 successfulJobsHistoryLimit / failedJobsHistoryLimit（防 etcd 膨胀）\n· 时区 timeZone 指定（默认按节点时区）", {
      x: 5.6, y: 1.6, w: 3.6, h: 0.86,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "维度", options: hdr }, { text: "服务型（Deployment 等）", options: hdr }, { text: "任务型（Job/CronJob）", options: hdr }],
      [{ text: "期望状态", options: mkF(0) }, { text: "容器一直运行", options: celA }, { text: "容器跑完退出", options: celB }],
      [{ text: "restartPolicy", options: mkF(1) }, { text: "Always（退出就重启）", options: celB }, { text: "OnFailure / Never（跑完别重启）", options: celA }],
      [{ text: "成功标志", options: mkF(0) }, { text: "Running", options: celA }, { text: "Completed（exit 0）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 2.72, w: 8.8, colW: [1.5, 3.4, 3.9],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.4,
    });
    s.addText("为什么 Job 的 Pod 不能配 Always：Always = 退出就重启 → 任务跑完了还会被拉起来重跑，永远完不成——Job 语义要求“退出即结束”", {
      x: 0.6, y: 4.4, w: 8.8, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("CronJob 典型场景：定时备份、定时清理、定时报表", {
      x: 0.6, y: 4.95, w: 8.8, h: 0.35,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
