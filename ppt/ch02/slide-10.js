// slide-10.js — 2.2.3 工作负载控制器（五卡片）
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 10, title: "工作负载控制器" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "工作负载控制器（Workload Controllers）", C.bgLight);
    s.addText("控制器是“管理 Pod 的 Pod”——声明“要这种 Pod、要 N 个、怎么更新”，由控制器维持", {
      x: 0.6, y: 1.15, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const items = [
      { t: "Deployment", d: "无状态多副本\n滚动更新/回滚/扩缩容", strip: C.primary },
      { t: "StatefulSet", d: "有状态、有序\n稳定标识 + 独立存储", strip: C.secondary },
      { t: "DaemonSet", d: "每节点恰好一个\n网络/监控/日志采集", strip: C.accent },
      { t: "Job", d: "一次性任务\n成功（Completed）即结束", strip: C.accentWarm },
      { t: "CronJob", d: "按 cron 定时触发\n如每天凌晨备份", strip: C.gold },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + i * 1.82;
      card(s, x, 1.65, 1.7, 2.1, it.strip);
      s.addText(it.t, {
        x: x + 0.1, y: 1.75, w: 1.5, h: 0.4,
        fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary,
        align: "center", margin: 0
      });
      s.addText(it.d, {
        x: x + 0.1, y: 2.2, w: 1.5, h: 1.4,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
        align: "center", lineSpacingMultiple: 1.3, margin: 0, valign: "top"
      });
    });
    calloutBar(s, "选择口诀：无状态用 Deployment、有状态用 StatefulSet、每节点守护用 DaemonSet、一次性用 Job、定时用 CronJob。", 4.2);
  }
};
