// slide-05.js — 16.1.2 证据链思维
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 5, title: "证据链思维" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "证据链思维：现象 → 事件 → 日志 → 根因", C.bgLight);
    s.addText("取证顺序就是证据链——不要一上来乱敲命令", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const steps = [
      { t: "① 事件", v: "集群视角", c: "kubectl get events -A\nkubectl describe xxx", d: "“发生了什么”\nScheduled / Pulled / Unhealthy / Killing…" },
      { t: "② 日志", v: "应用视角", c: "kubectl logs <pod>\n--previous", d: "“应用说了什么”\n报错堆栈 / 连接失败…" },
      { t: "③ 指标", v: "资源视角", c: "kubectl top\npod / node", d: "“资源佐证”\n内存超限 / OOM…" },
    ];
    steps.forEach((st, i) => {
      const x = 0.6 + i * 3.05;
      card(s, x, 1.55, 2.9, 2.7, i === 1 ? C.accent : C.primary);
      s.addText(st.t, {
        x: x + 0.15, y: 1.7, w: 2.6, h: 0.4,
        fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(st.v, {
        x: x + 0.15, y: 2.1, w: 2.6, h: 0.32,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.accentWarm, margin: 0
      });
      s.addText(st.c, {
        x: x + 0.15, y: 2.45, w: 2.6, h: 0.75,
        fontSize: 10.5, fontFace: "Consolas", color: C.textDark,
        lineSpacingMultiple: 1.2, margin: 0, valign: "top"
      });
      s.addText(st.d, {
        x: x + 0.15, y: 3.45, w: 2.6, h: 0.7,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid,
        lineSpacingMultiple: 1.2, margin: 0, valign: "top"
      });
    });
    s.addShape("rect", { x: 0.6, y: 4.5, w: 8.8, h: 0.55, fill: { color: C.bgAccent } });
    s.addShape("rect", { x: 0.6, y: 4.5, w: 0.06, h: 0.55, fill: { color: C.accent } });
    s.addText("根因定位 → 修复 → 验证", {
      x: 0.9, y: 4.5, w: 8.2, h: 0.55,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.accent,
      valign: "middle", margin: 0
    });
    calloutBar(s, "describe 的 Events 段永远是最快的切入点——90% 的问题在事件 + 日志两步内定位。", 5.12);
  }
};
