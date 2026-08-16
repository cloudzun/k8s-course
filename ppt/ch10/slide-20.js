// slide-20.js — 思考题
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 20, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "容器内写的文件，Pod 删除后还在吗？emptyDir 和 hostPath 的数据分别在什么情况下会丢？",
      "PV 与 PVC 各自是谁创建的？为什么应用只写 PVC 不写 PV？",
      "PVC 一直 Pending，可能的原因有哪些（至少三个）？怎么排查（describe 看 Events）？",
      "local-path 的 PV 为什么必须是 WaitForFirstConsumer 绑定？",
      "一个 3 副本应用要共享同一个 PVC，local-path 行吗？应该用什么方案？",
      "为什么说“水平扩展的前提是存储可共享”？（结合第 5 章 StatefulSet 与本章 local-path）",
    ];
    qs.forEach((q, i) => {
      const y = 1.15 + i * 0.58;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(q, {
        x: 1.35, y, w: 8.1, h: 0.5,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    // CKA 考点条（加高以容纳两行）
    s.addShape("rect", { x: 0.6, y: 4.75, w: 8.8, h: 0.6, fill: { color: C.bgAccent } });
    s.addShape("rect", { x: 0.6, y: 4.75, w: 0.05, h: 0.6, fill: { color: C.accent } });
    s.addText("CKA 考点（域 4 存储 10%）：PV/PVC 绑定与生命周期、访问模式、回收策略、StorageClass（provisioner/默认类/绑定模式）；高频场景题：静态 vs 动态、PVC 排障（Pending → 匹配条件）、多副本共享选型。", {
      x: 0.85, y: 4.78, w: 8.3, h: 0.55,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      valign: "middle", lineSpacingMultiple: 1.1, margin: 0
    });
  }
};
