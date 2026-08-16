// slide-24.js — 本章小结
const { C, sectionTitle, numBadge, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 24, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "容器 = 命名空间（隔离）+ cgroups（限制）的受控进程，比虚拟机轻量得多",
      "镜像 = 只读分层 + 可写层，共享底层省空间、启动快",
      "单机 Docker 的七大痛点 → 编排器的需求来源",
      "云原生 = 容器 + 微服务 + 动态编排 + DevOps + 声明式",
      "Kubernetes 凭声明式 API + 生态 + 云厂商背书成为容器编排事实标准",
    ];
    items.forEach((g, i) => {
      const y = 1.35 + i * 0.78;
      numBadge(s, 0.7, y + 0.05, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.65,
        fontSize: 15, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
      if (i < items.length - 1) {
        s.addShape("line", { x: 1.35, y: y + 0.72, w: 7.9, h: 0, line: { color: C.border, width: 0.5 } });
      }
    });
    calloutBar(s, "衔接：第 2 章进入 Kubernetes 本身——架构、组件与“声明式 API + 控制循环”的核心设计。", 5.0);
  }
};
