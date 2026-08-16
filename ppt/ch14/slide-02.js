// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "说出运维的四大对象（节点/控制面/数据/版本）与各自的例行动作",
      "执行完整的节点维护流程（cordon → drain → 维护 → uncordon），解释 PDB 的保护作用",
      "描述集群升级的完整流程（准备 → 控制面 → worker 逐台 → 验证），解释顺序背后的原因",
      "说出升级的版本兼容窗口（为什么不能跳版本）与回滚预案",
      "设计 etcd 备份策略（周期/保留/异地/恢复演练），解释“恢复会丢什么”",
      "解释控制面高可用架构（多控制面 + 负载均衡）与 etcd Raft 奇数节点的原理",
      "掌握命名空间配额治理与对象清理的运维视角",
    ];
    goals.forEach((g, i) => {
      const y = 1.25 + i * 0.52;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.45,
        fontSize: 13.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
