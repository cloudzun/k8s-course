// slide-06.js — 3.2.1/3.2.2 集群形态与版本策略
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 6, title: "集群形态与版本策略" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "集群形态与版本策略");
    const shapes = [
      "单节点：1 台机器既是控制面又是工作节点——学习入门够用，但看不到跨节点调度与多节点网络",
      "标准 3 节点（本课程）：1 控制面 + 2 工作节点——能完整演练调度、网络、存储、故障转移，学习的最优形态",
      "生产高可用：3 控制面 + N 工作节点——控制面自身也要冗余（多控制面 + 负载均衡，第 14 章）",
    ];
    shapes.forEach((t, i) => {
      const y = 1.25 + i * 0.52;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.46, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.06, h: 0.46, fill: { color: C.primary } });
      s.addText(t, {
        x: 0.85, y, w: 8.3, h: 0.46,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("资源底线：每节点 2 核 / 2GB / 20GB（教学建议 4 核 8GB 更从容）· 关键前提：节点间内网互通", {
      x: 0.6, y: 2.9, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("版本策略", {
      x: 0.6, y: 3.35, w: 4.0, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const vers = [
      "用当前最新稳定版（kubeadm 会告知可用版本），本课程基线 v1.36",
      "kubelet / kubeadm / kubectl 三件套必须同版本——版本对齐的协议交互，跨版本会告警甚至失败",
      "工作节点与控制面版本一致（官方允许跨一个次版本，但一致最稳）",
      "装完后锁定版本（apt-mark hold）——防止系统自动升级把集群搞崩",
    ];
    vers.forEach((t, i) => {
      const y = 3.75 + i * 0.42;
      s.addShape("ellipse", { x: 0.7, y: y + 0.04, w: 0.16, h: 0.16, fill: { color: C.accent } });
      s.addText(t, {
        x: 0.95, y, w: 8.4, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
