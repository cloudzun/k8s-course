// slide-03.js — 分隔页 5.1 控制器：管理 Pod 的管理者
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "控制器：管理 Pod 的“管理者”" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "5.1", "控制器：管理 Pod 的“管理者”", [
      "裸 Pod 三个致命问题：不自愈 / 不扩缩 / 不更新",
      "控制器 = 管 Pod 的人：声明期望，持续调和",
      "共同骨架：selector + template + replicas + 控制循环",
      "决策树：先问“身份”→ 再问“分布”→ 再问“任务”"
    ]);
  }
};
