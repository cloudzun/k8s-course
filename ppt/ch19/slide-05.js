// slide-05.js — 分隔页 19.2 五大域考点浓缩
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 5, title: "五大域考点浓缩" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "19.2", "五大域考点浓缩（全书速查）", [
      "域 1 集群架构 25% · 域 2 工作负载 15% · 域 3 网络 20%",
      "域 4 存储 10% · 域 5 故障排查 30%（第一重）",
      "每域 = 考点 + 关键命令/机制 + 教材/实验定位"
    ]);
  }
};
