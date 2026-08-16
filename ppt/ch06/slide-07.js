// slide-07.js — 分隔页 6.2 节点选择
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 7, title: "节点选择：把 Pod 定向到节点" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "6.2", "节点选择：把 Pod 定向到节点", [
      "nodeSelector：最简单，只能“等值匹配”（=）",
      "节点亲和 nodeAffinity：表达式匹配 + 软硬约束（required / preferred）",
      "matchExpressions 运算符：In / NotIn / Exists / DoesNotExist / Gt / Lt",
      "选型：简单等值 → nodeSelector；或 / 非 / 软偏好 → nodeAffinity"
    ]);
  }
};
