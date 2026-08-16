// slide-08.js — 4.2.2 command / args
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 8, title: "command / args 覆盖规则" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "命令与参数：command / args", C.bgLight);
    s.addText("镜像默认命令来自 Dockerfile（ENTRYPOINT + CMD），Kubernetes 可以覆盖：", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "K8s 字段", options: hdr }, { text: "覆盖 Dockerfile", options: hdr }, { text: "作用", options: hdr }],
      [{ text: "command", options: mkF(0) }, { text: "ENTRYPOINT", options: celA }, { text: "替换启动程序", options: celA }],
      [{ text: "args", options: mkF(1) }, { text: "CMD", options: celA }, { text: "替换启动参数", options: celA }],
    ];
    s.addTable(rows, {
      x: 0.6, y: 1.6, w: 8.8, colW: [2.0, 2.6, 4.2],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.5, fontFace: "Microsoft YaHei"
    });
    s.addText("覆盖规则（容易混淆，重点记忆）", {
      x: 0.6, y: 3.35, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    const rules = [
      "只写 args → 程序不变（用镜像 ENTRYPOINT），只换参数",
      "只写 command → 程序换掉，参数用镜像默认 CMD（必要时同时清掉 args）",
      "command + args 都写 → 程序和参数全换",
    ];
    rules.forEach((r, i) => {
      const y = 3.75 + i * 0.45;
      numBadge(s, 0.7, y + 0.02, i + 1);
      s.addText(r, {
        x: 1.35, y, w: 8.0, h: 0.4,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("为什么需要覆盖：同一镜像跑不同任务（busybox 既当“睡眠容器”又当“一次性任务”）、调试进 shell、镜像默认命令在集群环境不适用。kubectl 命令式创建用 --command -- <命令>（v1.36 必须带分隔符）", {
      x: 0.6, y: 5.15, w: 8.8, h: 0.4,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
