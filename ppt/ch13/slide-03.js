// slide-03.js — 分隔页 13.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "集群信任链总览" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "13.1", "集群信任链总览", [
      "信任根是 CA：签发全部组件证书（第 3 章生成）",
      "三条安全线：证书线 / 数据线 / 节点线",
      "一句话总览：证书保通信、加密保落盘、kubelet 保入口"
    ]);
  }
};
