// slide-21.js — 4.5.1 requests 与 limits
const { C, sectionTitle, card, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 21, title: "requests 与 limits" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "requests 与 limits：两个不同的机制");
    card(s, 0.6, 1.3, 4.5, 1.6, C.primary);
    s.addText("requests（请求量）— 调度承诺", {
      x: 0.86, y: 1.42, w: 4.0, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("告诉调度器“这个容器至少需要多少”——决定 Pod 落在哪个节点（scheduler 过滤依据）", {
      x: 0.86, y: 1.85, w: 4.0, h: 1.0,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
    });
    card(s, 5.3, 1.3, 4.1, 1.6, C.accent);
    s.addText("limits（上限）— 运行时限制", {
      x: 5.56, y: 1.42, w: 3.6, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("告诉 kubelet“最多能用多少”——决定容器能跑多快 / 会不会被杀（运行时执行）", {
      x: 5.56, y: 1.85, w: 3.6, h: 1.0,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
    });
    const code = [
      "requests: CPU 0.5 / 内存 256Mi   ← 调度器：找剩余资源 ≥ 这个值的节点",
      "limits:   CPU 1 / 内存 512Mi    ← kubelet：容器最多用这么多",
    ].join("\n");
    codeBlock(s, 0.6, 3.1, 8.8, 0.85, code, 10.5);
    card(s, 0.6, 4.15, 8.8, 0.55, C.accentWarm);
    s.addText("CPU 可压缩 → 超限节流（throttling）跑慢点不致命　|　内存不可压缩 → 超限 OOM 被杀（SIGKILL，退出码 137）", {
      x: 0.9, y: 4.15, w: 8.2, h: 0.55,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
    calloutBar(s, "生产底线：内存 limits 必须设——防泄漏容器拖垮整台节点（影响同节点其他 Pod）；CPU limit 可选，只是不节流。");
    s.addText("（实验 02 Lab 10：requests / limits 生效、超限节流与 OOM）", {
      x: 0.6, y: 5.3, w: 8.8, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
