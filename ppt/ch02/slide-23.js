// slide-23.js — 2.4.1 kube-apiserver
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 23, title: "kube-apiserver" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "kube-apiserver：集群的唯一入口");
    s.addText("所有请求（kubectl、各组件、Pod 内服务、控制台）都先到这里——“所有组件不直接互访，只通过 apiserver 交互”（星型拓扑）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.5,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const steps = [
      "① 认证 Authentication —— 你是谁？（X.509 证书 / Token / 用户名密码）",
      "② 授权 Authorization —— 你能干什么？（RBAC 检查）",
      "③ 准入控制 Admission —— 请求合法吗？（插件检查/修改，可拒绝）",
      "④ 持久化 —— 写入 etcd",
      "⑤ 返回结果 + 通知关注者（Watch 机制）",
    ];
    steps.forEach((st, i) => {
      const y = 1.75 + i * 0.62;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.5, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.06, h: 0.5, fill: { color: C.primary } });
      s.addText(st, {
        x: 0.85, y, w: 8.3, h: 0.5,
        fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("两个关键能力：Watch（监听）机制 = 控制循环的“眼睛”；API 发现（kubectl api-resources / explain）", {
      x: 0.6, y: 4.95, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, margin: 0
    });
    calloutBar(s, "集中管控 = 一处认证授权、一处审计、一处限流；apiserver 起不来 = 集群完全不可用。", 5.0);
  }
};

