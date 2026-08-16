// slide-18.js — 16.6 实验演练指引
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "labs", index: 18, title: "实验演练指引" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "实验演练指引：实验 10“故障排查”（5 个 Lab）", C.bgLight);
    const labs = [
      { t: "Lab 1 排查三板斧", d: "describe / logs / events 的标准动作（§16.1.2 的实操）" },
      { t: "Lab 2 CrashLoopBackOff 排查", d: "bad-image（ImagePullBackOff）+ bad-cmd（CrashLoop）→ 退出码定位（§16.2.2）" },
      { t: "Lab 3 节点 NotReady 排查", d: "kubelet 服务与日志定位（§16.2.1）" },
      { t: "Lab 4 Service/DNS 排查", d: "selector 错 → Endpoints 空 → 修复闭环（§16.2.4）" },
      { t: "Lab 5 可靠性演练", d: "滚动更新 0/1 调优 + preStop 优雅下线 + PDB 计算（§16.4）" },
    ];
    labs.forEach((L, i) => {
      const y = 1.35 + i * 0.72;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.62, fill: { color: C.bgWhite }, line: { color: C.border, width: 1 } });
      numBadge(s, 0.75, y + 0.09, i + 1, C.primary);
      s.addText(L.t, {
        x: 1.35, y: y + 0.04, w: 3.3, h: 0.3,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(L.d, {
        x: 1.35, y: y + 0.32, w: 7.8, h: 0.28,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
      });
    });
    s.addShape("rect", { x: 0.6, y: 5.0, w: 8.8, h: 0.5, fill: { color: C.bgAccent } });
    s.addShape("rect", { x: 0.6, y: 5.0, w: 0.06, h: 0.5, fill: { color: C.accent } });
    s.addText("教学建议：Lab 1-4 是排障（出事怎么查），Lab 5 是可靠性（怎么不出事）——排障 + 可靠性 = 域 5 的完整能力", {
      x: 0.9, y: 5.0, w: 8.3, h: 0.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      valign: "middle", margin: 0
    });
  }
};
