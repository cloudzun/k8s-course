// slide-20.js — 3.7.3/3.7.4 为什么 Calico 与网段一致
const { C, sectionTitle, mkSh } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 20, title: "为什么选 Calico · Pod 网段必须一致" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "为什么是 Calico · 一个必须一致的参数", C.bgLight);
    s.addText("本课程为什么选 Calico", {
      x: 0.6, y: 1.18, w: 5.3, h: 0.32,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const reasons = [
      "性能与模型：BGP 三层路由（数据走真实路由而非隧道封装）——比 Flannel 的 VXLAN 性能好",
      "NetworkPolicy：第 9 章要演练“网络策略隔离”——Flannel 不支持，Calico 原生支持（教学刚需）",
      "生产主流：学了就是生产可用的——大量生产集群用 Calico",
      "实测稳定：本课程在 v1.36 实测通过（多源拉取、三节点互通）",
    ];
    reasons.forEach((r, i) => {
      const y = 1.58 + i * 0.68;
      s.addShape("rect", { x: 0.6, y, w: 5.35, h: 0.6, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.06, h: 0.6, fill: { color: C.primary } });
      s.addText(r, {
        x: 0.9, y, w: 4.9, h: 0.6,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addShape("rect", { x: 6.15, y: 1.58, w: 3.25, h: 2.6, fill: { color: C.bgWhite }, shadow: mkSh() });
    s.addShape("rect", { x: 6.15, y: 1.58, w: 0.06, h: 2.6, fill: { color: C.accentWarm } });
    s.addText("CALICO_IPV4POOL_CIDR 必须与 --pod-network-cidr 完全一致", {
      x: 6.4, y: 1.7, w: 2.8, h: 0.6,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0
    });
    s.addText("init 时声明的网段是“集群的 Pod 网段约定”，Calico 的 IP 池是“实际分配 IP 的池子”——两者不一致，Calico 分配的 IP 落在约定网段之外，路由就乱了。", {
      x: 6.4, y: 2.35, w: 2.8, h: 1.1,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
    s.addText("⚠ 这是 CNI 安装中最常见的错误点。", {
      x: 6.4, y: 3.5, w: 2.8, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0
    });
    s.addText("决策逻辑：教学选型 = “性能可用 + 支持全部要教的功能（网络策略）+ 生产通用”；Flannel 适合“只想通网”的极简场景；Cilium 是“更强但更复杂”的进阶选项", {
      x: 0.6, y: 4.45, w: 8.8, h: 0.55,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
  }
};
