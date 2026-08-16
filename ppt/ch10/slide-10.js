// slide-10.js — 10.3.3 PVC 与匹配规则
const { C, sectionTitle, card, codeBlock, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 10, title: "PVC：应用的存储请求" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "PVC：应用的存储请求");
    s.addText("PVC = 命名空间级请求：应用声明“需要多大、什么访问模式”——只写 PVC，不写底层细节", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.6, 4.5, 2.5, `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysqldata
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: ""   # 禁用动态供应（§10.4）
  resources:
    requests:
      storage: 5Gi`, 10.5);
    card(s, 5.3, 1.6, 4.1, 1.35, C.primary);
    s.addText("匹配规则（静态绑定）", {
      x: 5.5, y: 1.7, w: 3.7, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("容量 ≥ 请求 && 访问模式匹配 && storageClassName 匹配\n→ 一个 PV 绑定一个 PVC（一对一）", {
      x: 5.5, y: 2.1, w: 3.7, h: 0.8,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0
    });
    card(s, 5.3, 3.1, 4.1, 1.05, C.accent);
    s.addText("管理视角：PV = 我提供什么\n应用视角：PVC = 我需要什么", {
      x: 5.5, y: 3.2, w: 3.7, h: 0.85,
      fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0
    });
    warnBar(s, "⚠ 实测易错点：有默认 StorageClass 时，PVC 不写 storageClassName 会走动态供应——静态绑定必须写 \"\"（实验 08 Lab 3）", 4.5);
  }
};
