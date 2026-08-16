// slide-24.js — 思考题
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 24, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "思考题", C.bgLight);
    const qs = [
      "调度器过滤阶段和打分阶段各回答什么问题？举一个“过滤通过但打分靠后”的例子。",
      "nodeSelector 与 nodeAffinity 的本质区别是什么？什么场景必须用亲和？",
      "5 个副本配 podAntiAffinity(required, hostname) 在 3 节点集群会发生什么？为什么？",
      "taint 的 NoExecute 与 NoSchedule 的区别？容忍里 tolerationSeconds: 60 是什么意思？",
      "为什么 DaemonSet 的 Pod 能跑到带 control-plane 污点的控制面节点上？",
      "PDB 能防止节点宕机导致的业务中断吗？为什么？（提示：自愿 vs 非自愿中断）",
      "设计一个“GPU 推理服务”的落点方案：要 GPU 节点、副本分散、节点维护时业务无损——需要哪几层配置？",
    ];
    qs.forEach((q, i) => {
      const y = 1.18 + i * 0.53;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.5,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    // CKA 考点条（自定义浅蓝条，容纳多行）
    s.addShape("rect", { x: 0.6, y: 4.95, w: 8.8, h: 0.6, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 4.95, w: 0.05, h: 0.6, fill: { color: C.primary } });
    s.addText("CKA 考点（域 2：工作负载与调度 15%）：必考命令 kubectl label node / taint / cordon / drain / uncordon / get pdb；必考机制 两阶段调度、nodeAffinity（required/preferred + matchExpressions）、podAntiAffinity + topologyKey、污点三种 effect、PDB 计算（minAvailable / maxUnavailable）；高频场景题 专用节点 / 分散高可用 / 维护窗口 → 配置对应机制；排障关联（域 5）：FailedScheduling → describe 看 Events", {
      x: 0.85, y: 5.0, w: 8.3, h: 0.5,
      fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
