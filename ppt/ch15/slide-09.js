// slide-09.js — 15.2.4 生产指标实践
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 9, title: "生产指标实践" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "生产指标实践");
    s.addText("三类指标 + 三层告警：从基础设施到业务体验，逐层贴近用户", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const cards = [
      { t: "利用率指标", d: "节点 CPU / 内存利用率\nPod 用量与 requests 的比值\n（结合第 7 章 requests/limits）", c: C.primary },
      { t: "应用指标（RED，进阶）", d: "请求量（QPS）\n错误率（Errors）\n延迟（Duration）", c: C.accent },
      { t: "告警分层", d: "节点级：NotReady / 磁盘满\n→ Pod 级：重启次数 / 探针失败\n→ 应用级：错误率", c: C.accentWarm },
    ];
    cards.forEach((cd, i) => {
      const x = 0.6 + i * 3.0;
      card(s, x, 1.55, 2.8, 2.3, cd.c);
      s.addText(cd.t, { x: x + 0.2, y: 1.7, w: 2.4, h: 0.4, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: cd.c, margin: 0 });
      s.addText(cd.d, { x: x + 0.2, y: 2.2, w: 2.4, h: 1.5, fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    });
    s.addText("告警是生产值班的核心：规则（CPU > 80% 持续 5 分钟）→ Alertmanager 通知 → 处理闭环（§15.2.2）", {
      x: 0.6, y: 4.15, w: 8.8, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("（实验 05 Lab 2：启用 HPA——指标的实际消费者，指标链路闭环；实验 14：kube-prometheus-stack 实操）", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
