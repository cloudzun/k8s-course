// slide-09.js — 8.2.6 / 8.2.7 subPath 陷阱与 immutable / Reloader
const { C, sectionTitle, card, codeBlock, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 9, title: "subPath 陷阱与生产性能方案" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "subPath 陷阱与生产性能方案");
    // 左：subPath 陷阱
    card(s, 0.6, 1.15, 4.55, 2.8, C.accentWarm);
    s.addText("subPath 挂载陷阱（经典坑，必读）", {
      x: 0.85, y: 1.25, w: 4.1, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0
    });
    s.addText("只挂 ConfigMap 里的单个文件：", {
      x: 0.85, y: 1.62, w: 4.1, h: 0.28,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.85, 1.95, 4.1, 1.0, [
      "volumeMounts:",
      "- name: config",
      "  mountPath: /etc/nginx/nginx.conf",
      "  subPath: nginx.conf",
    ].join("\n"), 10);
    s.addText("subPath 是“直接复制文件”（不做软链接）——ConfigMap 更新后文件不会跟着变，彻底丧失热更新，只能重启 Pod", {
      x: 0.85, y: 3.05, w: 4.1, h: 0.65,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("决策：适合“只挂单文件 + 配置基本不变”；要热更新别用 subPath（挂整个目录）", {
      x: 0.85, y: 3.7, w: 4.1, h: 0.35,
      fontSize: 10.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    // 右上：immutable
    card(s, 5.35, 1.15, 4.05, 1.35, C.primary);
    s.addText("immutable：不可变（省轮询）", {
      x: 5.6, y: 1.25, w: 3.65, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("immutable: true 后禁止修改（只能删了重建）；kubelet 不再轮询检查变化 → 大规模集群控制面压力大幅下降；适合公共证书、系统级配置等“基本不变”的配置", {
      x: 5.6, y: 1.62, w: 3.65, h: 0.85,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 右下：Reloader
    card(s, 5.35, 2.65, 4.05, 1.3, C.accent);
    s.addText("Reloader：热更新自动化（第三方）", {
      x: 5.6, y: 2.75, w: 3.65, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("自动监听 ConfigMap / Secret 变化 → 滚动重启关联 Deployment，解决 env / subPath 不能热更新的自动化问题", {
      x: 5.6, y: 3.12, w: 3.65, h: 0.6,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("注解标记：reloader.stakater.com/auto: \"true\"", {
      x: 5.6, y: 3.72, w: 3.65, h: 0.25,
      fontSize: 10.5, fontFace: "Consolas", color: C.primary, margin: 0
    });
    warnBar(s, "生产组合：配置文件卷挂载（热更新）+ 少量参数 immutable（省轮询）+ 需要重启生效的场景用 Reloader 自动滚动。", 4.25);
  }
};
