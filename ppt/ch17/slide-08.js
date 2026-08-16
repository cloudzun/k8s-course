// slide-08.js — 17.2.2 Chart 目录结构
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 8, title: "Chart 目录结构" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Chart 目录结构（解剖一个应用包）", C.bgLight);
    const tree = [
      "myapp/",
      "├── Chart.yaml          # 元数据",
      "│                        # name/version/appVersion/依赖",
      "├── values.yaml         # 默认配置值",
      "│                        # （镜像 tag/副本数/域名）",
      "├── values-prod.yaml    # （可选）环境覆盖值",
      "├── templates/          # 资源模板（Go template）",
      "│   ├── deployment.yaml",
      "│   ├── service.yaml",
      "│   ├── ingress.yaml",
      "│   └── _helpers.tpl    # 公共模板片段",
      "└── charts/             # （可选）子 Chart 依赖",
    ];
    codeBlock(s, 0.6, 1.35, 5.0, 3.6, tree.join("\n"), 11);
    const notes = [
      { t: "Chart.yaml — 元数据", d: "name / version / appVersion / 依赖声明" },
      { t: "values.yaml — 默认值", d: "镜像 tag、副本数、域名……“变化”都在这" },
      { t: "templates/ — 模板", d: "资源模板，Go template 语法，values 注入" },
      { t: "charts/ — 子 Chart", d: "可选依赖；_helpers.tpl 为公共片段" },
    ];
    notes.forEach((n, i) => {
      const y = 1.35 + i * 0.88;
      card(s, 5.85, y, 3.55, 0.78, C.primary);
      s.addText(n.t, {
        x: 6.1, y: y + 0.08, w: 3.1, h: 0.32,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(n.d, {
        x: 6.1, y: y + 0.4, w: 3.1, h: 0.32,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    card(s, 0.6, 5.0, 8.8, 0.5, C.accent);
    s.addText("核心认知：模板里写结构、values 里写变化——安装时用 values 渲染出最终 YAML", {
      x: 0.9, y: 5.08, w: 8.2, h: 0.34,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
  }
};
