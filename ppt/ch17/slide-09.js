// slide-09.js — 17.2.3 模板化原理
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 9, title: "模板化原理" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "模板化原理（values 注入 + 渲染）");
    const code = [
      "templates/deployment.yaml（片段）",
      "  replicas: {{ .Values.replicaCount }}",
      "  image: {{ .Values.image.repository }}:{{ .Values.image.tag }}",
      "",
      "values.yaml",
      "  replicaCount: 3",
      "  image:",
      "    repository: nginx",
      "    tag: \"1.27\"",
      "",
      "渲染结果",
      "  replicas: 3",
      "  image: nginx:1.27",
    ];
    codeBlock(s, 0.6, 1.3, 5.8, 3.6, code.join("\n"), 11.5);
    const notes = [
      { t: "模板语言", d: "Go template：{{ .Values.xxx }} 取值、条件、循环" },
      { t: "values 优先级", d: "--set 命令行 > 指定 values 文件 > values.yaml 默认值" },
      { t: "渲染检查", d: "helm template myapp ./myapp——先看渲染结果再装（排障利器）" },
    ];
    notes.forEach((n, i) => {
      const y = 1.3 + i * 1.18;
      card(s, 6.65, y, 2.75, 1.05, C.accent);
      s.addText(n.t, {
        x: 6.9, y: y + 0.1, w: 2.3, h: 0.32,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(n.d, {
        x: 6.9, y: y + 0.44, w: 2.3, h: 0.55,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("（实验 13：values 多环境——同一 Chart 在不同环境渲染出不同 YAML）", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
