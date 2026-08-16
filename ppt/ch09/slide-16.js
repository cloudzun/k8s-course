// slide-16.js — 9.4.6 展望：Gateway API
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 16, title: "展望：Gateway API" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "展望：Gateway API（Ingress 的继任者）", C.bgLight);
    card(s, 0.6, 1.35, 4.3, 1.75, C.accentWarm);
    s.addText("Ingress 的局限（生产暴露的问题）", {
      x: 0.9, y: 1.45, w: 3.7, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("· 能力被“注解”绑架（不同控制器各自发明注解，不可移植）\n· 只能管南北向（外部进集群），管不了东西向（服务间流量）\n· 路由 / 流量治理能力有限（权重分流靠控制器扩展）", {
      x: 0.9, y: 1.83, w: 3.7, h: 1.15,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, margin: 0
    });
    card(s, 5.1, 1.35, 4.3, 1.75, C.primary);
    s.addText("Gateway API 的核心模型", {
      x: 5.4, y: 1.45, w: 3.7, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("GatewayClass（控制器实现，类比 StorageClass）\n→ Gateway（入口实例：监听端口 / TLS）\n→ HTTPRoute（host/path/权重/Header）→ Service", {
      x: 5.4, y: 1.83, w: 3.7, h: 1.15,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, margin: 0
    });
    card(s, 0.6, 3.3, 8.8, 1.15, C.accent);
    s.addText("与 Ingress 的关系：不是“替换即弃”——Ingress 仍被广泛支持，Gateway API 是演进方向（v1.36 已 GA）", {
      x: 0.9, y: 3.42, w: 8.2, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("关键优势：标准化（不再依赖控制器注解）· 南北向 + 东西向都支持 · 权重分流 / Header 路由内建（金丝雀 / A-B 发布的天然载体，呼应第 5 章发布策略）", {
      x: 0.9, y: 3.8, w: 8.2, h: 0.6,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("决策逻辑：现有集群继续用 Ingress（成熟稳定）；新架构 / 需要高级流量治理 → 评估 Gateway API。用法与 Ingress 思路一脉相承。", {
      x: 0.6, y: 4.7, w: 8.8, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
