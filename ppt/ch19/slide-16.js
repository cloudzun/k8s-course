// slide-16.js — 思考题（自测）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 16, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题（自测）");
    const qs = [
      "考试开始后第一件事是什么？（提示：不是做题）",
      "无外网环境里，写 yaml 忘了字段结构怎么办？",
      "一道 RBAC 题要求“只读 default 命名空间的 Pod 和日志”，写出完整命令序列（含验证）。",
      "etcd 备份恢复的完整命令序列？（写到能背的程度）",
      "2 小时 17 题，一道题卡了 12 分钟，你怎么办？",
      "用自己的话列出 v1.36 与旧教程的 5 个语法差异。",
    ];
    qs.forEach((q, i) => {
      const y = 1.3 + i * 0.6;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.55,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("CKA 考点标注：本章即备考本身——§19.2 五大域考点浓缩是考前的最终速查清单。", {
      x: 0.7, y: 5.12, w: 8.6, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.accentWarm, bold: true, margin: 0
    });
  }
};
