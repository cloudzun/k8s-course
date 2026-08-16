// slide-18.js — 9.5.1-9.5.2 NetworkPolicy 原理与关键语义
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 18, title: "NetworkPolicy 原理与关键语义" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "NetworkPolicy：默认全通 → 白名单");
    s.addText("默认情况下集群内所有 Pod 互通（Pod 网络扁平）——一个 Pod 被攻破，可横向访问任何其他 Pod（包括数据库）。NetworkPolicy = 网络层白名单：声明“谁可以访问哪些 Pod”。", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.6,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.8, 5.5, 3.5, [
      "apiVersion: networking.k8s.io/v1",
      "kind: NetworkPolicy",
      "metadata:",
      "  name: db-allow-app",
      "  namespace: default",
      "spec:",
      "  podSelector:            # 作用对象",
      "    matchLabels: { app: mysql }",
      "  policyTypes: [Ingress, Egress]",
      "  ingress:                # 入站：谁可以访问 mysql",
      "  - from:",
      "    - podSelector: { matchLabels: { app: web } }",
      "    - ipBlock: { cidr: 10.0.0.0/8 }",
      "  egress:                 # 出站：mysql 可以访问谁",
      "  - to:",
      "    - podSelector: { matchLabels: { app: web } }",
      "    ports:",
      "    - protocol: TCP",
      "      port: 3306",
    ].join("\n"), 10);
    card(s, 6.3, 1.8, 3.1, 3.5, C.accentWarm);
    s.addText("关键语义", {
      x: 6.55, y: 1.92, w: 2.6, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("· 匹配的 Pod 一旦被某个 NetworkPolicy 覆盖，默认全通就失效——只允许规则里写明的来源（白名单制）\n· policyTypes 不写的方向不受影响（只限制 Ingress 时 Egress 仍全通）\n· 注意：应用要访问集群 DNS → egress 要放行 DNS（53/UDP），否则 Pod 域名解析都断了（实验 07 Lab 6 实测踩坑）", {
      x: 6.55, y: 2.3, w: 2.6, h: 2.85,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.2, margin: 0
    });
  }
};
