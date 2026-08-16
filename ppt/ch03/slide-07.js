// slide-07.js — 3.2.3 三个网段规划
const { C, sectionTitle, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 7, title: "三个网段不能打架" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "网络规划：三个网段不能打架", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "网段", options: hdr }, { text: "用途", options: hdr }, { text: "本课程取值", options: hdr }, { text: "为什么不能冲突", options: hdr }],
      [{ text: "节点网段", options: mkF(0) }, { text: "机器的真实内网 IP", options: celA }, { text: "192.168.0.0/24", options: celB }, { text: "物理基础，真实存在", options: celA }],
      [{ text: "Pod 网段\n（--pod-network-cidr）", options: mkF(1) }, { text: "每个 Pod 的 IP", options: celB }, { text: "10.244.0.0/16", options: celA }, { text: "与节点网段冲突 → Pod 与节点 IP 混淆、路由错乱", options: celB }],
      [{ text: "Service 网段\n（--service-cidr）", options: mkF(0) }, { text: "Service 虚拟 IP", options: celA }, { text: "10.96.0.0/12（默认）", options: celB }, { text: "同样不能与上面两个重叠", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.25, w: 8.8, colW: [2.3, 2.0, 1.9, 2.6],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.62,
    });
    warnBar(s, "常见错误：云主机内网常用 192.168.x.x，若 Pod 网段也选 192.168.x.x 两者重叠——流量会被路由到错误的地方；选一个明显不同的网段（10.244.x.x）就对了。", 3.95);
    s.addText("三个网段由 --pod-network-cidr / --service-cidr 声明，是 IPAM 的“IP 池”边界（§3.7）；规划顺序：节点网段（物理）→ Pod 网段 → Service 网段", {
      x: 0.6, y: 4.65, w: 8.8, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
