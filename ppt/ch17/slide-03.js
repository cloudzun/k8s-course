// slide-03.js — 分隔页 17.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "为什么需要应用交付工具链" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "17.1", "为什么需要应用交付工具链", [
      "裸 YAML 管理的三个痛点：重复 / 无法参数化 / 无版本管理",
      "工具链定位：Helm（打包与发布）+ Kustomize（配置定制）互补",
      "决策逻辑：应用要分发/复用 → Helm；项目内多环境 → Kustomize"
    ]);
  }
};
