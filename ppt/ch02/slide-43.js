// slide-43.js — 2.9 沙盒演练总览
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 43, title: "沙盒演练总览" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "沙盒演练（Killercoda，约 30 分钟）");
    s.addText("环境：https://killercoda.com/playgrounds/scenario/kubernetes · GitHub 账号登录 · 单节点集群 · 最长 1 小时", {
      x: 0.6, y: 1.15, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "演练", options: hdr }, { text: "动作", options: hdr }, { text: "印证的概念", options: hdr }],
      [{ text: "1 认识集群", options: mkF(0) }, { text: "kubectl get nodes / get pods -n kube-system", options: celA }, { text: "架构图上的每个方块 = 真实 Pod", options: celA }],
      [{ text: "2 describe", options: mkF(1) }, { text: "describe apiserver Pod", options: celB }, { text: "对象结构、Events、启动参数", options: celB }],
      [{ text: "3 建第一个 Pod", options: mkF(0) }, { text: "kubectl run nginx + get -o yaml", options: celA }, { text: "命令式、spec vs status", options: celA }],
      [{ text: "4 体验自愈 ⭐", options: mkF(1) }, { text: "裸 Pod 删了不重建 vs Deployment 自动补", options: celB }, { text: "控制循环——全书最重要的“哇”时刻", options: celB }],
      [{ text: "5 Service + scale", options: mkF(0) }, { text: "expose + curl Service + scale 2→5", options: celA }, { text: "稳定入口、弹性（改期望即扩缩）", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.65, w: 8.8, colW: [1.7, 3.9, 3.2],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.55,
    });
    s.addShape("rect", { x: 0.6, y: 4.75, w: 8.8, h: 0.5, fill: { color: C.bgCard } });
    s.addShape("rect", { x: 0.6, y: 4.75, w: 0.05, h: 0.5, fill: { color: C.primary } });
    s.addText("衔接实验手册：这些命令的完整讲解见实验手册（实验 01）“Kubectl 基础与公共操作”", {
      x: 0.85, y: 4.75, w: 8.3, h: 0.5,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
  }
};
