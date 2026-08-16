// slide-14.js — 2.2.7 六核心概念关系图
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 14, title: "六概念关系图" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "六个核心概念关系图", C.bgLight);
    // 命名空间大框
    s.addShape("rect", { x: 0.6, y: 1.25, w: 8.8, h: 3.6, fill: { color: "FFFFFF" }, line: { color: C.secondary, width: 1 } });
    s.addText("命名空间 Namespace（逻辑边界）", {
      x: 0.75, y: 1.32, w: 5.0, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.secondary, margin: 0
    });
    // 控制面节点
    s.addShape("rect", { x: 0.9, y: 1.7, w: 3.6, h: 1.0, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
    s.addText("控制面节点\napiserver / etcd / scheduler / controller", {
      x: 0.95, y: 1.8, w: 3.5, h: 0.85,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 工作节点
    s.addShape("rect", { x: 0.9, y: 2.85, w: 3.6, h: 1.0, fill: { color: "E8F8E8" }, line: { color: "5BA85B", width: 1 } });
    s.addText("工作节点 × N\nkubelet / kube-proxy / containerd", {
      x: 0.95, y: 2.95, w: 3.5, h: 0.85,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // Pod
    s.addShape("rect", { x: 5.0, y: 1.7, w: 2.0, h: 0.8, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
    s.addText("Pod\n最小调度单元", {
      x: 5.05, y: 1.8, w: 1.9, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", margin: 0
    });
    // Service
    s.addShape("rect", { x: 7.4, y: 1.7, w: 1.9, h: 0.8, fill: { color: "FFF3E0" }, line: { color: "E08A3C", width: 1 } });
    s.addText("Service\n稳定入口", {
      x: 7.45, y: 1.8, w: 1.8, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", margin: 0
    });
    // 标签选择器
    s.addShape("rect", { x: 5.0, y: 3.6, w: 4.3, h: 0.8, fill: { color: "F5F5F5" }, line: { color: C.secondary, width: 1 } });
    s.addText("标签选择器 Label Selector（关联机制）", {
      x: 5.05, y: 3.68, w: 4.2, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, align: "center", margin: 0
    });
    s.addText("控制器/Service 通过标签选中 Pod", {
      x: 5.05, y: 3.98, w: 4.2, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0
    });
    // 箭头（用 addText 简化箭头标注）
    s.addText("→ 运行在", { x: 4.55, y: 1.9, w: 0.5, h: 0.4, fontSize: 10, fontFace: "Microsoft YaHei", color: C.secondary, margin: 0 });
    s.addText("→ 提供入口", { x: 7.05, y: 1.9, w: 0.5, h: 0.4, fontSize: 10, fontFace: "Microsoft YaHei", color: C.secondary, margin: 0 });
    s.addText("↑ 选中", { x: 6.0, y: 3.3, w: 0.5, h: 0.3, fontSize: 10, fontFace: "Microsoft YaHei", color: C.accent, margin: 0 });
    s.addText("三个关系一图看清：命名空间包含一切（包含）、Pod 运行在工作节点（运行）、标签选择器关联 Pod 与 Service/控制器（关联）", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.primary, bold: true,
      align: "center", margin: 0
    });
  }
};
