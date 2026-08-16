// slide-29.js — 2.5.2 kube-proxy
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 29, title: "kube-proxy" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "kube-proxy：Service 的“交通警察”", C.bgLight);
    s.addText("实现 Service 的负载均衡——把发往 Service 虚拟 IP 的流量转发到后端某个 Pod", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const steps = [
      "应用访问 Service：http://10.96.x.x:80",
      "进入节点内核（iptables 或 IPVS）",
      "kube-proxy 提前写好的规则匹配到 Service IP",
      "按规则随机/轮询选择后端 Pod IP（Endpoints 列表）",
      "DNAT 改写目标地址 → 转发到 Pod 容器",
    ];
    steps.forEach((st, i) => {
      const y = 1.6 + i * 0.52;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.42, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.05, h: 0.42, fill: { color: C.secondary } });
      s.addText((i + 1) + ". " + st, {
        x: 0.85, y, w: 8.3, h: 0.42,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    card(s, 0.6, 4.35, 8.8, 1.05, C.primary);
    s.addText("iptables vs IPVS：iptables 是线性链表 O(n)——Service 越多越慢；IPVS 是哈希表 O(1)——直接查表命中", {
      x: 0.86, y: 4.45, w: 8.3, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, margin: 0
    });
    s.addText("kube-proxy 只做转发不做服务发现（发现靠 DNS）；规则写进内核，流量不经过 kube-proxy 进程", {
      x: 0.86, y: 4.9, w: 8.3, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
