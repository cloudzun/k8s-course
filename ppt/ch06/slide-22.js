// slide-22.js — 6.6 综合走查：一个 Pod 的完整落点决策
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 22, title: "综合走查：一个 Pod 的完整落点决策" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "综合走查：一个 Pod 的完整落点决策", C.bgLight);
    s.addText("带完整约束的 gpu-job（期望：3 副本、要 GPU 节点、副本分散、容忍 GPU 污点）从创建到落点：", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.35, fontSize: 11.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0
    });
    // 四阶段卡片
    card(s, 0.6, 1.55, 2.05, 2.6, C.primary);
    s.addText("① 过滤（阶段一）", { x: 0.72, y: 1.65, w: 1.85, h: 0.3, fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    s.addText("资源：节点剩余 ≥ requests？\n节点亲和：gpu=true？（required）\n污点：GPU 污点 → 有容忍？\nPod 反亲和：该节点已有副本？\n→ 候选节点集", {
      x: 0.72, y: 2.0, w: 1.85, h: 2.05, fontSize: 9, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.2
    });
    card(s, 2.85, 1.55, 2.05, 2.6, C.accentWarm);
    s.addText("② 打分（阶段二）", { x: 2.97, y: 1.65, w: 1.85, h: 0.3, fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0 });
    s.addText("资源均衡度\n+ preferred 偏好\n（如“优先 zone-a”）\n→ 选出最优节点\nnode2", {
      x: 2.97, y: 2.0, w: 1.85, h: 2.05, fontSize: 9, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.2
    });
    card(s, 5.1, 1.55, 2.05, 2.6, C.accent);
    s.addText("③ 绑定", { x: 5.22, y: 1.65, w: 1.85, h: 0.3, fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0 });
    s.addText("Pod.nodeName = node2\n→ kubelet Watch 到\n→ 拉起容器", {
      x: 5.22, y: 2.0, w: 1.85, h: 2.05, fontSize: 9, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.2
    });
    card(s, 7.35, 1.55, 2.05, 2.6, C.secondary);
    s.addText("④ 运行时保护", { x: 7.47, y: 1.65, w: 1.85, h: 0.3, fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.secondary, margin: 0 });
    s.addText("节点维护 drain\n→ PDB 限同时驱逐数\n（minAvailable=2）\n→ 优雅终止迁移\n业务无损", {
      x: 7.47, y: 2.0, w: 1.85, h: 2.05, fontSize: 9, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.2
    });
    // 设计顺序
    card(s, 0.6, 4.35, 8.8, 0.7, C.primary);
    s.addText("设计顺序建议：先定“应用类型与副本数”（第 5 章）→ 再定“落点约束”（节点亲和 + 污点容忍 + Pod 反亲和）→ 最后加“运行期保护”（PDB + 探针）——三层约束各有职责，缺一不可", {
      x: 0.9, y: 4.43, w: 8.2, h: 0.55, fontSize: 10.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.1
    });
    // 实验指引
    s.addText("对应实验 04“集群资源调度”（7 个 Lab）：labels/nodeSelector → 亲和 → taint/tolerations → drain → PDB → 控制面承载 → DaemonSet 上控制面", {
      x: 0.6, y: 5.18, w: 8.8, h: 0.32, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textMid, margin: 0
    });
  }
};
