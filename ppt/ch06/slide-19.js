// slide-19.js — 分隔页 6.5 节点维护与驱逐保护
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 19, title: "节点维护与驱逐保护" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "6.5", "节点维护与驱逐保护", [
      "维护三步曲：cordon → drain → uncordon",
      "drain 驱逐走优雅终止，业务无感迁移",
      "PDB：约束主动驱逐的副本数（ALLOWED DISRUPTIONS 计算）",
      "核心服务必配 PDB——否则一次维护可能全量中断"
    ]);
  }
};
