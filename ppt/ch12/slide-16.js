// slide-16.js — 12.5 策略即代码：OPA Gatekeeper / Kyverno
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 16, title: "策略即代码：Gatekeeper / Kyverno" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "策略即代码：OPA Gatekeeper / Kyverno");
    s.addText("PSA 只覆盖“Pod 安全”这一维度——生产还要约束“镜像来自可信仓库”“必须带资源限制”“禁止特定标签”等自定义策略。PSA 做不了，交给策略引擎：", {
      x: 0.6, y: 1.05, w: 8.8, h: 0.5,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    codeBlock(s, 0.6, 1.65, 8.8, 1.45, [
      "# Kyverno 策略示例（概念）：要求所有 Pod 必须带资源限制",
      "apiVersion: kyverno.io/v1",
      "kind: ClusterPolicy",
      "metadata: { name: require-resources }",
      "spec:",
      "  rules:",
      "  - name: require-limits",
      "    match: { any: [{ resources: { kinds: [\"Pod\"] } }] }",
      "    validate: { message: \"Pod 必须声明 resources\", pattern: { spec: { containers: [{ resources: { limits: {} } }] } } }",
    ].join("\n"), 9.5);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "引擎", options: hdr }, { text: "特点", options: hdr }, { text: "策略写法", options: hdr }],
      [{ text: "OPA Gatekeeper", options: mkF(0) }, { text: "通用策略引擎（OPA / Rego）", options: celA }, { text: "Rego 语言 + ConstraintTemplate（学习曲线陡）", options: celB }],
      [{ text: "Kyverno", options: mkF(1) }, { text: "专为 K8s 设计", options: celB }, { text: "YAML 声明式（match + validate），上手快", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 3.25, w: 8.8, colW: [2.2, 2.8, 3.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    s.addText("与 PSA 的关系：PSA 是内置的“Pod 安全标准”（三级别）；Gatekeeper / Kyverno 是可编程的任意准入规则（超越 Pod 安全，管所有资源）。决策逻辑：只需要 Pod 安全标准 → PSA 够用；需要自定义 / 组织级策略 → 引入 Kyverno（YAML 友好）或 OPA Gatekeeper（表达力最强）。生产组合：PSA 定基线 + Kyverno / Gatekeeper 定组织级策略（镜像仓库白名单、必带标签、资源要求）。", {
      x: 0.6, y: 4.95, w: 8.8, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.accent, bold: true, valign: "middle", margin: 0
    });
  }
};
