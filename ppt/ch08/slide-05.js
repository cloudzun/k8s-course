// slide-05.js — 分隔页 8.2 ConfigMap
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 5, title: "ConfigMap：非敏感配置" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "8.2", "ConfigMap：非敏感配置", [
      "本质：一个“键值对仓库”（data 区）——键可以是短值，也可以是整个文件",
      "两种消费：卷挂载（键变文件）vs 环境变量注入（键变变量）",
      "核心差异：卷挂载支持热更新，env 注入需要重启 Pod",
      "经典陷阱：subPath 单文件挂载丧失热更新；immutable 与 Reloader 是生产方案"
    ]);
  }
};
