// slide-23.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 23, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "本章小结");
    const items = [
      "为什么需要控制器：裸 Pod 不自愈、不扩缩、不更新——控制器通过控制循环“维持期望状态”",
      "共同骨架：selector（管哪些）+ template（长什么样）+ replicas（几个）+ 控制循环",
      "Deployment：三层结构（RS 为回滚而生）；滚动更新用 maxUnavailable/maxSurge 控节奏（readinessProbe 是零中断的前提）；rollout undo 一键回滚",
      "StatefulSet：解决有状态三难题——稳定有序命名（web-0）、独立 PVC（volumeClaimTemplates）、有序部署/更新",
      "DaemonSet：按节点分布（每节点一个），新节点自动补——CNI/监控/日志的标配",
      "Job/CronJob：成功 = Completed（exit 0）；restartPolicy 必须 OnFailure/Never；CronJob 定时触发 + 并发策略",
      "选型决策树：任务 → Job/CronJob；每节点 → DaemonSet；有身份 → StatefulSet；其余 → Deployment",
    ];
    items.forEach((g, i) => {
      const y = 1.12 + i * 0.58;
      numBadge(s, 0.7, y + 0.04, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.54,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.05
      });
    });
    s.addText("衔接：第 6 章讲“Pod 落在哪个节点”——调度器与调度策略（nodeSelector / 亲和 / 污点容忍 / drain / PDB），届时 DaemonSet 的“控制面不上”之谜会解开", {
      x: 0.6, y: 5.2, w: 8.8, h: 0.35,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
