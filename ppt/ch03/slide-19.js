// slide-19.js — 3.7.1/3.7.2 CNI 角色与主流插件对比
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 19, title: "CNI 角色与主流插件对比" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "CNI 的角色与主流插件对比");
    s.addText("CNI（容器网络接口）插件：Pod 创建时分配 IP、配置网卡、建立跨节点路由——没有 CNI：Pod 没有 IP、节点间不通、节点不 Ready（必须装）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("CNI 不止管“连通”：还包含 IPAM（IP 地址管理）——负责 Pod IP 的分配/回收；--pod-network-cidr 就是给 IPAM 划定“IP 池”范围", {
      x: 0.6, y: 1.5, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "插件", options: hdr }, { text: "网络模型", options: hdr }, { text: "特点", options: hdr }, { text: "适用场景", options: hdr }],
      [{ text: "Flannel", options: mkF(0) }, { text: "VXLAN 覆盖网络（overlay）", options: celA }, { text: "最简单、最轻量，Pod 间二层互通", options: celB }, { text: "学习、小型集群、“能通”就行", options: celA }],
      [{ text: "Calico（本课程）", options: mkF(1) }, { text: "BGP 三层路由（可选 overlay）", options: celB }, { text: "性能好、原生支持 NetworkPolicy（第 9 章必需）、可扩展", options: celA }, { text: "生产主流；需要网络策略/性能", options: celB }],
      [{ text: "Cilium", options: mkF(0) }, { text: "eBPF 内核编程", options: celA }, { text: "性能最强、功能最丰富（策略/可观测/服务网格）", options: celB }, { text: "大型生产、要求高（学习曲线陡）", options: celA }],
      [{ text: "Weave", options: mkF(1) }, { text: "覆盖网络", options: celB }, { text: "简单易用、自带 DNS 加密", options: celA }, { text: "小规模、追求简单", options: celB }],
      [{ text: "云厂商自带", options: mkF(0) }, { text: "云网络直通", options: celA }, { text: "与云 VPC 集成好", options: celB }, { text: "托管集群（EKS 等）默认", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.95, w: 8.8, colW: [1.75, 2.35, 2.7, 2.0],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.44,
    });
    s.addText("理解 IPAM 才能理解“Pod IP 从哪来、为什么不会耗尽/冲突”（IP 耗尽排障见第 16 章）", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
