// slide-05.js — 4.1.3 多容器三种协作模式
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 5, title: "三种协作模式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "单容器 vs 多容器：三种协作模式", C.bgLight);
    const cols = [
      { t: "sidecar（边车）", d: "辅助主容器，增强而不侵入", e: "日志采集 filebeat · 指标暴露 exporter · 本地文件同步" },
      { t: "Adapter（适配器）", d: "把主容器的输出转换成统一格式", e: "应用日志转标准 JSON · 指标转监控系统格式" },
      { t: "Ambassador（大使）", d: "代表主容器访问外部", e: "数据库连接池代理 · 访问外部服务的本地代理" },
    ];
    cols.forEach((c, i) => {
      const x = 0.6 + i * 3.0;
      card(s, x, 1.35, 2.8, 2.5, [C.primary, C.accent, C.accentWarm][i]);
      s.addText(c.t, {
        x: x + 0.22, y: 1.5, w: 2.4, h: 0.4,
        fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(c.d, {
        x: x + 0.22, y: 2.0, w: 2.4, h: 0.6,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
      s.addText(c.e, {
        x: x + 0.22, y: 2.65, w: 2.4, h: 1.0,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, valign: "top", margin: 0
      });
    });
    card(s, 0.6, 4.15, 8.8, 1.0, C.primary);
    s.addText("决策逻辑：先问“能不能一个容器搞定？”——单容器最简单、运维成本最低；只有进程必须同生命周期、共享本地资源时才拆多容器（sidecar 等模式）", {
      x: 0.9, y: 4.25, w: 8.2, h: 0.8,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
    s.addText("（实验 02 Lab 2：多容器 Pod）", {
      x: 0.6, y: 5.3, w: 8.8, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
