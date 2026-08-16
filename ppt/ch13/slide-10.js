// slide-10.js — 13.3.1 TLS 通信加密 + 13.3.3 备份安全
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 10, title: "etcd TLS 与备份安全" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "TLS 通信加密 + 13.3.3 备份安全", C.bgLight);
    // 左卡：通信层面
    card(s, 0.6, 1.3, 4.3, 3.25, "4A90D9");
    s.addText("通信层面：全链路 TLS", {
      x: 0.85, y: 1.45, w: 3.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const tls = [
      "apiserver 用 apiserver-etcd-client 证书连 etcd（2379）",
      "etcd 节点间用 peer 证书（2380）",
      "结论：通信层面没有明文",
    ];
    tls.forEach((t, i) => {
      s.addText("▸ " + t, {
        x: 0.85, y: 1.95 + i * 0.5, w: 3.8, h: 0.45,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("apiserver ──(apiserver-etcd-client, 2379)──▶ etcd\netcd ──(peer 证书, 2380)──▶ etcd", {
      x: 0.85, y: 3.5, w: 3.8, h: 0.9,
      fontSize: 9.5, fontFace: "Consolas", color: C.primary, valign: "top", lineSpacingMultiple: 1.35, margin: 0
    });
    // 右卡：备份安全
    card(s, 5.1, 1.3, 4.3, 3.25, C.accentWarm);
    s.addText("备份安全", {
      x: 5.35, y: 1.45, w: 3.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const bk = [
      "第 14 章 / 实验 12 的 etcd 快照也含明文 Secret（未配静态加密时）",
      "备份文件 = 敏感数据：加密存储 + 异地 + 访问控制",
      "风险级别：备份泄露 ≈ 磁盘泄露",
    ];
    bk.forEach((b, i) => {
      s.addText("▸ " + b, {
        x: 5.35, y: 1.95 + i * 0.5, w: 3.8, h: 0.45,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addShape("rect", { x: 5.35, y: 3.5, w: 3.8, h: 0.9, fill: { color: C.bgAccent } });
    s.addText("备份策略：加密存储 · 异地保存 · 访问控制——备份与磁盘同级别对待", {
      x: 5.55, y: 3.58, w: 3.4, h: 0.75,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", lineSpacingMultiple: 1.25, margin: 0
    });
    s.addText("能拿到 etcd 备份 / 数据文件的人 = 看到所有密码（未加密时）——这正是 §13.3.2 静态加密要解决的问题。", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, valign: "middle", margin: 0
    });
  }
};
