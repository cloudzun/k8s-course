// slide-12.js — 8.3.3 Secret 的四种类型与系统级特例
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 12, title: "Secret 的四种类型" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Secret 的四种类型");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const mkA = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" });
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "类型", options: hdr }, { text: "用途", options: hdr }, { text: "键要求", options: hdr }],
      [{ text: "Opaque（默认）", options: mkF(0) }, { text: "通用敏感值：密码 / Token / API Key", options: mkA(1) }, { text: "任意键", options: mkA(0) }],
      [{ text: "kubernetes.io/tls", options: mkF(1) }, { text: "TLS 证书（Ingress 的 HTTPS）", options: mkA(0) }, { text: "固定 tls.crt + tls.key", options: mkA(1) }],
      [{ text: "kubernetes.io/dockerconfigjson", options: mkF(0) }, { text: "私有镜像仓库凭据", options: mkA(1) }, { text: "固定 .dockerconfigjson", options: mkA(0) }],
      [{ text: "kubernetes.io/service-account-token", options: mkF(1) }, { text: "SA 令牌（系统使用）", options: mkA(0) }, { text: "自动管理", options: mkA(1) }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.15, w: 8.8, colW: [2.7, 3.7, 2.4],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.45,
    });
    card(s, 0.6, 3.55, 8.8, 1.0, C.accent);
    s.addText("两个“非通用”消费特例（不经 env / 卷，被系统直接引用）：", {
      x: 0.85, y: 3.65, w: 8.3, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("tls 类型 → Ingress 的 spec.tls.secretName（实验 07 Ingress TLS）", {
      x: 0.85, y: 3.97, w: 8.3, h: 0.28,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("dockerconfigjson 类型 → Pod 的 imagePullSecrets（拉私有镜像时用它认证）", {
      x: 0.85, y: 4.25, w: 8.3, h: 0.28,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 4.7, 8.8, 0.55, [
      "kubectl create secret tls my-tls --cert=cert.crt --key=key.key",
      "kubectl create secret docker-registry regcred --docker-server=HOST --docker-username=USER --docker-password=PASS",
    ].join("\n"), 9.5);
  }
};
