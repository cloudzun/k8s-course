// slide-04.js — 3.1 三种安装方式对比
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 4, title: "三种安装方式对比" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "安装方式的抉择：为什么是 kubeadm", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "安装方式", options: hdr }, { text: "优点", options: hdr }, { text: "缺点", options: hdr }, { text: "定位", options: hdr }],
      [{ text: "云托管服务\n（EKS/AKS/GKE/ACK）", options: mkF(0) }, { text: "一键创建集群、控制面完全托管，最快最省心", options: celA }, { text: "控制面是黑盒——学不到集群怎么运转", options: celB }, { text: "生产使用，不是学习途径", options: celA }],
      [{ text: "轻量单机\n（minikube/kind/k3s）", options: mkF(1) }, { text: "秒级起集群、资源占用小，本地快速体验", options: celB }, { text: "与生产多节点形态差异大（无真实跨节点调度/网络/存储）", options: celA }, { text: "开发调试、临时体验", options: celB }],
      [{ text: "kubeadm\n（本课程）", options: mkF(0) }, { text: "官方标准工具，可控、可解释、可扩展，过程透明", options: celA }, { text: "需要逐节点操作，有一定学习成本", options: celB }, { text: "学习 + 生产两相宜，CKA 考察", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.25, w: 8.8, colW: [2.1, 2.5, 2.3, 1.9],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.68,
    });
    calloutBar(s, "决策逻辑：学习阶段必须选“过程可见”的方式——kubeadm 把第 2 章的每个组件（etcd、apiserver、kubelet…）一步步摆到你面前；托管服务把这些全藏起来，学不到东西。", 4.7);
  }
};
