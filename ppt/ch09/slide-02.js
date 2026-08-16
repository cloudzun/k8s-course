// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "画出集群的四个网络层次（节点 / Pod / Service / 集群外）及各自网段",
      "解释 Service 的完整机制：Endpoints 选择后端 + kube-proxy 写入转发规则（iptables / IPVS）",
      "对比 Service 的四种类型与 headless，说出各自适用场景",
      "解释集群 DNS（coredns）的解析规则与命名空间作用域",
      "解释 Ingress 的原理（对象 + 控制器 + host/path 路由 + TLS 终止），说出它与 Service 的分工",
      "解释 NetworkPolicy 的隔离原理（默认全通 → 白名单）与典型策略设计",
      "走查“外部用户 → 应用 Pod”的完整路径（哪个组件做了什么）",
    ];
    goals.forEach((g, i) => {
      const y = 1.2 + i * 0.58;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.52,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
