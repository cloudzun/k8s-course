// slide-10.js — 1.1.5 OCI 标准
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 10, title: "OCI 标准" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "OCI 标准：让“容器”不绑死某一家", C.bgLight);
    card(s, 0.6, 1.3, 4.3, 1.9, C.primary);
    s.addText("Image Spec（镜像规范）", {
      x: 0.86, y: 1.45, w: 3.9, h: 0.45,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("镜像的打包格式（分层 / 配置 / manifest）\n——任何符合规范的镜像，任何符合规范的运行时都能跑", {
      x: 0.86, y: 1.95, w: 3.9, h: 1.1,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    card(s, 5.1, 1.3, 4.3, 1.9, C.accent);
    s.addText("Runtime Spec（运行时规范）", {
      x: 5.36, y: 1.45, w: 3.9, h: 0.45,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("容器运行时的行为（进程 / 命名空间 / cgroups 配置、生命周期钩子）", {
      x: 5.36, y: 1.95, w: 3.9, h: 1.1,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    card(s, 0.6, 3.4, 8.8, 1.0, C.accentWarm);
    s.addText("本书伏笔：Docker 构建的镜像 → containerd（符合 OCI Runtime Spec）直接运行", {
      x: 0.86, y: 3.52, w: 8.3, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.gold, margin: 0
    });
    s.addText("第 3 章“K8s 用 containerd 替换 Docker”之所以无缝，正是因为大家都遵守 OCI", {
      x: 0.86, y: 3.92, w: 8.3, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    calloutBar(s, "生态不绑死：镜像可来自 Docker / Podman / Buildah，运行时可以是 containerd / CRI-O——标准是生态互通的基石。", 4.75);
  }
};
