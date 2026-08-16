// slide-14.js — 14.4.2 恢复演练 / 14.4.3 验证闭环
const { C, sectionTitle, card, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 14, title: "恢复演练与验证闭环" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "恢复演练：“恢复会丢什么”");
    // 左卡：恢复的本质
    card(s, 0.6, 1.25, 4.9, 3.3, C.primary);
    s.addText("恢复 = 集群回滚到快照时刻", {
      x: 0.8, y: 1.38, w: 4.5, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("▸ 之后的所有变更（新建的 Pod、修改的配置）都会丢失\n▸ 恢复前先想清楚：快照时刻到现在丢了什么？丢得起吗？——往往“丢几分钟数据”优于“集群瘫痪”\n▸ 定期演练：备份能不能用，只有恢复过才知道——CKA 的 etcd restore 题考的就是流程熟练度", {
      x: 0.85, y: 1.9, w: 4.45, h: 2.5,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    // 右上：恢复五步
    const code1 = [
      "① 停 apiserver",
      "② snapshot restore 到新目录",
      "③ 替换数据目录",
      "④ 恢复 manifest",
      "⑤ 验证",
    ].join("\n");
    codeBlock(s, 5.7, 1.25, 3.7, 1.75, code1, 11.5);
    s.addText("恢复流程五步（实验 12 · Lab 1）", {
      x: 5.7, y: 3.05, w: 3.7, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textMid, margin: 0
    });
    // 右下：验证闭环
    s.addText("验证闭环", {
      x: 5.7, y: 3.4, w: 3.7, h: 0.3,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const code2 = [
      "备份(snapshot save) → 验证(snapshot status)",
      "→ 演练(restore 到临时环境) → 定期循环",
      "“备份 + 验证 + 演练”三件套缺一不可",
    ].join("\n");
    codeBlock(s, 5.7, 3.75, 3.7, 1.0, code2, 10);
    calloutBar(s, "运维铁律：没有验证过的备份 = 没有备份。", 4.95);
  }
};
