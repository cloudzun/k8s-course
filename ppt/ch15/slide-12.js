// slide-12.js — 15.3.3 日志收集模式 + 15.3.4 生产日志实践
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "compare", index: 12, title: "日志收集模式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "日志收集模式：daemonset vs sidecar");
    s.addText("kubectl logs 只能看单 Pod；生产要把所有 Pod 的日志集中（检索 / 告警 / 合规）——两种收集模式", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 模式一：daemonset
    card(s, 0.6, 1.55, 4.3, 1.85, C.primary);
    s.addText("模式一：daemonset 收集（每节点一个，主流）", { x: 0.85, y: 1.68, w: 3.85, h: 0.35, fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    s.addText("每个节点一个采集 Pod（filebeat / fluentd / vector）→ 读 /var/log/containers/ → 发到集中存储（ES/Loki/S3）→ Kibana/Grafana 检索", { x: 0.85, y: 2.05, w: 3.85, h: 0.85, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    s.addText("优点：一个 DaemonSet 管全集群、应用无感知\n缺点：采集器自己也要日志（注意循环）", { x: 0.85, y: 2.92, w: 3.85, h: 0.42, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
    // 模式二：sidecar
    card(s, 5.1, 1.55, 4.3, 1.85, C.accent);
    s.addText("模式二：sidecar 收集（每 Pod 一个，特殊场景）", { x: 5.35, y: 1.68, w: 3.85, h: 0.35, fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0 });
    s.addText("Pod 里：主容器（写日志文件）+ sidecar 容器（读文件转发）", { x: 5.35, y: 2.05, w: 3.85, h: 0.85, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    s.addText("优点：应用日志文件化（老应用只写文件）、可加过滤/格式转换\n缺点：每个 Pod 多一个容器（资源/复杂度翻倍）", { x: 5.35, y: 2.92, w: 3.85, h: 0.42, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
    calloutBar(s, "选型：默认 daemonset 模式（第 5 章 DaemonSet 的典型场景）；sidecar 只用于“必须文件化”的老应用。", 3.55);
    s.addText("生产日志实践", { x: 0.6, y: 4.2, w: 8.8, h: 0.3, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    const mini = [
      { t: "日志分级与采样", d: "ERROR/WARN/INFO 分级，采样防日志爆炸" },
      { t: "敏感信息脱敏", d: "日志里别打密码——Secret 不落日志" },
      { t: "保留策略", d: "合规要求 vs 存储成本" },
    ];
    mini.forEach((m, i) => {
      const x = 0.6 + i * 3.0;
      s.addShape("rect", { x, y: 4.58, w: 2.8, h: 0.7, fill: { color: C.bgCard } });
      s.addShape("rect", { x, y: 4.58, w: 0.05, h: 0.7, fill: { color: C.accentWarm } });
      s.addText(m.t, { x: x + 0.15, y: 4.62, w: 2.5, h: 0.28, fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0 });
      s.addText(m.d, { x: x + 0.15, y: 4.92, w: 2.5, h: 0.3, fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
    });
  }
};
