// slide-36.js — 2.7.1 GVK
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 36, title: "Group/Version/Kind" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Group / Version / Kind：如何定位一个资源", C.bgLight);
    const code = [
      "apiVersion: apps/v1        # 组/版本：apps 组的 v1",
      "kind: Deployment           # 类型：Deployment",
      "---",
      "apiVersion: v1             # 核心组没有组名",
      "kind: Pod                  # 只写版本",
    ].join("\n");
    codeBlock(s, 0.6, 1.3, 4.2, 2.5, code, 12);
    s.addText("Group（API 组）：资源的分类。核心组（core）最特殊——没有组名，如 Pod / Service / ConfigMap\n\n其他组：apps（Deployment/STS/DS）、batch（Job/CronJob）、networking.k8s.io（Ingress/NP）、rbac.authorization.k8s.io（Role）", {
      x: 5.1, y: 1.3, w: 4.3, h: 2.5,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    s.addShape("rect", { x: 0.6, y: 4.0, w: 8.8, h: 1.0, fill: { color: C.bgCard } });
    s.addText("Version：v1（稳定，生产可用）/ beta（测试）/ alpha（实验）", {
      x: 0.85, y: 4.1, w: 8.3, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("查看方式：kubectl api-resources（列出所有资源）/ kubectl explain pod（写 yaml 的字典）", {
      x: 0.85, y: 4.5, w: 8.3, h: 0.35,
      fontSize: 12.5, fontFace: "Consolas", color: C.primary, bold: true, margin: 0
    });
  }
};
