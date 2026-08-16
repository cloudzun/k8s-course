// slide-16.js — 4.4.2 三种探针各管一件事
const { C, sectionTitle, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 16, title: "三种探针" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "三种探针：各管一件事", C.bgLight);
    const cols = [
      { t: "readinessProbe", n: "就绪探针“能用了吗？”", d: "决定是否把流量发给这个 Pod（Service 后端列表是否包含它）", f: "失败 → 从 Service 摘除（Pod 不重启）", e: "场景：启动慢、要加载缓存 / 连数据库" },
      { t: "livenessProbe", n: "存活探针“还活着吗？”", d: "决定是否重启这个容器（自愈机制）", f: "失败 → kubelet 杀容器并按重启策略重建", e: "场景：进程活着但业务卡死（死锁 / 泄漏）" },
      { t: "startupProbe", n: "启动探针“开始检查了吗？”", d: "决定 liveness / readiness 什么时候开始检查", f: "启动阶段只查它 → 解决慢启动被误杀", e: "场景：JVM 启动、加载大模型、冷启动慢" },
    ];
    cols.forEach((c, i) => {
      const x = 0.6 + i * 3.0;
      card(s, x, 1.3, 2.8, 2.7, [C.primary, C.accentWarm, C.accent][i]);
      s.addText(c.t, {
        x: x + 0.22, y: 1.42, w: 2.4, h: 0.35,
        fontSize: 13, fontFace: "Consolas", bold: true, color: C.primary, margin: 0
      });
      s.addText(c.n, {
        x: x + 0.22, y: 1.8, w: 2.4, h: 0.32,
        fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
      });
      s.addText(c.d, {
        x: x + 0.22, y: 2.18, w: 2.4, h: 0.7,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
      });
      s.addText(c.f, {
        x: x + 0.22, y: 2.95, w: 2.4, h: 0.6,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.accentWarm, bold: true, valign: "top", margin: 0
      });
      s.addText(c.e, {
        x: x + 0.22, y: 3.6, w: 2.4, h: 0.35,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
      });
    });
    warnBar(s, "最小化原则：只配必要的——readiness 大多数有流量的服务要配；liveness 有死锁 / 泄漏风险时配；startup 启动超过默认 10s 必须配（防被 liveness 误杀）。", 4.25);
    s.addText("（实验 02 Lab 8：readiness 摘流量、liveness 重启，亲眼验证探针行为）", {
      x: 0.6, y: 4.95, w: 8.8, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
