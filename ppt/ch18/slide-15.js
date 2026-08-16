// slide-15.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 15, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "架构设计：需求拆解 → 数据与应用分离（无状态多副本 + 有状态独立存储）",
      "逐层落地：Secret/PVC（数据）→ Deployment/探针（应用）→ Service/Ingress（访问）→ HPA（扩展）→ PDB/配额（保护）——每层都是前面某章的“总装”",
      "local-path 边界：多副本共享 PVC 受限（RWO / 单节点）——生产用 NFS / 云盘（第 10 章选型实战）",
      "三层验证：全链路（通不通）/ 持久化（丢不丢）/ 扩展（够不够）",
      "清理规范：先入口 → 再应用 → 后数据（PVC 删除 = 数据删除）",
      "生产化差距：保护层（liveness / preStop / PDB / 配额）是“能跑”与“生产可用”的差距",
    ];
    items.forEach((g, i) => {
      const y = 1.28 + i * 0.66;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.6,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("衔接：第 19 章 CKA 考试指南——把全书知识转化为考试能力（考点速查、时间策略、模拟演练）。", {
      x: 0.7, y: 5.28, w: 8.6, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
