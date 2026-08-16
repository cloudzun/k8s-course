// slide-19.js — 为什么生产用声明式
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 19, title: "为什么生产用声明式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "为什么生产用声明式（apply）", C.bgLight);
    const items = [
      { t: "意图即代码", d: "yaml 文件就是“配置即代码”——进 Git 版本管理、可 review、可回滚" },
      { t: "幂等", d: "同一份 yaml 反复 apply 结果一致——这是 CI/CD 的基础" },
      { t: "可自愈", d: "系统记住这份期望状态，任何偏离都被自动修复" },
      { t: "协作标准", d: "create 只能建一次、apply 可反复执行——生产标准是 apply" },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + (i % 2) * 4.55;
      const y = 1.5 + Math.floor(i / 2) * 1.7;
      card(s, x, y, 4.3, 1.5, C.primary);
      numBadge(s, x + 0.15, y + 0.15, i + 1);
      s.addText(it.t, {
        x: x + 0.75, y: y + 0.12, w: 3.4, h: 0.45,
        fontSize: 16, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(it.d, {
        x: x + 0.2, y: y + 0.65, w: 3.9, h: 0.75,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.3, margin: 0, valign: "top"
      });
    });
    s.addText("一句话：命令式是“手把手教系统做”，声明式是“给系统一张目标图，让它自己达成并守住”", {
      x: 0.6, y: 5.0, w: 8.8, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.accent,
      align: "center", margin: 0
    });
  }
};
