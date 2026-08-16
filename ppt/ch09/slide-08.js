// slide-08.js — 9.2.3 NodePort / LoadBalancer 访问链
const { C, sectionTitle, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 8, title: "NodePort / LoadBalancer 访问链" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "NodePort 与 LoadBalancer 的访问链");
    card(s, 0.6, 1.4, 8.8, 1.45, C.primary);
    s.addText("NodePort：集群外直连节点端口", {
      x: 0.9, y: 1.52, w: 4.4, h: 0.35,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("外部用户 → 任意节点 IP:31230 → kube-proxy 规则 → ClusterIP:80 → Pod", {
      x: 0.9, y: 1.92, w: 8.2, h: 0.35,
      fontSize: 12, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("每个节点都开同一个端口，访问任意节点 IP 都能到达；适合测试 / 小规模外部访问", {
      x: 0.9, y: 2.32, w: 8.2, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    card(s, 0.6, 3.05, 8.8, 1.45, C.accent);
    s.addText("LoadBalancer：云负载均衡器接管", {
      x: 0.9, y: 3.17, w: 4.4, h: 0.35,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("外部用户 → 云负载均衡器 → 节点 IP:NodePort → ClusterIP → Pod", {
      x: 0.9, y: 3.57, w: 8.2, h: 0.35,
      fontSize: 12, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("云厂商创建负载均衡器并绑定到 NodePort——云环境生产对外首选", {
      x: 0.9, y: 3.97, w: 8.2, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    warnBar(s, "NodePort 端口范围固定 30000-32767；实验 07 Lab 3 看到的 443:30573/TCP 就是它。", 4.8);
  }
};
