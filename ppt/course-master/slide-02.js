// slide-02.js — 课程目录 (1/2)
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "toc", index: 2, title: "课程目录 1/2" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "课程目录（第一部分：基础与核心）");
    const items = [
      ["01", "容器与云原生基础", "无强制实验"],
      ["02", "Kubernetes 概述与架构", "实验 01 前置"],
      ["03", "集群安装与配置", "实验 01 全部"],
      ["04", "Pod 与容器", "实验 02"],
      ["05", "工作负载控制器", "实验 03"],
      ["06", "调度与 Pod 放置", "实验 04"],
      ["07", "扩缩容与资源治理", "实验 05"],
      ["08", "配置管理", "实验 06"],
      ["09", "服务、负载均衡与网络", "实验 07"],
      ["10", "存储", "实验 08"],
    ];
    items.forEach((it, i) => {
      const y = 1.35 + i * 0.42;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.36, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.05, h: 0.36, fill: { color: C.primary } });
      s.addText(it[0], { x: 0.8, y: y + 0.02, w: 0.6, h: 0.32, fontSize: 11.5, fontFace: "Consolas", bold: true, color: C.primary, margin: 0 });
      s.addText("第 " + it[0] + " 章  " + it[1], { x: 1.5, y: y + 0.02, w: 5.6, h: 0.32, fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
      s.addText(it[2], { x: 7.2, y: y + 0.02, w: 2.1, h: 0.32, fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, align: "right", margin: 0 });
    });
  }
};
