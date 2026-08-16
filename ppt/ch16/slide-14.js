// slide-14.js — 分隔页 16.4
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 14, title: "可靠性工程" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "16.4", "可靠性工程：让故障少发生", [
      "发布可靠性：滚动更新策略调优（0/1 零中断）",
      "下线可靠性：优雅终止深化（preStop + grace period）",
      "驱逐可靠性：PDB 保护计算（自愿中断）",
      "主动演练：混沌思想——故障会来，不如主动让它来一次",
    ]);
  }
};
