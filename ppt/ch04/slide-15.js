// slide-15.js — 4.4.1/4.4.5 容器状态、退出码与重启策略
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 15, title: "容器状态与重启策略" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "容器状态、退出码与重启策略");
    const states = [
      { t: "Waiting", d: "正在准备：拉镜像、创建等" },
      { t: "Running", d: "正在运行" },
      { t: "Terminated", d: "已退出：正常 / 异常，含退出码" },
    ];
    states.forEach((c, i) => {
      const x = 0.6 + i * 3.0;
      card(s, x, 1.3, 2.8, 1.15, [C.secondary, C.accent, C.primary][i]);
      s.addText(c.t, {
        x: x + 0.22, y: 1.42, w: 2.4, h: 0.35,
        fontSize: 13.5, fontFace: "Consolas", bold: true, color: C.primary, margin: 0
      });
      s.addText(c.d, {
        x: x + 0.22, y: 1.82, w: 2.4, h: 0.5,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addShape("rect", { x: 0.6, y: 2.7, w: 8.8, h: 0.55, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 2.7, w: 0.05, h: 0.55, fill: { color: C.primary } });
    s.addText("退出码排障必读：0 = 正常退出；非 0 = 异常（1 通用错误）；137 = SIGKILL（先怀疑内存超限 OOM）；143 = SIGTERM", {
      x: 0.85, y: 2.7, w: 8.3, h: 0.55,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    s.addText("restartPolicy：容器失败 / 退出后要不要重启（Pod 级配置）", {
      x: 0.6, y: 3.45, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "策略", options: hdr }, { text: "行为", options: hdr }, { text: "适用", options: hdr }],
      [{ text: "Always（默认）", options: mkF(0) }, { text: "任何退出都重启", options: celA }, { text: "Deployment 等长期服务", options: celB }],
      [{ text: "OnFailure", options: mkF(1) }, { text: "只有异常退出（非 0）才重启", options: celA }, { text: "Job 等任务", options: celB }],
      [{ text: "Never", options: mkF(0) }, { text: "绝不重启", options: celA }, { text: "一次性批处理任务", options: celB }],
    ];
    s.addTable(rows, {
      x: 0.6, y: 3.85, w: 8.8, colW: [2.2, 3.4, 3.2],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.42, fontFace: "Microsoft YaHei"
    });
  }
};
