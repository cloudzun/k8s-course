// slide-07.js — 8.2.2 / 8.2.3 两种消费方式：卷挂载 vs env 注入
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 7, title: "两种消费方式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "两种消费方式：卷挂载 vs env 注入", C.bgLight);
    // 左：卷挂载
    card(s, 0.6, 1.1, 4.3, 3.55, C.primary);
    s.addText("① 卷挂载：键变文件", {
      x: 0.85, y: 1.2, w: 3.9, h: 0.35,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 0.85, 1.65, 3.85, 2.3, [
      "spec:",
      "  containers:",
      "  - name: app",
      "    volumeMounts:",
      "    - name: config",
      "      mountPath: /etc/app",
      "  volumes:",
      "  - name: config",
      "    configMap:",
      "      name: app-config",
    ].join("\n"), 10);
    s.addText("挂载后每个键变成一个文件：/etc/app/ 下有 LOG_LEVEL、APP_PORT、app.conf——适合“读配置文件”的应用", {
      x: 0.85, y: 4.05, w: 3.9, h: 0.5,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 右：env 注入
    card(s, 5.1, 1.1, 4.3, 3.55, C.accent);
    s.addText("② env 注入：键变变量", {
      x: 5.35, y: 1.2, w: 3.9, h: 0.35,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 5.35, 1.65, 3.85, 2.3, [
      "spec:",
      "  containers:",
      "  - name: app",
      "    env:",
      "    - name: LOG_LEVEL",
      "      valueFrom:",
      "        configMapKeyRef:",
      "          name: app-config",
      "          key: LOG_LEVEL",
    ].join("\n"), 10);
    s.addText("只把指定的键注入为环境变量——适合“读环境变量”的应用（12-Factor 风格）", {
      x: 5.35, y: 4.05, w: 3.9, h: 0.5,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("共同点：数据都来自同一个 ConfigMap；区别只在“形态”——文件还是环境变量", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    s.addText("读图要点：判断依据是“形态 + 读取方式”——配置文件 → 卷挂载；少量键值且应用读 env → env 注入", {
      x: 0.6, y: 5.22, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
  }
};
