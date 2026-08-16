// slide-04.js — 课程结尾
const { C, topAccentBar, bottomAccentBar } = require("./common");
module.exports = {
  slideConfig: { type: "end", index: 4, title: "课程总结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.darkBg };
    topAccentBar(s);
    bottomAccentBar(s);
    s.addShape("rect", { x: 0.8, y: 0.9, w: 0.05, h: 3.2, fill: { color: C.accent } });
    s.addText("课程总结", {
      x: 1.2, y: 1.0, w: 8.0, h: 0.9,
      fontSize: 36, fontFace: "Microsoft YaHei", bold: true, color: C.textLight, margin: 0
    });
    const pts = [
      "从容器原理到生产集群：装得起、看得懂、排得了、守得住",
      "核心能力：声明式思维 · 控制循环 · 分层排障 · 最小权限",
      "动手路线：实验 01-14 全流程真实集群演练（93 个 Lab）",
      "认证目标：CKA 五大域全覆盖（架构 / 工作负载 / 网络 / 存储 / 安全 / 排障）",
    ];
    pts.forEach((p, i) => {
      const y = 2.2 + i * 0.62;
      s.addText("▸ " + p, {
        x: 1.3, y, w: 8.0, h: 0.5,
        fontSize: 15, fontFace: "Microsoft YaHei", color: "DDDDF0", margin: 0
      });
    });
    s.addText("谢谢 · 祝各位顺利通过 CKA", {
      x: 1.2, y: 4.9, w: 8.0, h: 0.6,
      fontSize: 20, fontFace: "Microsoft YaHei", bold: true, color: "9DB8E8", margin: 0
    });
  }
};
