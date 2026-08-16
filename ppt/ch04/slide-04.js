// slide-04.js — 4.1.1/4.1.2 Pod 本质与共享边界
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 4, title: "Pod 本质与共享边界" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Pod 是“逻辑主机”：共享什么、为什么共享");
    // 左卡：设计动机
    card(s, 0.6, 1.3, 4.5, 3.6, C.primary);
    s.addText("设计动机：为什么必须“同机共存”", {
      x: 0.86, y: 1.42, w: 4.0, h: 0.4,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const lefts = [
      "主应用 + 日志采集器：同机才能读日志文件",
      "Web 服务 + 本地代理（Envoy）：同机才能拦截流量",
      "应用 + 配置刷新器：定期拉配置写入共享目录",
    ];
    lefts.forEach((t, i) => {
      s.addText("▸ " + t, {
        x: 0.9, y: 1.95 + i * 0.52, w: 4.0, h: 0.5,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("拆成独立 Pod 的代价", {
      x: 0.9, y: 3.62, w: 4.0, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.gold, margin: 0
    });
    s.addText("IP 不同（无法 localhost）· 存储不共享 · 生命周期不同步——调度器把整个 Pod 当作整体调度到同一节点", {
      x: 0.9, y: 3.98, w: 4.0, h: 0.8,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
    });
    // 右卡：共享边界表格
    card(s, 5.3, 1.3, 4.1, 3.6, C.accent);
    s.addText("Pod 内共享什么", {
      x: 5.56, y: 1.42, w: 3.6, h: 0.4,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "共享项", options: hdr }, { text: "含义", options: hdr }],
      [{ text: "网络命名空间", options: mkF(0) }, { text: "一个 Pod IP + 端口空间，容器间用 localhost 互访", options: celA }],
      [{ text: "UTS 命名空间", options: mkF(1) }, { text: "共享主机名", options: celA }],
      [{ text: "存储卷", options: mkF(0) }, { text: "Pod 级卷可被所有容器挂载（如共享日志目录）", options: celA }],
      [{ text: "生命周期", options: mkF(1) }, { text: "一起调度、一起终止", options: celA }],
    ];
    s.addTable(rows, {
      x: 5.56, y: 1.92, w: 3.6, colW: [1.3, 2.3],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.52, fontFace: "Microsoft YaHei"
    });
    s.addText("不共享：PID 命名空间（默认）、cgroups（各自独立资源限制）", {
      x: 5.56, y: 4.55, w: 3.6, h: 0.32,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    s.addText("Pod 的 IP 属于 pause 沙箱——“删 Pod = 整个 Pod 消亡”的技术根源", {
      x: 5.56, y: 4.88, w: 3.6, h: 0.32,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
