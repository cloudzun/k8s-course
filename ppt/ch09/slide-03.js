// slide-03.js — 9.1 网络全景：四个层次
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 3, title: "网络全景：四个层次" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "网络全景：四个层次");
    s.addText("集群里有四个网络层次，各司其职（第 3 章规划过网段）：", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "层次", options: hdr }, { text: "网段", options: hdr }, { text: "说明", options: hdr }],
      [{ text: "① 节点网络（物理）", options: mkF(0) }, { text: "192.168.0.0/24", options: { ...celA, fontFace: "Consolas", align: "center" } }, { text: "机器真实 IP，节点互通", options: celA }],
      [{ text: "② Pod 网络（虚拟）", options: mkF(1) }, { text: "10.244.0.0/16", options: { ...celB, fontFace: "Consolas", align: "center" } }, { text: "每个 Pod 一个 IP（CNI 分配）", options: celB }],
      [{ text: "③ Service 网络（虚拟）", options: mkF(0) }, { text: "10.96.0.0/12", options: { ...celA, fontFace: "Consolas", align: "center" } }, { text: "Service 虚拟 IP（ClusterIP）", options: celA }],
      [{ text: "④ 集群外访问", options: mkF(1) }, { text: "节点 IP:端口 / 域名", options: { ...celB, fontFace: "Consolas", align: "center" } }, { text: "负载均衡器 / Ingress 进入集群", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.55, w: 8.8, colW: [2.6, 2.4, 3.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.58,
    });
    s.addShape("rect", { x: 0.6, y: 4.6, w: 8.8, h: 0.55, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 4.6, w: 0.06, h: 0.55, fill: { color: C.primary } });
    s.addText("关键模型：每个 Pod 一个 IP（CNI / Calico 分配），Pod 之间直接互通无需 NAT；没有 CNI，Pod 无 IP、节点不 Ready。", {
      x: 0.85, y: 4.6, w: 8.3, h: 0.55,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    s.addText("补充：IPv6 双栈——现代 Kubernetes 支持 IPv4 + IPv6 同时运行（--pod-cidrs 配双网段），默认单栈 IPv4。", {
      x: 0.6, y: 5.2, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
