// slide-12.js — 分隔页 10.4
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 12, title: "StorageClass" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "10.4", "StorageClass：动态供应（自动化）", [
      "为什么需要：静态绑定每个应用都要手动建 PV——忙不过来",
      "provisioner 自动创建 PV 并绑定——声明即用",
      "默认类：PVC 不写 storageClassName 时自动用它",
      "绑定模式 WaitForFirstConsumer：节点本地存储的必需",
      "在线扩容 + 快照：磁盘管理与数据保护手段"
    ]);
  }
};
