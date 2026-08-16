// slide-06.js — 14.2.1 维护窗口三步曲
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "flow", index: 6, title: "维护窗口三步曲" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "维护窗口三步曲（流程化）", C.bgLight);
    s.addText("第 6 章 §6.5 讲过机制，运维视角是完整流程：先挡新 → 再腾空 → 后恢复（实验 12 · Lab 3 节点维护演练）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const steps = [
      { t: "① cordon node2", d: "隔离：新 Pod 不调度", strip: C.primary },
      { t: "② drain node2", d: "排空：业务优雅迁移，PDB 约束", strip: C.accentWarm },
      { t: "③ 执行维护", d: "换硬件 / 重启", strip: C.secondary },
      { t: "④ uncordon node2", d: "恢复调度", strip: C.accent },
    ];
    steps.forEach((st, i) => {
      const x = 0.7 + i * 2.25;
      s.addShape("rect", { x, y: 1.7, w: 1.85, h: 1.55, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
      s.addShape("rect", { x, y: 1.7, w: 0.06, h: 1.55, fill: { color: st.strip } });
      s.addText(st.t, {
        x: x + 0.1, y: 1.8, w: 1.65, h: 0.4,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(st.d, {
        x: x + 0.1, y: 2.25, w: 1.65, h: 0.9,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
      if (i < 3) {
        s.addText("→", {
          x: x + 1.85, y: 2.25, w: 0.4, h: 0.4,
          fontSize: 14, fontFace: "Microsoft YaHei", color: C.accentWarm,
          align: "center", valign: "middle", margin: 0
        });
      }
    });
    card(s, 0.6, 3.55, 8.8, 1.3, C.primary);
    s.addText("为什么分三步", {
      x: 0.9, y: 3.65, w: 8.2, h: 0.35,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("cordon 与 drain 分开是为了平滑——先挡新流量（存量业务不受影响），再逐台腾空（配合 PDB 保证可用性），维护完恢复；“排空 = 业务无感迁移”依赖第 4 章的优雅终止与第 6 章的 PDB（两条链路的汇合点）。", {
      x: 0.9, y: 4.05, w: 8.2, h: 0.75,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addText("验证点：drain 后确认业务全在别处；uncordon 后确认节点 Ready——每一步都有验证", {
      x: 0.6, y: 5.0, w: 8.8, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
