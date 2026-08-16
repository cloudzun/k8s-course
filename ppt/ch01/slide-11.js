// slide-11.js — 核心认知（强调页）
const { C, sectionTitle, bigCallout, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "highlight", index: 11, title: "核心认知" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "核心认知");
    bigCallout(s, "OCI 是“容器界的 USB 接口”", 1.6, 1.2);
    s.addText("镜像分层、containerd 运行时，都在 OCI 的框架内工作。Docker 只是“最流行的 OCI 实现之一”。", {
      x: 0.6, y: 3.2, w: 8.8, h: 0.9,
      fontSize: 17, fontFace: "Microsoft YaHei", color: C.textDark,
      align: "center", valign: "middle", margin: 0
    });
    calloutBar(s, "第 1 章学的镜像分层、第 3 章装的 containerd——都会在本章之后的课程里反复用到。", 4.6);
  }
};
