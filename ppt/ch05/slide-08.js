// slide-08.js — 5.2.2 + 5.2.5 副本管理、扩缩容与暂停
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 8, title: "副本管理与扩缩容暂停" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "副本管理与自愈 · 扩缩容与暂停", C.bgLight);
    card(s, 0.6, 1.3, 5.0, 2.6, C.primary);
    s.addText("replicas: 3 = 期望副本数，ReplicaSet 控制器负责维持", {
      x: 0.9, y: 1.42, w: 4.5, h: 0.34,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("· 某 Pod 崩溃 → RS 创建新 Pod（自愈）\n· 某节点挂了 → 该节点上 Pod 消失 → RS 在其他节点补建（节点级自愈）\n· kubectl scale → 只是修改期望值（3→5），RS 自动补建 2 个（第 2 章 §2.3.4 走查过）\n· 扩缩容原理 = 修改期望状态，RS 负责调和——第 7 章 HPA 就是自动执行这一步", {
      x: 0.9, y: 1.85, w: 4.5, h: 1.9,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
    codeBlock(s, 5.8, 1.3, 3.6, 2.6,
`kubectl scale deployment/web --replicas=5
# 改期望值 → RS 自动补建 2 个

kubectl rollout pause deployment/web
# 暂停：多次修改模板不触发更新

kubectl rollout resume deployment/web
# 恢复：合并的修改一次性生效`, 10.5);
    s.addText("暂停的价值：批量修改模板时避免每次改动都滚动一次——改完 resume 一次性生效（生产变更的常用手法）", {
      x: 0.6, y: 4.1, w: 8.8, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("“删了自动补”就是第 2 章控制循环在 Deployment 上的具体化：持续把“当前副本数”调和到“期望副本数”", {
      x: 0.6, y: 4.6, w: 8.8, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
