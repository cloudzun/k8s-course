// slide-07.js — 1.1.3 cgroups（四卡片）
const { C, sectionTitle, card, calloutBar, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 7, title: "cgroups 资源限制" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "cgroups：限制“能用多少”");
    s.addText("cgroups（Control Groups）限制容器能消耗多少资源：", {
      x: 0.6, y: 1.2, w: 8.8, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const items = [
      { t: "cpu", d: "CPU 份额与配额\n如最多用 0.5 核", strip: C.primary },
      { t: "memory", d: "内存上限\n超限触发 OOM Killer", strip: C.secondary },
      { t: "cpuset", d: "绑定特定 CPU 核\nCPU 亲和性", strip: C.accent },
      { t: "blkio", d: "磁盘 IO 带宽\n读写速率限制", strip: C.accentWarm },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + (i % 2) * 4.55;
      const y = 1.75 + Math.floor(i / 2) * 1.65;
      card(s, x, y, 4.3, 1.45, it.strip);
      s.addText(it.t, {
        x: x + 0.2, y: y + 0.12, w: 2.6, h: 0.4,
        fontSize: 17, fontFace: "Consolas", bold: true, color: C.primary, margin: 0
      });
      s.addText(it.d, {
        x: x + 2.7, y: y + 0.12, w: 1.5, h: 1.2,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.3, margin: 0, valign: "top"
      });
    });
    calloutBar(s, "教学记忆：命名空间管“看不见”（隔离），cgroups 管“用多少”（限制）——两者结合，容器既安全隔离又可被资源管控。", 4.85);
  }
};
