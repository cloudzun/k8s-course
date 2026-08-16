// slide-13.js — 8.3.5 Secret 的安全边界
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 13, title: "Secret 的安全边界" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Secret 的安全边界", C.bgLight);
    s.addText("消费方式与 ConfigMap 完全相同（卷 / env + 两个系统级特例）——区别只在数据敏感性：Secret 更“金贵”，只给需要的 Pod 挂", {
      x: 0.6, y: 1.05, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    const items = [
      { t: "RBAC 收紧", d: "get secret 就是拿到全部值——Secret 的读权限要单独授权（第 11 章授权机制）" },
      { t: "etcd 静态加密", d: "默认 etcd 里 Secret 是明文存储——配 EncryptionConfiguration 落盘加密，防备份泄露（实验 09 Lab 9）" },
      { t: "最小权限", d: "一个 Secret 只给需要的命名空间 / 应用；不用的不创建、不授权；定期轮换" },
      { t: "外部密钥管理（进阶）", d: "生产可接 External Secrets（Vault / AWS Secrets Manager），集群里不落明文——知道存在即可" },
    ];
    items.forEach((it, i) => {
      const y = 1.5 + i * 0.95;
      card(s, 0.6, y, 8.8, 0.85, i === 0 ? C.primary : C.accent);
      s.addText(it.t, {
        x: 0.9, y, w: 2.1, h: 0.85,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, valign: "middle", margin: 0
      });
      s.addText(it.d, {
        x: 3.1, y, w: 6.1, h: 0.85,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "一句话：把 base64 当加密是新手最常见的误解——Secret 的安全永远靠“权限 + 加密存储”，而不是编码本身。", 5.08);
  }
};
