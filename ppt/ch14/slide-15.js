// slide-15.js — 14.5.1/14.5.2 控制面高可用：多控制面架构
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 15, title: "多控制面高可用架构" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "控制面高可用（概念层）", C.bgLight);
    // 左卡：为什么需要
    card(s, 0.6, 1.2, 3.0, 3.3, C.primary);
    s.addText("为什么需要", {
      x: 0.75, y: 1.32, w: 2.7, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("▸ 第 3 章的单控制面集群有一个单点\n▸ 控制面节点挂了：kubectl 连不上、调度停摆、业务 Pod 状态无法维持\n▸ 生产环境控制面必须冗余", {
      x: 0.8, y: 1.82, w: 2.6, h: 2.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    // 右：架构图
    const LX = 4.7, LW = 4.2;
    s.addText("多控制面架构（kubeadm 支持）", {
      x: 3.8, y: 1.15, w: 5.6, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addShape("rect", { x: LX, y: 1.55, w: LW, h: 0.55, fill: { color: "FFF3E0" }, line: { color: "E08A3C", width: 1 } });
    s.addText("负载均衡器（VIP 192.168.0.100:6443）", {
      x: LX + 0.1, y: 1.6, w: LW - 0.2, h: 0.45,
      fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    s.addText("↓", { x: LX + LW / 2 - 0.15, y: 2.1, w: 0.3, h: 0.3, fontSize: 12, fontFace: "Microsoft YaHei", color: C.accentWarm, align: "center", margin: 0 });
    s.addText("控制面 ×3", {
      x: LX, y: 2.42, w: LW, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0
    });
    const ms = ["master1\nAPI + etcd", "master2\nAPI + etcd", "master3\nAPI + etcd"];
    ms.forEach((m, i) => {
      const x = LX + i * 1.55;
      s.addShape("rect", { x, y: 2.72, w: 1.4, h: 0.85, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
      s.addText(m, {
        x: x + 0.05, y: 2.8, w: 1.3, h: 0.7,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
      });
    });
    s.addText("↓", { x: LX + LW / 2 - 0.15, y: 3.6, w: 0.3, h: 0.3, fontSize: 12, fontFace: "Microsoft YaHei", color: C.accentWarm, align: "center", margin: 0 });
    s.addShape("rect", { x: LX, y: 3.92, w: LW, h: 0.5, fill: { color: "E8F8E8" }, line: { color: "5BA85B", width: 1 } });
    s.addText("工作节点 Worker × N", {
      x: LX + 0.1, y: 3.97, w: LW - 0.2, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    s.addText("kubectl / worker 只连 VIP——任一控制面节点挂掉，其他两个继续服务（控制面无单点）", {
      x: 3.8, y: 4.5, w: 5.6, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0
    });
    // 底部：endpoint 要点
    s.addText("--control-plane-endpoint：给多个控制面一个统一入口（负载均衡 VIP）——kubectl/worker 都连它；kubeadm 用 --control-plane-endpoint 指定 VIP、join --control-plane 加入其余节点。架构细节（kubeadm 配置/证书分发）是进阶运维内容——本章建立概念，知道生产长什么样。", {
      x: 0.6, y: 4.8, w: 8.8, h: 0.65,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
  }
};
