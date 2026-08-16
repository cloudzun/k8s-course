// slide-17.js — 5.4 DaemonSet 机制、场景与对比
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 17, title: "DaemonSet 机制与场景" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "DaemonSet：每节点一个");
    s.addText("保证每个节点上恰好运行一个该应用的 Pod——不是按副本数分布，而是按节点分布", {
      x: 0.6, y: 1.08, w: 8.8, h: 0.32,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const mech = [
      { t: "新节点加入", d: "DaemonSet 自动在新节点创建 Pod", c: C.primary },
      { t: "节点删除", d: "对应 Pod 一并消失", c: C.accent },
      { t: "cordon 不可调度", d: "该节点上不创建（实验 12 Lab 3）", c: C.accentWarm },
    ];
    mech.forEach((cd, i) => {
      const x = 0.6 + i * 2.98;
      card(s, x, 1.48, 2.83, 0.95, cd.c);
      s.addText(cd.t, {
        x: x + 0.2, y: 1.56, w: 2.45, h: 0.32,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: cd.c, margin: 0
      });
      s.addText(cd.d, {
        x: x + 0.2, y: 1.92, w: 2.45, h: 0.45,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    card(s, 0.6, 2.62, 4.55, 2.15, C.accent);
    s.addText("典型场景：节点级服务", {
      x: 0.85, y: 2.72, w: 4.0, h: 0.32,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("· 网络插件：calico-node 每节点一个，管该节点 Pod 网络（实验 01 装过）\n· 监控采集：node-exporter 每节点采集主机指标、metrics-server 的指标来源\n· 日志采集：filebeat / fluentd 每节点一个，收集该节点所有容器日志\n· 存储挂载：部分 CSI 节点组件", {
      x: 0.85, y: 3.1, w: 4.05, h: 1.55,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 10.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "维度", options: hdr }, { text: "Deployment", options: hdr }, { text: "DaemonSet", options: hdr }],
      [{ text: "分布逻辑", options: mkF(0) }, { text: "按副本数，调度器选节点", options: celA }, { text: "按节点，每节点恰好一个", options: celB }],
      [{ text: "新增节点", options: mkF(1) }, { text: "可能不上新节点", options: celB }, { text: "自动补上", options: celA }],
      [{ text: "副本数", options: mkF(0) }, { text: "replicas 指定", options: celA }, { text: "无需指定（= 节点数）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 5.35, y: 2.62, w: 4.05, colW: [1.05, 1.5, 1.5],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    s.addText("注意：默认情况下 DaemonSet 只在工作节点运行——控制面节点有污点（第 6 章调度时展开）；要让 DaemonSet 也跑上控制面，需要容忍那个污点（实验 04 Lab 7 演练过）", {
      x: 0.6, y: 4.95, w: 8.8, h: 0.45,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
