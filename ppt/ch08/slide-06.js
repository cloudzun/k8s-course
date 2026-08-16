// slide-06.js — 8.2.1 ConfigMap 的本质与创建
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 6, title: "ConfigMap 的本质与创建" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "ConfigMap 的本质与创建");
    codeBlock(s, 0.6, 1.15, 5.3, 2.5, [
      "apiVersion: v1",
      "kind: ConfigMap",
      "metadata:",
      "  name: app-config",
      "data:",
      "  LOG_LEVEL: info        # 键值对（短配置）",
      "  APP_PORT: \"8080\"",
      "  app.conf: |            # 键=文件名（长配置）",
      "    server.port=8080",
      "    server.timeout=30",
    ].join("\n"), 11);
    card(s, 6.1, 1.15, 3.3, 2.5, C.primary);
    s.addText("本质：键值对仓库", {
      x: 6.35, y: 1.25, w: 2.9, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const pts = [
      "data 区 = 键值对集合",
      "短配置：键 = 开关 / 参数，值 = 字符串",
      "长配置：键 = 文件名，值 = 整个文件内容",
      "一个 CM 可同时装两类配置",
      "非敏感：连接串、开关、日志级别",
    ];
    pts.forEach((p, i) => {
      s.addText("▸ " + p, {
        x: 6.35, y: 1.7 + i * 0.38, w: 2.85, h: 0.34,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    card(s, 0.6, 3.9, 8.8, 1.5, C.accent);
    s.addText("创建方式（实验 06 Lab 1 / Lab 2）", {
      x: 0.85, y: 4.0, w: 8.3, h: 0.32,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const cmds = [
      "kubectl create configmap app-config --from-literal=LOG_LEVEL=info",
      "kubectl create configmap app-config --from-file=app.conf",
      "kubectl create configmap app-config --from-file=conf.d/    # 目录：每文件一个键",
      "kubectl apply -f configmap.yaml                            # 声明式（生产推荐）",
    ];
    cmds.forEach((c, i) => {
      s.addText(c, {
        x: 0.85, y: 4.38 + i * 0.26, w: 8.4, h: 0.24,
        fontSize: 10.5, fontFace: "Consolas", color: C.textDark, margin: 0
      });
    });
  }
};
