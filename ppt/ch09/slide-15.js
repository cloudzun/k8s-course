// slide-15.js — 9.4.4 TLS 终止 · 分工
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 15, title: "TLS 终止与 Ingress/Service 分工" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "TLS 终止 · 与 Service 的分工");
    codeBlock(s, 0.6, 1.35, 4.3, 2.0, [
      "spec:",
      "  tls:",
      "  - hosts: [shop.example.com]",
      "    secretName: shop-tls",
      "  rules:",
      "  - host: shop.example.com",
      "    # ...",
    ].join("\n"), 12);
    card(s, 5.1, 1.35, 4.3, 2.0, C.primary);
    s.addText("TLS 终止（证书加解密）由 Ingress 完成，后端 Pod 保持 HTTP 简单", {
      x: 5.4, y: 1.5, w: 3.7, h: 0.6,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("· 证书原料 = 第 8 章 kubernetes.io/tls Secret——第 8 章知识在这里落地\n· 生产证书由 cert-manager 自动签发续期（进阶）", {
      x: 5.4, y: 2.15, w: 3.7, h: 1.0,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, margin: 0
    });
    s.addText("Ingress 与 Service 的分工（易混点）：", {
      x: 0.6, y: 3.6, w: 4.4, h: 0.3,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const boxes = [
      { t: "Ingress\n七层：域名/路径路由 + TLS", c: "E8F4FD" },
      { t: "Service\n四层：负载均衡", c: "E8F4FD" },
      { t: "Pod\n真正干活", c: "E8F8E8" },
    ];
    const bw = 2.6, gap = 0.3;
    boxes.forEach((b, i) => {
      const x = 0.65 + i * (bw + gap);
      s.addShape("rect", { x, y: 3.95, w: bw, h: 0.9, fill: { color: b.c }, line: { color: C.border, width: 1 } });
      s.addText(b.t, {
        x: x + 0.05, y: 4.0, w: bw - 0.1, h: 0.8,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
      });
      if (i < 2) {
        s.addText("→", { x: x + bw + 0.02, y: 4.2, w: gap - 0.04, h: 0.4, fontSize: 16, fontFace: "Microsoft YaHei", color: C.accent, align: "center", margin: 0 });
      }
    });
    s.addText("一句话：Service 负责“负载均衡”（四层），Ingress 负责“路由”（七层）——Ingress 的 backend 指向 Service，不是直接指向 Pod。", {
      x: 0.6, y: 5.0, w: 8.8, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
  }
};
