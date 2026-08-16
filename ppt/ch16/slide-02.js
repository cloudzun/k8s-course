// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "说出分层排障框架（节点/Pod/容器/网络/存储）与每层的判断依据",
      "掌握证据链思维：现象 → 事件 → 日志 → 根因的取证顺序",
      "熟记排障纪律：先恢复再排查、一次只改一个、报错即答案",
      "对典型故障（NotReady/ImagePullBackOff/CrashLoop/探针失败/PVC 挂载失败）说出排查路径",
      "解释可靠性工程三件套（滚动更新调优/优雅终止/PDB）如何让故障少发生",
      "解释主动演练（混沌思想）的意义与基本方法",
    ];
    goals.forEach((g, i) => {
      const y = 1.25 + i * 0.62;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.55,
        fontSize: 13.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
