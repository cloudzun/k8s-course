// slide-26.js — 思考题
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 26, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "为什么“内存超限”比“CPU 超限”危险？分别会发生什么？（提示：可压缩 vs 不可压缩）",
      "一个应用启动需要 90 秒，直接配 liveness 会发生什么？startup 探针怎么解决？",
      "preStop 钩子里 sleep 5 的常见用途是什么？应用收尾需要 60 秒，要改什么配置？",
      "Init 容器与 sidecar 容器都“在主容器旁做事”，它们的本质区别是什么？",
      "为什么“只设 requests 不设 limits”（内存）在生产上是危险的？",
      "镜像带 :latest 时默认拉取策略是 Always——这带来什么风险？怎么规避？",
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
    s.addShape("rect", { x: 0.6, y: 5.0, w: 8.8, h: 0.55, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 5.0, w: 0.05, h: 0.55, fill: { color: C.primary } });
    s.addText("CKA 考点（域 2 工作负载与调度 15%）：探针三件套与参数、requests / limits、restartPolicy、imagePullPolicy；优雅终止流程、OOM 退出码 137、Init 容器顺序执行。", {
      x: 0.85, y: 5.0, w: 8.3, h: 0.55,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
  }
};
