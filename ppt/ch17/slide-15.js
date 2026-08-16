// slide-15.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 15, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "痛点：裸 YAML 重复 / 无法参数化 / 无版本管理——工具链的解决思路",
      "Helm：Chart（包）→ Release（实例）→ Repository（仓库）；values.yaml + templates/ 渲染出最终 YAML",
      "Helm 全生命周期：install / upgrade / rollback——revision 机制支持应用级回滚",
      "Kustomize：base + overlay 覆盖式定制（无模板语言）；kubectl apply -k",
      "选型：分发 / 装第三方 → Helm；项目内多环境 → Kustomize；两者可组合",
      "企业流程：Chart 版本化 + 多环境 values + CI/CD——“一套 Chart 跑所有环境”；扩展铺垫：CRD + Operator（第 18 章展望）",
    ];
    items.forEach((g, i) => {
      const y = 1.3 + i * 0.66;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.6,
        fontSize: 13, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
