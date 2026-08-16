// slide-10.js — 14.3.2 顺序背后的原因 / 14.3.3 业务保障
const { C, sectionTitle, numBadge, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 10, title: "升级顺序的原因与业务保障" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "升级顺序背后的原因");
    const reasons = [
      "kubeadm 先升：旧 kubeadm 不认识新版本的升级流程",
      "控制面先行：apiserver 新版本才能接受新版本 worker 的注册",
      "worker 逐台：一台一台 drain/升级/恢复——集群容量只少一台，业务无感",
      "版本一致：最终所有节点同版本（跨一个次版本兼容，但一致最稳）",
    ];
    reasons.forEach((r, i) => {
      const y = 1.25 + i * 0.6;
      numBadge(s, 0.7, y + 0.05, i + 1);
      s.addText(r, {
        x: 1.35, y, w: 8.0, h: 0.55,
        fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("升级中的业务保障（三条机制叠加）", {
      x: 0.6, y: 3.7, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const code = [
      "worker 升级时：drain（PDB 约束逐个驱逐）→ 业务 Pod 迁移到其他节点",
      "            → 滚动/重建（第 5 章）→ 优雅终止（第 4 章）",
      "三层保障：PDB（驱逐有保护）+ 优雅终止（下线不丢请求）+ 多副本（迁移有备份）",
    ].join("\n");
    codeBlock(s, 0.6, 4.1, 8.8, 1.2, code, 11.5);
  }
};
