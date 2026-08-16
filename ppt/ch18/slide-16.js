// slide-16.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 16, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "为什么 WordPress 前端可以多副本，MySQL 却保持单副本？（数据与应用分离原则）",
      "本演练中“多副本”实际堆在同一节点——为什么？生产怎么解决？",
      "验证“持久化”时，为什么要删除全部 Pod 再读？（而不是读正在运行的 Pod）",
      "清理时为什么“先删 Ingress / HPA 再删 Deployment”？（提示：流量与伸缩）",
      "要发布一个“有上传文件、多副本、要扛流量”的站点，存储方案怎么选（对比 local-path / NFS / 云盘）？",
      "这个演练里哪些配置属于“保护层”（生产必配但教学简化）？补全后的完整清单是什么？",
    ];
    qs.forEach((q, i) => {
      const y = 1.25 + i * 0.62;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.55,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "CKA 考点（全部 5 域综合）：Secret 注入 / PVC / Service+Ingress / HPA / 探针 / PDB——Lab 能独立完成即实操达标。", 5.05);
  }
};
