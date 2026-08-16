// slide-07.js — 9.2.3 Service 的四种类型
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 7, title: "Service 的四种类型" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Service 的四种类型", C.bgLight);
    s.addText("ClusterIP 是默认类型；四种类型由 spec.type 字段指定", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "类型", options: hdr }, { text: "作用域", options: hdr }, { text: "机制", options: hdr }, { text: "适用", options: hdr }],
      [{ text: "ClusterIP（默认）", options: mkF(0) }, { text: "集群内", options: celA }, { text: "虚拟 IP，仅集群内可达", options: celA }, { text: "内部服务间调用（默认首选）", options: celA }],
      [{ text: "NodePort", options: mkF(1) }, { text: "集群外", options: celB }, { text: "每个节点开一个端口（30000-32767）→ 转发到 ClusterIP", options: celB }, { text: "测试 / 小规模外部访问", options: celB }],
      [{ text: "LoadBalancer", options: mkF(0) }, { text: "集群外", options: celA }, { text: "云厂商创建负载均衡器 → 指向 NodePort", options: celA }, { text: "云环境生产对外", options: celA }],
      [{ text: "ExternalName", options: mkF(1) }, { text: "集群外", options: celB }, { text: "DNS CNAME 指向外部域名（无 IP 无转发）", options: celB }, { text: "把集群外服务“伪装”成集群内服务", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.55, w: 8.8, colW: [1.9, 1.1, 3.2, 2.6],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.68,
    });
    s.addText("NodePort 端口范围：30000-32767（固定）——实验 07 Lab 3 看到的 443:30573/TCP 就是它。", {
      x: 0.6, y: 5.08, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
