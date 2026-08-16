// slide-04.js — 5.1.1-5.1.2 为什么需要控制器 + 共同骨架
const { C, sectionTitle, card, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 4, title: "为什么需要控制器与共同骨架" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "为什么需要控制器 · 共同骨架");
    s.addText("生产上几乎从不直接创建裸 Pod——控制器就是“管 Pod 的人”：你声明要什么样的 Pod、要几个，它负责创建、维持、更新、扩缩。", {
      x: 0.6, y: 1.08, w: 8.8, h: 0.32,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const cards = [
      { t: "① 不会自愈", d: "Pod 崩溃 / 被删，不会自动重建", c: C.primary },
      { t: "② 不会扩缩", d: "流量大要手动一个个建，流量降要手动删", c: C.accent },
      { t: "③ 没有更新能力", d: "镜像升级只能删了重建，无法滚动", c: C.accentWarm },
    ];
    cards.forEach((cd, i) => {
      const x = 0.6 + i * 2.98;
      card(s, x, 1.48, 2.83, 1.12, cd.c);
      s.addText(cd.t, {
        x: x + 0.2, y: 1.56, w: 2.45, h: 0.34,
        fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: cd.c, margin: 0
      });
      s.addText(cd.d, {
        x: x + 0.2, y: 1.94, w: 2.45, h: 0.6,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    codeBlock(s, 0.6, 2.82, 8.8, 1.8,
`所有工作负载控制器（Deployment/StatefulSet/DaemonSet/Job/CronJob）的共同骨架：
  ① selector（选择器）：管哪些 Pod —— 按标签匹配
  ② template（Pod 模板）：Pod 长什么样 —— 镜像/端口/探针/卷
  ③ replicas（副本数，部分控制器无）：期望多少个 —— Deployment/StatefulSet 有，DaemonSet/Job 无
  ④ 控制循环：持续观察 → 对比期望 → 调和（第 2 章 §2.3）`, 10.5);
    calloutBar(s, "核心认知：控制器不直接运行容器——它只创建/删除 Pod 对象，真正跑容器的是 kubelet；看到“Pod 删了又回来”，就是某个控制器在调和。", 4.8);
  }
};
