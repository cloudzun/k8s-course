// slide-21.js — 5.6 控制器选择总决策树（走查实例）
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 21, title: "总决策树与实例走查" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "控制器选择总决策树（走查实例）");
    codeBlock(s, 0.6, 1.2, 4.55, 2.6,
`新应用上线，先问：
① 长期服务 or 跑一次/定时？
   跑一次 → Job（backoffLimit 控重试）
   定时 → CronJob（schedule+并发策略）
   长期服务 → 问 ②
② 每个节点都需要吗？
   是 → DaemonSet（CNI/监控/日志）
   否 → 问 ③
③ 应用有“身份”吗？
   是 → StatefulSet（数据库/消息队列）
   否 → Deployment（Web/API/网关）`, 10.5);
    card(s, 5.35, 1.2, 4.05, 1.28, C.accent);
    s.addText("实例 1：WordPress 站点", {
      x: 5.6, y: 1.28, w: 3.6, h: 0.32,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("· 前端 WordPress → Deployment（多副本、可滚动更新、共享卷存上传文件）\n· MySQL → StatefulSet（稳定标识 mysql-0、独立 PVC 存数据、有序启动）——生产建议", {
      x: 5.6, y: 1.66, w: 3.6, h: 0.76,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    card(s, 5.35, 2.62, 4.05, 1.28, C.accentWarm);
    s.addText("实例 2：监控体系", {
      x: 5.6, y: 2.7, w: 3.6, h: 0.32,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0
    });
    s.addText("· node-exporter 每节点采集指标 → DaemonSet\n· 每日凌晨备份数据库 → CronJob（0 2 * * *）\n· 一次性数据迁移 → Job", {
      x: 5.6, y: 3.08, w: 3.6, h: 0.76,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    // CKA 提示条（自定义浅蓝条）
    s.addShape("rect", { x: 0.6, y: 4.05, w: 8.8, h: 0.62, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 4.05, w: 0.05, h: 0.62, fill: { color: C.primary } });
    s.addText("CKA 考点（域 2：工作负载与调度 15%）：决策树是场景题的答题骨架——看到场景先分类（身份 / 分布 / 任务），再选控制器；场景选型题必考", {
      x: 0.85, y: 4.13, w: 8.3, h: 0.46,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.1
    });
    s.addText("“长期服务 → 按节点分布 → 有身份”三步问完，控制器就定了——先选对类型，再看机制细节", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
