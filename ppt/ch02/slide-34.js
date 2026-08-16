// slide-34.js — 2.6.3 通信安全与端口
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 34, title: "通信安全与端口" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "通信安全：TLS 双向证书与端口");
    s.addText("双向 TLS（mTLS）：通信双方都持有证书，互相验证身份——集群有一个 CA，每个组件有自己的证书（由 CA 签发）", {
      x: 0.6, y: 1.15, w: 8.8, h: 0.6,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "组件", options: hdr }, { text: "端口", options: hdr }, { text: "谁连它", options: hdr }],
      [{ text: "kube-apiserver", options: mkF(0) }, { text: "6443", options: celA }, { text: "所有组件 + kubectl", options: celA }],
      [{ text: "kubelet", options: mkF(1) }, { text: "10250", options: celB }, { text: "apiserver（上报/下发）", options: celB }],
      [{ text: "etcd 客户端", options: mkF(0) }, { text: "2379", options: celA }, { text: "apiserver", options: celA }],
      [{ text: "etcd 节点间", options: mkF(1) }, { text: "2380", options: celB }, { text: "etcd 节点互连", options: celB }],
      [{ text: "scheduler / controller-manager", options: mkF(0) }, { text: "10259 / 10257", options: celA }, { text: "健康检查（本地）", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.85, w: 8.8, colW: [3.4, 2.2, 3.2],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    s.addShape("rect", { x: 0.6, y: 4.8, w: 8.8, h: 0.5, fill: { color: C.bgCard } });
    s.addShape("rect", { x: 0.6, y: 4.8, w: 0.05, h: 0.5, fill: { color: C.accentWarm } });
    s.addText("排障关联：“connection refused 到 6443”= apiserver 挂了；“节点 NotReady”先查 10250（kubelet）——第 16 章", {
      x: 0.85, y: 4.8, w: 8.3, h: 0.5,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
  }
};
