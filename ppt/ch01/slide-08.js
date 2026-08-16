// slide-08.js — 教学记忆（强调页）
const { C, sectionTitle, bigCallout, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "highlight", index: 8, title: "教学记忆" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "教学记忆", C.bgLight);
    bigCallout(s, "命名空间（Namespaces）→ 管“看不见”→ 隔离", 1.4, 1.15);
    bigCallout(s, "cgroups → 管“用多少”→ 限制", 2.85, 1.15);
    calloutBar(s, "两者结合：容器既安全隔离，又可被资源管控——这是容器与虚拟机的本质区别。", 4.6);
  }
};
