// slide-05.js — 5.1.3 控制器选择决策树
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 5, title: "控制器选择决策树" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "控制器选择决策树（先选对类型）", C.bgLight);
    const qBox = (x, label) => {
      s.addShape("rect", { x, y: 1.3, w: 2.05, h: 0.85, fill: { color: C.bgWhite }, line: { color: C.primary, width: 1.5 } });
      s.addText(label, {
        x: x + 0.05, y: 1.3, w: 1.95, h: 0.85,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary,
        align: "center", valign: "middle", margin: 0
      });
    };
    const resBox = (x, y, label, fill, stroke) => {
      s.addShape("rect", { x, y, w: 2.05, h: 0.85, fill: { color: fill }, line: { color: stroke, width: 1.25 } });
      s.addText(label, {
        x: x + 0.05, y, w: 1.95, h: 0.85,
        fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textDark,
        align: "center", valign: "middle", margin: 0
      });
    };
    // 问题链（第一行）
    qBox(0.6, "① 需要固定身份？");
    qBox(3.0, "② 每个节点都要跑？");
    qBox(5.4, "③ 一次性任务？");
    qBox(7.75, "④ 需要定时？");
    // 结论（第二行）
    resBox(0.6, 2.5, "StatefulSet\n（数据库等）", "E8F4FD", "4A90D9");
    resBox(3.0, 2.5, "DaemonSet\n（CNI/监控/日志）", "E8F4FD", "4A90D9");
    resBox(5.4, 2.5, "Deployment\n（最常用）", "E8F8E8", "5BA85B");
    resBox(7.75, 2.5, "CronJob", "FFF3E0", "E08A3C");
    // Job（第三行，④ 的否分支）
    s.addShape("rect", { x: 7.75, y: 3.62, w: 2.05, h: 0.85, fill: { color: "FFF3E0" }, line: { color: "E08A3C", width: 1.25 } });
    s.addText("Job", {
      x: 7.8, y: 3.62, w: 1.95, h: 0.85,
      fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textDark,
      align: "center", valign: "middle", margin: 0
    });
    // 分支标签
    const noLabel = (x) => s.addText("否→", { x, y: 1.55, w: 0.34, h: 0.3, fontSize: 10, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, align: "center", margin: 0 });
    const yesDown = (x) => s.addText("是↓", { x, y: 2.2, w: 0.6, h: 0.25, fontSize: 10, fontFace: "Microsoft YaHei", bold: true, color: C.accent, align: "center", margin: 0 });
    const noDown = (x) => s.addText("否↓", { x, y: 2.2, w: 0.6, h: 0.25, fontSize: 10, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, align: "center", margin: 0 });
    noLabel(2.66);   // Q1 否 → Q2
    noLabel(5.06);   // Q2 否 → Q3
    s.addText("是→", { x: 7.46, y: 1.55, w: 0.34, h: 0.3, fontSize: 10, fontFace: "Microsoft YaHei", bold: true, color: C.accent, align: "center", margin: 0 }); // Q3 是 → Q4
    yesDown(1.3);    // Q1 是 → StatefulSet
    yesDown(3.7);    // Q2 是 → DaemonSet
    noDown(5.8);     // Q3 否 → Deployment
    yesDown(7.95);   // Q4 是 → CronJob
    s.addText("否↓", { x: 7.9, y: 3.37, w: 0.6, h: 0.22, fontSize: 10, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, align: "center", margin: 0 }); // Q4 否 → Job
    s.addText("判断顺序：先问“身份”→ 再问“分布”→ 再问“任务”——分支结果全部落在右侧的四种控制器", {
      x: 0.6, y: 4.5, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    calloutBar(s, "决策逻辑：默认 Deployment；应用有“身份”（名字/存储要固定）→ StatefulSet；按节点分布 → DaemonSet；跑完即走 → Job/CronJob。选错类型是工作负载最常见的错误——把有状态应用当 Deployment 跑，数据就悬了。", 4.9);
  }
};
