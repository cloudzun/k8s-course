// slide-05.js — 分隔页 14.2
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 5, title: "节点管理流程" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "14.2", "节点管理流程", [
      "维护窗口三步曲：cordon → drain → 维护 → uncordon（先挡新、再腾空、后恢复）",
      "Drain 异常处理：本地卷 / PDB 拦截 / 驱逐失败三场景",
      "PDB 业务保护 + 污点隔离：故障隔离、专用节点、灰度节点"
    ]);
  }
};
