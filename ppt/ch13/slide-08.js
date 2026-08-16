// slide-08.js — 13.2.4 证书即身份 + TLS 密码套件加固
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 8, title: "证书即身份与 TLS 加固" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "证书即身份 + TLS 密码套件加固");
    // 左卡：kubeconfig 与证书（回顾）
    card(s, 0.6, 1.3, 4.3, 3.15, C.primary);
    s.addText("kubeconfig 与证书（回顾）", {
      x: 0.85, y: 1.45, w: 3.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("kubeconfig 里的 client-certificate-data 就是用户身份证书（第 11 章 Lab 1 亲手签发过）——“身份”在 Kubernetes 里就是一张 CA 签发的证书，这条线从安装贯穿到用户管理。", {
      x: 0.85, y: 1.85, w: 3.8, h: 1.1,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      valign: "top", lineSpacingMultiple: 1.3, margin: 0
    });
    codeBlock(s, 0.85, 3.1, 3.8, 1.15, [
      "users[].user:",
      "  client-certificate-data: <证书 base64>",
      "  client-key-data: <私钥 base64>",
    ].join("\n"), 9.5);
    // 右卡：TLS 密码套件加固
    card(s, 5.1, 1.3, 4.3, 3.15, C.accentWarm);
    s.addText("TLS 密码套件加固（安全敏感环境）", {
      x: 5.35, y: 1.45, w: 3.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("金融 / 合规场景还要求限制 TLS 版本与密码套件（apiserver 启动参数，改 manifest）：", {
      x: 5.35, y: 1.85, w: 3.8, h: 0.9,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      valign: "top", lineSpacingMultiple: 1.3, margin: 0
    });
    codeBlock(s, 5.35, 2.9, 3.8, 1.35, [
      "--tls-min-version=VersionTLS12",
      "--tls-cipher-suites=",
      "  TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    ].join("\n"), 9.5);
    // 底部认知
    s.addText("核心认知：默认配置“安全够用”（Go 默认已排除弱套件）；等保 / 金融合规要求显式声明时按上例配置——改 apiserver manifest，与 §13.5 审计日志同类操作。", {
      x: 0.6, y: 4.65, w: 8.8, h: 0.7,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, valign: "top", lineSpacingMultiple: 1.3, margin: 0
    });
  }
};
