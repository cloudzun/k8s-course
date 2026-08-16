// slide-25.js — 2.4.3 kube-scheduler
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 25, title: "kube-scheduler" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "kube-scheduler：调度器");
    s.addText("职责：决定新创建的 Pod 落在哪个节点上——不运行容器，只做“分配决策”", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    card(s, 0.6, 1.6, 4.3, 2.6, C.primary);
    s.addText("阶段一：过滤（Filtering）", {
      x: 0.86, y: 1.72, w: 3.9, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("排除不合适的节点：\n• 资源够吗（CPU/内存 ≥ requests）\n• 满足 nodeSelector / 亲和吗\n• 污点能容忍吗\n• 端口冲突？磁盘压力？\n→ 得到“候选节点集合”", {
      x: 0.86, y: 2.15, w: 3.9, h: 1.9,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    card(s, 5.1, 1.6, 4.3, 2.6, C.accent);
    s.addText("阶段二：打分（Scoring）", {
      x: 5.36, y: 1.72, w: 3.9, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("在候选中选最优：\n• 剩余资源越均衡分越高\n• 与同应用 Pod 分散开（反亲和）\n• 亲和偏好\n→ 得分最高者胜出", {
      x: 5.36, y: 2.15, w: 3.9, h: 1.9,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    s.addShape("rect", { x: 0.6, y: 4.4, w: 8.8, h: 0.55, fill: { color: C.bgCard } });
    s.addShape("rect", { x: 0.6, y: 4.4, w: 0.05, h: 0.55, fill: { color: C.accentWarm } });
    s.addText("排障关联：Pod 一直 Pending，十有八九是调度阶段失败——看 Events 的 FailedScheduling 原因（第 16 章）", {
      x: 0.85, y: 4.4, w: 8.3, h: 0.55,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
  }
};
