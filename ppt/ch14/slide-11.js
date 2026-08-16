// slide-11.js — 14.3.4/14.3.5 失败回滚与版本兼容窗口
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 11, title: "失败回滚与版本兼容窗口" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "失败回滚与版本兼容窗口", C.bgLight);
    // 左卡：失败与回滚预案
    card(s, 0.6, 1.25, 4.4, 3.0, C.primary);
    s.addText("失败与回滚预案", {
      x: 0.8, y: 1.38, w: 4.0, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("▸ 升级失败先看 kubeadm upgrade plan 的兼容性提示（多数失败是版本/依赖问题）\n▸ 回滚手段：etcd 快照恢复到升级前（§14.4）——这就是“升级前备份”的意义\n▸ 部分失败（某 worker 没起来）：单独修复该节点，不要回滚整个集群", {
      x: 0.85, y: 1.9, w: 3.95, h: 2.25,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    // 右卡：版本兼容窗口
    card(s, 5.2, 1.25, 4.2, 3.0, C.accent);
    s.addText("版本兼容窗口（不能跳版本）", {
      x: 5.4, y: 1.38, w: 3.8, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const code = [
      "kubeadm 不支持跨次要版本升级：",
      "1.36 → 1.37 → 1.38（每次只升一个次版本）",
    ].join("\n");
    codeBlock(s, 5.4, 1.85, 3.8, 0.95, code, 11);
    s.addText("原因：控制面与节点的版本差有上限（±1 次版本），跳版本会导致不兼容。升级要一步一步来——多次小版本升级 vs 一次大跳。", {
      x: 5.4, y: 2.95, w: 3.8, h: 1.2,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    s.addText("CKA 考点（域 1/5）：必考流程——升级顺序、节点维护流程、etcd 备份恢复五步；排障关联（域 5）——升级失败先看 upgrade plan 的提示。", {
      x: 0.6, y: 4.5, w: 8.8, h: 0.7,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
  }
};
