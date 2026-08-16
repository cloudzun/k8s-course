// slide-06.js — 16.1.3 排障纪律（三条铁律）
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 6, title: "排障纪律" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "排障纪律：三条铁律");
    const rules = [
      { t: "报错信息就是答案", d: "K8s 的报错几乎都直说“差在哪”：manifest not found=镜像名错、配额、调度条件——先读报错，再想别的" },
      { t: "先恢复、再排查", d: "生产故障第一优先恢复业务（rollout undo 回滚、scale 副本、重启），恢复后再慢慢查根因" },
      { t: "一次只改一个", d: "改完验证、不行再改下一个——多变量同时改 = 无法定位（与 Git 二分思路一致）" },
    ];
    rules.forEach((r, i) => {
      const x = 0.6 + i * 3.05;
      card(s, x, 1.5, 2.9, 3.2, i === 2 ? C.accentWarm : C.primary);
      numBadge(s, x + 0.15, 1.68, i + 1, i === 2 ? C.accentWarm : C.primary);
      s.addText(r.t, {
        x: x + 0.15, y: 2.25, w: 2.6, h: 0.45,
        fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(r.d, {
        x: x + 0.15, y: 2.85, w: 2.6, h: 1.7,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.3, margin: 0, valign: "top"
      });
    });
    s.addShape("rect", { x: 0.6, y: 5.0, w: 8.8, h: 0.5, fill: { color: C.bgCard } });
    s.addText("纪律的本质：把排障变成“可复现的流程”而不是“碰运气”", {
      x: 0.85, y: 5.0, w: 8.3, h: 0.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true,
      valign: "middle", margin: 0
    });
  }
};
