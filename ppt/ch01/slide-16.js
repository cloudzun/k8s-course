// slide-16.js — 1.3.1 容器化的价值（四卡片）
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 16, title: "容器化的价值" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "容器化的价值", C.bgLight);
    const items = [
      { t: "可移植性", d: "构建一次，处处运行\n开发/测试/生产一致", strip: C.primary },
      { t: "资源效率", d: "高密度、秒级启动\n弹性伸缩的基础", strip: C.secondary },
      { t: "一致性", d: "环境差异消失\n“在我机器上是好的”不再成立", strip: C.accent },
      { t: "快速交付", d: "镜像即部署产物\nCI/CD 流水线化", strip: C.accentWarm },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + (i % 2) * 4.55;
      const y = 1.4 + Math.floor(i / 2) * 1.85;
      card(s, x, y, 4.3, 1.65, it.strip);
      numBadge(s, x + 0.15, y + 0.15, i + 1, it.strip);
      s.addText(it.t, {
        x: x + 0.75, y: y + 0.12, w: 3.4, h: 0.5,
        fontSize: 17, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(it.d, {
        x: x + 0.2, y: y + 0.7, w: 3.9, h: 0.85,
        fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.35, margin: 0, valign: "top"
      });
    });
    s.addShape("rect", { x: 0.6, y: 5.05, w: 8.8, h: 0.4, fill: { color: C.bgAccent } });
    s.addText("四大价值 → 容器化成为现代应用交付的默认形态", {
      x: 0.85, y: 5.05, w: 8.3, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.accent, bold: true, valign: "middle", margin: 0
    });
  }
};
