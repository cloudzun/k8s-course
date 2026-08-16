// slide-07.js — 17.2.1 核心模型（Chart / Release / Repository）
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 7, title: "Helm 核心模型" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "核心模型（三个概念）");
    // 三个概念框
    card(s, 0.6, 1.35, 2.6, 1.5, C.primary);
    s.addText("Chart\n（安装包）", {
      x: 0.85, y: 1.5, w: 2.15, h: 0.75,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("打包单元：资源模板 + 默认值\n类比 .deb / .rpm", {
      x: 0.85, y: 2.25, w: 2.15, h: 0.55,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("helm install", { x: 3.22, y: 1.72, w: 0.66, h: 0.35, fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.accent, align: "center", margin: 0 });
    card(s, 3.9, 1.35, 2.4, 1.5, C.accent);
    s.addText("Release\n（运行实例）", {
      x: 4.15, y: 1.5, w: 1.95, h: 0.75,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("一次安装的实例\n有名字、版本号、可回滚", {
      x: 4.15, y: 2.25, w: 1.95, h: 0.55,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("依赖 / 获取", { x: 6.32, y: 1.72, w: 0.66, h: 0.35, fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0 });
    card(s, 7.0, 1.35, 2.4, 1.5, C.accentWarm);
    s.addText("Repository\n（软件源）", {
      x: 7.25, y: 1.5, w: 1.95, h: 0.75,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.gold, margin: 0
    });
    s.addText("Chart 的存放与分发中心\nhelm repo add 添加", {
      x: 7.25, y: 2.25, w: 1.95, h: 0.55,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 关系说明卡
    card(s, 0.6, 3.25, 8.8, 1.65, C.primary);
    const rels = [
      "· helm install → Chart 变成 Release：同一 Chart 可多次安装成多个 Release（如 dev/web、prod/web）",
      "· Repository 是 Chart 的“软件源”：helm repo add 添加、发布/获取 Chart",
      "· Release 有版本号（revision）可回滚——这是“包管理器”价值的基础",
    ];
    rels.forEach((r, i) => {
      s.addText(r, {
        x: 0.9, y: 3.45 + i * 0.45, w: 8.2, h: 0.4,
        fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("（实验 13 Lab 1：Chart 结构解剖 / 打包发布）", {
      x: 0.9, y: 4.85, w: 8.2, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
