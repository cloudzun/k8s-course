// slide-03.js — 分隔页 18.1 从需求到架构
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "从需求到架构" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "18.1", "从需求到架构", [
      "需求拆解：一个博客站 → 四个子问题（数据 / 密码 / 前端 / 访问）",
      "架构核心原则：数据与应用分离",
      "前端无状态多副本 · 数据库有状态独立存储"
    ]);
  }
};
