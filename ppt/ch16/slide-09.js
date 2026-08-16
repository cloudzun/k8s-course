// slide-09.js — 16.2.2 Pod 层状态表 + 退出码解读
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 9, title: "Pod 层状态排查" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Pod 层：Pending / ImagePullBackOff / CrashLoopBackOff");
    s.addText("判断依据：kubectl get pods -o wide 看 STATUS", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "状态", options: hdr }, { text: "含义", options: hdr }, { text: "排查路径", options: hdr }],
      [{ text: "Pending", options: mkF(0) }, { text: "未调度/未就绪", options: celA }, { text: "describe 看 Events：资源/亲和/污点，或镜像拉取中", options: celA }],
      [{ text: "ImagePullBackOff", options: mkF(1) }, { text: "镜像拉不下来", options: celB }, { text: "Events：镜像名/标签/私有仓库凭据/网络", options: celB }],
      [{ text: "CrashLoopBackOff", options: mkF(0) }, { text: "容器反复崩溃", options: celA }, { text: "logs --previous 崩溃前输出；Last State 退出码", options: celA }],
      [{ text: "探针失败", options: mkF(1) }, { text: "被重启/被摘除", options: celB }, { text: "describe 事件：哪个探针、为什么失败", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.55, w: 8.8, colW: [1.9, 1.7, 5.2],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    s.addText("CrashLoop 退出码解读（第 4 章 §4.4.1）——先读退出码，再查日志", {
      x: 0.6, y: 4.2, w: 8.8, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 0.6, 4.6, 8.8, 0.95,
`0   = 正常退出（任务型用了 Always）
1   = 应用错误（看日志）
127 = 命令不存在（镜像里没有，如 busybox 无 bash）
137 = SIGKILL（OOM/被强杀）→ 查 limits 与 top
143 = SIGTERM（被优雅终止，可能正常下线）`, 9.5);
  }
};
