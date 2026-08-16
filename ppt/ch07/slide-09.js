// slide-09.js — 7.2.5 局限与注意
const { C, sectionTitle, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 9, title: "HPA 局限与注意" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "局限与注意");
    const rows = [
      "① 指标延迟：metrics-server 采集有延迟（约 15 秒），HPA 决策滞后于流量变化——突发流量要预留余量（目标利用率别设 90%，留 60-70%）",
      "② 最小/最大副本：minReplicas 保底（应对冷启动）、maxReplicas 封顶（防止失控扩容）",
      "③ 与手动 scale 的关系：手动 kubectl scale 会被 HPA 覆盖（HPA 是权威）——要调整 HPA 的 min/max 而不是手动 scale，不要混用",
      "④ 与资源模型的关系：HPA 只认 requests——Pod 没配 requests，CPU 利用率指标不可用",
    ];
    rows.forEach((r, i) => {
      const y = 1.3 + i * 0.78;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.68, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.06, h: 0.68, fill: { color: C.primary } });
      s.addText(r, {
        x: 0.85, y, w: 8.3, h: 0.68,
        fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    warnBar(s, "排障提示（CKA 域 5）：HPA 副本不动的排查先看两件事——metrics-server 是否就绪、Pod 是否配了 requests。", 4.62);
  }
};
