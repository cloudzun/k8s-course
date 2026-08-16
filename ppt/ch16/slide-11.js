// slide-11.js — 16.2.4 网络层排查流程
const { C, sectionTitle, numBadge, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 11, title: "网络层排查" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "网络层：访问不通（Service/DNS 排查流程）");
    const steps = [
      { t: "Service 有后端吗？", c: "kubectl get endpoints web-svc", d: "ENDPOINTS 为空 = selector 没匹配上（检查 Service 与 Pod 标签）" },
      { t: "DNS 解析对吗？", c: "kubectl exec xxx -- nslookup web-svc.default.svc", d: "解析失败 = Service 名/命名空间写错，或 coredns 异常" },
      { t: "连通性：", c: "kubectl exec xxx -- wget -O- http://web-svc", d: "通 = 网络 OK；不通 = kube-proxy/CNI 问题" },
    ];
    steps.forEach((st, i) => {
      const y = 1.4 + i * 1.05;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.95, fill: { color: i % 2 ? C.bgLight : C.bgWhite }, line: { color: C.border, width: 1 } });
      numBadge(s, 0.75, y + 0.25, i + 1, C.primary);
      s.addText(st.t, {
        x: 1.35, y: y + 0.08, w: 3.4, h: 0.35,
        fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(st.c, {
        x: 1.35, y: y + 0.45, w: 4.9, h: 0.35,
        fontSize: 10.5, fontFace: "Consolas", color: C.textDark, margin: 0
      });
      s.addText(st.d, {
        x: 6.35, y: y + 0.08, w: 2.9, h: 0.8,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid,
        valign: "middle", margin: 0, lineSpacingMultiple: 1.15
      });
    });
    calloutBar(s, "经典根因：Service 的 selector 拼错标签（app=web vs app=Web）→ Endpoints 空 → 服务 502——实验 10 Lab 4 亲手踩过。", 4.9);
  }
};
