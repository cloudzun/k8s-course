// slide-17.js — 6.4.3 内置污点 + DaemonSet 之谜
const { C, sectionTitle, card, bigCallout } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 17, title: "内置污点与 DaemonSet 之谜" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "内置污点：你其实天天在用", C.bgLight);
    // 系统污点
    card(s, 0.6, 1.15, 8.8, 2.0, C.primary);
    s.addText("集群默认存在的系统污点——理解了它们，很多“奇怪现象”就通了", {
      x: 0.9, y: 1.28, w: 8.2, h: 0.35, fontSize: 13, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    const items = [
      "控制面节点：node-role.kubernetes.io/control-plane:NoSchedule——这就是“控制面不跑业务 Pod”的实现机制（实验 04 Lab 6 去掉它，让控制面承载负载）",
      "节点 NotReady：node.kubernetes.io/not-ready:NoExecute——节点失联时驱逐其上 Pod（第 16 章排障相关）",
      "磁盘 / 网络压力：node.kubernetes.io/disk-pressure 等",
    ];
    items.forEach((t, i) => {
      s.addText("• " + t, {
        x: 0.9, y: 1.72 + i * 0.47, w: 8.2, h: 0.45,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
      });
    });
    // DaemonSet 之谜
    bigCallout(s, "DaemonSet 之谜解开（第 5 章遗留问题）：calico-node 能上控制面，是因为清单里显式写了 tolerations", 3.4, 0.85);
    card(s, 0.6, 4.4, 8.8, 1.05, C.accentWarm);
    s.addText("补充：DaemonSet 的 Pod 自动容忍“节点故障类”污点（not-ready / unreachable / disk-pressure 等，由 DaemonSet 控制器默认注入，保证节点异常时守护组件不被驱逐）；但 control-plane 污点不会自动容忍（实验 04 Lab 7 演练过）", {
      x: 0.9, y: 4.52, w: 8.2, h: 0.8, fontSize: 11, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
  }
};
