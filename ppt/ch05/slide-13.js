// slide-13.js — 5.3.1-5.3.2 有状态三难题与稳定网络标识
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 13, title: "有状态三难题与稳定标识" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "有状态三难题与稳定网络标识", C.bgLight);
    const cards = [
      { t: "① 身份要稳定", d: "副本 web-0 永远是 web-0——集群里其他组件认它的名字", c: C.primary },
      { t: "② 存储要固定", d: "每个副本的数据必须绑在自己的卷上：删了重建数据不丢、不串", c: C.accent },
      { t: "③ 启动要有序", d: "主从架构：主库先起、从库后起（副本 0 先于副本 1）", c: C.accentWarm },
    ];
    cards.forEach((cd, i) => {
      const x = 0.6 + i * 2.98;
      card(s, x, 1.2, 2.83, 1.1, cd.c);
      s.addText(cd.t, {
        x: x + 0.2, y: 1.28, w: 2.45, h: 0.34,
        fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: cd.c, margin: 0
      });
      s.addText(cd.d, {
        x: x + 0.2, y: 1.66, w: 2.45, h: 0.58,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("Deployment 给不了这些（Pod 名随机、卷不绑定、无顺序）——StatefulSet 就是为此设计的", {
      x: 0.6, y: 2.44, w: 8.8, h: 0.32,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 2.86, 8.8, 1.62,
`StatefulSet: web（replicas=3）—— 每个 Pod 有稳定且有序的名字：<sts名>-<序号>
  ├─ web-0  ←→ 稳定 DNS: web-0.web-svc.default.svc
  ├─ web-1  ←→ web-1.web-svc.default.svc
  └─ web-2  ←→ web-2.web-svc.default.svc`, 11);
    s.addText("名字从 0 开始编号、永不改变——Pod 删了重建还是叫 web-1；配合 headless Service（实验 07 Lab 4），从库连主库就用固定名 web-0.web-svc.namespace.svc", {
      x: 0.6, y: 4.65, w: 8.8, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
