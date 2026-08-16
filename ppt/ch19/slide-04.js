// slide-04.js — 19.1 考试形式与环境
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 4, title: "考试形式与环境" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "考试概览");
    s.addText("考试形式", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.32,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "项目", options: hdr }, { text: "说明", options: hdr }],
      [{ text: "形式", options: mkF(0) }, { text: "在线实操：真实集群终端，不是选择题", options: celA }],
      [{ text: "时长", options: mkF(1) }, { text: "2 小时 · 约 15-20 道题 · 每题一个集群场景", options: celB }],
      [{ text: "环境", options: mkF(0) }, { text: "浏览器内终端 + 多个预置集群（不同 context）", options: celA }],
      [{ text: "网络", options: mkF(1) }, { text: "无外网：镜像/文档都取不到——靠记忆和命令补全", options: celB }],
      [{ text: "评分", options: mkF(0) }, { text: "按操作结果（对象是否正确创建/配置）——部分得分", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.48, w: 8.8, colW: [1.3, 7.5],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.4,
    });
    s.addText("环境要点与评分思路", {
      x: 0.6, y: 4.02, w: 8.8, h: 0.3,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const pts = [
      "多集群：每题开头 kubectl config use-context <目标> 切换——答错集群 = 白做",
      "kubectl 补全默认可用 + vi/nano 编辑器；无外网不能用在线文档",
      "按“期望对象是否达标”给分——partial credit 存在，做一半有一半分",
      "时间策略：每题平均 7 分钟，卡住 5 分钟就跳过，回头再补",
    ];
    pts.forEach((p, i) => {
      const y = 4.36 + i * 0.26;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.16, h: 0.16, fill: { color: C.accent } });
      s.addText(p, {
        x: 0.95, y, w: 8.4, h: 0.24,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    calloutBar(s, "无外网环境：kubectl explain 是唯一字典——所有命令与字段结构靠记忆 + 命令补全。", 5.1);
  }
};
