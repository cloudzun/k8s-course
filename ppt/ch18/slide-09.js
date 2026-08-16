// slide-09.js — 18.2.4 扩展层：HPA + 多副本
const { C, sectionTitle, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 9, title: "扩展层：HPA + 多副本" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "扩展层：HPA + 多副本（存储限制的认知）", C.bgLight);
    // 两个扩展动作
    card(s, 0.6, 1.25, 4.25, 1.4, C.primary);
    s.addText("① scale 到多副本（第 5 章）", { x: 0.9, y: 1.4, w: 3.75, h: 0.32, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    s.addText("kubectl scale deployment wordpress --replicas=5\n→ Pod 变 5，多副本分担流量（同一节点可共存）", {
      x: 0.9, y: 1.76, w: 3.7, h: 0.8, fontSize: 11.5, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    card(s, 5.15, 1.25, 4.25, 1.4, C.primary);
    s.addText("② HPA：CPU 超目标自动扩缩（第 7 章）", { x: 5.45, y: 1.4, w: 3.75, h: 0.32, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    s.addText("HPA 观测 CPU → 自动调整 replicas\n观察：kubectl get hpa（超出目标自动扩）", {
      x: 5.45, y: 1.76, w: 3.7, h: 0.8, fontSize: 11.5, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    // 存储边界
    card(s, 0.6, 2.85, 8.8, 1.35, C.accentWarm);
    s.addText("⚠ local-path 的边界（第 10 章 §10.5.1）", { x: 0.9, y: 3.0, w: 8.2, h: 0.32, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0 });
    s.addText("wordpress-pvc 是节点本地存储：多副本跨节点时 PVC 无法同时挂载（RWO + 单节点）→ 教学环境“多副本”堆在同一节点；生产多副本共享存储必须用 NFS / 云盘。", {
      x: 0.9, y: 3.36, w: 8.2, h: 0.75, fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    warnBar(s, "这个限制就是第 10 章选型知识的实战体现：存储选型决定你能怎么扩展。", 4.4);
  }
};
