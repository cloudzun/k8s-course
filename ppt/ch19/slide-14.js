// slide-14.js — 19.5 备考路线图（考前 4-6 周）+ 19.6 模拟演练
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "roadmap", index: 14, title: "备考路线图与模拟演练" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "备考路线图（考前 4-6 周） · 模拟演练");
    const phases = [
      { t: "阶段一（2 周）体系建立", d: "教材第 1-16 章通读 + 实验 01-12 全部亲手做一遍；重点：实验 01（装集群）/ 02（Pod）/ 10（排障）→ 产出：故障图谱 + 命令速查" },
      { t: "阶段二（1-2 周）按域强化", d: "按 §19.2 五大域重刷对应实验：域 1 → 01/09/12（etcd 备份反复练）、域 2 → 02-05、域 3 → 07、域 4 → 08、域 5 → 10 → 每域 30 分钟内完成" },
      { t: "阶段三（1 周）模拟冲刺", d: "卡时间做模拟题（每题 7 分钟纪律）；dry-run 生成 yaml 练到肌肉记忆；考前 1-2 天过 §19.2 速查表 + §19.4 陷阱清单" },
    ];
    phases.forEach((p, i) => {
      const y = 1.4 + i * 1.06;
      card(s, 0.6, y, 8.8, 0.94, i === 2 ? C.accentWarm : C.primary);
      numBadge(s, 0.75, y + 0.24, i + 1, i === 2 ? C.accentWarm : C.primary);
      s.addText(p.t, {
        x: 1.4, y: y + 0.08, w: 7.8, h: 0.3,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(p.d, {
        x: 1.4, y: y + 0.42, w: 7.85, h: 0.48,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
      });
    });
    s.addText("模拟演练指引", {
      x: 0.6, y: 4.66, w: 8.8, h: 0.3,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const checks = [
      "实验 11（WordPress 综合演练）：不看手册独立完成 = 全书实操达标",
      "自测：每个考点能不看教材说出“命令 + 关键参数 + 验证方式”（对照 §19.2 自查）",
      "排障自测：实验 10 的 5 个 Lab 重做一遍，限时 45 分钟",
    ];
    checks.forEach((c, i) => {
      const y = 5.0 + i * 0.2;
      s.addText("✓ " + c, {
        x: 0.7, y, w: 8.6, h: 0.2,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
  }
};
