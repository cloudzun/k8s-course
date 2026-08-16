// slide-06.js — 分隔页 18.2 逐层落地（全书机制总装）
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 6, title: "逐层落地（全书机制总装）" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "18.2", "逐层落地（全书机制总装）", [
      "数据层：Secret + PVC + StatefulSet（MySQL 有状态）",
      "应用层：Deployment + PVC + 探针（WordPress 无状态）",
      "访问层：Service + Ingress · 扩展层：HPA · 保护层：PDB / 配额",
      "每一层都是前面某章机制的“总装”"
    ]);
  }
};
