// slide-04.js — 6.1.1/6.1.2 调度的本质与两阶段决策
const { C, sectionTitle, bigCallout, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 4, title: "调度的本质与两阶段决策" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "调度的本质与两阶段决策", C.bgLight);
    // 四步横向流程
    s.addShape("rect", { x: 0.6, y: 1.25, w: 1.65, h: 1.05, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
    s.addText("新 Pod 创建\n（未指定节点）\n状态 Pending", {
      x: 0.65, y: 1.32, w: 1.55, h: 0.9, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    s.addText("→", { x: 2.27, y: 1.52, w: 0.4, h: 0.4, fontSize: 18, bold: true, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    s.addShape("rect", { x: 2.7, y: 1.25, w: 2.15, h: 1.05, fill: { color: "FFF3E0" }, line: { color: "E08A3C", width: 1 } });
    s.addText("① 过滤 Filtering\n资源 / 亲和\n污点 / 端口", {
      x: 2.75, y: 1.32, w: 2.05, h: 0.9, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    s.addText("→", { x: 4.87, y: 1.52, w: 0.4, h: 0.4, fontSize: 18, bold: true, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    s.addShape("rect", { x: 5.3, y: 1.25, w: 2.15, h: 1.05, fill: { color: "FFF3E0" }, line: { color: "E08A3C", width: 1 } });
    s.addText("② 打分 Scoring\n资源均衡 / Pod 分散\n亲和偏好", {
      x: 5.35, y: 1.32, w: 2.05, h: 0.9, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    s.addText("→", { x: 7.47, y: 1.52, w: 0.4, h: 0.4, fontSize: 18, bold: true, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    s.addShape("rect", { x: 7.9, y: 1.25, w: 1.5, h: 1.05, fill: { color: "E8F8E8" }, line: { color: "5BA85B", width: 1 } });
    s.addText("绑定 nodeName\n（写入 Pod 对象）", {
      x: 7.95, y: 1.32, w: 1.4, h: 0.9, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    // 各步注释
    s.addText("node1 不足 ✗ 排除\nnode2 / node3 候选 ✓", { x: 2.7, y: 2.4, w: 2.15, h: 0.5, fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0 });
    s.addText("node2 90 分\n> node3 70 分", { x: 5.3, y: 2.4, w: 2.15, h: 0.5, fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0 });
    s.addText("kubelet Watch 到\n→ 拉起容器", { x: 7.9, y: 2.4, w: 1.5, h: 0.5, fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0 });
    // 结论条
    bigCallout(s, "过滤 = 一票否决（不合格直接排除）；打分 = 择优录取（剩余里选最优）——先保证可行性，再追求均衡性", 3.15, 0.85);
    // 核心认知
    card(s, 0.6, 4.2, 8.8, 1.15, C.primary);
    s.addText("核心认知：调度器不直接通知 kubelet“我调给你了”——它只修改 Pod 对象的 spec.nodeName 字段，kubelet 自己 Watch 到才动手（第 2 章“组件只与 apiserver 通信”的又一次体现）", {
      x: 0.9, y: 4.32, w: 8.2, h: 0.9, fontSize: 12.5, fontFace: "Microsoft YaHei",
      color: C.textDark, bold: true, valign: "middle", margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
