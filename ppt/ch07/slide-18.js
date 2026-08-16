// slide-18.js — 7.5 实验演练指引
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "labs", index: 18, title: "实验演练指引" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "实验演练指引（实验 05“资源管理和监控”）");
    s.addText("本章机制对应配套实验手册实验 05（4 个 Lab），动手验证“指标 → HPA → 配额”全链路。", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const labs = [
      { t: "Lab 1 安装 metrics-server", b: "指标链路的数据源——装好后 kubectl top node/pod 有数（requests/limits 基础在实验 02 Lab 10）", c: C.primary, x: 0.6, y: 1.6 },
      { t: "Lab 2 启用 HPA", b: "autoscaling/v2 配置 CPU/内存指标，压测观察副本数自动增减", c: C.accent, x: 5.1, y: 1.6 },
      { t: "Lab 3 LimitRange", b: "min/max/default/defaultRequest——超限 Forbidden、缺省自动填充", c: C.accentWarm, x: 0.6, y: 3.1 },
      { t: "Lab 4 ResourceQuota", b: "hard 配额观察——超配额拒绝、资源释放后自动恢复", c: C.primary, x: 5.1, y: 3.1 },
    ];
    labs.forEach(lb => {
      card(s, lb.x, lb.y, 4.3, 1.35, lb.c);
      s.addText(lb.t, {
        x: lb.x + 0.26, y: lb.y + 0.12, w: 3.9, h: 0.35,
        fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: lb.c, margin: 0
      });
      s.addText(lb.b, {
        x: lb.x + 0.26, y: lb.y + 0.5, w: 3.9, h: 0.75,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, valign: "top", margin: 0
      });
    });
    s.addText("教学建议：Lab 1 是 HPA 的前提（无指标无决策）；Lab 3/4 对比记忆——LimitRange 管单个、ResourceQuota 管总量。", {
      x: 0.6, y: 4.65, w: 8.8, h: 0.5,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, valign: "middle", margin: 0
    });
  }
};
