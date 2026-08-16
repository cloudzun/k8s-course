// slide-37.js — 2.7.2/2.7.3 metadata + spec/status
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 37, title: "metadata 与 spec/status" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "对象的身份与期望");
    card(s, 0.6, 1.3, 4.3, 3.3, C.primary);
    s.addText("metadata：对象的“身份”", {
      x: 0.86, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("name —— 命名空间内唯一（DNS 规范）\nnamespace —— 所属命名空间\nlabels —— 可被选择器选中\nannotations —— 非结构化元数据\nuid —— 系统分配、不可变\nresourceVersion —— 乐观锁版本号", {
      x: 0.86, y: 1.9, w: 3.9, h: 2.5,
      fontSize: 12, fontFace: "Consolas", color: C.textDark,
      lineSpacingMultiple: 1.4, margin: 0, valign: "top"
    });
    card(s, 5.1, 1.3, 4.3, 3.3, C.accent);
    s.addText("spec vs status", {
      x: 5.36, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("spec —— 用户编写：描述期望状态（要什么）\nstatus —— 系统维护：描述当前状态（实际怎样），用户不写它\n\n控制器对比两者来调和（§2.3）", {
      x: 5.36, y: 1.9, w: 3.9, h: 1.6,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.4, margin: 0, valign: "top"
    });
    s.addShape("rect", { x: 5.1, y: 3.6, w: 4.3, h: 0.9, fill: { color: C.bgAccent } });
    s.addText("记忆：spec 是“心愿单”，status 是“体检报告”", {
      x: 5.36, y: 3.72, w: 3.9, h: 0.4,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("kubectl get pod nginx -o yaml → 上半部分 spec（你写的期望）、下半部分 status（系统填的实际）", {
      x: 5.36, y: 4.1, w: 3.9, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    s.addText("“一切皆对象”——理解对象结构就是理解 Kubernetes 的“语法”", {
      x: 0.6, y: 4.9, w: 8.8, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary,
      align: "center", margin: 0
    });
  }
};
