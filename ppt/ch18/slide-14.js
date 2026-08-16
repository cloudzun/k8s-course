// slide-14.js — 18.6 实验演练指引
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 14, title: "实验演练指引（实验 11）" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "实验演练指引：实验 11“综合演练：WordPress 应用发布”");
    const labs = [
      { t: "Lab 1 MySQL 数据库", d: "—— Secret + PVC + Service（数据层落地 §18.2.1）" },
      { t: "Lab 2 发布 WordPress", d: "—— Deployment + env + PVC + readinessProbe（应用层 §18.2.2）" },
      { t: "Lab 3 水平扩展", d: "—— 多副本 + HPA（扩展层 §18.2.4）" },
      { t: "Lab 4 Ingress 域名发布", d: "—— wp.example.com 路由 + 全链路验证（§18.2.3 / 18.3.1）" },
      { t: "Lab 5 数据持久化验证 + 清理", d: "—— 删 Pod 数据仍在 + 按序清理（§18.3.2 / 18.4）" },
    ];
    labs.forEach((lb, i) => {
      const y = 1.25 + i * 0.62;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText([
        { text: lb.t, options: { bold: true, color: C.primary } },
        { text: lb.d, options: { color: C.textDark } },
      ], { x: 1.35, y, w: 8.1, h: 0.5, fontSize: 12.5, fontFace: "Microsoft YaHei", valign: "middle", margin: 0 });
    });
    // 教学建议
    s.addShape("rect", { x: 0.6, y: 4.5, w: 8.8, h: 0.85, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 4.5, w: 0.05, h: 0.85, fill: { color: C.primary } });
    s.addText("教学建议：本章是“毕业设计”——不看书能独立完成 5 个 Lab 并解释每个配置为什么，才算真正掌握全书。\n完成后再对照 §18.2.5 保护层清单（PDB / 配额）补配，做生产化练习。", {
      x: 0.85, y: 4.55, w: 8.3, h: 0.75, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
  }
};
