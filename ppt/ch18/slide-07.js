// slide-07.js — 18.2.1 数据层：MySQL + Secret + PVC
const { C, sectionTitle, card, numBadge, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 7, title: "数据层：MySQL + Secret + PVC" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "数据层：MySQL + Secret + PVC（StatefulSet）", C.bgLight);
    const items = [
      { t: "Secret：mysql-pass", d: "密码只存 Secret，yaml 零明文（第 8 章）" },
      { t: "PVC 模板：volumeClaimTemplates", d: "每个副本独立 PVC，数据落节点（第 10 章）" },
      { t: "StatefulSet：mysql 单副本", d: "env 从 Secret 注入 · 稳定标识 mysql-0（第 5 章）" },
      { t: "Service：ClusterIP / headless", d: "应用用服务名连接，不关心 Pod IP（第 9 章）" },
    ];
    const pos = [
      { x: 0.6, y: 1.2 }, { x: 5.1, y: 1.2 },
      { x: 0.6, y: 2.3 }, { x: 5.1, y: 2.3 },
    ];
    items.forEach((it, i) => {
      const p = pos[i];
      card(s, p.x, p.y, 4.3, 1.0, C.primary);
      numBadge(s, p.x + 0.18, p.y + 0.16, i + 1);
      s.addText(it.t, { x: p.x + 0.8, y: p.y + 0.14, w: 3.35, h: 0.32, fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
      s.addText(it.d, { x: p.x + 0.8, y: p.y + 0.5, w: 3.35, h: 0.42, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    });
    warnBar(s, "反模式警示：Deployment 跑数据库 = Pod 名随机、存储不绑定——有状态应用必须 StatefulSet。", 3.55);
    s.addText("“单副本”决策：数据库不适合随意多副本（写冲突）——教学环境单点，生产用主从（第 14 章 HA 思想）。", {
      x: 0.6, y: 4.2, w: 8.8, h: 0.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
