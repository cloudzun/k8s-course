// slide-04.js — 7.1 指标链路：扩缩容的数据基础
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 4, title: "指标链路" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "指标链路：扩缩容的数据基础", C.bgLight);
    s.addText("requests/limits 是静态声明；“实际用了多少”需要动态数据——这就是 metrics-server 的角色。", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 链路图：四个节点
    const chain = [
      { t: "节点上的容器", b: "kubelet（cAdvisor）\n采集 CPU/内存", f: "E8F4FD", l: "4A90D9" },
      { t: "metrics-server", b: "从各节点拉取\n聚合为标准 API", f: "E8F8E8", l: "5BA85B" },
      { t: "metrics.k8s.io API", b: "apiserver 暴露\n标准接口", f: "FFF3E0", l: "E08A3C" },
      { t: "消费方", b: "kubectl top（人看）\nHPA（机器用）", f: "E8F0FE", l: "326CE5" },
    ];
    chain.forEach((b, i) => {
      const bx = 0.6 + i * 2.25;
      s.addShape("rect", { x: bx, y: 1.7, w: 2.0, h: 1.05, fill: { color: b.f }, line: { color: b.l, width: 1 } });
      s.addText(b.t, {
        x: bx + 0.05, y: 1.78, w: 1.9, h: 0.35,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, align: "center", margin: 0
      });
      s.addText(b.b, {
        x: bx + 0.05, y: 2.13, w: 1.9, h: 0.55,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", margin: 0
      });
      if (i < 3) {
        s.addText("→", {
          x: bx + 2.03, y: 2.02, w: 0.2, h: 0.4,
          fontSize: 16, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0
        });
      }
    });
    // 下方两个说明卡片
    card(s, 0.6, 3.15, 4.3, 1.4, C.primary);
    s.addText("谁提供“用量数据”", {
      x: 0.86, y: 3.27, w: 3.9, h: 0.35,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("集群内指标采集器（kube-system 里的 Deployment，实验 05 Lab 1 安装）\n从每个节点的 kubelet（cAdvisor）拉取 CPU/内存实际用量，聚合后暴露", {
      x: 0.86, y: 3.65, w: 3.9, h: 0.82,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.3, valign: "top", margin: 0
    });
    card(s, 5.1, 3.15, 4.3, 1.4, C.accent);
    s.addText("注意：实时用量不存历史", {
      x: 5.36, y: 3.27, w: 3.9, h: 0.35,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("metrics-server 只提供实时用量（不存历史）\n历史趋势与告警需要 Prometheus 这类完整监控（第 15 章可观测性展开）", {
      x: 5.36, y: 3.65, w: 3.9, h: 0.82,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.3, valign: "top", margin: 0
    });
    calloutBar(s, "核心认知：没有 metrics-server，kubectl top 无数据、HPA 也无法工作（指标未知 → 无法决策）——实验 05 Lab 1 是 HPA 的前提。", 4.7);
  }
};
