// slide-12.js — 6.3.1/6.3.2 为什么需要 Pod 间位置控制 + 拓扑域
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 12, title: "Pod 间位置控制与拓扑域" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Pod 间位置控制与拓扑域（topologyKey）", C.bgLight);
    // 为什么需要
    card(s, 0.6, 1.15, 4.3, 1.5, C.primary);
    s.addText("反亲和（分散）→ 高可用", {
      x: 0.9, y: 1.25, w: 3.8, h: 0.32, fontSize: 12.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    s.addText("同一应用的 3 个副本不要放同一台节点——一台挂了，不至于全部副本一起挂", {
      x: 0.9, y: 1.62, w: 3.8, h: 0.9, fontSize: 11, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
    card(s, 5.1, 1.15, 4.3, 1.5, C.accent);
    s.addText("亲和（聚合）→ 数据本地性", {
      x: 5.4, y: 1.25, w: 3.8, h: 0.32, fontSize: 12.5, fontFace: "Microsoft YaHei",
      bold: true, color: C.accent, margin: 0
    });
    s.addText("缓存服务与计算服务放在同一节点——本地访问快，不跨节点", {
      x: 5.4, y: 1.62, w: 3.8, h: 0.9, fontSize: 11, fontFace: "Microsoft YaHei",
      color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
    s.addText("nodeSelector / 节点亲和做不了这个——它们只认节点标签，不关心其他 Pod 在哪（实验 04 Lab 2）", {
      x: 0.6, y: 2.78, w: 8.8, h: 0.35, fontSize: 10.5, fontFace: "Microsoft YaHei",
      color: C.textMid, margin: 0
    });
    // 拓扑域
    card(s, 0.6, 3.25, 8.8, 2.35, C.primary);
    s.addText("topologyKey：用什么维度衡量“同一处”——按哪个标签分组", {
      x: 0.9, y: 3.38, w: 8.2, h: 0.35, fontSize: 13, fontFace: "Microsoft YaHei",
      bold: true, color: C.primary, margin: 0
    });
    const tItems = [
      "kubernetes.io/hostname：按节点分——同一节点 = 同一拓扑域",
      "topology.kubernetes.io/zone：按可用区分——同一机房 = 同一拓扑域",
      "topology.kubernetes.io/region：按地域分",
    ];
    tItems.forEach((t, i) => {
      s.addText("• " + t, {
        x: 0.9, y: 3.8 + i * 0.36, w: 8.2, h: 0.35,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("node1（web-1, web-2）│ node2（web-3）│ node3（　）→ web-1 / web-2 同拓扑域，反亲和避免", {
      x: 0.9, y: 4.95, w: 8.2, h: 0.28, fontSize: 9.5, fontFace: "Consolas",
      color: C.textMid, margin: 0
    });
    s.addText("核心认知：拓扑域 = “多分散 / 多聚合才算数”的度量单位——同节点分散是默认，跨可用区是生产进阶", {
      x: 0.9, y: 5.28, w: 8.2, h: 0.3, fontSize: 10, fontFace: "Microsoft YaHei",
      bold: true, color: C.accent, margin: 0
    });
  }
};
