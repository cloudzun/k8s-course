// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "画出集群信任链：CA → 各组件证书 → 双向 TLS，说清“证书过期 = 集群瘫痪”",
      "执行证书检查与续期（kubeadm certs check-expiration / renew）并知道续期后注意事项",
      "解释 etcd 静态加密机制（EncryptionConfiguration、aescbc、identity 兜底）与验证方法",
      "解释 kubelet 的认证授权模式：anonymous 禁用 + Webhook 委托 apiserver",
      "汇总 Secret 的安全边界：RBAC + 加密存储 + 最小权限（纵深防御）",
      "说出“数据安全”的两道防线（静态加密 + 网络隔离）及各防什么",
    ];
    goals.forEach((g, i) => {
      const y = 1.3 + i * 0.55;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.5,
        fontSize: 13, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
