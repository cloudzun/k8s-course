// slide-09.js — 4.2.3/4.2.4 环境变量与标签注解
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 9, title: "环境变量与标签注解" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "环境变量与标签注解（Pod 层面）");
    // 左卡：环境变量
    card(s, 0.6, 1.3, 4.5, 3.75, C.primary);
    s.addText("环境变量：传配置最直接的方式", {
      x: 0.86, y: 1.42, w: 4.0, h: 0.4,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("静态值：env: [{ name: MODE, value: prod }]——写死在 Pod 定义里", {
      x: 0.86, y: 1.95, w: 4.0, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("动态来源：从 ConfigMap / Secret 引用（第 8 章）；从 Downward API 注入自身元数据（§4.5.4）", {
      x: 0.86, y: 2.7, w: 4.0, h: 0.9,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
    });
    s.addText("局限：不适合传“文件型配置”（如整个配置文件）——文件型用 ConfigMap 卷挂载（第 8 章）", {
      x: 0.86, y: 3.75, w: 4.0, h: 0.9,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, valign: "top", margin: 0
    });
    // 右卡：标签与注解
    card(s, 5.3, 1.3, 4.1, 3.75, C.accent);
    s.addText("标签与注解的区别（Pod 层面补充）", {
      x: 5.56, y: 1.42, w: 3.6, h: 0.4,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("标签 = “被管理的凭据”：Deployment / Service 靠它选中 Pod——标签与选择器必须精确匹配，错了 Pod 就“没人管”（删了不重建、流量不进）", {
      x: 5.56, y: 1.95, w: 3.6, h: 1.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
    });
    s.addText("注解 = 声明“意图”：如 kubernetes.io/change-cause（记录更新原因）、监控告警配置——控制器 / 工具读取，但不参与选择", {
      x: 5.56, y: 3.45, w: 3.6, h: 1.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
    });
    s.addText("（实验 02 Lab 5 / Lab 7：环境变量、标签与注解）", {
      x: 0.6, y: 5.3, w: 8.8, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
