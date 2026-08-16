// slide-17.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 17, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "为什么外部化：镜像不可变、多环境复用、敏感信息不落地——同一份镜像跑所有环境",
      "ConfigMap = 非敏感键值对仓库；两种消费：卷挂载（键变文件、热更新）vs env 注入（一次性、需重启）",
      "读文件用卷、读 env 用 env；subPath 单文件挂载会彻底丧失热更新（经典坑）",
      "Secret 与 CM 同构 + base64；base64 ≠ 加密——安全靠 RBAC + etcd 静态加密 + 最小权限",
      "Secret 四种类型：Opaque / tls / dockerconfigjson / service-account-token；后两者是系统级消费特例",
      "Downward API 注入“自己是谁”——与外部配置界限分明（CM=要什么，Secret=凭什么）",
      "生产实践：配置全进对象、按敏感性分流、Secret 最小权限、多环境复用",
      "衔接：第 9 章网络——tls 型 Secret 是 Ingress HTTPS 的原料；第 11 章 RBAC 为 Secret 访问控制提供机制",
    ];
    items.forEach((g, i) => {
      const y = 1.2 + i * 0.52;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.46,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
