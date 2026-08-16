// slide-24.js — 思考题
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 24, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "为什么 Deployment 要隔一层 ReplicaSet？没有它，回滚怎么实现？",
      "滚动更新时 maxUnavailable: 0 意味着什么代价？（提示：更新期间副本数会怎样）",
      "新 Pod 没配 readinessProbe，滚动更新会有什么风险？",
      "StatefulSet 的 Pod 删了重建，为什么名字还是 web-1？数据还在吗？（提示：稳定标识 + volumeClaimTemplates）",
      "为什么 Job 的 Pod 不能配 restartPolicy: Always？",
      "用决策树判断：“每节点都要采集系统指标”的组件和“每天凌晨清理临时文件”的任务，分别用什么控制器？",
    ];
    qs.forEach((q, i) => {
      const y = 1.2 + i * 0.62;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.55,
        fontSize: 12, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    // CKA 考点条（自定义浅蓝条，容纳两行）
    s.addShape("rect", { x: 0.6, y: 4.95, w: 8.8, h: 0.62, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 4.95, w: 0.05, h: 0.62, fill: { color: C.primary } });
    s.addText("CKA 考点（域 2：工作负载与调度 15%）：必考操作 kubectl scale / rollout undo / set image；必考机制 滚动更新（maxUnavailable/maxSurge）、回滚原理（RS 历史）、StatefulSet 稳定标识、Job 的 Completed 语义与 backoffLimit、CronJob 并发策略；必考选型 控制器决策树——排障关联（域 5）：更新后 CrashLoop → rollout undo 快速恢复", {
      x: 0.85, y: 5.0, w: 8.3, h: 0.52,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
