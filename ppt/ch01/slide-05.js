// slide-05.js — 为什么容器更快更轻
const { C, sectionTitle, card, calloutBar, bigCallout } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 5, title: "为什么容器更快更轻" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "为什么容器更快更轻", C.bgLight);
    bigCallout(s, "容器 = 宿主机上的“一组受约束的进程”", 1.3, 1.0);
    card(s, 0.6, 2.6, 4.3, 1.8, C.primary);
    s.addText("不虚拟硬件和操作系统", {
      x: 0.86, y: 2.8, w: 3.9, h: 0.5,
      fontSize: 16, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("容器共享宿主机内核，没有 Hypervisor 层，没有 Guest OS——启动就是启动一个进程，自然秒级、轻量。", {
      x: 0.86, y: 3.35, w: 3.9, h: 1.0,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    card(s, 5.1, 2.6, 4.3, 1.8, C.accent);
    s.addText("隔离与限制靠内核机制", {
      x: 5.36, y: 2.8, w: 3.9, h: 0.5,
      fontSize: 16, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("命名空间（Namespaces）：隔离“看得见”\ncgroups（Control Groups）：限制“能用多少”", {
      x: 5.36, y: 3.35, w: 3.9, h: 1.0,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    calloutBar(s, "这是容器与虚拟机的本质区别：VM 是“模拟一台机器”，容器是“约束一组进程”。", 4.8);
  }
};
