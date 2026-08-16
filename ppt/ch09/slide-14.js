// slide-14.js — 9.4.3 路由规则：host 与 path
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 14, title: "路由规则：host 与 path" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "路由规则：host 与 path", C.bgLight);
    codeBlock(s, 0.6, 1.3, 4.5, 3.9, [
      "apiVersion: networking.k8s.io/v1",
      "kind: Ingress",
      "metadata:",
      "  name: web-ingress",
      "spec:",
      "  ingressClassName: nginx   # 指定控制器",
      "  rules:",
      "  - host: shop.example.com  # 域名 A",
      "    http:",
      "      paths:",
      "      - path: /",
      "        pathType: Prefix",
      "        backend:",
      "          service: { name: shop-svc, port: 80 }",
      "  - host: blog.example.com  # 域名 B",
      "    http:",
      "      paths:",
      "      - path: /admin        # 按路径再细分",
      "        pathType: Prefix",
      "        backend:",
      "          service: { name: blog-admin, port: 80 }",
    ].join("\n"), 10);
    card(s, 5.3, 1.3, 4.1, 1.2, C.primary);
    s.addText("host 匹配域名（Host 头）", {
      x: 5.55, y: 1.4, w: 3.6, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("· pathType: Prefix 前缀 / Exact 精确\n· 无 host 的规则 = 兜底（匹配所有域名）", {
      x: 5.55, y: 1.78, w: 3.6, h: 0.65,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.2, margin: 0
    });
    card(s, 5.3, 2.65, 4.1, 1.15, C.accent);
    s.addText("backend 指向 Service（不是 Pod）", {
      x: 5.55, y: 2.75, w: 3.6, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("Ingress 只做路由决策，实际转发由 Service + kube-proxy 完成", {
      x: 5.55, y: 3.13, w: 3.6, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    card(s, 5.3, 3.95, 4.1, 1.25, C.accentWarm);
    s.addText("访问验证（无 DNS 时）", {
      x: 5.55, y: 4.05, w: 3.6, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("curl -H \"Host: shop.example.com\"\n     http://节点IP:NodePort", {
      x: 5.55, y: 4.38, w: 3.6, h: 0.7,
      fontSize: 11, fontFace: "Consolas", color: C.textDark, margin: 0
    });
  }
};
