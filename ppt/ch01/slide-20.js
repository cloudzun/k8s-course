// slide-20.js — 1.4.2 CNCF 项目全景（表格）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 20, title: "CNCF 项目全景" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "CNCF 项目全景（与本课程相关）");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.textDark, valign: "middle" };
    const mkFirst = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 12, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "层次", options: hdr }, { text: "代表项目", options: hdr }, { text: "本课程对应", options: hdr }],
      [{ text: "编排", options: mkFirst(0) }, { text: "Kubernetes", options: celA }, { text: "全书", options: celA }],
      [{ text: "容器运行时", options: mkFirst(1) }, { text: "containerd / CRI-O", options: celB }, { text: "第 1、3 章", options: celB }],
      [{ text: "网络", options: mkFirst(0) }, { text: "Calico / Cilium / Flannel", options: celA }, { text: "第 9 章（实验 07）", options: celA }],
      [{ text: "存储", options: mkFirst(1) }, { text: "Rook / Longhorn", options: celB }, { text: "第 10 章（实验 08）", options: celB }],
      [{ text: "可观测性", options: mkFirst(0) }, { text: "Prometheus / Grafana", options: celA }, { text: "第 15 章", options: celA }],
      [{ text: "服务网格", options: mkFirst(1) }, { text: "Istio / Linkerd", options: celB }, { text: "进阶（本课程略）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.3, w: 8.8, colW: [2.0, 4.0, 2.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.55,
    });
    s.addShape("rect", { x: 0.6, y: 5.0, w: 8.8, h: 0.4, fill: { color: C.bgBlue } });
    s.addText("Kubernetes 是 CNCF 最大的毕业项目——本课程全部围绕它展开", {
      x: 0.85, y: 5.0, w: 8.3, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.primary, bold: true, valign: "middle", margin: 0
    });
  }
};
