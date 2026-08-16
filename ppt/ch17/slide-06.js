// slide-06.js — 分隔页 17.2
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 6, title: "Helm：Kubernetes 的包管理器" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "17.2", "Helm：Kubernetes 的包管理器", [
      "核心模型：Chart（安装包）/ Release（运行实例）/ Repository（软件源）",
      "Chart 目录结构 + 模板化原理（values 注入 → 渲染出最终 YAML）",
      "常用命令与 revision 版本回滚机制（实验 09 Lab 6 / 实验 13）"
    ]);
  }
};
