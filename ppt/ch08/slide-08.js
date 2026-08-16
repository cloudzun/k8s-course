// slide-08.js — 8.2.4 / 8.2.5 两种方式对比与热更新原理
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 8, title: "两种方式对比与热更新原理" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "两种方式对比与热更新原理");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const mkA = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" });
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const hot = { fill: { color: C.bgAccent }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, bold: true, valign: "middle" };
    const rows = [
      [{ text: "维度", options: hdr }, { text: "卷挂载", options: hdr }, { text: "env 注入", options: hdr }],
      [{ text: "形态", options: mkF(0) }, { text: "键 → 文件", options: mkA(1) }, { text: "键 → 环境变量", options: mkA(0) }],
      [{ text: "应用读取", options: mkF(1) }, { text: "读文件（配置类应用）", options: mkA(0) }, { text: "读环境变量", options: mkA(1) }],
      [{ text: "热更新", options: { ...mkF(0), fill: { color: C.bgAccent } } }, { text: "改 CM 后文件自动更新，无需重启", options: hot }, { text: "改后需重启 Pod 才生效", options: hot }],
      [{ text: "场景", options: mkF(1) }, { text: "配置文件、整个 conf 目录", options: mkA(0) }, { text: "少量开关、连接参数", options: mkA(1) }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.2, w: 8.8, colW: [1.6, 3.6, 3.6],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.42,
    });
    s.addText("热更新的底层原理（重要）", {
      x: 0.6, y: 3.4, w: 8.8, h: 0.3,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    card(s, 0.6, 3.8, 4.3, 1.15, C.primary);
    s.addText("卷挂载 → 为什么能热更新", {
      x: 0.85, y: 3.88, w: 3.9, h: 0.32,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("kubelet 定期把 ConfigMap 同步到本地缓存目录，挂载是“软链 / 绑定挂载”——CM 变了，文件内容跟着变（应用是否重读文件取决于实现）", {
      x: 0.85, y: 4.24, w: 3.9, h: 0.65,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    card(s, 5.1, 3.8, 4.3, 1.15, C.accentWarm);
    s.addText("env → 为什么不能", {
      x: 5.35, y: 3.88, w: 3.9, h: 0.32,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0
    });
    s.addText("环境变量是“进程启动时”注入的——进程已经跑起来，改 env 进不到正在运行的进程，只能重启 Pod（新 Pod 用新值）", {
      x: 5.35, y: 4.24, w: 3.9, h: 0.65,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    calloutBar(s, "决策逻辑：需要频繁改配置、应用读文件 → 卷挂载（热更新）；少量一次性参数、应用读 env → env 注入。", 5.08);
  }
};
