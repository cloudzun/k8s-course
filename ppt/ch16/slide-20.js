// slide-20.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 20, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "思考题", C.bgLight);
    const qs = [
      "一个“503 Service Unavailable”，你的排查顺序是什么？（从分层框架出发写完整步骤）",
      "kubectl logs 和 kubectl logs --previous 的区别？什么场景必须用 --previous？",
      "CrashLoop 退出码 137 和 143 分别意味着什么？怎么进一步确认？",
      "“报错即答案”——举三个报错例子，说明它们各自直说了什么问题？",
      "滚动更新要“零中断”，除了 maxUnavailable: 0 还需要什么配置？（提示：readiness）",
      "为什么说“PDB 只管自愿中断”？节点宕机时谁在保护业务？",
      "主动演练的最小实践是什么？在实验环境怎么验证“自愈”？",
    ];
    qs.forEach((q, i) => {
      const y = 1.2 + i * 0.56;
      s.addShape("ellipse", { x: 0.7, y: y + 0.04, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.04, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.5,
        fontSize: 12, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "CKA 考点标注（域 5，30%，权重最高）：describe Events 段、退出码解读、NotReady（kubelet）、Service/DNS（Endpoints）、PVC、Forbidden、exceeded quota、PDB、滚动更新、优雅终止。", 5.12);
  }
};
