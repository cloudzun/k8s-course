// slide-19.js — 1.4.1 云原生的定义
const { C, sectionTitle, bigCallout, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 19, title: "云原生的定义" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "云原生的定义（CNCF）", C.bgLight);
    bigCallout(s, "在现代动态环境（公有云 / 私有云 / 混合云）中构建和运行可扩展应用的技术", 1.25, 1.0);
    const items = [
      { t: "容器化", d: "应用打包为容器\n可移植、隔离" },
      { t: "微服务", d: "单体拆分为\n可独立部署的服务" },
      { t: "动态编排", d: "K8s 自动调度\n扩缩、自愈" },
      { t: "DevOps", d: "开发运维一体化\nCI/CD 自动化" },
      { t: "声明式", d: "描述期望状态\n系统自行达到" },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + i * 1.82;
      card(s, x, 2.55, 1.7, 1.75, C.primary);
      s.addText(it.t, {
        x: x + 0.12, y: 2.65, w: 1.46, h: 0.4,
        fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary,
        align: "center", margin: 0
      });
      s.addText(it.d, {
        x: x + 0.12, y: 3.1, w: 1.46, h: 1.1,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
        align: "center", lineSpacingMultiple: 1.3, margin: 0, valign: "top"
      });
    });
    calloutBar(s, "声明式：描述“期望状态”，系统自行达到——这是第 2 章的核心概念，也是 Kubernetes 设计的灵魂。", 4.75);
  }
};
