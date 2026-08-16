// slide-13.js — 分隔页 13.4
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 13, title: "kubelet 安全" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "13.4", "kubelet 安全", [
      "kubelet 也有 API（10250）——入口必须认证授权",
      "默认基线：anonymous 禁用 + 认证授权全 Webhook 委托 apiserver",
      "生产红线：不要改成 anonymous 允许或 AlwaysAllow（等于节点裸奔）"
    ]);
  }
};
