// slide-20.js — 6.5.1 维护三步曲 cordon / drain / uncordon
const { C, sectionTitle, codeBlock, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 20, title: "维护三步曲 cordon / drain / uncordon" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "维护三步曲：cordon / drain / uncordon", C.bgLight);
    // 命令
    codeBlock(s, 0.6, 1.15, 8.8, 1.15,
      "kubectl cordon node2                       # ① 隔离：标记不可调度（已有 Pod 不受影响）\n" +
      "kubectl drain node2 --ignore-daemonsets    # ② 排空：驱逐所有业务 Pod（到其他节点）\n" +
      "[ 节点维护 ... ]\n" +
      "kubectl uncordon node2                     # ③ 恢复：重新可调度", 10.5);
    // 三步卡片
    card(s, 0.6, 2.5, 2.75, 2.0, C.primary);
    s.addText("① cordon 隔离（挡新）", {
      x: 0.8, y: 2.62, w: 2.4, h: 0.3, fontSize: 12, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    s.addText("只挡新 Pod——等于打上 node.kubernetes.io/unschedulable 标记；已有 Pod 不受影响", {
      x: 0.8, y: 2.98, w: 2.4, h: 1.4, fontSize: 10, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
    card(s, 3.65, 2.5, 2.75, 2.0, C.accentWarm);
    s.addText("② drain 排空（驱逐）", {
      x: 3.85, y: 2.62, w: 2.4, h: 0.3, fontSize: 12, fontFace: "Microsoft YaHei",
      bold: true, color: C.accentWarm, margin: 0
    });
    s.addText("驱逐 Pod 走优雅终止：摘流量 → preStop → SIGTERM；--ignore-daemonsets 跳过 DaemonSet（控制器会在节点恢复后自动重建，驱逐无意义）", {
      x: 3.85, y: 2.98, w: 2.4, h: 1.4, fontSize: 10, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
    card(s, 6.7, 2.5, 2.75, 2.0, C.accent);
    s.addText("③ uncordon 恢复", {
      x: 6.9, y: 2.62, w: 2.4, h: 0.3, fontSize: 12, fontFace: "Microsoft YaHei",
      bold: true, color: C.accent, margin: 0
    });
    s.addText("去掉隔离标记，节点重新可调度", {
      x: 6.9, y: 2.98, w: 2.4, h: 1.4, fontSize: 10, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
    // 安全性说明
    s.addText("为什么 drain 是安全的：驱逐逐个进行、每个都走优雅终止——业务无感迁移（配合 PDB，见 §6.5.2）", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.4, fontSize: 11.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.accent, margin: 0, lineSpacingMultiple: 1.1
    });
    s.addText("实操：实验 04 Lab 4——drain + uncordon 节点排空与恢复", {
      x: 0.6, y: 5.25, w: 8.8, h: 0.3, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textMid, margin: 0
    });
  }
};
