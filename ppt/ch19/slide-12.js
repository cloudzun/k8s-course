// slide-12.js — 19.4.1 v1.36 语法差异（表格）+ 19.4.3 心理与操作
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 12, title: "v1.36 语法差异" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "v1.36 语法差异（本课程基线实测）");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 10, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "旧习惯（教程常见）", options: hdr }, { text: "v1.36 正确做法", options: hdr }, { text: "后果", options: hdr }],
      [{ text: "kubectl exec -it pod bash", options: mkF(0) }, { text: "kubectl exec -it pod -- bash", options: celA }, { text: "必须 -- 分隔", options: celB }],
      [{ text: "kubectl autoscale --cpu-percent=50", options: mkF(1) }, { text: "--cpu-percent 已弃用（告警但可用）", options: celB }, { text: "参数弃用", options: celA }],
      [{ text: "kubectl run --requests/--limits", options: mkF(0) }, { text: "不支持（yaml 唯一方式）", options: celA }, { text: "unknown flag", options: celB }],
      [{ text: "describe secret 找 SA token", options: mkF(1) }, { text: "kubectl create token <sa>", options: celB }, { text: "v1.24+ 无长期 token", options: celA }],
      [{ text: "kubectl run 创建 Deployment", options: mkF(0) }, { text: "kubectl run 创建 Pod", options: celA }, { text: "语义更准确", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.45, w: 8.8, colW: [2.9, 3.5, 2.4],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.42,
    });
    s.addText("心理与操作", {
      x: 0.6, y: 4.12, w: 8.8, h: 0.3,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const pts = [
      "不要慌：报错先读（报错即答案，第 16 章）；kubectl describe 是万能排障",
      "多集群别串：每题的 context 切换是纪律",
      "保存不丢：yaml 文件放当前目录即可——对象在集群里就计分",
    ];
    pts.forEach((p, i) => {
      const y = 4.48 + i * 0.36;
      s.addShape("ellipse", { x: 0.7, y: y + 0.04, w: 0.15, h: 0.15, fill: { color: C.accentWarm } });
      s.addText(p, {
        x: 0.95, y, w: 8.4, h: 0.32,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
  }
};
