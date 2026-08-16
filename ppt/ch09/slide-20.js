// slide-20.js — 9.6 综合走查：完整访问路径
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 20, title: "综合走查：完整访问路径" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "综合走查：外部用户访问应用的完整路径");
    const steps = [
      "① DNS 解析：wp.example.com → 节点 IP（集群外 DNS）",
      "② Ingress 路由：Host 头匹配规则 + TLS 终止（ingress-nginx，NodePort 31230）",
      "③ Service 负载均衡：wordpress Service（ClusterIP）四层转发",
      "④ kube-proxy DNAT：改写目标 → wordpress Pod",
      "⑤ 应用处理 + MySQL：Pod 通过 Service 名解析访问 MySQL（DB 层有 NetworkPolicy 保护）",
    ];
    steps.forEach((st, i) => {
      const y = 1.3 + i * 0.56;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.48, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.06, h: 0.48, fill: { color: i === 4 ? C.accent : C.primary } });
      s.addText(st, {
        x: 0.85, y, w: 8.3, h: 0.48,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    card(s, 0.6, 4.2, 8.8, 0.75, C.accent);
    s.addText("每层职责：DNS（名字→IP）→ Ingress（域名/路径路由 + TLS）→ Service（负载均衡）→ kube-proxy（转发规则）→ Pod（干活）——排障从外层往内层逐层验证", {
      x: 0.9, y: 4.3, w: 8.2, h: 0.55,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    s.addText("对应实验：实验 07“网络和服务”（Lab 1-6 + 补充）、实验 11 WordPress 案例；Service/DNS 排障顺序见实验 07 Lab 4。", {
      x: 0.6, y: 5.08, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
