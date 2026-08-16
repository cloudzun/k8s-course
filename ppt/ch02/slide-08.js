// slide-08.js — 2.2.1 集群与节点
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 8, title: "集群与节点" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "集群与节点", C.bgLight);
    card(s, 0.6, 1.3, 4.3, 2.2, C.primary);
    s.addText("控制面节点（Control Plane）", {
      x: 0.86, y: 1.45, w: 3.9, h: 0.45,
      fontSize: 16, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("运行集群的管理组件（§2.4）——相当于“大脑”。\n\n默认不运行业务容器（污点保护，第 6 章）；生产通常部署 2-3 个做高可用。", {
      x: 0.86, y: 1.95, w: 3.9, h: 1.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    card(s, 5.1, 1.3, 4.3, 2.2, C.accent);
    s.addText("工作节点（Worker Node）", {
      x: 5.36, y: 1.45, w: 3.9, h: 0.45,
      fontSize: 16, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("运行业务容器的机器，数量按需扩展。\n\n每个节点固定三件套：kubelet（节点代理）、kube-proxy（网络转发）、容器运行时（containerd）。", {
      x: 5.36, y: 1.95, w: 3.9, h: 1.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    s.addShape("rect", { x: 0.6, y: 3.75, w: 8.8, h: 0.55, fill: { color: C.bgCard } });
    s.addShape("rect", { x: 0.6, y: 3.75, w: 0.05, h: 0.55, fill: { color: C.primary } });
    s.addText("节点通过 kubelet 定期向控制面上报心跳 → 控制面据此判断节点是否健康（Ready）", {
      x: 0.85, y: 3.75, w: 8.3, h: 0.55,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
    s.addText("判断集群规模：kubectl get nodes 显示所有节点及状态——排障第一步（第 16 章）", {
      x: 0.6, y: 4.55, w: 8.8, h: 0.5,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
