// slide-07.js — 15.2.2 完整监控：Prometheus 体系
const { C, sectionTitle, bigCallout } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 7, title: "Prometheus 体系架构" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "完整监控：Prometheus 体系（概念）");
    s.addText("生产级监控需要历史、告警、可视化——这就是 Prometheus 生态（CNCF 毕业项目）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 指标源（左列三个）
    const srcs = ["kubelet", "node-exporter", "应用 /metrics"];
    srcs.forEach((t, i) => {
      s.addShape("rect", { x: 0.7, y: 1.6 + i * 0.62, w: 1.8, h: 0.52, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
      s.addText(t, { x: 0.7, y: 1.6 + i * 0.62, w: 1.8, h: 0.52, fontSize: 11, fontFace: "Consolas", color: C.textDark, align: "center", valign: "middle", margin: 0 });
    });
    // 抓取标签
    s.addText("抓取 scrape\n（定期拉）", { x: 2.62, y: 2.12, w: 0.85, h: 0.9, fontSize: 10, fontFace: "Microsoft YaHei", color: C.accentWarm, align: "center", margin: 0 });
    // Prometheus 中心
    s.addShape("rect", { x: 3.55, y: 1.85, w: 2.0, h: 1.4, fill: { color: "E8F4FD" }, line: { color: "326CE5", width: 1.5 } });
    s.addText("Prometheus\n（时序库 + PromQL）", { x: 3.55, y: 1.85, w: 2.0, h: 1.4, fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, align: "center", valign: "middle", margin: 0 });
    // 告警 / 展示（右列两个）
    s.addShape("rect", { x: 6.7, y: 1.6, w: 2.6, h: 0.72, fill: { color: "FDECEA" }, line: { color: "D94F4F", width: 1 } });
    s.addText("告警 Alertmanager\n规则触发 → 通知", { x: 6.7, y: 1.6, w: 2.6, h: 0.72, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0 });
    s.addShape("rect", { x: 6.7, y: 2.5, w: 2.6, h: 0.72, fill: { color: "E8F8E8" }, line: { color: "5BA85B", width: 1 } });
    s.addText("展示 Grafana\n图表 / 大盘", { x: 6.7, y: 2.5, w: 2.6, h: 0.72, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0 });
    // 箭头
    s.addText("→", { x: 5.65, y: 1.75, w: 0.4, h: 0.4, fontSize: 18, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    s.addText("→", { x: 5.65, y: 2.65, w: 0.4, h: 0.4, fontSize: 18, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    bigCallout(s, "决策逻辑：教学/小集群 → metrics-server 够用\n生产 → Prometheus 体系（历史 + 告警 + 大盘）", 3.7, 1.05);
    s.addText("部署形态：kube-prometheus-stack（Prometheus + Grafana + 告警一体，Helm 一键装）——知道存在与用途即可，不用手搓", {
      x: 0.6, y: 4.95, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
