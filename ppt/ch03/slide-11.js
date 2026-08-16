// slide-11.js — 3.3.1/3.3.2 Docker 与 containerd 的历史纠葛
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "timeline", index: 11, title: "Docker 与 containerd 的历史纠葛" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "运行时角色与“为什么不是 Docker”");
    s.addText("运行时角色：kubelet 通过 CRI（容器运行时接口，gRPC 协议）指挥“跑容器的引擎”——引擎必须实现 CRI，kubelet 才能驱动它", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const boxes = [
      { t: "早期：Docker 是事实标准", b: "Kubernetes 通过 dockershim 适配层直接对接 Docker——当时必须兼容它", c1: "E8F4FD", c2: "4A90D9" },
      { t: "问题：Docker 是“全家桶”", b: "dockerd + containerd + 上层 CLI/网络/存储——K8s 只需要“跑容器”这一层，多余层是冗余，还引入“守护进程里的守护进程”的稳定性问题", c1: "FFF3E0", c2: "E08A3C" },
      { t: "转折（v1.24）：移除 dockershim", b: "containerd 本身直接实现 CRI（Docker 反而包了层壳）；少一层抽象 = 少一个故障点；CNCF 托管，与 K8s 同基金会、中立可信", c1: "E8F8E8", c2: "5BA85B" },
    ];
    boxes.forEach((bx, i) => {
      const x = 0.6 + i * 3.05;
      s.addShape("rect", { x, y: 1.62, w: 2.8, h: 2.15, fill: { color: bx.c1 }, line: { color: bx.c2, width: 1 } });
      s.addText(bx.t, {
        x: x + 0.12, y: 1.74, w: 2.56, h: 0.4,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: bx.c2, valign: "middle", margin: 0
      });
      s.addText(bx.b, {
        x: x + 0.12, y: 2.2, w: 2.56, h: 1.5,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
      });
    });
    card(s, 0.6, 4.0, 8.8, 1.0, C.accent);
    s.addText("现状：containerd 成为 Kubernetes 的默认/主流运行时（本课程实测 2.2.x）", {
      x: 0.9, y: 4.1, w: 8.2, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("你照样用 Docker 构建镜像（镜像符合 OCI 标准，第 1 章）——只是“跑容器”这步交给 containerd", {
      x: 0.9, y: 4.5, w: 8.2, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
  }
};
