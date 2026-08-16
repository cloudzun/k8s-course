// slide-05.js — 9.2.1-9.2.2 Service 机制：Endpoints + kube-proxy
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 5, title: "Service 机制：Endpoints + kube-proxy" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Service 机制：Endpoints + kube-proxy", C.bgLight);
    s.addText("Pod IP 是临时的（重建即变）· 多副本时该访问哪个 IP？—— Service 提供“稳定虚拟 IP + DNS 名”", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    card(s, 0.6, 1.6, 8.8, 1.15, C.primary);
    s.addText("① Endpoints（谁在服务）：控制器把 selector 匹配的 Pod IP:端口 写进 Endpoints 对象", {
      x: 0.9, y: 1.68, w: 8.3, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("Service web → selector app=web → Endpoints: [10.244.1.5:80, 10.244.2.8:80, 10.244.3.2:80]", {
      x: 0.9, y: 2.08, w: 8.3, h: 0.35,
      fontSize: 11.5, fontFace: "Consolas", color: C.primary, margin: 0
    });
    s.addText("Endpoints 为空 = selector 没匹配到 Pod（CKA 高频排障场景）", {
      x: 0.9, y: 2.45, w: 8.3, h: 0.25,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    card(s, 0.6, 2.95, 8.8, 1.05, C.accent);
    s.addText("② kube-proxy（怎么转发）：每个节点把转发规则写进内核", {
      x: 0.9, y: 3.03, w: 8.3, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("发往 ClusterIP:80 的流量 → 随机 / 轮询选一个 Endpoints → DNAT 改写目标到 Pod IP", {
      x: 0.9, y: 3.42, w: 8.3, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("转发路径（请求不经过 kube-proxy 进程）：", {
      x: 0.6, y: 4.2, w: 4.4, h: 0.3,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    const boxes = [
      { t: "应用请求\nhttp://web-svc:80", c: "FFF3E0" },
      { t: "节点内核\n（iptables / IPVS 规则）", c: "E8F4FD" },
      { t: "DNAT 改写目标\n→ 后端 Pod IP", c: "E8F8E8" },
      { t: "Pod 容器\n处理请求", c: "E8F8E8" },
    ];
    const bw = 1.95, gap = 0.28;
    boxes.forEach((b, i) => {
      const x = 0.65 + i * (bw + gap);
      s.addShape("rect", { x, y: 4.55, w: bw, h: 0.8, fill: { color: b.c }, line: { color: C.border, width: 1 } });
      s.addText(b.t, {
        x: x + 0.05, y: 4.6, w: bw - 0.1, h: 0.7,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
      });
      if (i < 3) {
        s.addText("→", { x: x + bw + 0.02, y: 4.75, w: gap - 0.04, h: 0.35, fontSize: 14, fontFace: "Microsoft YaHei", color: C.accent, align: "center", margin: 0 });
      }
    });
  }
};
