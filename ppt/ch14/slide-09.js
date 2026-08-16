// slide-09.js — 14.3.1/14.3.2 升级准备与升级顺序
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "flow", index: 9, title: "升级准备与升级顺序" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "升级准备与升级顺序", C.bgLight);
    // 升级前准备：三件事
    const preps = [
      { t: "备份 etcd（§14.4）", d: "升级失败要能回滚", strip: C.primary },
      { t: "kubeadm upgrade plan", d: "查看当前可升级的版本与依赖", strip: C.secondary },
      { t: "读兼容性说明", d: "新版本 breaking changes（如 API 移除）", strip: C.accent },
    ];
    preps.forEach((p, i) => {
      const x = 0.6 + i * 3.05;
      card(s, x, 1.25, 2.7, 1.4, p.strip);
      numBadge(s, x + 0.15, 1.4, i + 1);
      s.addText(p.t, {
        x: x + 0.75, y: 1.42, w: 1.85, h: 0.4,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(p.d, {
        x: x + 0.2, y: 1.9, w: 2.3, h: 0.65,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.2, margin: 0, valign: "top"
      });
    });
    s.addText("升级顺序（为什么是这个顺序）", {
      x: 0.6, y: 2.85, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const steps = [
      { t: "① 升级 kubeadm", d: "先升安装工具" },
      { t: "② 控制面 apply", d: "upgrade apply：迁移组件 + 更新证书" },
      { t: "③ 控制面 kubelet", d: "kubelet/kubectl 升级 + 重启" },
      { t: "④ worker 逐台", d: "drain → 升级 → upgrade node → uncordon" },
      { t: "⑤ 验证", d: "全部 Ready + 新版本" },
    ];
    steps.forEach((st, i) => {
      const x = 0.7 + i * 1.75;
      s.addShape("rect", { x, y: 3.25, w: 1.6, h: 1.35, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
      s.addShape("rect", { x, y: 3.25, w: 0.05, h: 1.35, fill: { color: i === 3 ? C.accentWarm : C.primary } });
      s.addText(st.t, {
        x: x + 0.1, y: 3.33, w: 1.4, h: 0.4,
        fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(st.d, {
        x: x + 0.1, y: 3.78, w: 1.4, h: 0.75,
        fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.15, margin: 0, valign: "top"
      });
      if (i < 4) {
        s.addText("→", {
          x: x + 1.6, y: 3.75, w: 0.15, h: 0.35,
          fontSize: 13, fontFace: "Microsoft YaHei", color: C.accentWarm,
          align: "center", valign: "middle", margin: 0
        });
      }
    });
    s.addText("（实验 12 · Lab 2 kubeadm 集群升级：先 kubeadm → 控制面 apply → worker 逐台 drain/upgrade/uncordon；升级前先备份是铁律）", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
