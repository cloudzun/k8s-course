// slide-05.js — 6.1.2 过滤与打分：具体看哪些项
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 5, title: "过滤与打分：具体看哪些项" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "过滤与打分：具体看哪些项");
    // 阶段一 过滤
    card(s, 0.6, 1.15, 4.3, 3.15, C.primary);
    s.addText("阶段一 过滤 Filtering", {
      x: 0.9, y: 1.3, w: 3.8, h: 0.35, fontSize: 13.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    s.addText("“哪些节点不合格”——硬性条件，不满足直接排除", {
      x: 0.9, y: 1.65, w: 3.8, h: 0.32, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textMid, margin: 0
    });
    const fItems = [
      "资源够吗？可用 CPU / 内存 ≥ Pod requests（第 4 章）",
      "满足 nodeSelector 与节点亲和吗？（§6.2 / 6.3）",
      "能容忍节点污点吗？（§6.4）",
      "端口冲突 / 主机名 / 磁盘压力 / 节点年龄等",
      "结果：候选节点集合——为空则 Pod 一直 Pending",
    ];
    fItems.forEach((t, i) => {
      s.addText("• " + t, {
        x: 0.9, y: 2.05 + i * 0.43, w: 3.8, h: 0.42,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
      });
    });
    // 阶段二 打分
    card(s, 5.1, 1.15, 4.3, 3.15, C.accent);
    s.addText("阶段二 打分 Scoring", {
      x: 5.4, y: 1.3, w: 3.8, h: 0.35, fontSize: 13.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.accent, margin: 0
    });
    s.addText("“候选里选谁最优”——各策略加权求和，最高分胜出", {
      x: 5.4, y: 1.65, w: 3.8, h: 0.32, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textMid, margin: 0
    });
    const sItems = [
      "资源均衡：剩余 CPU / 内存越均衡分越高（避免挤爆、其他闲置）",
      "Pod 分布：与同应用已有 Pod 尽量分散（反亲和偏好，§6.3）",
      "节点亲和偏好（preferred 部分）",
      "结果：得分最高者被选中，Pod 绑定到它",
    ];
    sItems.forEach((t, i) => {
      s.addText("• " + t, {
        x: 5.4, y: 2.05 + i * 0.54, w: 3.8, h: 0.52,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
      });
    });
    // 排障关联
    calloutBar(s, "排障关联：Pod 一直 Pending → kubectl describe pod 看 Events 的 FailedScheduling——报错直接说“哪个条件不满足”（didn't match node selector / Insufficient cpu / Untolerated taint），改对应配置即可", 4.5);
  }
};
