// slide-06.js — 分隔页 4.2
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 6, title: "容器的配置要素" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "4.2", "容器的配置要素", [
      "镜像与拉取策略：默认策略由 tag 决定",
      "command / args 覆盖 ENTRYPOINT / CMD",
      "环境变量、标签注解、SecurityContext 安全基线"
    ]);
  }
};
