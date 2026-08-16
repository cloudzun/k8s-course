// slide-13.js — 分隔页 7.4
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 13, title: "资源治理三层防线" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "7.4", "资源治理三层防线", [
      "第一层：requests/limits——Pod 自己声明（自觉）",
      "第二层：LimitRange——命名空间内约束单个 Pod（默认值 + 上下限）",
      "第三层：ResourceQuota——命名空间内约束总量（防膨胀）",
      "三层协作、设计建议与多租户治理体系",
    ]);
  }
};
