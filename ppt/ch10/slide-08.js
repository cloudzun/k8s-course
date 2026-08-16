// slide-08.js — 10.3.1/10.3.2 解耦设计 + PV 货架
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 8, title: "为什么两层 + PV" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "为什么需要两层 · PV：存储的“货架”");
    card(s, 0.6, 1.12, 8.8, 0.62, C.primary);
    s.addText("直接让应用指定宿主机目录（hostPath）的问题：① yaml 里写死了存储细节（路径/机器）——换存储就要改应用　② 管理员想统一管理存储资源（哪些盘可用/多大/怎么回收）没有抓手", {
      x: 0.9, y: 1.18, w: 8.2, h: 0.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.15, margin: 0
    });
    card(s, 0.6, 1.88, 8.8, 0.55, C.accent);
    s.addText("解耦设计（与 RBAC 的 Subject/Binding 思想同源）：PV——管理员“提供什么”；PVC——应用“需要什么”，应用不知道也不关心底层是 NFS 还是云盘", {
      x: 0.9, y: 1.93, w: 8.2, h: 0.45,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    // 左：PV 概念
    card(s, 0.6, 2.6, 3.9, 2.35, C.primary);
    s.addText("PV —— 集群级资源", {
      x: 0.8, y: 2.72, w: 3.5, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("一块“已就绪的存储”\n由管理员创建（或 StorageClass 自动创建）\n描述：容量 · 访问模式 · 回收策略 · 底层实现\n底层实现：hostPath / NFS / 云盘（CSI）", {
      x: 0.8, y: 3.15, w: 3.5, h: 1.7,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0
    });
    // 右：PV YAML
    codeBlock(s, 4.7, 2.6, 4.7, 2.5, `apiVersion: v1
kind: PersistentVolume
metadata:
  name: mysqldata-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /data/mysql`, 11);
  }
};
