// slide-22.js — 3.8 集群验证
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 22, title: "集群验证四层" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "集群验证：验证什么、为什么");
    s.addText("装完集群，验证不是“随便看看”，而是对照第 2 章架构逐层确认", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "验证层", options: hdr }, { text: "验证什么", options: hdr }, { text: "为什么验证它", options: hdr }],
      [{ text: "节点层", options: mkF(0) }, { text: "3 个节点全部 Ready", options: celA }, { text: "Ready = kubelet 心跳正常 + 网络就绪（第 2 章）", options: celB }],
      [{ text: "组件层", options: mkF(1) }, { text: "kube-system 的系统 Pod 全部 Running", options: celB }, { text: "控制面四件套 + kube-proxy + coredns + calico 都在岗（第 2 章架构图）", options: celA }],
      [{ text: "调度层", options: mkF(0) }, { text: "测试 Pod 能创建并落到 worker 节点", options: celA }, { text: "证明调度器工作 + 控制面污点生效（控制面不跑业务，第 6 章）", options: celB }],
      [{ text: "镜像层", options: mkF(1) }, { text: "测试镜像能正常拉取启动", options: celB }, { text: "证明镜像获取链路可用（§3.9 的变通是否生效）", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.6, w: 8.8, colW: [1.5, 3.7, 3.6],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.6,
    });
    s.addText("验证命令（少量即可）：kubectl get nodes · kubectl get pods -A · 跑一个测试 Pod 看调度结果——具体命令在实验手册（实验 01）", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("教学提示：测试 Pod 调度到 worker 而非控制面是正常设计（control-plane 污点）——第一次看到别以为是故障", {
      x: 0.6, y: 5.15, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
