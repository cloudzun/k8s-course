// slide-13.js — 10.4.1/10.4.2 StorageClass 机制
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 13, title: "StorageClass 机制" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "StorageClass：让“建 PV”自动化");
    card(s, 0.6, 1.12, 8.8, 0.62, C.primary);
    s.addText("静态绑定的问题：每个应用都要管理员先手动建好 PV——应用多了根本忙不过来；且 PV 容量是死的（应用要 8G 但只建了 5G 的 PV？）", {
      x: 0.9, y: 1.18, w: 8.2, h: 0.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.15, margin: 0
    });
    codeBlock(s, 0.6, 1.9, 4.4, 2.1, `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
provisioner: rancher.io/local-path
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer`, 10.5);
    card(s, 5.2, 1.9, 4.2, 1.5, C.primary);
    s.addText("机制：声明即用", {
      x: 5.4, y: 2.0, w: 3.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("PVC（storageClassName: local-path）\n→ provisioner 收到请求 → 自动创建 PV（在节点本地目录建文件夹）\n→ 自动绑定 → PVC Bound → Pod 挂载使用", {
      x: 5.4, y: 2.4, w: 3.8, h: 0.95,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.22, margin: 0
    });
    card(s, 5.2, 3.55, 4.2, 0.95, C.accent);
    s.addText("默认 StorageClass：storageclass.kubernetes.io/is-default-class: \"true\" 注解标记默认类——PVC 不写 storageClassName 时自动用它", {
      x: 5.4, y: 3.65, w: 3.8, h: 0.8,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.22, margin: 0
    });
    card(s, 0.6, 4.6, 8.8, 0.6, C.accentWarm);
    s.addText("教学顺序（本课程设计）：StorageClass 讲完概念再安装——实验 08 Lab 4 才装 local-path；学完 10.3（静态）再学 10.4（动态），对比最清晰", {
      x: 0.9, y: 4.66, w: 8.2, h: 0.48,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.15, margin: 0
    });
  }
};
