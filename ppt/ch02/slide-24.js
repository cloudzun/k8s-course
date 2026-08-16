// slide-24.js — 2.4.2 etcd
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 24, title: "etcd" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "etcd：集群的状态存储", C.bgLight);
    card(s, 0.6, 1.3, 4.3, 2.0, C.primary);
    s.addText("所有对象的状态都存这里", {
      x: 0.86, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("Pod / Service / ConfigMap / Secret 的完整定义——丢了 etcd = 丢了整个集群（CKA 必考）", {
      x: 0.86, y: 1.85, w: 3.9, h: 1.3,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    card(s, 5.1, 1.3, 4.3, 2.0, C.accent);
    s.addText("Raft 共识 + 奇数节点", {
      x: 5.36, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("多节点之间投票保证数据一致；需要奇数个（3/5/7）——Raft 要求多数派（2/3、3/5）才能提交", {
      x: 5.36, y: 1.85, w: 3.9, h: 1.3,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    const code = "/registry/pods/default/nginx\n/registry/deployments/default/web\n/registry/secrets/default/mysql-pass";
    codeBlock(s, 0.6, 3.55, 8.8, 1.1, code, 12);
    s.addText("键值对按路径组织 · 客户端端口 2379 · 节点间 2380 · Secret 默认明文（可配静态加密，实验 09 Lab 9）", {
      x: 0.6, y: 4.8, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    s.addShape("rect", { x: 0.6, y: 5.2, w: 8.8, h: 0.4, fill: { color: C.bgBlue } });
    s.addText("etcd 只存集群状态，不存应用数据（应用数据在 PV 里）；etcd 是“集群的记忆”，其他组件都是“读记忆的人”", {
      x: 0.85, y: 5.2, w: 8.3, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.primary, bold: true, valign: "middle", margin: 0
    });
  }
};
