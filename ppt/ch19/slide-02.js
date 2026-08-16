// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "说出 CKA 的考试形式与规则：时长 / 题型 / 环境 / 评分",
      "按五大域列出考点浓缩清单：命令 / 机制 / 对应章节与实验",
      "掌握考试效率技巧：dry-run 生成 yaml、上下文切换、时间分配",
      "识别 v1.36 语法差异与高频易错点（陷阱清单）",
      "制定自己的备考路线图并执行模拟演练（实验 11 自测）",
    ];
    goals.forEach((g, i) => {
      const y = 1.35 + i * 0.72;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.6,
        fontSize: 14, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("CKA 是实操考试——会做比会背重要；本章所有技巧都建立在前面章节的动手基础上。", {
      x: 0.7, y: 5.1, w: 8.6, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.accent, bold: true, margin: 0
    });
  }
};
