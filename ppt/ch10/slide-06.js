// slide-06.js — 10.2 卷类型与边界认知
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 6, title: "三种卷类型" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "卷（Volume）：Pod 内的存储抽象");
    s.addText("卷是 Pod 级概念：声明在 Pod 里、挂载进容器，生命周期与 Pod 一致", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const vols = [
      { t: "emptyDir · 临时共享盘", strip: C.primary,
        lines: ["创建时为空目录：容器重启不丢，Pod 删除即清空", "典型用途：容器间共享（sidecar 读主容器日志）、临时缓存", "Pod 被调度到别的节点 = 新 Pod = 新 emptyDir（数据不迁移）", "（实验 08 Lab 1：emptyDir 随 Pod 消失）"] },
      { t: "hostPath · 宿主机目录", strip: C.accent,
        lines: ["直接挂宿主机的一个目录（如 /data/mysql）", "数据在节点磁盘上——Pod 删了还在，但只在该节点", "Pod 漂移到其他节点就找不到数据", "典型用途：单节点实验、kubelet 等系统组件（实验 08 Lab 2）"] },
      { t: "configMap / secret · 配置卷", strip: C.secondary,
        lines: ["第 8 章的配置注入：键变文件", "本质也是卷——只读配置卷", "用途：配置与密钥以文件形式挂进容器"] },
    ];
    vols.forEach((v, i) => {
      const x = 0.6 + i * 3.0;
      card(s, x, 1.6, 2.8, 2.4, v.strip);
      s.addText(v.t, {
        x: x + 0.15, y: 1.75, w: 2.5, h: 0.4,
        fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(v.lines.join("\n"), {
        x: x + 0.15, y: 2.2, w: 2.5, h: 1.7,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.22, margin: 0
      });
    });
    // 边界认知
    card(s, 0.6, 4.15, 8.8, 0.95, C.accentWarm);
    s.addText("边界认知：emptyDir 和 hostPath 都“绑定节点”——它们是“单机思维”的存储", {
      x: 0.9, y: 4.25, w: 8.2, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("多节点集群要“数据跟着应用走”→ 需要集群级抽象（PV/PVC）", {
      x: 0.9, y: 4.65, w: 8.2, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
