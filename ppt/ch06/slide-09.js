// slide-09.js — 6.2.2 节点亲和/反亲和：表达式的力量
const { C, sectionTitle, codeBlock, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 9, title: "节点亲和/反亲和" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "节点亲和/反亲和：表达式的力量", C.bgLight);
    // 软硬约束两张小卡
    card(s, 0.6, 1.15, 4.3, 0.95, C.primary);
    s.addText("requiredDuringScheduling（硬性）", {
      x: 0.9, y: 1.22, w: 3.8, h: 0.3, fontSize: 12.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    s.addText("必须满足，否则不调度——≈ nodeSelector，但更强（支持表达式）", {
      x: 0.9, y: 1.55, w: 3.8, h: 0.45, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
    });
    card(s, 5.1, 1.15, 4.3, 0.95, C.accent);
    s.addText("preferredDuringScheduling（软性）", {
      x: 5.4, y: 1.22, w: 3.8, h: 0.3, fontSize: 12.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.accent, margin: 0
    });
    s.addText("尽量满足，不满足也能调度——打分加权（§6.1.2）", {
      x: 5.4, y: 1.55, w: 3.8, h: 0.45, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
    });
    // 代码
    codeBlock(s, 0.6, 2.3, 8.8, 2.4,
      "spec:\n" +
      "  affinity:\n" +
      "    nodeAffinity:\n" +
      "      requiredDuringSchedulingIgnoredDuringExecution:  # 硬性\n" +
      "        nodeSelectorTerms:\n" +
      "        - matchExpressions:\n" +
      "          - { key: disktype, operator: In, values: [\"ssd\", \"nvme\"] }  # 或\n" +
      "      preferredDuringSchedulingIgnoredDuringExecution:  # 软性\n" +
      "      - weight: 100\n" +
      "        preference:\n" +
      "          matchExpressions:\n" +
      "          - { key: zone, operator: In, values: [\"az-a\"] }  # 最好在 az-a", 10.5);
    // 命名缘由
    s.addText("为什么叫“节点亲和”而不是“节点选择”：语义从“我选节点”升级为“节点与我的关系”——可以表达“我偏好在这些节点上”（软性），这是选择器做不到的", {
      x: 0.6, y: 4.9, w: 8.8, h: 0.55, fontSize: 11, fontFace: "Microsoft YaHei",
      color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
