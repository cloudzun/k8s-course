// slide-09.js — 9.2.4 headless Service
const { C, sectionTitle, card, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 9, title: "headless Service" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "headless Service：不要虚拟 IP", C.bgLight);
    s.addText("clusterIP: None 的 Service 不创建虚拟 IP——DNS 直接返回所有后端 Pod IP 列表，调用方自己选（轮询 / 随机）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.62, 8.8, 1.15, [
      "普通 Service：DNS 解析 web-svc → 1 个 ClusterIP（kube-proxy 转发）",
      "headless：   DNS 解析 web-svc → N 个 Pod IP（调用方自行选择）",
    ].join("\n"), 12.5);
    card(s, 0.6, 3.0, 4.3, 1.5, C.primary);
    s.addText("典型用途 ①：StatefulSet 稳定 DNS 名", {
      x: 0.9, y: 3.1, w: 3.7, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("web-0.web-svc.namespace.svc——Pod 名解析由 StatefulSet 控制器写入 DNS，要求 Service 是 headless", {
      x: 0.9, y: 3.48, w: 3.7, h: 0.9,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    card(s, 5.1, 3.0, 4.3, 1.5, C.accent);
    s.addText("典型用途 ②：自己控制负载", {
      x: 5.4, y: 3.1, w: 3.7, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("需要“拿到所有后端 IP 自己选”的场景——如数据库客户端自己挑从库", {
      x: 5.4, y: 3.48, w: 3.7, h: 0.9,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    calloutBar(s, "关键点：headless 的“稳定 DNS 名”只有配合 StatefulSet 才有——普通 Deployment 的 Pod 没有 pod名.svc 解析。", 4.7);
  }
};
