// slide-12.js — 18.4 清理规范：先入口后数据
const { C, sectionTitle, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 12, title: "清理规范：先入口后数据" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "清理规范：先入口后数据");
    s.addText("清理顺序的原则：先停流量 → 再删应用 → 最后删数据（第 10 章“PVC 删除 = 数据删除”）", {
      x: 0.6, y: 1.05, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    // 四个清理步骤框
    const steps = [
      { n: "① 入口", l1: "删 Ingress", l2: "删 HPA（先停流量与伸缩）" },
      { n: "② 应用", l1: "删 Deployment", l2: "删 Service（工作负载消失）" },
      { n: "③ 数据", l1: "删 PVC", l2: "确认数据不要了才删！" },
      { n: "④ 凭据", l1: "删 Secret", l2: "最后删命名空间（清残留）" },
    ];
    steps.forEach((st, i) => {
      const x = 0.6 + i * 2.25;
      s.addShape("rect", { x, y: 1.6, w: 1.9, h: 1.35, fill: { color: i % 2 ? C.bgWhite : C.bgCard }, shadow: { type: "outer", color: "000000", blur: 5, offset: 2, angle: 135, opacity: 0.06 } });
      s.addShape("rect", { x, y: 1.6, w: 1.9, h: 0.06, fill: { color: C.primary } });
      s.addText(st.n, { x: x + 0.1, y: 1.72, w: 1.7, h: 0.3, fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
      s.addText(st.l1 + "\n" + st.l2, { x: x + 0.1, y: 2.05, w: 1.7, h: 0.8, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
      if (i < 3) {
        s.addText("→", { x: x + 1.92, y: 2.12, w: 0.3, h: 0.4, fontSize: 14, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
      }
    });
    s.addText("删除顺序的意义：流量与伸缩先停，避免删除过程中仍有请求进来；工作负载消失后再动数据，避免重建读取失败。", {
      x: 0.6, y: 3.25, w: 8.8, h: 0.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    warnBar(s, "PVC 删除 = 数据物理删除（local-path Delete 回收）——确认不要数据再删；想保留就留着 PVC。", 4.6);
  }
};
