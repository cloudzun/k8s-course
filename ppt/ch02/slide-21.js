// slide-21.js — 2.3.4 实例走查：Deployment 保证 3 副本
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 21, title: "实例走查：3 副本" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "实例走查：Deployment 如何保证“3 个副本”", C.bgLight);
    const steps = [
      { t: "用户 apply", d: "kubectl apply（期望 replicas=3）" },
      { t: "Deployment 控制器", d: "创建 ReplicaSet（子控制器）" },
      { t: "ReplicaSet 控制器", d: "创建 3 个 Pod 对象" },
      { t: "Scheduler", d: "绑定 Pod → 各节点" },
      { t: "kubelet", d: "拉起容器，上报 Running" },
      { t: "自愈", d: "某 Pod 崩溃 → RS 观察偏离 → 补建 1 个" },
    ];
    steps.forEach((st, i) => {
      const x = 0.6 + (i % 3) * 3.05;
      const y = 1.4 + Math.floor(i / 3) * 1.85;
      s.addShape("rect", { x, y, w: 2.85, h: 1.6, fill: { color: C.bgWhite }, shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.08 } });
      s.addShape("rect", { x, y, w: 0.06, h: 1.6, fill: { color: i === 5 ? C.accentWarm : C.primary } });
      numBadge(s, x + 0.12, y + 0.12, i + 1);
      s.addText(st.t, {
        x: x + 0.7, y: y + 0.12, w: 2.0, h: 0.4,
        fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(st.d, {
        x: x + 0.15, y: y + 0.6, w: 2.55, h: 0.9,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.3, margin: 0, valign: "top"
      });
    });
    s.addText("职责分层：Deployment 管 RS → RS 管数量 → Scheduler 管落点 → kubelet 管运行；一切通过 apiserver，没有组件直连", {
      x: 0.6, y: 5.1, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.primary, bold: true,
      align: "center", margin: 0
    });
  }
};
