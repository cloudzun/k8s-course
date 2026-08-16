// slide-09.js — 2.2.2 Pod：最小调度单元
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 9, title: "Pod：最小调度单元" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Pod：最小调度单元");
    s.addText("Pod 是 Kubernetes 调度的最小单位——不是容器。一个 Pod 包含一个或多个容器，共享：", {
      x: 0.6, y: 1.15, w: 8.8, h: 0.4,
      fontSize: 13.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const items = [
      { t: "网络命名空间", d: "共享一个 IP 和端口空间\n容器间用 localhost 通信" },
      { t: "UTS 命名空间", d: "共享主机名" },
      { t: "共享存储卷", d: "Pod 级卷可被内部所有容器挂载" },
      { t: "同一生命周期", d: "一起创建、一起销毁\nPod 是“逻辑主机”" },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + (i % 2) * 4.55;
      const y = 1.7 + Math.floor(i / 2) * 1.35;
      card(s, x, y, 4.3, 1.2, C.primary);
      numBadge(s, x + 0.12, y + 0.1, i + 1);
      s.addText(it.t, {
        x: x + 0.7, y: y + 0.1, w: 3.5, h: 0.4,
        fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(it.d, {
        x: x + 0.7, y: y + 0.5, w: 3.5, h: 0.6,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.25, margin: 0, valign: "top"
      });
    });
    s.addShape("rect", { x: 0.6, y: 4.5, w: 8.8, h: 0.9, fill: { color: C.bgCard } });
    s.addText("生命周期：Pending（已创建未调度）→ Running（运行中）→ Succeeded/Failed → 删除（Terminating）", {
      x: 0.85, y: 4.55, w: 8.3, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("Pod IP 是临时的（重建即变）——这是 Service 存在的原因；“调度、扩缩、自愈”都发生在 Pod 级别", {
      x: 0.85, y: 4.95, w: 8.3, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.primary, bold: true, margin: 0
    });
  }
};
