// slide-05.js — 13.2.1 组件证书全景
const { C, sectionTitle, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 5, title: "组件证书全景" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "组件证书全景（谁有证书）", C.bgLight);
    s.addText("第 3 章 kubeadm init 生成的 PKI 体系（/etc/kubernetes/pki/）：", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgCard : C.bgWhite }, fontFace: "Consolas", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "证书", options: hdr }, { text: "用途", options: hdr }],
      [{ text: "ca.crt / ca.key", options: mkF(0) }, { text: "信任根：签发所有其他证书（最宝贵，必须保管好）", options: celA }],
      [{ text: "apiserver.crt / key", options: mkF(1) }, { text: "apiserver 对外服务（kubectl/组件连它时验证）", options: celB }],
      [{ text: "apiserver-kubelet-client.crt", options: mkF(0) }, { text: "apiserver → kubelet（§13.4 的客户端身份）", options: celA }],
      [{ text: "apiserver-etcd-client.crt", options: mkF(1) }, { text: "apiserver → etcd", options: celB }],
      [{ text: "etcd/ca.crt + server/peer", options: mkF(0) }, { text: "etcd 集群内部与客户端", options: celA }],
      [{ text: "front-proxy-ca.crt", options: mkF(1) }, { text: "聚合 API（扩展 apiserver）", options: celB }],
      [{ text: "sa.pub / sa.key", options: mkF(0) }, { text: "ServiceAccount token 签名（第 11 章）", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.5, w: 8.8, colW: [3.3, 5.5],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.41,
    });
    warnBar(s, "注意：ca.key 是签发一切的私钥——泄露 = 攻击者可伪造任何组件身份；备份但要加密保管。", 4.95);
  }
};
