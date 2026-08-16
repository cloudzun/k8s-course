// slide-08.js — 19.2 域 4 存储 + 域 5 故障排查（备考重心）
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 8, title: "域 4 与域 5 考点" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "域 4 存储（10%） · 域 5 故障排查（30%——第一重）", C.bgLight);
    const mkTitle = (t, x) => {
      s.addText(t, {
        x, y: 1.1, w: 4.3, h: 0.3,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
    };
    mkTitle("域 4 存储（10%）", 0.6);
    mkTitle("域 5 故障排查（30%）", 5.1);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgCard : C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    const mkL = (i) => ({ fill: { color: i % 2 ? C.bgCard : C.bgWhite }, fontFace: "Consolas", fontSize: 10, color: C.accent, valign: "middle" });
    const rowsL = [
      [{ text: "考点 / 机制", options: hdr }, { text: "教材/实验", options: hdr }],
      [{ text: "PV/PVC：静态绑定（容量/访问模式/SC 匹配）、storageClassName: \"\"", options: mkF(0) }, { text: "第10章/实验08", options: mkL(0) }],
      [{ text: "StorageClass：provisioner、默认类、WaitForFirstConsumer", options: mkF(1) }, { text: "第10章/实验08", options: mkL(1) }],
      [{ text: "卷：emptyDir/hostPath 的边界", options: mkF(0) }, { text: "第10章/实验08", options: mkL(0) }],
    ];
    const rowsR = [
      [{ text: "考点 / 机制", options: hdr }, { text: "教材/实验", options: hdr }],
      [{ text: "三板斧：describe（Events）/ logs（--previous）/ events", options: mkF(0) }, { text: "15/16章/实验10", options: mkL(0) }],
      [{ text: "典型故障：CrashLoop（退出码）、ImagePullBackOff、NotReady（kubelet）、Service/DNS、PVC、Forbidden", options: mkF(1) }, { text: "第16章/实验10", options: mkL(1) }],
      [{ text: "排障纪律：报错即答案、先恢复再排查、一次只改一个", options: mkF(0) }, { text: "第16章", options: mkL(0) }],
    ];
    s.addTable(rowsL, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.5, w: 4.3, colW: [3.05, 1.25],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.6,
    });
    s.addTable(rowsR, {
      fontFace: "Microsoft YaHei",
      x: 5.1, y: 1.5, w: 4.3, colW: [3.05, 1.25],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.6,
    });
    calloutBar(s, "备考重心：域 5（30%）+ 域 1（25%）= 55%——实验 10 与实验 01/12 的实操价值最高。", 4.6);
  }
};
