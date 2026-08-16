// slide-07.js — 14.2 Drain 异常处理与业务保护（表格 + 卡片 + 警示条）
const { C, sectionTitle, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 7, title: "Drain 异常处理与业务保护" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Drain 异常处理与业务保护");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "卡住现象", options: hdr }, { text: "原因", options: hdr }, { text: "处理", options: hdr }],
      [{ text: "cannot delete Pods with local storage", options: mkF(0) }, { text: "Pod 挂了本地卷（emptyDir/hostPath）", options: celA }, { text: "drain 加 --delete-emptydir-data（确认数据可丢后）；或先处理这些 Pod", options: celA }],
      [{ text: "drain 一直 Pending（PDB 拦）", options: mkF(1) }, { text: "应用可用副本已低于 PDB 下限", options: celB }, { text: "评估：等业务恢复 / 临时调 PDB / --disable-eviction 强驱（慎用）", options: celB }],
      [{ text: "驱逐后 Pod 起不来", options: mkF(0) }, { text: "调度不满足（资源/亲和/污点）", options: celA }, { text: "修调度条件；或 --force 跳过驱逐校验（慎用）", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.15, w: 8.8, colW: [2.6, 2.8, 3.4],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.62,
    });
    // 14.2.2 PDB 与 14.2.3 污点隔离
    card(s, 0.6, 3.35, 4.3, 1.5, C.primary);
    s.addText("PDB 与业务保护（运维视角）", {
      x: 0.8, y: 3.45, w: 3.9, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("▸ 核心服务必须配 PDB（min-available / max-unavailable）\n▸ drain 被拦（ALLOWED DISRUPTIONS = 0）→ 先评估再决定\n▸ 维护窗口前检查 kubectl get pdb -A", {
      x: 0.8, y: 3.85, w: 3.95, h: 0.95,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    card(s, 5.1, 3.35, 4.3, 1.5, C.accent);
    s.addText("污点隔离（节点级运维手段）", {
      x: 5.3, y: 3.45, w: 3.9, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("▸ 故障隔离：NoExecute 先驱逐（快速止损），再排查\n▸ 专用节点：GPU/高内存打污点，只放匹配负载\n▸ 灰度节点：新版本节点先隔离，验证完再放开", {
      x: 5.3, y: 3.85, w: 3.95, h: 0.95,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    warnBar(s, "铁律：--force / --disable-eviction 是“明确后果”的开关——先想清楚再传；PDB 卡住时优先“解决问题”而不是“绕开保护”。", 5.0);
  }
};
