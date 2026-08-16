// slide-04.js — 12.1.1 时机与角色
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 4, title: "准入的时机与角色" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "时机与角色：第三道门");
    // 四步流程框
    const boxes = [
      { x: 0.6, y: 1.5, w: 1.9, h: 1.15, fill: "E8F4FD", line: "4A90D9", t: "认证\n（你是谁）" },
      { x: 2.95, y: 1.5, w: 1.9, h: 1.15, fill: "E8F4FD", line: "4A90D9", t: "授权\n（你能干啥）" },
      { x: 5.3, y: 1.5, w: 2.1, h: 1.15, fill: "FFF3E0", line: "E08A3C", t: "准入控制\n（请求合法吗？）" },
      { x: 7.85, y: 1.5, w: 1.55, h: 1.15, fill: "E8F8E8", line: "5BA85B", t: "写入 etcd" },
    ];
    boxes.forEach(b => {
      s.addShape("rect", { x: b.x, y: b.y, w: b.w, h: b.h, fill: { color: b.fill }, line: { color: b.line, width: 1 } });
      s.addText(b.t, {
        x: b.x + 0.05, y: b.y, w: b.w - 0.1, h: b.h,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
        align: "center", valign: "middle", margin: 0
      });
    });
    // 箭头
    [[2.55, 2.9], [4.9, 5.25], [7.45, 7.8]].forEach(([ax]) => {
      s.addText("→", {
        x: ax, y: 1.92, w: 0.35, h: 0.3,
        fontSize: 16, fontFace: "Microsoft YaHei", color: C.secondary,
        align: "center", margin: 0
      });
    });
    // 分支说明
    s.addText("通过 → 写入 etcd", {
      x: 5.3, y: 2.8, w: 2.2, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: "5BA85B", align: "center", margin: 0
    });
    s.addText("拒绝 / 修改 → Forbidden / 补默认值", {
      x: 5.3, y: 3.1, w: 2.6, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: "E08A3C", align: "center", margin: 0
    });
    // 角色卡片
    card(s, 0.6, 3.6, 8.8, 1.05, C.primary);
    s.addText("角色：对象创建 / 更新 / 删除时，一组准入控制器按顺序检查（和修改）请求——这是“规则能拦在资源落地之前”的机制：LimitRange / ResourceQuota / PSA 都靠它，第 7 章的两层防线在这里执行。", {
      x: 0.9, y: 3.65, w: 8.2, h: 0.95,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true,
      valign: "middle", margin: 0
    });
    calloutBar(s, "准入是“资源落地前的最后一道闸”——认证授权决定“能不能来”，准入决定“来的是不是合格”；既能拒绝（Validating）也能修改（Mutating）。", 4.9);
  }
};
