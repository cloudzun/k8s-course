// slide-11.js — 19.3.1 时间管理 / 19.3.3 上下文切换 / 19.3.4 保存进度
const { C, sectionTitle, card, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 11, title: "时间管理 · 上下文切换 · 保存进度" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "时间管理 · 上下文切换 · 保存进度", C.bgLight);
    const mkCard = (x, strip, title, items) => {
      card(s, x, 1.45, 4.3, 2.1, strip);
      s.addText(title, {
        x: x + 0.15, y: 1.55, w: 4.0, h: 0.35,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      items.forEach((it, i) => {
        const y = 1.98 + i * 0.5;
        s.addText("①②③"[i], {
          x: x + 0.15, y, w: 0.3, h: 0.4,
          fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: strip === C.accent ? C.accent : C.primary, margin: 0
        });
        s.addText(it, {
          x: x + 0.5, y, w: 3.65, h: 0.48,
          fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
        });
      });
    };
    mkCard(0.6, C.primary, "时间管理（19.3.1）", [
      "先易后难：先做有把握的，难题最后啃",
      "每题限时：平均 7 分钟；卡住 5 分钟 → 标记跳过，回头再补",
      "留 15 分钟复查：kubectl get 扫一遍确认创建成功",
    ]);
    mkCard(5.1, C.accent, "保存进度（19.3.4）", [
      "apply 后立即验证：get <对象> 确认创建成功（RBAC/Ingress 易静默失败）",
      "修改类操作（scale/set image）后验证结果：get pods 数量/镜像",
      "删除类操作确认：get 无结果",
    ]);
    s.addText("上下文切换（19.3.3）——每题的“第一动作”", {
      x: 0.6, y: 3.72, w: 8.8, h: 0.28,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 0.6, 4.02, 8.8, 0.92,
      "kubectl config get-contexts                  # 看有哪些集群\n" +
      "kubectl config use-context <题目指定的>       # 切到目标集群\n" +
      "kubectl get nodes                            # 确认切对了（验证）",
      11);
    calloutBar(s, "答错集群 = 白做——养成“每题开头切换 + 验证”的纪律。", 5.1);
  }
};
