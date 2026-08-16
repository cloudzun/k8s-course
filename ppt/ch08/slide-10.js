// slide-10.js — 分隔页 8.3 Secret
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 10, title: "Secret：敏感配置" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "8.3", "Secret：敏感配置", [
      "结构与 ConfigMap 几乎一样，差别在：base64 编码、默认不显示内容、有类型字段",
      "重要认知：base64 是编码不是加密——安全靠 RBAC + etcd 加密 + 最小权限",
      "四种类型：Opaque / tls / dockerconfigjson / service-account-token",
      "两个系统级消费特例：Ingress TLS 与 imagePullSecrets"
    ]);
  }
};
