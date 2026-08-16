// slide-16.js — 15.6 排障入口：三支柱怎么配合
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 16, title: "排障入口：三支柱配合" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "排障入口：三支柱怎么配合", C.bgLight);
    s.addText("用第 16 章会展开的方法论，提前看一眼三支柱的配合——从现象出发，三步定位", { x: 0.6, y: 1.12, w: 8.8, h: 0.35, fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    const rows = [
      { t: "故障现象：应用 502——从现象出发", c: C.accentWarm },
      { t: "① 事件：kubectl get events -A →“Unhealthy”（readiness 探针失败）→ 定位到某个 Pod", c: C.primary },
      { t: "② 日志：kubectl logs <pod> --previous →“OutOfMemoryError”→ 定位根因方向", c: C.primary },
      { t: "③ 指标：kubectl top pod → 内存 800Mi / limit 512Mi（OOM 佐证）→ 确认根因", c: C.primary },
      { t: "修复：调内存 limits（第 4 章）→ 验证", c: C.accent },
    ];
    rows.forEach((r, i) => {
      const y = 1.5 + i * 0.58;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.52, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.06, h: 0.52, fill: { color: r.c } });
      s.addText(r.t, { x: 0.9, y, w: 8.2, h: 0.52, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0 });
    });
    s.addText("分工记忆：事件指方向、日志给细节、指标做佐证——第 16 章排障方法论的数据侧", { x: 0.6, y: 4.45, w: 8.8, h: 0.4, fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0 });
    s.addText("（实验 10 Lab 1：排查三板斧——describe（事件）/ logs / events 的标准动作）", { x: 0.6, y: 4.95, w: 8.8, h: 0.3, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
  }
};
