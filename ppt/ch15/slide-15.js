// slide-15.js — 15.5 分布式追踪（Tracing）
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 15, title: "分布式追踪 Tracing" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "分布式追踪（Tracing）：请求的一生");
    s.addText("问题：微服务里一个请求经过 A → B → C，出问题时“慢在哪一环”？日志（局部）与指标（统计）都答不了", { x: 0.6, y: 1.1, w: 8.8, h: 0.32, fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    // 请求链路图
    const boxes = [
      { t: "用户请求", x: 0.7, w: 1.4, c: "E8F0FE", lc: "326CE5" },
      { t: "网关\nspan: 5ms", x: 2.5, w: 1.5, c: "E8F0FE", lc: "326CE5" },
      { t: "订单服务\nspan: 120ms", x: 4.4, w: 1.7, c: "E8F0FE", lc: "326CE5" },
      { t: "数据库\nspan: 95ms", x: 6.5, w: 1.5, c: "FDECEA", lc: "D94F4F" },
    ];
    boxes.forEach(b => {
      s.addShape("rect", { x: b.x, y: 1.6, w: b.w, h: 0.7, fill: { color: b.c }, line: { color: b.lc, width: 1 } });
      s.addText(b.t, { x: b.x, y: 1.6, w: b.w, h: 0.7, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0 });
    });
    ["→", "→", "→"].forEach((a, i) => {
      s.addText(a, { x: 2.15 + i * 1.9, y: 1.72, w: 0.4, h: 0.45, fontSize: 16, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    });
    // 分支：库存服务（慢在下游）
    s.addShape("rect", { x: 4.4, y: 2.5, w: 1.7, h: 0.6, fill: { color: "E8F8E8" }, line: { color: "5BA85B", width: 1 } });
    s.addText("库存服务\nspan: 40ms", { x: 4.4, y: 2.5, w: 1.7, h: 0.6, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0 });
    s.addText("└─ 慢在这里！", { x: 6.55, y: 2.38, w: 2.6, h: 0.3, fontSize: 10.5, fontFace: "Microsoft YaHei", bold: true, color: "D94F4F", margin: 0 });
    s.addText("traceID 贯穿所有 span → 火焰图/瀑布图 → 一眼定位“慢在哪一环”；技术栈：OpenTelemetry SDK + Jaeger/Tempo", { x: 0.6, y: 3.18, w: 8.8, h: 0.32, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
    // 核心概念
    s.addText("核心概念（OpenTelemetry 标准——云原生追踪事实标准）", { x: 0.6, y: 3.6, w: 8.8, h: 0.28, fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    const concepts = [
      { t: "Trace（追踪）", d: "一个请求的全链路，由 traceID 关联" },
      { t: "Span（跨度）", d: "链路上的一段：一次服务调用/操作，含耗时与状态" },
      { t: "传播（Propagation）", d: "请求头携带 traceID 传递（traceparent 头），各服务把 span 上报到追踪后端" },
    ];
    concepts.forEach((cd, i) => {
      const x = 0.6 + i * 3.0;
      card(s, x, 3.95, 2.8, 1.0, C.primary);
      s.addText(cd.t, { x: x + 0.15, y: 4.05, w: 2.5, h: 0.3, fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
      s.addText(cd.d, { x: x + 0.15, y: 4.38, w: 2.5, h: 0.5, fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    });
    s.addText("核心认知：Metrics“出问题了”· Logs“说了什么”· Traces“慢在哪一环”——三支柱 + 追踪齐备，才能高效定位故障", { x: 0.6, y: 5.08, w: 8.8, h: 0.32, fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0 });
  }
};
