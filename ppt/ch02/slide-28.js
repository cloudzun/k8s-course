// slide-28.js — 2.5.1 kubelet
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 28, title: "kubelet" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "kubelet：节点上的“Kubernetes 代理”");
    s.addText("管理该节点所有 Pod 的生命周期，并持续向控制面上报节点状态", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const steps = [
      { t: "读取 Pod 定义", d: "apiserver 通知“Pod X 调度到本节点”→ 读取 spec" },
      { t: "调用容器运行时", d: "通过 CRI：建沙箱（pause）、拉镜像、起容器、挂卷配网" },
      { t: "持续监控", d: "执行探针（liveness 重启 / readiness 摘流量）、采集资源（cAdvisor）" },
      { t: "心跳上报", d: "每 10s 上报；超 40s 无心跳 → 控制面判 NotReady" },
    ];
    steps.forEach((st, i) => {
      const y = 1.6 + i * 0.78;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(st.t, {
        x: 1.35, y, w: 2.6, h: 0.65,
        fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, valign: "middle", margin: 0
      });
      s.addText(st.d, {
        x: 4.0, y, w: 5.4, h: 0.65,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addShape("rect", { x: 0.6, y: 4.75, w: 8.8, h: 0.6, fill: { color: C.bgCard } });
    s.addShape("rect", { x: 0.6, y: 4.75, w: 0.05, h: 0.6, fill: { color: C.accentWarm } });
    s.addText("关键点：kubelet 是节点侧唯一与 apiserver 对话的人；节点 Ready 与否取决于 kubelet 心跳；端口 10250；静态 Pod 不经调度器", {
      x: 0.85, y: 4.75, w: 8.3, h: 0.6,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
  }
};
