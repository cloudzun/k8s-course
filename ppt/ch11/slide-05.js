// slide-05.js — 分隔页 11.2 认证：你是谁
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 5, title: "认证：你是谁" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "11.2", "认证：你是谁", [
      "两种身份：User（人）与 ServiceAccount（程序）",
      "认证方式：X.509 客户端证书 / Bearer Token / 基础认证 / OIDC 等",
      "X.509 机制：CA 签发、CN 即用户名——“签发证书 = 创建用户”",
      "v1.24+：SA Token 动态签发，不再自动创建长期 token"
    ]);
  }
};
