// slide-22.js — 5.7 实验演练指引
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 22, title: "实验演练指引" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "实验演练指引：实验 03“工作负载”（6 个 Lab）", C.bgLight);
    const labs = [
      "Lab 1 使用 deployment 维护服务数量：副本/自愈/扩缩容——kubectl scale 改期望值，亲眼看到“删了自动补”",
      "Lab 2 滚动更新与回滚：kubectl set image 更新 → rollout undo——观察 maxUnavailable/maxSurge 默认值",
      "Lab 3 StatefulSet：webserver-0/1/2 的稳定命名与 headless DNS——有序部署的观察",
      "Lab 4 Job：Completed 状态与 logs 查看任务输出",
      "Lab 5 CronJob：*/1 * * * * 每分钟触发，kubectl get cronjob 看调度记录",
      "Lab 6 DaemonSet：kubectl get pods -o wide 看“每节点一个”的分布",
    ];
    labs.forEach((l, i) => {
      const y = 1.2 + i * 0.56;
      numBadge(s, 0.7, y + 0.02, i + 1);
      s.addText(l, {
        x: 1.35, y, w: 8.0, h: 0.5,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("教学建议：每个 Lab 做完回到本章对应小节对照“机制 → 现象”——Lab 2 的滚动更新观察点就是 §5.2.3 的节奏图；Lab 3 的 webserver-0 命名就是 §5.3.2 的稳定标识", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
