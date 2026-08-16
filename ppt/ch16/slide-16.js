// slide-16.js — 16.4.3 PDB 保护 + 16.4.4 主动演练
const { C, sectionTitle, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 16, title: "PDB + 16.4.4 主动演练" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "驱逐可靠性 + 16.4.4 主动演练", C.bgLight);
    card(s, 0.6, 1.3, 4.3, 3.0, C.primary);
    s.addText("驱逐可靠性：PDB 保护", {
      x: 0.86, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 14.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("ALLOWED DISRUPTIONS = 可用副本 − minAvailable（第 6 章 §6.5.2）", {
      x: 0.86, y: 1.88, w: 3.9, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addText("价值：节点维护/升级（第 14 章）时业务无损的保障", {
      x: 0.86, y: 2.4, w: 3.9, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("核心服务必配：数据库 / 网关 / 所有多副本应用", {
      x: 0.86, y: 2.82, w: 3.9, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("边界：只保护自愿中断（drain），节点宕机管不了（那是控制器自愈的事）", {
      x: 0.86, y: 3.24, w: 3.9, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    card(s, 5.1, 1.3, 4.3, 3.0, C.accent);
    s.addText("主动演练：混沌思想", {
      x: 5.36, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 14.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("“故障会来，不如主动让它来一次”——混沌工程思想（Netflix Chaos Monkey 起源）", {
      x: 5.36, y: 1.88, w: 3.9, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addText("受控演练：杀一个 Pod → 验证自愈（ReplicaSet 重建）；停一台 worker（drain + 关机）→ 验证业务迁移 + PDB；断一个副本的网络 → 验证 Service 只把流量给就绪 Pod", {
      x: 5.36, y: 2.5, w: 3.9, h: 1.0,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    s.addText("目的：验证“系统宣称的能力”真的存在——平时演练过，真出事才不慌", {
      x: 5.36, y: 3.55, w: 3.9, h: 0.55,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
    warnBar(s, "本课程实验 10 Lab 5 与实验 02 Lab 9 的删除对比，就是最小的主动演练。", 4.5);
    s.addShape("rect", { x: 0.6, y: 5.1, w: 8.8, h: 0.42, fill: { color: C.bgBlue } });
    s.addText("可靠性 = 发布不中断 + 下线不丢请求 + 驱逐有保护——三件套对应“怎么不出事”", {
      x: 0.85, y: 5.1, w: 8.3, h: 0.42,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true,
      valign: "middle", margin: 0
    });
  }
};
