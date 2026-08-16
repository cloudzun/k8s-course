// slide-04.js — 17.1.1 裸 YAML 管理的三个痛点
const { C, sectionTitle, card, numBadge, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 4, title: "裸 YAML 管理的三个痛点" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "裸 YAML 管理的三个痛点");
    const pains = [
      { t: "重复", d: "每个环境（dev / staging / prod）都要一份几乎一样的 YAML，只差镜像 tag、副本数、域名——复制粘贴，改一处漏三处" },
      { t: "无法参数化", d: "同样的 Deployment 模板，环境不同值不同——YAML 里没有“变量”概念" },
      { t: "无版本管理", d: "YAML 文件散落，没有“应用包”的概念——回滚、分发、依赖管理无从谈起" },
    ];
    pains.forEach((p, i) => {
      const x = 0.6 + i * 3.05;
      card(s, x, 1.4, 2.75, 2.25, C.primary);
      numBadge(s, x + 0.18, 1.58, i + 1);
      s.addText(p.t, {
        x: x + 0.2, y: 2.12, w: 2.35, h: 0.42,
        fontSize: 14.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(p.d, {
        x: x + 0.2, y: 2.62, w: 2.35, h: 0.95,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    card(s, 0.6, 3.95, 8.8, 0.6, C.accentWarm);
    s.addText("教学清晰 ≠ 生产可用：第 18 章 WordPress 用十几个裸 YAML 手动管理——生产立刻会遇到这些痛点", {
      x: 0.9, y: 4.05, w: 8.2, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    calloutBar(s, "工具链解决思路：把“变与不变”分离——结构写一次、差异参数化 / 补丁化、包版本化管理。", 4.9);
  }
};
