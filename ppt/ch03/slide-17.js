// slide-17.js — 分隔页 3.6-3.7 节点加入与网络插件
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 17, title: "节点加入与网络插件" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "3.6-3.7", "节点加入与网络插件（CNI）", [
      "token（入场券）+ CA hash（防中间人）+ TLS bootstrap（换取长期证书）",
      "join 后 NotReady 是正常中间态——在等 CNI",
      "CNI 角色：分配 Pod IP、打通跨节点路由——没有 CNI 节点不 Ready",
      "选型：Calico（BGP + NetworkPolicy）vs Flannel（极简）vs Cilium（更强更复杂）"
    ]);
  }
};
