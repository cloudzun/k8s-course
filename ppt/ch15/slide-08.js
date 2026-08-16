// slide-08.js — 15.2.3 PromQL 极简实战
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 8, title: "PromQL 极简实战" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "PromQL 极简实战（会看、会写一条就够）", C.bgLight);
    s.addText("Prometheus 查询语言——至少掌握一条典型查询；rate = 每秒增量（计数器最常用处理）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.55, 8.8, 0.72,
      "# 节点 CPU 使用率（rate 处理计数器）\n100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)\ncontainer_memory_usage_bytes{namespace=\"default\"}   # Pod 内存用量", 10);
    codeBlock(s, 0.6, 2.42, 8.8, 0.78,
      "- alert: NodeCPUHigh\n  expr: (100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)) > 80\n  for: 5m        # 持续 5 分钟才告警（防抖动）", 10);
    s.addText("采集配置：ServiceMonitor——Prometheus Operator 用它声明“抓哪些服务的指标”", {
      x: 0.6, y: 3.38, w: 8.8, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 0.6, 3.72, 8.8, 1.5,
      "apiVersion: monitoring.coreos.com/v1\nkind: ServiceMonitor\nmetadata:\n  name: myapp\nspec:\n  selector: { matchLabels: { app: myapp } }   # 选 Service\n  endpoints:\n  - port: metrics                              # 指标端口（应用暴露 /metrics）", 10);
    s.addText("核心认知：指标采集的“最后一公里”= 应用暴露 /metrics + ServiceMonitor 声明抓取（kube-prometheus-stack 已帮你做好）", {
      x: 0.6, y: 5.3, w: 8.8, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
