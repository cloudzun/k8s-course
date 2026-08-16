// slide-03.js — 课程目录 (2/2)
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "toc", index: 3, title: "课程目录 2/2" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "课程目录（第二部分：安全、运维与综合）", C.bgLight);
    const items = [
      ["11", "认证与授权", "实验 09"],
      ["12", "准入与容器安全", "实验 09"],
      ["13", "集群安全加固", "实验 09"],
      ["14", "集群维护与运维", "实验 12"],
      ["15", "可观测性：监控、日志与事件", "实验 05 / 14"],
      ["16", "故障排查与可靠性", "实验 10"],
      ["17", "Helm 与 Kustomize", "实验 13"],
      ["18", "综合实战：应用发布全流程", "实验 11"],
      ["19", "CKA 考试指南", "全书重刷"],
    ];
    items.forEach((it, i) => {
      const y = 1.35 + i * 0.42;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.36, fill: { color: i % 2 ? C.bgLight : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.05, h: 0.36, fill: { color: C.primary } });
      s.addText(it[0], { x: 0.8, y: y + 0.02, w: 0.6, h: 0.32, fontSize: 11.5, fontFace: "Consolas", bold: true, color: C.primary, margin: 0 });
      s.addText("第 " + it[0] + " 章  " + it[1], { x: 1.5, y: y + 0.02, w: 5.6, h: 0.32, fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
      s.addText(it[2], { x: 7.2, y: y + 0.02, w: 2.1, h: 0.32, fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, align: "right", margin: 0 });
    });
    s.addShape("rect", { x: 0.6, y: 5.1, w: 8.8, h: 0.4, fill: { color: C.bgBlue } });
    s.addText("实验手册：实验 01-14（93 个 Lab，必做 67 / 推荐 19 / 可选·进阶 7）", {
      x: 0.85, y: 5.1, w: 8.3, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.primary, bold: true, valign: "middle", margin: 0
    });
  }
};
