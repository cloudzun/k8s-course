// slide-06.js — 9.2.2 iptables 与 IPVS 两种实现
const { C, sectionTitle, card, bigCallout } = require("./common");
module.exports = {
  slideConfig: { type: "compare", index: 6, title: "iptables 与 IPVS" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "两种实现：iptables 与 IPVS");
    card(s, 0.6, 1.4, 4.3, 1.9, C.primary);
    s.addText("iptables 模式（默认）", {
      x: 0.9, y: 1.52, w: 3.7, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("· 为每个 Service / Endpoints 生成 iptables 规则链\n· 每个请求在规则里随机命中一个后端\n· 随机算法，不是加权轮询", {
      x: 0.9, y: 1.95, w: 3.7, h: 1.2,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, margin: 0
    });
    card(s, 5.1, 1.4, 4.3, 1.9, C.accent);
    s.addText("IPVS 模式", {
      x: 5.4, y: 1.52, w: 3.7, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("· 内核级负载均衡（LVS）\n· 支持 rr / wrr / lc 等调度算法\n· 规则更少、性能更好（大量 Service 时明显）", {
      x: 5.4, y: 1.95, w: 3.7, h: 1.2,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, margin: 0
    });
    bigCallout(s, "核心认知（易错点）：kube-proxy 不是代理进程——流量不经过它，它只负责把规则写进内核；它也不做服务发现（发现靠 DNS）。“规则写内核、转发在内核”是性能的关键。", 3.55, 1.1);
    s.addText("转发发生在内核里：请求路径完全不经过 kube-proxy 进程——kube-proxy 只是“规则的搬运工”。", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
  }
};
