// slide-18.js — 思考题
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 18, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "为什么说“证书过期 = 集群瘫痪”？apiserver 与 kubelet 证书过期的影响面分别是什么？",
      "静态加密只对新写入的数据生效，旧 Secret 怎么办？（提示：identity 兜底 + 更新时加密）",
      "拿到 etcd 备份文件能解密吗？没配静态加密呢？配了但密钥也泄露了呢？",
      "kubelet 的 anonymous 改成允许会有什么风险？Webhook 模式的意义是什么？",
      "数据安全的纵深防御有几层？各防什么？（网络隔离 / RBAC / 静态加密 / 审计）",
      "证书续期后为什么 kubeconfig 可能需要重新生成？",
    ];
    qs.forEach((q, i) => {
      const y = 1.3 + i * 0.62;
      s.addShape("ellipse", { x: 0.7, y: y + 0.04, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.04, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.5,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("CKA 考点（域 1/3）：kubeadm certs check-expiration / renew · EncryptionConfiguration（aescbc / identity）· kubelet 认证授权（Webhook）· Secret 安全边界；排障（域 5）：x509: certificate has expired。", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.45,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, valign: "middle", margin: 0
    });
  }
};
