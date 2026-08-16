// slide-16.js — 分隔页 10.5
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 16, title: "存储方案选型" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "10.5", "存储方案选型：本地 vs 共享 vs 云盘", [
      "local-path：节点本地目录——零成本，但单节点 / 不可共享 / 无冗余",
      "NFS / 云盘：多节点可访问（RWX 共享）",
      "CSI：Kubernetes 与存储厂商的标准接口（生产接入方式）",
      "选型决策树：持久 → 共享 → 生产 → 核心",
      "多副本共享的前提是存储可共享"
    ]);
  }
};
