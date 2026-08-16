// slide-12.js — 3.3.3/3.3.4 其他运行时与 SystemdCgroup
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 12, title: "其他运行时与 SystemdCgroup" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "其他运行时 · SystemdCgroup", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "运行时", options: hdr }, { text: "特点", options: hdr }, { text: "适用场景", options: hdr }],
      [{ text: "containerd（本课程）", options: mkF(0) }, { text: "轻量、标准、CNCF 托管", options: celA }, { text: "默认选择，绝大多数场景", options: celB }],
      [{ text: "CRI-O", options: mkF(1) }, { text: "专为 Kubernetes 而生、极简（只为 K8s 服务）", options: celB }, { text: "偏爱极简、RedHat 生态（OpenShift 用）", options: celA }],
      [{ text: "Kata Containers", options: mkF(0) }, { text: "每个容器跑在轻量虚拟机里（硬件级隔离）", options: celA }, { text: "安全敏感：多租户、不可信负载（牺牲性能换隔离）", options: celB }],
      [{ text: "gVisor", options: mkF(1) }, { text: "用户态内核拦截系统调用", options: celB }, { text: "同样面向安全隔离场景", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.25, w: 8.8, colW: [2.3, 3.3, 3.2],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.42,
    });
    s.addText("关键配置项的原理：SystemdCgroup = true", {
      x: 0.6, y: 3.5, w: 8.0, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    card(s, 0.6, 3.95, 8.8, 0.85, C.primary);
    s.addText("cgroup 有两种“驱动”：systemd 或 cgroupfs。Ubuntu 用 systemd 管理整个系统的 cgroup 树，kubelet 也用 systemd 驱动——containerd 必须与 kubelet 用同一种驱动，否则两边对 cgroup 的管理冲突，Pod 的资源限制（requests/limits，第 7 章）失效", {
      x: 0.9, y: 4.0, w: 8.2, h: 0.75,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    calloutBar(s, "SystemdCgroup=true：containerd 的 cgroup 驱动要与 kubelet 对齐（都是 systemd）——这是安装时最容易漏、漏了最隐蔽的配置（集群能跑但资源限制不生效）。", 4.95);
  }
};
