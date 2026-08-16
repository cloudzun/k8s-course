// slide-14.js — 10.4.3/10.4.4 绑定模式与回收策略
const { C, sectionTitle, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 14, title: "绑定模式与回收策略" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "绑定模式 · 回收策略");
    card(s, 0.6, 1.15, 4.3, 1.8, C.primary);
    s.addText("Immediate · 立即绑定", {
      x: 0.8, y: 1.25, w: 3.9, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("PVC 创建就绑定（PV 立即建好）\n——可能建在与 Pod 无关的节点上\n适合网络存储（NFS / 云盘）", {
      x: 0.8, y: 1.7, w: 3.9, h: 1.15,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0
    });
    card(s, 5.1, 1.15, 4.3, 1.8, C.accent);
    s.addText("WaitForFirstConsumer · 等消费再绑定", {
      x: 5.3, y: 1.25, w: 3.9, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("等第一个 Pod 调度后再绑定——PV 建在 Pod 所在节点\nlocal-path 这类“节点本地存储”必须用这个：提前绑定可能建在别的节点，Pod 调度过来时数据在别处", {
      x: 5.3, y: 1.7, w: 3.9, h: 1.15,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0
    });
    card(s, 0.6, 3.15, 8.8, 1.05, C.secondary);
    s.addText("回收策略：动态供应的 PV 跟随 StorageClass（reclaimPolicy: Delete 常见）——PVC 删除 = 数据删除（local-path 会删掉本地目录）", {
      x: 0.9, y: 3.25, w: 8.2, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("要保留数据：临时改 PV 的回收策略为 Retain，或用备份", {
      x: 0.9, y: 3.68, w: 8.2, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    warnBar(s, "⚠ PVC 删除 = 数据删除：Delete 策略下 local-path 会删掉本地目录——删 PVC 前确认数据已备份", 4.4);
    s.addText("（实验 08 Lab 4：安装 local-path 后观察“PV 自动生成、目录自动创建”）", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
