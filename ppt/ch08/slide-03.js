// slide-03.js — 分隔页 8.1 为什么需要配置外部化
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "为什么需要配置外部化" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "8.1", "为什么需要“配置外部化”", [
      "三个痛点：镜像不可变被破坏、多环境无法复用、敏感信息暴露",
      "十二要素（12-Factor）核心：配置与代码分离——同一份镜像跑所有环境",
      "K8s 的答案：ConfigMap（非敏感）+ Secret（敏感），机制几乎一样",
      "承上启下：第 4 章 env/command 硬编码 → 本章把配置“抽”出来统一管理"
    ]);
  }
};
