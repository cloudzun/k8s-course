// slide-08.js — 6.2.1 nodeSelector：最简单的方式
const { C, sectionTitle, codeBlock, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 8, title: "nodeSelector：最简单的方式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "nodeSelector：最简单的方式");
    // 代码
    codeBlock(s, 0.6, 1.15, 8.8, 1.65,
      "# ① 给节点打标签\n" +
      "kubectl label node node2 disktype=ssd\n" +
      "# ② Pod 声明：只调度到带 disktype=ssd 的节点\n" +
      "spec:\n" +
      "  nodeSelector:\n" +
      "    disktype: ssd", 12);
    // 特点与局限
    card(s, 0.6, 3.05, 8.8, 1.75, C.primary);
    s.addText("特点与局限", {
      x: 0.9, y: 3.2, w: 8.2, h: 0.35, fontSize: 13, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    const items = [
      "简单直观，但只能做“等值匹配”（=）",
      "不能表达“或”（ssd 或 nvme）、“非”（不要 CPU 密集节点）、“软性偏好”（最好在 SSD 上，没有也无妨）",
      "需要更强表达力 → 升级到节点亲和（§6.2.2）",
    ];
    items.forEach((t, i) => {
      s.addText("• " + t, {
        x: 0.9, y: 3.62 + i * 0.4, w: 8.2, h: 0.38,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("实操：实验 04 Lab 1——给节点打标签 + nodeSelector 定向调度", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.32,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
