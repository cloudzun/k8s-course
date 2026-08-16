// slide-17.js — 4.4.2 探针配合流程与参数
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 17, title: "探针配合流程与参数" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "三探针的配合关系与参数速查");
    const boxes = [
      { t: "容器启动", note: "" },
      { t: "startupProbe\n通过？", note: "否 → 继续等待\n不查其他探针" },
      { t: "readinessProbe\n通过？", note: "否 → 从 Service 摘除\n流量不进入" },
      { t: "livenessProbe\n持续检查", note: "失败 → 重启容器\n回到起点（自愈）" },
    ];
    const fills = ["E8F4FD", "FFF3E0", "E8F8E8", "FDECEA"];
    boxes.forEach((b, i) => {
      const x = 0.6 + i * 2.32;
      s.addShape("rect", { x, y: 1.4, w: 2.0, h: 0.85, fill: { color: fills[i] }, line: { color: C.primary, width: 1 } });
      s.addText(b.t, {
        x: x + 0.05, y: 1.48, w: 1.9, h: 0.7,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
      });
      s.addText(b.note, {
        x: x + 0.1, y: 2.35, w: 1.9, h: 0.55,
        fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0
      });
      if (i < 3) {
        s.addText("→", {
          x: x + 2.0, y: 1.5, w: 0.32, h: 0.6,
          fontSize: 16, fontFace: "Microsoft YaHei", color: C.primary, align: "center", valign: "middle", margin: 0
        });
      }
    });
    s.addText("readiness 通过后才接流量；liveness 失败 → 重启 → 回到 startup 重新走流程（循环）", {
      x: 0.6, y: 3.0, w: 8.8, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.accent, bold: true, align: "center", margin: 0
    });
    card(s, 0.6, 3.5, 8.8, 1.35, C.accent);
    s.addText("探针参数（速查）", {
      x: 0.9, y: 3.62, w: 8.2, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("initialDelaySeconds 启动后等多久才第一次查 · periodSeconds 探测间隔 · timeoutSeconds 单次超时\nfailureThreshold 连续几次失败才判定失败 · successThreshold 连续几次成功才判定成功", {
      x: 0.9, y: 4.0, w: 8.2, h: 0.75,
      fontSize: 11.5, fontFace: "Consolas", color: C.textDark, lineSpacingMultiple: 1.3, margin: 0
    });
    s.addText("读图要点：startup 通过前另外两个探针都不查（慢启动保护）；readiness 失败只摘流量；liveness 失败才重启——三个探针的失败后果各不相同", {
      x: 0.6, y: 5.1, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
