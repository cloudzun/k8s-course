// slide-15.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 15, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "考试形式：2 小时在线实操、多集群、无外网——kubectl explain 是唯一字典",
      "考点浓缩：域 5（30%）+ 域 1（25%）是重心；etcd 备份恢复是必考实操",
      "三大技巧：dry-run 生成 yaml、每题先切 context、先易后难 + 留复查时间",
      "陷阱清单：v1.36 语法（-- 分隔 / create token / 弃用参数）、selector 匹配、apiGroups、命名空间",
      "备考路线图：体系建立 → 按域强化 → 模拟冲刺——实验手册就是题库",
    ];
    items.forEach((g, i) => {
      const y = 1.3 + i * 0.68;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.6,
        fontSize: 13, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("最后的话：给你一个真实集群，你能把它搭起来、把应用跑上去、把问题查出来——CKA 只是这个能力的证明。", {
      x: 0.7, y: 4.95, w: 8.6, h: 0.5,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.accent, bold: true, margin: 0
    });
  }
};
