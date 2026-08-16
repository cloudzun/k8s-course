// slide-19.js — 4.4.4 生命周期钩子与优雅终止
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 19, title: "钩子与优雅终止" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "生命周期钩子与优雅终止");
    card(s, 0.6, 1.3, 4.5, 1.5, C.primary);
    s.addText("postStart（启动后钩子）", {
      x: 0.86, y: 1.42, w: 4.0, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("注册到注册中心、初始化脚本——与主进程并发执行（不阻塞）；失败不会导致重启（只记录事件）", {
      x: 0.86, y: 1.85, w: 4.0, h: 0.85,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
    });
    card(s, 5.3, 1.3, 4.1, 1.5, C.accent);
    s.addText("preStop（终止前钩子）", {
      x: 5.56, y: 1.42, w: 3.6, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("通知注册中心下线、排空连接、保存状态——阻塞式：必须执行完（或超时）才继续终止流程", {
      x: 5.56, y: 1.85, w: 3.6, h: 0.85,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0
    });
    s.addText("优雅终止完整流程（“发布不中断”的关键机制）", {
      x: 0.6, y: 3.0, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    const steps = [
      { t: "① Terminating", d: "从 Service 摘除" },
      { t: "② preStop 钩子", d: "排空 / 反注册" },
      { t: "③ SIGTERM", d: "应用自己收尾" },
      { t: "④ 等待宽限期", d: "默认 30s" },
      { t: "⑤ SIGKILL", d: "超时强杀兜底" },
    ];
    steps.forEach((st, i) => {
      const x = 0.6 + i * 1.82;
      s.addShape("rect", {
        x, y: 3.45, w: 1.66, h: 0.85,
        fill: { color: i === 4 ? "FDECEA" : "E8F4FD" },
        line: { color: i === 4 ? "D94F4F" : C.primary, width: 1 }
      });
      s.addText(st.t, {
        x: x + 0.05, y: 3.52, w: 1.56, h: 0.35,
        fontSize: 10, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, align: "center", margin: 0
      });
      s.addText(st.d, {
        x: x + 0.05, y: 3.88, w: 1.56, h: 0.35,
        fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0
      });
      if (i < 4) {
        s.addText("→", {
          x: x + 1.66, y: 3.5, w: 0.16, h: 0.6,
          fontSize: 12, fontFace: "Microsoft YaHei", color: C.primary, align: "center", valign: "middle", margin: 0
        });
      }
    });
    s.addText("应用收尾需要超过 30 秒？调大 terminationGracePeriodSeconds（实验 02 Lab 9：实测完整终止流程 5.8s）", {
      x: 0.6, y: 4.45, w: 8.8, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    calloutBar(s, "优雅终止 = 不丢请求：先摘流量 → preStop 排空存量 → SIGTERM 优雅退出 → 超时才 SIGKILL 兜底——发布、扩缩容、drain 都走这套流程。");
  }
};
