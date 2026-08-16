// slide-23.js — K8s 胜出的核心理由（四卡片）
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 23, title: "胜出的核心理由" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Kubernetes 胜出的核心理由");
    const items = [
      { t: "声明式 API + 控制循环", d: "描述“期望状态”，控制器持续调和——设计优雅，可扩展", strip: C.primary },
      { t: "可扩展性", d: "CRD、Operator、CNI/CSI 插件机制，生态爆炸式增长", strip: C.secondary },
      { t: "云厂商背书", d: "AWS/Azure/GCP/阿里云全部提供托管 K8s（EKS/AKS/GKE/ACK）", strip: C.accent },
      { t: "CKA 认证体系", d: "人才市场认可——本课程的目标", strip: C.accentWarm },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + (i % 2) * 4.55;
      const y = 1.4 + Math.floor(i / 2) * 1.85;
      card(s, x, y, 4.3, 1.65, it.strip);
      numBadge(s, x + 0.15, y + 0.15, i + 1, it.strip);
      s.addText(it.t, {
        x: x + 0.75, y: y + 0.12, w: 3.4, h: 0.5,
        fontSize: 16, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(it.d, {
        x: x + 0.2, y: y + 0.7, w: 3.9, h: 0.85,
        fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.35, margin: 0, valign: "top"
      });
    });
    s.addShape("rect", { x: 0.6, y: 5.1, w: 8.8, h: 0.4, fill: { color: C.bgBlue } });
    s.addText("一句话：Kubernetes 赢在“设计”与“生态”——第 2 章将深入它的架构与核心设计", {
      x: 0.85, y: 5.1, w: 8.3, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.primary, bold: true, valign: "middle", margin: 0
    });
  }
};
