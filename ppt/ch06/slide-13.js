// slide-13.js — 6.3.3/6.3.4 podAffinity / podAntiAffinity 与场景设计
const { C, sectionTitle, codeBlock, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 13, title: "podAffinity / podAntiAffinity 与场景设计" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "podAffinity / podAntiAffinity 与场景设计");
    // 代码
    codeBlock(s, 0.6, 1.15, 8.8, 2.55,
      "spec:\n" +
      "  affinity:\n" +
      "    podAntiAffinity:                       # 反亲和：分散\n" +
      "      requiredDuringSchedulingIgnoredDuringExecution:\n" +
      "      - labelSelector:\n" +
      "          matchLabels: { app: web }        # 匹配已运行的 app=web Pod\n" +
      "        topologyKey: kubernetes.io/hostname  # 以节点为单位分散\n" +
      "    podAffinity:                           # 亲和：聚合\n" +
      "      preferredDuringSchedulingIgnoredDuringExecution:\n" +
      "      - weight: 100\n" +
      "        podAffinityTerm:\n" +
      "          labelSelector:\n" +
      "            matchLabels: { app: cache }\n" +
      "          topologyKey: kubernetes.io/hostname", 10.5);
    // 硬软性
    s.addText("硬性 required：可能导致调度不上——如 5 副本反亲和到 3 节点（每节点最多 1 个），第 4、5 个会一直 Pending；软性 preferred：尽量满足，打分加权", {
      x: 0.6, y: 3.85, w: 8.8, h: 0.45, fontSize: 11, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    // 场景两卡
    card(s, 0.6, 4.4, 4.3, 0.7, C.primary);
    s.addText("场景一 多副本高可用分布：3 副本 web + podAntiAffinity(required, hostname) → 每节点最多 1 个副本，一台挂了另两台照常", {
      x: 0.9, y: 4.48, w: 3.8, h: 0.56, fontSize: 9.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
    });
    card(s, 5.1, 4.4, 4.3, 0.7, C.accent);
    s.addText("场景二 计算与缓存同地：计算 Pod + podAffinity(preferred, app=cache) → 尽量与 cache Pod 同节点，本地读缓存不跨节点", {
      x: 5.4, y: 4.48, w: 3.8, h: 0.56, fontSize: 9.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
    });
    // 警示
    warnBar(s, "⚠️ required 反亲和的副本数不能超过拓扑域数（5 副本 × 3 节点 → 2 个永远 Pending）；高可用标准组合 = 反亲和 + PDB + 多副本（PDB 见 §6.5.2）", 5.1);
  }
};
