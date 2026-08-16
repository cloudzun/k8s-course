// slide-16.js — 6.4.1/6.4.2 污点与容忍机制 + 三种 effect
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 16, title: "污点与容忍机制与三种 effect" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "污点与容忍：排斥力与通行证");
    // 机制两卡
    card(s, 0.6, 1.15, 4.3, 1.1, C.accentWarm);
    s.addText("污点 Taint——节点的“排斥标记”", {
      x: 0.9, y: 1.23, w: 3.8, h: 0.3, fontSize: 12.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.accentWarm, margin: 0
    });
    s.addText("带污点的节点，默认拒绝没有相应容忍的 Pod（节点主动排斥）", {
      x: 0.9, y: 1.58, w: 3.8, h: 0.55, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    card(s, 5.1, 1.15, 4.3, 1.1, C.primary);
    s.addText("容忍 Toleration——Pod 的“通行证”", {
      x: 5.4, y: 1.23, w: 3.8, h: 0.3, fontSize: 12.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    s.addText("容忍了某个污点的 Pod，才能被调度到该节点（Pod 主动声明）", {
      x: 5.4, y: 1.58, w: 3.8, h: 0.55, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    s.addText("node1（污点 dedicated=gpu:NoSchedule）→ 普通 Pod 拒绝 ✗ ｜ 带容忍的 Pod 放行 ✓", {
      x: 0.6, y: 2.4, w: 8.8, h: 0.35, fontSize: 10.5, fontFace: "Consolas",
      color: C.textMid, margin: 0
    });
    // effect 表
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "effect", options: hdr }, { text: "语义", options: hdr }, { text: "典型用途", options: hdr }],
      [{ text: "NoSchedule", options: mkF(0) }, { text: "不调度新 Pod（已在跑的不管）", options: celA }, { text: "节点维护前隔离新负载", options: celA }],
      [{ text: "PreferNoSchedule", options: mkF(1) }, { text: "尽量不调度（软性，打分排斥）", options: celB }, { text: "偏好性隔离", options: celB }],
      [{ text: "NoExecute", options: mkF(0) }, { text: "不调度新 Pod + 驱逐已在跑的（不带容忍的立即被赶走）", options: celA }, { text: "节点故障 / 隔离的强手段", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei", x: 0.6, y: 2.9, w: 8.8, colW: [1.8, 4.4, 2.6],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.45,
    });
    // NoExecute 驱逐时间
    s.addText("NoExecute 驱逐时间：容忍可以带时长——tolerationSeconds: 60 = “容忍 60 秒，之后被驱逐”（故障节点上让 Pod 多活一会儿完成收尾）", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.35, fontSize: 11, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0
    });
    // 命令
    codeBlock(s, 0.6, 5.25, 8.8, 0.36,
      "kubectl taint nodes node2 dedicated=gpu:NoSchedule    # 打污点\n" +
      "kubectl taint nodes node2 dedicated=gpu:NoSchedule-   # 去掉污点（末尾 -）", 10);
  }
};
