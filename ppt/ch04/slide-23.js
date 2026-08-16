// slide-23.js — 4.5.4 Downward API
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 23, title: "Downward API" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Downward API：Pod 怎么“认识自己”");
    card(s, 0.6, 1.3, 5.2, 3.6, C.primary);
    s.addText("解决什么问题", {
      x: 0.86, y: 1.42, w: 4.7, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("容器内部怎么知道自己的 Pod 名、命名空间、IP、所在节点？——Downward API 把 Pod 自身的元数据注入容器（环境变量或文件两种方式）", {
      x: 0.86, y: 1.85, w: 4.7, h: 0.9,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
    });
    s.addText("两种注入方式", {
      x: 0.86, y: 2.85, w: 4.7, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("环境变量：Pod 名、命名空间、节点名、Pod IP（label / annotation 不能进 env）\n文件方式（volume）：label / annotation 等全部字段，挂载成文件、支持热更新", {
      x: 0.86, y: 3.25, w: 4.7, h: 1.2,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.3, valign: "top", margin: 0
    });
    const code = [
      "env:",
      "- name: MY_POD_NAME",
      "  valueFrom:",
      "    fieldRef:",
      "      fieldPath: metadata.name",
    ].join("\n");
    codeBlock(s, 6.0, 1.5, 3.4, 1.7, code, 10.5);
    s.addText("注入的是“自身信息”，不是外部配置——外部配置用 ConfigMap（第 8 章）", {
      x: 6.0, y: 3.35, w: 3.4, h: 0.7,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, valign: "top", margin: 0
    });
    s.addText("典型用途：应用上报日志时带“我是哪个 Pod”、监控系统标记来源、按 Pod 标签决定行为", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
