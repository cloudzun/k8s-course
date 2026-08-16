// slide-10.js — 分隔页 11.3 授权：你能干什么（RBAC）
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 10, title: "授权：你能干什么（RBAC）" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "11.3", "授权：你能干什么（RBAC）", [
      "RBAC 三要素：Subject（谁）＋ Role/ClusterRole（权限）＋ Binding（关联）",
      "两种范围：Role（命名空间）vs ClusterRole（集群）——范围由绑定方式决定",
      "rules 三要素：apiGroups / resources / verbs（CKA 必考）",
      "认证 ≠ 授权：证书有效但 Forbidden——“能登录”和“能操作”是两回事"
    ]);
  }
};
