// slide-20.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 20, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "没有 metrics-server 时，HPA 会怎样？kubectl top 会怎样？",
      "HPA 计算期望副本数时，为什么“当前利用率 / 目标利用率”用乘法？（提示：比例关系）",
      "为什么缩容稳定窗口默认比扩容长？极端情况下把两个窗口都设 0 会怎样？",
      "某 Pod 没配 requests，HPA 的 CPU 利用率指标为什么不可用？",
      "LimitRange 与 ResourceQuota 的管辖范围分别是什么？“exceeded quota”和“Forbidden: maximum cpu”分别来自哪层？",
      "为什么生产建议给每个命名空间配 LimitRange 的 default？（提示：HPA/调度/配额都依赖 requests）",
    ];
    qs.forEach((q, i) => {
      const y = 1.2 + i * 0.6;
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
    calloutBar(s, "CKA 考点（域 2/5）：kubectl autoscale --cpu=50% --min=2 --max=10；HPA 公式与稳定窗口；LimitRange 的 Forbidden 与 default 填充；ResourceQuota 的 exceeded quota；场景题：按需求配置资源治理。", 4.85);
  }
};
