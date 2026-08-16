// slide-09.js — 12.2.2 Seccomp Profile（restricted 的强制项）
const { C, sectionTitle, codeBlock, card } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 9, title: "Seccomp Profile" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Seccomp Profile：restricted 的强制项");
    s.addText("seccomp 限制容器能发起的系统调用——攻击面收敛：即使容器被攻破，危险 syscall 也被拦。", {
      x: 0.6, y: 1.15, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 0.6, 1.65, 8.8, 1.5, [
      "securityContext:",
      "  seccompProfile:",
      "    type: RuntimeDefault    # 使用运行时的默认 seccomp 配置（containerd 内置）",
      "    # type: Localhost + localhostProfile: 自定义 profile（进阶）",
    ].join("\n"), 11.5);
    card(s, 0.6, 3.35, 8.8, 0.8, C.accent);
    s.addText("RuntimeDefault：containerd 内置的默认策略（阻断 mount / 未授权 ptrace 等危险调用）——restricted 级别要求它。", {
      x: 0.9, y: 3.4, w: 8.2, h: 0.7,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    card(s, 0.6, 4.3, 8.8, 0.8, C.accentWarm);
    s.addText("不配置 = Unconfined（无限制）——v1.27+ 的新 Pod 默认带 RuntimeDefault 注释（行为向安全靠拢）。", {
      x: 0.9, y: 4.35, w: 8.2, h: 0.7,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    s.addText("（实验 09 Lab 8：seccomp 是 restricted 的强制项）", {
      x: 0.6, y: 5.2, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
