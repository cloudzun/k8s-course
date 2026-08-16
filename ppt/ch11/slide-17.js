// slide-17.js — 11.4 最小权限设计与 kubectl auth can-i
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 17, title: "最小权限设计" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "最小权限设计（Least Privilege）", C.bgLight);
    s.addText("原则：只给完成工作所需的最小权限", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.32, fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const items = [
      ["够用就好", "开发只读 → view；要改配置 → edit；不要给所有人 cluster-admin"],
      ["按团队隔离", "按团队/项目拆分命名空间 + RoleBinding（隔离授权范围）"],
      ["SA 最小化", "SA 只挂自己需要的权限（Pod 不该有集群管理权限）"],
      ["定期审计", "谁的权限过期了、谁还挂着 cluster-admin"],
    ];
    items.forEach((it, i) => {
      const x = 0.6 + (i % 2) * 4.55, y = 1.55 + Math.floor(i / 2) * 0.95;
      card(s, x, y, 4.35, 0.8, C.accent);
      s.addText("【" + it[0] + "】" + it[1], {
        x: x + 0.25, y: y + 0.08, w: 3.9, h: 0.64,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.1
      });
    });
    s.addText("验证工具：kubectl auth can-i —— 不用真试就能检查“某个身份能不能做某个操作”", {
      x: 0.6, y: 3.55, w: 8.8, h: 0.32, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 0.6, 3.92, 8.8, 0.95,
`kubectl auth can-i get pods                         # 当前身份
kubectl auth can-i create deployments --as=dev-user  # 模拟 dev-user
kubectl auth can-i list secrets --as=system:serviceaccount:default:my-sa`, 10.5);
    s.addText("实战价值：给权限之前先验证、给完再验证一次；排障“为什么 Forbidden”时用它确认是授权没配还是规则写错（CKA 排障必用）。", {
      x: 0.6, y: 5.0, w: 8.8, h: 0.4, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
