// slide-06.js — 19.2 域 1 集群架构、安装与配置（25%）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 6, title: "域 1 集群架构安装配置" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "域 1 集群架构、安装与配置（25%）", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgCard : C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    const mkL = (i) => ({ fill: { color: i % 2 ? C.bgCard : C.bgWhite }, fontFace: "Consolas", fontSize: 10, color: C.accent, valign: "middle" });
    const rows = [
      [{ text: "考点", options: hdr }, { text: "关键命令 / 机制", options: hdr }, { text: "教材 / 实验", options: hdr }],
      [{ text: "组件职责与通信", options: mkF(0) }, { text: "apiserver 唯一入口、etcd 状态存储、kubelet 心跳", options: celA }, { text: "第2/3章", options: mkL(0) }],
      [{ text: "kubeadm 流程", options: mkF(1) }, { text: "kubeadm init/join、token 续发", options: celB }, { text: "第3章/实验01", options: mkL(1) }],
      [{ text: "etcd 备份恢复 ★必考", options: mkF(0) }, { text: "etcdctl snapshot save/status/restore", options: celA }, { text: "第14章/实验12", options: mkL(0) }],
      [{ text: "证书", options: mkF(1) }, { text: "kubeadm certs check-expiration/renew", options: celB }, { text: "第13章/实验09", options: mkL(1) }],
      [{ text: "升级", options: mkF(0) }, { text: "kubeadm upgrade plan/apply、worker 逐台", options: celA }, { text: "第14章/实验12", options: mkL(0) }],
      [{ text: "节点管理", options: mkF(1) }, { text: "cordon/drain/uncordon、PDB", options: celB }, { text: "第6/14章", options: mkL(1) }],
      [{ text: "RBAC", options: mkF(0) }, { text: "create role/clusterrole/rolebinding/clusterrolebinding", options: celA }, { text: "第11章/实验09", options: mkL(0) }],
      [{ text: "静态加密", options: mkF(1) }, { text: "EncryptionConfiguration（aescbc/identity）", options: celB }, { text: "第13章/实验09", options: mkL(1) }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.45, w: 8.8, colW: [2.3, 4.7, 1.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.4,
    });
    s.addText("域 1 实操主战场：实验 01（装集群）/ 09（证书与 RBAC）/ 12（etcd 备份恢复）——etcd 备份恢复为必考实操。", {
      x: 0.6, y: 5.2, w: 8.8, h: 0.32,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
