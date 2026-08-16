// slide-32.js — 2.6.1 读旅程
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 32, title: "旅程一：读请求" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "旅程一：kubectl get pods 读请求");
    const steps = [
      { t: "kubectl", d: "读取 kubeconfig（地址 + 证书）" },
      { t: "apiserver", d: "HTTPS 请求（客户端证书）→ 认证 → 授权 → 准入" },
      { t: "etcd", d: "读取 /registry/pods" },
      { t: "返回", d: "apiserver 组装响应 → kubectl 展示" },
    ];
    steps.forEach((st, i) => {
      const x = 0.6 + i * 2.28;
      s.addShape("rect", { x, y: 1.7, w: 2.1, h: 1.7, fill: { color: C.bgCard }, line: { color: C.border, width: 0.5 } });
      s.addShape("rect", { x, y: 1.7, w: 2.1, h: 0.5, fill: { color: C.primary } });
      s.addText(st.t, { x: x + 0.1, y: 1.75, w: 1.9, h: 0.4, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textLight, align: "center", margin: 0 });
      s.addText(st.d, { x: x + 0.1, y: 2.3, w: 1.9, h: 1.0, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", lineSpacingMultiple: 1.3, valign: "top", margin: 0 });
      if (i < 3) {
        s.addText("→", { x: x + 2.05, y: 2.3, w: 0.35, h: 0.4, fontSize: 15, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
      }
    });
    s.addShape("rect", { x: 0.6, y: 3.9, w: 8.8, h: 0.55, fill: { color: C.bgCard } });
    s.addShape("rect", { x: 0.6, y: 3.9, w: 0.05, h: 0.55, fill: { color: C.primary } });
    s.addText("读请求短：kubectl → apiserver → etcd → 回来；kubectl 通常走 apiserver 缓存（watch 已同步），不每次都打 etcd", {
      x: 0.85, y: 3.9, w: 8.3, h: 0.55,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, valign: "middle", margin: 0
    });
    s.addText("注意：kubectl 连接用 kubeconfig 里的客户端证书（kubernetes-admin）——没有证书的请求在认证阶段就被拒绝", {
      x: 0.6, y: 4.7, w: 8.8, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
