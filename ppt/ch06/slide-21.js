// slide-21.js — 6.5.2 PodDisruptionBudget：驱逐的保险丝
const { C, sectionTitle, codeBlock, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 21, title: "PodDisruptionBudget：驱逐的保险丝" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "PodDisruptionBudget：驱逐的保险丝");
    s.addText("问题：drain node2 时，如果 node2 上正好有某应用的全部 3 个副本——一次全驱逐 = 服务中断", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.32, fontSize: 11.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.5, 8.8, 1.6,
      "apiVersion: policy/v1\n" +
      "kind: PodDisruptionBudget\n" +
      "metadata:\n" +
      "  name: web-pdb\n" +
      "spec:\n" +
      "  minAvailable: 2          # 至少保持 2 个可用\n" +
      "  selector:\n" +
      "    matchLabels:\n" +
      "      app: web", 10.5);
    // ALLOWED DISRUPTIONS
    card(s, 0.6, 3.3, 8.8, 0.65, C.accent);
    s.addText("ALLOWED DISRUPTIONS = 当前可用副本数 − minAvailable = 3 − 2 = 1  →  kubectl get pdb 显示：web-pdb  MIN AVAILABLE 2  ALLOWED DISRUPTIONS 1", {
      x: 0.9, y: 3.38, w: 8.2, h: 0.5, fontSize: 11, fontFace: "Consolas",
      color: C.textDark, valign: "middle", margin: 0
    });
    // 两个边界
    card(s, 0.6, 4.1, 8.8, 0.95, C.accentWarm);
    s.addText("• 只约束“主动驱逐”（drain 等自愿中断）——节点宕机、Pod 崩溃等非自愿中断不归它管（控制器照样重建）", {
      x: 0.9, y: 4.18, w: 8.2, h: 0.36, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0
    });
    s.addText("• 只保护“副本数量”不保护“可用性”——若 3 副本里 2 个 CrashLoop（readiness 失败），PDB 可能直接阻止 drain（可用数已低于 minAvailable）", {
      x: 0.9, y: 4.58, w: 8.2, h: 0.36, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0
    });
    // 生产实践
    calloutBar(s, "生产实践：核心服务（数据库 / 网关 / 所有多副本应用）必须配 PDB——否则一次节点维护就可能造成全量中断；minAvailable（保底）与 maxUnavailable（上限）二选一", 5.15);
  }
};
