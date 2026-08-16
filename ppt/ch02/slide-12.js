// slide-12.js — 2.2.5 命名空间
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 12, title: "命名空间" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "命名空间（Namespace）", C.bgLight);
    const items = [
      { t: "资源隔离", d: "资源名在命名空间内唯一\n同名不同 ns 互不冲突" },
      { t: "权限隔离", d: "RBAC 按命名空间授权\n（第 11 章）" },
      { t: "配额隔离", d: "每个命名空间可设资源配额\n（第 7 章 ResourceQuota）" },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + i * 3.1;
      card(s, x, 1.3, 2.85, 1.7, C.primary);
      s.addText(it.t, {
        x: x + 0.15, y: 1.42, w: 2.55, h: 0.4,
        fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(it.d, {
        x: x + 0.15, y: 1.85, w: 2.55, h: 1.0,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.3, margin: 0, valign: "top"
      });
    });
    s.addShape("rect", { x: 0.6, y: 3.2, w: 8.8, h: 1.5, fill: { color: C.bgCard } });
    s.addText("内置命名空间", {
      x: 0.85, y: 3.3, w: 3.0, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const ns = [
      "default —— 默认；没指定时资源都放这里",
      "kube-system —— 系统组件（apiserver/etcd/coredns 等）",
      "kube-public —— 公开信息（集群内所有用户可读）",
    ];
    ns.forEach((n, i) => {
      s.addText(n, {
        x: 0.85, y: 3.7 + i * 0.32, w: 8.3, h: 0.3,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addShape("rect", { x: 0.6, y: 4.9, w: 8.8, h: 0.45, fill: { color: C.bgBlue } });
    s.addText("注意：命名空间隔离“名字”与“权限”，不隔离网络——跨 ns 的 Pod 默认互通（隔离用 NetworkPolicy，第 9 章）", {
      x: 0.85, y: 4.9, w: 8.3, h: 0.45,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.primary, bold: true, valign: "middle", margin: 0
    });
  }
};
