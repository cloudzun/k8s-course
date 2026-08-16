// slide-12.js — 16.2.5 存储层排查
const { C, sectionTitle, codeBlock, card } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 12, title: "存储层排查" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "存储层：卷挂不上", C.bgLight);
    codeBlock(s, 0.6, 1.3, 8.8, 1.9,
`kubectl get pvc                    # PVC 状态（Pending = 没绑定）
kubectl describe pvc              # Events：no persistent volumes available（没有匹配的 PV）
kubectl get pv                    # PV 存在吗/容量/访问模式/SC 匹配吗
kubectl describe pod              # Events 的 FailedMount（挂载失败：路径/权限/存储节点）`, 10.5);
    card(s, 0.6, 3.4, 4.3, 1.7, C.primary);
    s.addText("PVC Pending = PV 不匹配", {
      x: 0.9, y: 3.55, w: 3.8, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("容量 / 访问模式 / SC 对不上（第 10 章 §10.3.4）\n→ 补 PV 或改 SC", {
      x: 0.9, y: 4.0, w: 3.8, h: 0.95,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    card(s, 5.1, 3.4, 4.3, 1.7, C.accent);
    s.addText("FailedMount = 底层存储问题", {
      x: 5.4, y: 3.55, w: 3.8, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("节点挂了 / 权限问题\n→ 修底层存储（不是改 PVC）", {
      x: 5.4, y: 4.0, w: 3.8, h: 0.95,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    s.addShape("rect", { x: 0.6, y: 5.15, w: 8.8, h: 0.45, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 5.15, w: 0.06, h: 0.45, fill: { color: C.primary } });
    s.addText("判断要点：先分清是“没有匹配的 PV”（PVC Pending）还是“挂不上”（FailedMount）", {
      x: 0.9, y: 5.15, w: 8.3, h: 0.45,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      valign: "middle", margin: 0
    });
  }
};
