// slide-07.js — 4.2.1 镜像与拉取策略
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 7, title: "镜像与拉取策略" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "镜像与拉取策略（imagePullPolicy）");
    const cols = [
      { t: "IfNotPresent", d: "本地有就用本地，没有才拉", tag: "版本化镜像（nginx:1.27）的默认策略" },
      { t: "Always", d: "每次到仓库拉取，检查 digest 有变化就更新", tag: ":latest 或无 tag 的默认策略" },
      { t: "Never", d: "只用本地镜像，绝不拉取", tag: "离线环境、测试镜像" },
    ];
    cols.forEach((c, i) => {
      const x = 0.6 + i * 3.0;
      card(s, x, 1.35, 2.8, 1.5, [C.primary, C.accentWarm, C.secondary][i]);
      s.addText(c.t, {
        x: x + 0.22, y: 1.48, w: 2.4, h: 0.35,
        fontSize: 14, fontFace: "Consolas", bold: true, color: C.primary, margin: 0
      });
      s.addText(c.d, {
        x: x + 0.22, y: 1.9, w: 2.4, h: 0.4,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
      s.addText(c.tag, {
        x: x + 0.22, y: 2.32, w: 2.4, h: 0.4,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
      });
    });
    card(s, 0.6, 3.05, 8.8, 1.15, C.accent);
    s.addText("关键认知：默认策略由镜像 tag 决定", {
      x: 0.9, y: 3.17, w: 8.2, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("带具体版本（nginx:1.27）→ 默认 IfNotPresent（版本不可变，本地有就不重复拉）\n用 :latest 或没写 tag → 默认 Always（latest 是“移动靶”，每次启动确认最新）", {
      x: 0.9, y: 3.55, w: 8.2, h: 0.6,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.2, margin: 0
    });
    calloutBar(s, "“tag 即契约”：版本化镜像假设不可变、latest 假设始终要最新——生产永远用具体版本号 + IfNotPresent，规避 :latest 的不可预测性。");
    s.addText("（实验 02 Lab 4：拉取策略）", {
      x: 0.6, y: 5.3, w: 8.8, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
