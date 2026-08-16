// slide-11.js — 12.2.4 违规的后果（报错解读）
const { C, sectionTitle, codeBlock, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 11, title: "违规的后果：Forbidden 报错" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "违规的后果：读懂 Forbidden 报错");
    codeBlock(s, 0.6, 1.3, 8.8, 1.5, [
      "kubectl -n psa-demo run bad --image=busybox --privileged",
      'Error from server (Forbidden): pods "bad" is forbidden: violates PodSecurity "baseline:latest":',
      'privileged (container "bad" must not set securityContext.privileged=true)',
    ].join("\n"), 11);
    s.addText("报错三要素：", {
      x: 0.6, y: 2.95, w: 3.0, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const items = [
      { c: C.primary, t: "① 违反了哪个级别 → baseline（命名空间 enforce 标签定的标准）" },
      { c: C.accent, t: "② 违反哪条规则 → privileged（禁止设置 securityContext.privileged=true）" },
      { c: C.accentWarm, t: "③ 怎么修 → must not set…：去掉违规字段，或换合规配置" },
    ];
    items.forEach((it, i) => {
      const y = 3.4 + i * 0.55;
      card(s, 0.6, y, 8.8, 0.45, it.c);
      s.addText(it.t, {
        x: 0.9, y, w: 8.2, h: 0.45,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "CKA 排障（域 5）：报错 violates PodSecurity = PSA 拦截——核对命名空间标签与 Pod 配置；实验 09 Lab 8 亲手验证。", 5.05);
  }
};
