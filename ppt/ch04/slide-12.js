// slide-12.js — 4.3.1/4.3.2 Init 容器机制
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 12, title: "Init 容器机制" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Init 容器：启动前的“先决条件执行器”");
    // 左卡：为什么需要
    card(s, 0.6, 1.3, 4.5, 3.75, C.primary);
    s.addText("为什么需要 Init 容器", {
      x: 0.86, y: 1.42, w: 4.0, h: 0.4,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const needs = [
      "等待依赖就绪：while ! nc -z mysql 3306; do sleep 1; done",
      "预置数据 / 权限：下载配置、初始化目录、设置文件权限",
      "预热缓存：启动前先把缓存填充好",
    ];
    needs.forEach((t, i) => {
      s.addText("▸ " + t, {
        x: 0.9, y: 1.95 + i * 0.68, w: 4.0, h: 0.62,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
      });
    });
    s.addText("放进主容器的代价：与主进程争抢资源、逻辑混杂、“启动慢被探针误杀”（§4.4.2）", {
      x: 0.9, y: 4.1, w: 4.0, h: 0.85,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, valign: "top", margin: 0
    });
    // 右卡：工作机制
    card(s, 5.3, 1.3, 4.1, 3.75, C.accent);
    s.addText("工作机制：主容器之前，做完就退出", {
      x: 5.56, y: 1.42, w: 3.6, h: 0.4,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    const flow = [
      "Init 容器按声明顺序逐个执行（init-1 等待数据库 → init-2 预置数据 → 主容器）",
      "某个失败 → 整个 Pod 按重启策略重启，所有 Init 从头再跑",
      "与主容器共享 Pod 卷：预置的数据主容器直接读",
      "独立镜像：主容器用精简运行时，Init 用带工具的镜像下载数据",
    ];
    flow.forEach((t, i) => {
      const y = 1.95 + i * 0.68;
      numBadge(s, 5.62, y + 0.02, i + 1);
      s.addText(t, {
        x: 6.2, y, w: 3.1, h: 0.66,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
      });
    });
    s.addText("“失败从头跑”：Init 可能修改共享卷的中间状态——从第一个重跑保证准备动作的确定性", {
      x: 5.56, y: 4.7, w: 3.6, h: 0.3,
      fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    s.addText("（实验 02 Lab 3：Init 容器）", {
      x: 0.6, y: 5.3, w: 8.8, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
