// slide-06.js — 11.2.1 两种身份 与 11.2.2 认证方式
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 6, title: "两种身份与认证方式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "两种身份 与 11.2.2 认证方式", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "身份", options: hdr }, { text: "给谁用", options: hdr }, { text: "凭据", options: hdr }, { text: "用户名格式", options: hdr }],
      [{ text: "User", options: mkF(0) }, { text: "人（管理员/开发）", options: celA }, { text: "客户端证书 / token", options: celB }, { text: "train 等（自定）", options: celA }],
      [{ text: "ServiceAccount", options: mkF(1) }, { text: "程序（Pod 内应用）", options: celB }, { text: "Token（Bearer）", options: celA }, { text: "system:serviceaccount:<ns>:<名字>", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.2, w: 8.8, colW: [1.9, 2.2, 1.9, 2.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.52,
    });
    s.addText("注意：Kubernetes 没有 User 对象（User 是“外部概念”，通过证书 CN 识别）；SA 是真实对象（存在集群里）。", {
      x: 0.6, y: 2.85, w: 8.8, h: 0.32, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    s.addText("认证方式（apiserver 支持的）", {
      x: 0.6, y: 3.25, w: 8.8, h: 0.32, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const ways = [
      "【X.509 客户端证书】最常用——kubeconfig 里带证书，apiserver 用 CA 校验签名",
      "【Bearer Token】SA 的 token（HTTP 头 Authorization: Bearer <token>）",
      "【基础认证】用户名/密码，一般不启用",
      "【OIDC】企业单点登录（Keycloak/Dex/企业 SSO）——生产人员认证事实标准，见下页",
      "【其他】Webhook 认证等",
    ];
    ways.forEach((w, i) => {
      const y = 3.62 + i * 0.38;
      s.addShape("ellipse", { x: 0.68, y: y + 0.02, w: 0.3, h: 0.3, fill: { color: C.secondary } });
      s.addText(String(i + 1), {
        x: 0.68, y: y + 0.02, w: 0.3, h: 0.3,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(w, {
        x: 1.12, y, w: 8.0, h: 0.34,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
