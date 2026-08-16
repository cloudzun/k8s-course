// slide-18.js — 10.5.2 选型决策树 + 10.5.3 CSI
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 18, title: "选型决策树与 CSI" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "选型决策树 · CSI 标准接口");
    // 决策树阶梯（问题框 + 分支结果框）
    const qs = [
      { q: "应用需要持久存储？", a1: "否 → emptyDir / 不挂", a1f: "F5F5F5", a1l: "666666", a2: "是 ↓", cont: true },
      { q: "多副本要共享？", a1: "是 → NFS / 对象存储（RWX）", a1f: "E8F8E8", a1l: "5BA85B", a2: "否 ↓", cont: true },
      { q: "生产环境？", a1: "否 → hostPath / local-path", a1f: "E8F4FD", a1l: "4A90D9", a2: "是 ↓", cont: true },
      { q: "核心数据库？", a1: "是 → 分布式存储 / 云盘 + 备份", a1f: "FFF3E0", a1l: "E08A3C", a2: "否 → 云盘 CSI（RWO）", cont: false },
    ];
    qs.forEach((r, i) => {
      const y = 1.15 + i * 0.7;
      s.addShape("rect", { x: 0.6, y, w: 3.9, h: 0.5, fill: { color: "E8F0FE" }, line: { color: C.primary, width: 1 } });
      s.addText(r.q, {
        x: 0.65, y, w: 3.8, h: 0.5,
        fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark,
        align: "center", valign: "middle", margin: 0
      });
      s.addShape("rect", { x: 4.8, y, w: 2.4, h: 0.5, fill: { color: r.a1f }, line: { color: r.a1l, width: 1 } });
      s.addText(r.a1, {
        x: 4.85, y, w: 2.3, h: 0.5,
        fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textDark,
        align: "center", valign: "middle", margin: 0
      });
      if (r.cont) {
        s.addShape("rect", { x: 7.45, y, w: 1.9, h: 0.5, fill: { color: "FFFFFF" }, line: { color: C.secondary, width: 1 } });
        s.addText(r.a2, {
          x: 7.5, y, w: 1.8, h: 0.5,
          fontSize: 10, fontFace: "Microsoft YaHei", bold: true, color: C.secondary,
          align: "center", valign: "middle", margin: 0
        });
      } else {
        s.addShape("rect", { x: 7.45, y, w: 1.9, h: 0.5, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
        s.addText(r.a2, {
          x: 7.5, y, w: 1.8, h: 0.5,
          fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textDark,
          align: "center", valign: "middle", margin: 0
        });
      }
    });
    card(s, 0.6, 3.95, 8.8, 0.55, C.accent);
    s.addText("读图要点：判断顺序——持久与否 → 是否共享 → 是否生产 → 是否核心；“共享”与“生产”是两条最关键的岔路", {
      x: 0.9, y: 4.0, w: 8.2, h: 0.45,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark,
      valign: "middle", margin: 0
    });
    card(s, 0.6, 4.65, 8.8, 0.85, C.primary);
    s.addText("CSI（Container Storage Interface）：K8s 与存储厂商的标准接口（类似第 3 章 CRI）——任何存储实现 CSI 就能被 K8s 动态供应，“装一个 CSI 驱动”就是接入某类存储", {
      x: 0.9, y: 4.72, w: 8.2, h: 0.4,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.15, margin: 0
    });
    s.addText("实例：Rook-Ceph——Ceph（分布式存储，多副本/自愈）经 Rook（Operator）部署进集群，以 CSI 驱动提供动态供应（StorageClass）", {
      x: 0.9, y: 5.1, w: 8.2, h: 0.32,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
