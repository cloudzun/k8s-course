// slide-12.js — 7.3.3 三种扩缩的定位 + 7.3.4 KEDA
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 12, title: "三种扩缩定位与 KEDA" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "三种扩缩的定位");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "维度", options: hdr }, { text: "调整什么", options: hdr }, { text: "生效方式", options: hdr }, { text: "适用", options: hdr }],
      [{ text: "HPA（水平）", options: mkF(0) }, { text: "副本数", options: celA }, { text: "立即（改 replicas）", options: celA }, { text: "无状态应用，最常用", options: celA }],
      [{ text: "VPA（垂直）", options: mkF(1) }, { text: "requests/limits", options: celB }, { text: "需重建 Pod（v1.27+ 可原地）", options: celB }, { text: "有状态/不好水平扩展", options: celB }],
      [{ text: "ClusterAutoscaler（节点级）", options: mkF(0) }, { text: "节点数", options: celA }, { text: "分钟级（云 API）", options: celA }, { text: "集群容量不足时", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.5, w: 8.8, colW: [2.15, 2.0, 2.55, 2.1],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.55,
    });
    s.addText("决策逻辑：默认 HPA → 副本数不能随便加（有状态/单实例）用 VPA → 节点容量瓶颈用 ClusterAutoscaler；三者可以组合（生产标准：HPA + CA）。", {
      x: 0.6, y: 3.82, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    // KEDA 进阶卡片
    card(s, 0.6, 4.35, 8.8, 1.05, C.accentWarm);
    s.addText("KEDA：事件驱动自动扩缩（进阶）", {
      x: 0.9, y: 4.45, w: 8.2, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0
    });
    s.addText("HPA 只认 CPU/内存；消息队列堆积（Kafka/RabbitMQ 积压 1 万条 → 加消费者）正是 KEDA 场景——内置 70+ Scaler 直接读外部指标，以“自定义指标源”接入 HPA，用 ScaledObject 声明“队列长度 > N 扩到 M”。决策：标准 CPU/内存 → HPA；事件驱动 → KEDA。", {
      x: 0.9, y: 4.78, w: 8.2, h: 0.55,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.2, valign: "top", margin: 0
    });
  }
};
