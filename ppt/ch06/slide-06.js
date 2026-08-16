// slide-06.js — 6.1.3/6.1.4 调度器可替换性与 Descheduler
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 6, title: "调度器可替换性与 Descheduler" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "调度器可替换性与 Descheduler", C.bgLight);
    // 可替换性
    card(s, 0.6, 1.15, 4.3, 2.95, C.primary);
    s.addText("调度器可替换（可插拔）", {
      x: 0.9, y: 1.3, w: 3.8, h: 0.35, fontSize: 13.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    const rItems = [
      "调度器不是“硬编码”的：Pod 可用 schedulerName 字段指定自定义调度器",
      "典型场景：专门处理 GPU 任务的自定义调度器",
      "默认调度器（kube-scheduler）覆盖绝大多数场景",
      "知道“调度策略可插拔”即可（进阶内容）",
    ];
    rItems.forEach((t, i) => {
      s.addText("• " + t, {
        x: 0.9, y: 1.8 + i * 0.55, w: 3.8, h: 0.52,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
      });
    });
    // Descheduler
    card(s, 5.1, 1.15, 4.3, 2.95, C.accentWarm);
    s.addText("Descheduler：运行期再平衡", {
      x: 5.4, y: 1.3, w: 3.8, h: 0.35, fontSize: 13.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.accentWarm, margin: 0
    });
    const dItems = [
      "问题：调度器只在 Pod 创建时决策一次——新节点加入、资源碎片化、副本增减后，已运行的 Pod 不会重新平衡",
      "场景：node1 挤满、node3 空着 → 新 Pod 去 node3，但 node1 的旧 Pod 不会自己挪 → 长期“贫富不均”",
      "机制：定期扫描并按策略驱逐（低利用率合并 / 副本分散 / 节点年龄）→ 优雅终止 → 控制器重建、重新调度",
    ];
    dItems.forEach((t, i) => {
      s.addText("• " + t, {
        x: 5.4, y: 1.8 + i * 0.72, w: 3.8, h: 0.7,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
      });
    });
    // 核心认知
    calloutBar(s, "核心认知：Descheduler 与调度器互补——调度器管“初始放置”，Descheduler 管“运行期再平衡”（配合 Cluster Autoscaler 实现资源生命周期闭环）；教学环境可选装，知道概念即可", 4.35);
  }
};
