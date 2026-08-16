// slide-40.js — 2.8.1 kubectl 命令体系
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 40, title: "kubectl 命令体系" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "kubectl 命令体系");
    s.addText("统一格式：kubectl <动词> <资源类型> [名称] [选项]", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 14, fontFace: "Consolas", bold: true, color: C.primary, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "动词", options: hdr }, { text: "作用", options: hdr }],
      [{ text: "get", options: mkF(0) }, { text: "查看资源列表（-o wide 更多列、-o yaml 完整对象）", options: celA }],
      [{ text: "describe", options: mkF(1) }, { text: "查看详细状态 + 事件（排障首选）", options: celB }],
      [{ text: "apply", options: mkF(0) }, { text: "声明式创建/更新（幂等）——生产标准", options: celA }],
      [{ text: "run / create / delete", options: mkF(1) }, { text: "命令式快速操作 / 命令式对象创建 / 删除", options: celB }],
      [{ text: "explain", options: mkF(0) }, { text: "查看字段结构（写 yaml 的字典）", options: celA }],
      [{ text: "logs / exec / scale", options: mkF(1) }, { text: "日志 / 进入容器（v1.36 需 -- 分隔）/ 扩缩容", options: celB }],
      [{ text: "config", options: mkF(0) }, { text: "管理 kubeconfig / 上下文", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.6, w: 8.8, colW: [2.6, 6.2],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.46,
    });
    s.addText("常用选项：-n <ns> 指定命名空间 · -A 所有命名空间 · -l 标签筛选 · -f 从文件 · -w 持续监听", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Consolas", color: C.textMid, margin: 0
    });
  }
};
