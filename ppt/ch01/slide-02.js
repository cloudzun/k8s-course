// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "解释容器的核心技术原理：命名空间隔离、cgroups 资源限制、镜像分层",
      "说出 Docker 的镜像 / 容器 / 仓库三要素及常用操作",
      "分析容器化应用在单机场景下的痛点，理解“为什么需要编排器”",
      "说明云原生（Cloud Native）的定义与 CNCF 生态定位",
      "对比 Kubernetes / Docker Swarm / Mesos，说出 Kubernetes 胜出的核心理由"
    ];
    goals.forEach((g, i) => {
      const y = 1.35 + i * 0.78;
      numBadge(s, 0.7, y + 0.05, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.65,
        fontSize: 15, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
      if (i < goals.length - 1) {
        s.addShape("line", { x: 1.35, y: y + 0.72, w: 7.9, h: 0, line: { color: C.border, width: 0.5 } });
      }
    });
  }
};
