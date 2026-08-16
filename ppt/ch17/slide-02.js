// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "说出裸 YAML 管理在生产中的三个痛点，以及工具链的解决思路",
      "解释 Helm 的核心模型（Chart / Release / Repository）与 Chart 目录结构",
      "理解模板化原理（values 注入 + 模板渲染）与 install / upgrade / rollback 的版本机制",
      "解释 Kustomize 的 base / overlay 定制机制，说出它与 Helm 的定位差异",
      "设计一个企业应用交付流程（Chart 版本化 + 多环境 values + CI/CD 集成）",
      "知道 CRD 与 Operator 是 Kubernetes 的扩展机制（为第 18 章展望铺垫）",
    ];
    goals.forEach((g, i) => {
      const y = 1.25 + i * 0.55;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.45,
        fontSize: 13.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
