// slide-15.js — 10.4.5/10.4.6 在线扩容与快照
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 15, title: "在线扩容与快照" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "在线扩容 · Volume Snapshot", C.bgLight);
    // 左：在线扩容
    card(s, 0.6, 1.15, 4.3, 3.25, C.primary);
    s.addText("PVC 在线扩容（不重建 Pod）", {
      x: 0.8, y: 1.25, w: 3.9, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("问题：磁盘满了怎么办？生产刚需\n前提：StorageClass 的 allowVolumeExpansion: true（未开启则 PVC 的 storage 不可改）\n生效：底层存储支持时应用无感（local-path 支持）；部分存储需 Pod 重启\n⚠ 只能扩不能缩——缩减有数据风险，K8s 不支持", {
      x: 0.8, y: 1.7, w: 3.9, h: 1.85,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.22, margin: 0
    });
    codeBlock(s, 0.8, 3.65, 3.9, 0.6, `kubectl patch pvc mysqldata \\
  -p '{"spec":{"resources":{"requests":{"storage":"10Gi"}}}}'`, 9.5);
    // 右：快照
    card(s, 5.1, 1.15, 4.3, 3.25, C.accent);
    s.addText("VolumeSnapshot · 存储快照（数据保护）", {
      x: 5.3, y: 1.25, w: 3.9, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("CSI 快照：给 PVC 打“时间点快照”——比拷贝文件更一致、更快\n用途：备份前的快速一致快照 / 数据库迁移 / 测试环境克隆\n恢复：从快照创建新 PVC（VolumeSnapshotContent）\n前提：底层 CSI 驱动支持快照——local-path 不支持；云盘/NFS 类支持\n示例：source.persistentVolumeClaimName: mysqldata", {
      x: 5.3, y: 1.7, w: 3.9, h: 2.55,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.22, margin: 0
    });
    card(s, 0.6, 4.55, 8.8, 0.7, C.accentWarm);
    s.addText("与第 14 章 etcd 快照的区别：etcd 快照保“集群状态”、VolumeSnapshot 保“应用数据”——两者互补（Velero 灾备就是组合使用）", {
      x: 0.9, y: 4.62, w: 8.2, h: 0.55,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark,
      lineSpacingMultiple: 1.15, margin: 0
    });
  }
};
