// slide-24.js — 3.10/3.11 维护起点与实验指引
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 24, title: "维护起点与实验演练指引" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "安装之后：维护起点与实验指引");
    s.addText("安装之后：集群维护的起点（动手实验在实验 12，完整流程第 14 章展开）", {
      x: 0.6, y: 1.18, w: 4.6, h: 0.55,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const lefts = [
      { t: "etcd 备份（装完第一件事）", d: "etcd = 集群的全部状态——配置快照 + 周期策略 + 恢复演练，CKA 必考" },
      { t: "升级认知", d: "kubeadm 升级有固定顺序：控制面先行、worker 逐台排空升级（第 14 章展开）" },
      { t: "实验 12“集群维护与运维”", d: "etcd 备份恢复 + kubeadm 升级 + 节点维护演练" },
    ];
    lefts.forEach((it, i) => {
      const y = 1.85 + i * 0.95;
      card(s, 0.6, y, 4.55, 0.85, C.accent);
      s.addText(it.t, {
        x: 0.85, y: y + 0.06, w: 4.1, h: 0.3,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
      });
      s.addText(it.d, {
        x: 0.85, y: y + 0.37, w: 4.1, h: 0.42,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("实验演练指引（本章动手内容全在实验手册 实验 01）", {
      x: 5.4, y: 1.18, w: 4.2, h: 0.55,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const rights = [
      "手动安装（10 步）：按本章原理走完整流程（含国内变通与故障清单）",
      "实验 12：etcd 备份恢复 / kubeadm 升级 / 节点维护演练",
      "附录 A-F：加速站清单与预测试、配置原理、版本组合、worker 一键脚本、单节点安装、实测记录（9 个坑）",
      "Kubectl 基础：第 2 章 Killercoda 演练的命令在自有集群完整过一遍",
    ];
    rights.forEach((r, i) => {
      const y = 1.85 + i * 0.6;
      s.addShape("ellipse", { x: 5.55, y: y + 0.08, w: 0.16, h: 0.16, fill: { color: C.accent } });
      s.addText(r, {
        x: 5.85, y, w: 3.7, h: 0.55,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("教学建议：先在 Killercoda（第 2 章）建立命令直觉 → 读本章理解原理 → 按实验手册（实验 01）动手安装 → 对照 §3.8 验收", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
  }
};
