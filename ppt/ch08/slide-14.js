// slide-14.js — 分隔页 8.4-8.6 Downward API 与生产实践
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 14, title: "Downward API 与生产实践" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "8.4-8.6", "Downward API 与生产实践", [
      "8.4 Downward API：注入“自己是谁”——Pod 自身元数据，与外部配置界限分明",
      "8.5 最佳实践：配置全进对象、按敏感性分流、Secret 最小权限、多环境复用",
      "8.6 实验 06“ConfigMap 和 Secret”：5 个 Lab + 2 个补充实操"
    ]);
  }
};
