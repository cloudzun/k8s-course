// slide-14.js — 5.3.3-5.3.4 稳定存储与有序部署/更新
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 14, title: "稳定存储与有序性" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "稳定存储与有序部署/更新");
    codeBlock(s, 0.6, 1.25, 4.55, 2.1,
`volumeClaimTemplates（卷声明模板）
自动为每个副本创建独立 PVC：
  web-0 → PVC web-data-web-0
  web-1 → PVC web-data-web-1
  web-2 → PVC web-data-web-2

Pod 删了重建 → 还绑同一个 PVC
（数据不丢）`, 10.5);
    card(s, 5.35, 1.25, 4.05, 2.1, C.primary);
    s.addText("与 Deployment 的本质区别", {
      x: 5.6, y: 1.38, w: 3.6, h: 0.34,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("· Deployment：所有副本共享同一个卷（或各自临时卷）\n· StatefulSet：每个副本有自己专属的卷\n——这就是“身份与数据绑定”", {
      x: 5.6, y: 1.8, w: 3.6, h: 1.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
    const ord = [
      { t: "部署有序", d: "web-0 先创建且 Running 后，才创建 web-1、再 web-2（rollout status 依次就绪）", c: C.primary },
      { t: "缩容有序", d: "从大到小删除：先 web-2、再 web-1、最后 web-0", c: C.accent },
      { t: "更新有序", d: "逆序逐个更新（web-2 → web-1 → web-0），保证主节点 web-0 最后更新", c: C.accentWarm },
    ];
    ord.forEach((cd, i) => {
      const x = 0.6 + i * 2.98;
      card(s, x, 3.55, 2.83, 1.12, cd.c);
      s.addText(cd.t, {
        x: x + 0.2, y: 3.63, w: 2.45, h: 0.32,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: cd.c, margin: 0
      });
      s.addText(cd.d, {
        x: x + 0.2, y: 4.0, w: 2.45, h: 0.62,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("podManagementPolicy：默认 OrderedReady（严格有序）；副本间无“谁先谁后”依赖（如无主从关系的缓存集群）→ 设 Parallel——所有副本并行创建/删除，扩缩容从几分钟降到秒级", {
      x: 0.6, y: 4.82, w: 8.8, h: 0.5,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
