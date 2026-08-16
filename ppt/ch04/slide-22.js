// slide-22.js — 4.5.2/4.5.3 不设置的后果与 QoS 等级
const { C, sectionTitle, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 22, title: "不设置的后果与 QoS" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "不设置会怎样？与 QoS 等级", C.bgLight);
    card(s, 0.6, 1.3, 4.5, 2.55, C.primary);
    s.addText("不设置的三种情况", {
      x: 0.86, y: 1.42, w: 4.0, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const nos = [
      "只有 requests 没 limits：调度有保障，运行时不受限（可超用节点资源）",
      "只有 limits 没 requests：limits 隐式等于 requests（K8s 自动补）",
      "都没有：调度“任何节点都行”（可能挤爆别人），运行时无上限（风险）",
    ];
    nos.forEach((t, i) => {
      s.addText("▸ " + t, {
        x: 0.9, y: 1.9 + i * 0.62, w: 4.0, h: 0.6,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
      });
    });
    card(s, 5.3, 1.3, 4.1, 2.55, C.accent);
    s.addText("QoS 等级：决定节点紧张时谁先被杀", {
      x: 5.56, y: 1.42, w: 3.6, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    const qos = [
      ["Guaranteed（保证）", "requests = limits（都设且相等）——最后被杀"],
      ["Burstable（可突发）", "requests < limits 或只设 requests——有保障可超用，中间"],
      ["BestEffort（尽力而为）", "什么都没设——最容易被杀"],
    ];
    qos.forEach((q, i) => {
      const y = 1.9 + i * 0.62;
      s.addText(q[0], {
        x: 5.56, y, w: 1.75, h: 0.55,
        fontSize: 10.5, fontFace: "Consolas", bold: true, color: C.primary, valign: "top", margin: 0
      });
      s.addText(q[1], {
        x: 7.35, y, w: 1.95, h: 0.55,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
      });
    });
    warnBar(s, "生产实践：核心服务配 Guaranteed（requests = limits）；一般服务 Burstable；BestEffort 只给测试任务。", 4.15);
    s.addText("（实验 02 Lab 10：requests / limits 生效，超限节流与 OOM）", {
      x: 0.6, y: 4.8, w: 8.8, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
