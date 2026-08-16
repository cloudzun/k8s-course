// slide-30.js — 2.5.3 容器运行时与 CRI
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 30, title: "容器运行时与 CRI" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "容器运行时与 CRI");
    // 结构图：kubelet → CRI → containerd（4 能力）
    s.addShape("rect", { x: 0.8, y: 1.5, w: 2.0, h: 1.1, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
    s.addText("kubelet", { x: 0.85, y: 1.62, w: 1.9, h: 0.4, fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, align: "center", margin: 0 });
    s.addText("唯一指挥者", { x: 0.85, y: 2.05, w: 1.9, h: 0.35, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0 });
    s.addText("CRI (gRPC)", { x: 3.0, y: 1.75, w: 1.2, h: 0.4, fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, align: "center", margin: 0 });
    s.addText("→", { x: 4.25, y: 1.75, w: 0.4, h: 0.4, fontSize: 16, fontFace: "Microsoft YaHei", color: C.accent, align: "center", margin: 0 });
    s.addShape("rect", { x: 4.7, y: 1.5, w: 2.0, h: 1.1, fill: { color: "E8F8E8" }, line: { color: "5BA85B", width: 1 } });
    s.addText("containerd", { x: 4.75, y: 1.62, w: 1.9, h: 0.4, fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.accent, align: "center", margin: 0 });
    s.addText("容器运行时", { x: 4.75, y: 2.05, w: 1.9, h: 0.35, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0 });
    const caps = ["沙箱管理\nPod 级 pause 容器", "容器管理\ncreate/start/stop", "镜像管理\npull/list", "监控\nstats"];
    caps.forEach((c, i) => {
      const x = 7.0 + (i % 2) * 1.45;
      const y = 1.3 + Math.floor(i / 2) * 1.5;
      s.addShape("rect", { x, y, w: 1.35, h: 1.3, fill: { color: C.bgCard }, line: { color: C.border, width: 0.5 } });
      s.addText(c, { x: x + 0.05, y: y + 0.1, w: 1.25, h: 1.1, fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", lineSpacingMultiple: 1.25, valign: "middle", margin: 0 });
    });
    card(s, 0.6, 3.3, 8.8, 1.15, C.primary);
    s.addText("pause 容器（沙箱）：每个 Pod 最先创建的“占位容器”，持有 Pod 的网络命名空间等共享资源——Pod 的 IP 属于 pause 容器，删 pause = 整个 Pod 消亡", {
      x: 0.86, y: 3.4, w: 8.3, h: 0.5,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, margin: 0
    });
    s.addText("OCI 标准：镜像格式与运行时行为遵循 OCI——第 1 章的 Docker 镜像能被 containerd 直接使用（Docker 多一层 daemon，containerd 更轻）", {
      x: 0.86, y: 3.9, w: 8.3, h: 0.45,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    s.addText("第 1 章的容器原理（命名空间/cgroups/镜像分层）就是在这里被“执行”的——kubelet 通过 CRI 驱动 containerd 用内核机制跑起容器", {
      x: 0.6, y: 4.7, w: 8.8, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.accent, bold: true, margin: 0
    });
  }
};
