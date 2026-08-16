// slide-22.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 22, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "流量真的经过 kube-proxy 进程吗？iptables 和 IPVS 模式的本质区别是什么？",
      "headless Service 的 DNS 返回什么？为什么 StatefulSet 需要 headless？",
      "跨命名空间访问 Service，DNS 名怎么写？只写 mysql 会发生什么？",
      "Ingress 对象不部署控制器会怎样？backend 为什么指向 Service 而不是 Pod？",
      "给数据库配了“只允许 app 访问”的 NetworkPolicy，为什么数据库 Pod 突然“域名解析失败”了？",
      "外部用户访问 WordPress 的完整路径中，哪一层做域名路由、哪一层做负载均衡、哪一层做端口转发？",
    ];
    qs.forEach((q, i) => {
      const y = 1.2 + i * 0.6;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.55,
        fontSize: 12, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "CKA 考点（域 3：服务与网络，20%，CKA 第二重）：kubectl expose 多端口 Service、headless + StatefulSet、Ingress（host/path + TLS）、NetworkPolicy（podSelector/ipBlock、ingress/egress）；排障关联（域 5）：Endpoints 为空、DNS 失败、Ingress 404/502、策略误拦。", 4.95);
  }
};
