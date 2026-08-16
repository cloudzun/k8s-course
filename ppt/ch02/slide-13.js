// slide-13.js — 2.2.6 标签与选择器
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "concept", index: 13, title: "标签与选择器" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "标签与选择器（Label & Selector）");
    card(s, 0.6, 1.3, 4.3, 2.1, C.primary);
    s.addText("标签（Label）", {
      x: 0.86, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("附加在对象上的键值对：\napp=web  env=prod  tier=frontend  version=v1.2", {
      x: 0.86, y: 1.85, w: 3.9, h: 0.75,
      fontSize: 12, fontFace: "Consolas", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    s.addText("用途：K8s 的“关联机制”全靠标签——控制器选 Pod、Service 选后端、调度选节点（第 6 章）", {
      x: 0.86, y: 2.6, w: 3.9, h: 0.7,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    card(s, 5.1, 1.3, 4.3, 2.1, C.accent);
    s.addText("选择器（Selector）", {
      x: 5.36, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("等值：kubectl get pods -l app=web（=、!=）\n集合：kubectl get pods -l 'app in (web,api)'（in/notin/exists）", {
      x: 5.36, y: 1.85, w: 3.9, h: 0.8,
      fontSize: 12, fontFace: "Consolas", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    s.addText("Deployment 用它管自己的 Pod；Service 用它选后端", {
      x: 5.36, y: 2.7, w: 3.9, h: 0.6,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.3, margin: 0, valign: "top"
    });
    s.addShape("rect", { x: 0.6, y: 3.6, w: 8.8, h: 1.0, fill: { color: C.bgCard } });
    s.addText("标签 vs 注解：标签是“身份证号”（结构化、可被选择器选中）；注解是“备注栏”（任意文本、不能被选择器选中）", {
      x: 0.85, y: 3.7, w: 8.3, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, margin: 0
    });
    s.addText("示例：selector.matchLabels.app=web —— Deployment 里匹配它管理的 Pod 模板标签；Service 里决定哪些 Pod 是后端", {
      x: 0.85, y: 4.15, w: 8.3, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
