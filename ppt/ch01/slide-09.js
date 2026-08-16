// slide-09.js — 1.1.4 镜像分层（堆叠图）
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 9, title: "镜像分层" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "镜像分层（Layer）");
    const layers = [
      { n: "应用层（App）", note: "← 可写层：容器运行时在此写", c: C.primary },
      { n: "RUN 指令层", note: "", c: "5B8DEA" },
      { n: "apt 安装层", note: "", c: "8FB0F0" },
      { n: "基础镜像层（OS）", note: "", c: "C9D8F6" },
    ];
    let y = 1.35;
    layers.forEach(l => {
      s.addShape("rect", { x: 2.3, y, w: 5.2, h: 0.8, fill: { color: l.c } });
      s.addText(l.n, {
        x: 2.55, y, w: 4.6, h: 0.8,
        fontSize: 16, fontFace: "Microsoft YaHei", bold: true,
        color: C.textLight, valign: "middle", margin: 0
      });
      if (l.note) {
        s.addText(l.note, {
          x: 7.6, y, w: 2.2, h: 0.8,
          fontSize: 13, fontFace: "Microsoft YaHei", color: C.primary,
          bold: true, valign: "middle", margin: 0
        });
      }
      y += 0.92;
    });
    s.addText("● 每层只存与上一层的差异（增量）——多容器共享底层 → 磁盘占用小、启动快", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    calloutBar(s, "容器运行时的写入发生在最上层可写层——删除容器即可写层消失（“容器无状态”的底层原因，第 4 章讲持久化）。", 4.95);
  }
};

