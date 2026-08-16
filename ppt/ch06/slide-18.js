// slide-18.js — 6.4.4/6.4.5 应用场景与“污点 vs 亲和”
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 18, title: "应用场景与“污点 vs 亲和”" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "应用场景与“污点 vs 亲和”");
    // 应用场景
    card(s, 0.6, 1.15, 4.3, 2.7, C.primary);
    s.addText("应用场景", {
      x: 0.9, y: 1.28, w: 3.8, h: 0.35, fontSize: 13.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    const aItems = [
      "专用节点：GPU 节点打 dedicated=gpu:NoSchedule，只有带容忍的 AI 任务能上（防普通任务挤占 GPU）",
      "节点隔离：节点出问题，先 NoExecute 驱逐业务，再维护",
      "控制面保护：内置 control-plane 污点（§6.4.3）",
      "混合环境：隔离“测试节点”与“生产节点”",
    ];
    aItems.forEach((t, i) => {
      s.addText("• " + t, {
        x: 0.9, y: 1.72 + i * 0.53, w: 3.8, h: 0.51,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
      });
    });
    // 污点 vs 亲和
    card(s, 5.1, 1.15, 4.3, 2.7, C.accentWarm);
    s.addText("污点 vs 亲和：两个独立维度", {
      x: 5.4, y: 1.28, w: 3.8, h: 0.35, fontSize: 13.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.accentWarm, margin: 0
    });
    const vItems = [
      "谁主动：亲和（nodeAffinity / podAffinity）= Pod 主动挑（Pod → 节点：“我要去哪”）；污点 / 容忍 = 节点主动拒（节点 → Pod：“我不要谁”）",
      "两者同时生效：先过滤双方条件，配合使用——亲和“要什么节点”+ 容忍“能上什么节点”",
    ];
    vItems.forEach((t, i) => {
      s.addText("• " + t, {
        x: 5.4, y: 1.72 + i * 0.95, w: 3.8, h: 0.92,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
      });
    });
    // 组合
    card(s, 0.6, 4.05, 8.8, 0.85, C.accent);
    s.addText("生产常用组合：GPU 任务 = nodeAffinity（要 gpu=true 的节点）+ tolerations（容忍 gpu 污点）——既要“我要 GPU 节点”，也要“GPU 节点愿意收我”", {
      x: 0.9, y: 4.15, w: 8.2, h: 0.62, fontSize: 11.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.1
    });
    s.addText("实操：实验 04 Lab 3——给节点打污点 + Pod 加容忍，亲手验证“排斥力与通行证”", {
      x: 0.6, y: 5.1, w: 8.8, h: 0.32, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textMid, margin: 0
    });
  }
};
