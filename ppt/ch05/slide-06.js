// slide-06.js — 分隔页 5.2 Deployment 与 ReplicaSet
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 6, title: "Deployment 与 ReplicaSet" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "5.2", "Deployment 与 ReplicaSet：无状态应用的标准答案", [
      "三层结构：Deployment → ReplicaSet → Pod——RS 为回滚而生",
      "滚动更新：maxUnavailable / maxSurge 控制替换节奏，readinessProbe 是零中断前提",
      "回滚：rollout undo 一键还原；扩缩容 / 暂停都是修改期望状态",
      "发布策略矩阵：滚动 / 蓝绿 / 金丝雀 / A-B 测试"
    ]);
  }
};
