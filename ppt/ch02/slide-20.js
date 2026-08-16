// slide-20.js — 2.3.2/2.3.3 控制循环
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 20, title: "控制循环" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "控制循环（Control Loop）");
    // 循环三框
    s.addShape("rect", { x: 0.9, y: 1.5, w: 2.6, h: 1.2, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
    s.addText("① 观察当前状态\n（从 apiserver/etcd 读取）", {
      x: 0.95, y: 1.6, w: 2.5, h: 1.0,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    s.addShape("rect", { x: 3.9, y: 1.5, w: 2.2, h: 1.2, fill: { color: "FFF3E0" }, line: { color: "E08A3C", width: 1 } });
    s.addText("② 与期望状态对比", {
      x: 3.95, y: 1.6, w: 2.1, h: 1.0,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    s.addShape("rect", { x: 6.5, y: 1.5, w: 2.6, h: 1.2, fill: { color: "E8F8E8" }, line: { color: "5BA85B", width: 1 } });
    s.addText("③ 执行动作\n创建/删除/更新，趋近期望", {
      x: 6.55, y: 1.6, w: 2.5, h: 1.0,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    s.addText("一致 → 回到观察", { x: 3.0, y: 2.8, w: 1.3, h: 0.35, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.accent, align: "center", margin: 0 });
    s.addText("→ 有差异 →", { x: 6.1, y: 2.8, w: 0.9, h: 0.35, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.accentWarm, align: "center", margin: 0 });
    s.addText("执行动作后回到观察（循环永不停止）", { x: 4.0, y: 3.3, w: 2.6, h: 0.35, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    card(s, 0.6, 3.85, 8.8, 1.1, C.primary);
    s.addText("控制器内部组成：Informer / Reflector（监听 apiserver 事件）→ WorkQueue（待处理队列）→ Worker（对比 spec 与 status，执行调和）", {
      x: 0.9, y: 3.95, w: 8.2, h: 0.45,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, margin: 0
    });
    s.addText("所有控制器（deployment / replicaset / daemonset / job / namespace…）都是这个模式", {
      x: 0.9, y: 4.45, w: 8.2, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    calloutBar(s, "循环永不停止：“一致”不是终点而是回到观察；“有差异”才执行动作——这就是自愈与弹性的共同引擎。", 5.15);
  }
};
