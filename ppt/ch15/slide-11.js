// slide-11.js — 15.3.1 kubectl logs 的边界 + 15.3.2 stdout 是标准
const { C, sectionTitle, codeBlock, warnBar, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 11, title: "kubectl logs 与 stdout 标准" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "kubectl logs 的边界 · stdout 是标准", C.bgLight);
    codeBlock(s, 0.6, 1.42, 8.8, 0.85,
      "kubectl logs <pod>               # 当前容器日志\nkubectl logs <pod> -c <容器>      # 多容器指定容器\nkubectl logs <pod> --previous    # 崩溃前的日志（排障核心）", 12);
    warnBar(s, "注意：容器重启后 kubectl logs 只能看到“当前容器”的日志——看上一个（崩溃的）实例要用 --previous；容器删除 = 日志消失（kubectl 层面）", 2.45);
    s.addText("日志架构：stdout 是标准", {
      x: 0.6, y: 3.1, w: 8.8, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("▸ 容器把日志写到 stdout/stderr → 容器运行时（containerd）捕获并轮转 → 每节点落盘 /var/log/containers/（kubelet 供 kubectl logs 读取）", {
      x: 0.6, y: 3.55, w: 8.8, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("▸ 应用不需要写文件——写文件（普通文件卷）反而麻烦：轮转、清理、收集都要自己管", {
      x: 0.6, y: 4.0, w: 8.8, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    calloutBar(s, "打日志 = 打 stdout——K8s 应用的日志铁律：镜像里配好日志输出到 stdout，后面的收集才顺。", 4.75);
  }
};
