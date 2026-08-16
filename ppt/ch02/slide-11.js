// slide-11.js — 2.2.4 Service
const { C, sectionTitle, numBadge, card } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 11, title: "Service：稳定入口" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Service：稳定入口");
    s.addText("问题：Pod IP 是临时的（重建即变），多副本时“该访问哪个 IP”？", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const steps = [
      "创建 Service，声明 selector（选哪些 Pod 作后端）",
      "分配稳定虚拟 IP（ClusterIP，如 10.96.x.x）——不会变",
      "kube-proxy 写转发规则：ClusterIP 流量 → 随机分发到后端",
      "集群 DNS（coredns）把 Service 名解析为 ClusterIP",
    ];
    steps.forEach((st, i) => {
      const y = 1.6 + i * 0.68;
      numBadge(s, 0.7, y + 0.02, i + 1);
      s.addText(st, {
        x: 1.35, y, w: 8.0, h: 0.6,
        fontSize: 13.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    card(s, 0.6, 4.5, 8.8, 0.85, C.primary);
    s.addText("应用用名字访问，不关心 Pod IP——Pod 会死会变，Service 是稳定的", {
      x: 0.9, y: 4.55, w: 8.2, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary,
      align: "center", margin: 0
    });
    s.addText("类型：ClusterIP（集群内）/ NodePort（节点端口）/ LoadBalancer（云负载均衡）/ headless（DNS 直返 Pod IP）", {
      x: 0.9, y: 4.95, w: 8.2, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid,
      align: "center", margin: 0
    });
  }
};
