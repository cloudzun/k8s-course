// slide-07.js — 分隔页 10.3
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 7, title: "PV 与 PVC" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "10.3", "PV 与 PVC：存储解耦（核心）", [
      "为什么需要两层：应用不写存储细节、管理员统一管理资源",
      "PV：集群级资源——管理员“提供什么”（容量/访问模式/回收策略）",
      "PVC：命名空间级请求——应用“需要什么”（只写 PVC 不写底层）",
      "生命周期：Provision → Bind → Use → Reclaim",
      "CKA 核心考点：绑定机制、访问模式、回收策略、静态 vs 动态"
    ]);
  }
};
