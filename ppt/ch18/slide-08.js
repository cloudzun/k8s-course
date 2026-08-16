// slide-08.js — 18.2.2/18.2.3 应用层与访问层
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 8, title: "应用层与访问层" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "应用层与访问层：Deployment 双线 + Service/Ingress");
    // 应用层
    card(s, 0.6, 1.25, 4.25, 2.15, C.primary);
    s.addText("应用层 · WordPress + Deployment + PVC（18.2.2）", { x: 0.9, y: 1.4, w: 3.75, h: 0.32, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    s.addText([
      { text: "① PVC：", options: { bold: true } },
      { text: "wordpress-pvc 存主题/上传文件——用户数据的持久化", options: {} },
    ], { x: 0.9, y: 1.78, w: 3.7, h: 0.4, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0 });
    s.addText([
      { text: "② Deployment：", options: { bold: true } },
      { text: "多副本 + env（WORDPRESS_DB_HOST=mysql 服务名）", options: {} },
    ], { x: 0.9, y: 2.2, w: 3.7, h: 0.4, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0 });
    s.addText([
      { text: "③ readinessProbe：", options: { bold: true } },
      { text: "就绪才接流量（滚动更新/Service 的前提）", options: {} },
    ], { x: 0.9, y: 2.62, w: 3.7, h: 0.4, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0 });
    s.addText("上传的图片/主题属“应用数据”——删 Pod 数据还在（实验 11 Lab 5 验证）", { x: 0.9, y: 3.05, w: 3.7, h: 0.3, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
    // 访问层
    card(s, 5.15, 1.25, 4.25, 2.15, C.accent);
    s.addText("访问层 · Service + Ingress（18.2.3）", { x: 5.45, y: 1.4, w: 3.75, h: 0.32, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0 });
    s.addText([
      { text: "① Service：", options: { bold: true } },
      { text: "wordpress ClusterIP（内部负载均衡）→ 第 9 章 §9.2", options: {} },
    ], { x: 5.45, y: 1.78, w: 3.7, h: 0.4, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0 });
    s.addText([
      { text: "② Ingress：", options: { bold: true } },
      { text: "wp.example.com → wordpress Service（域名路由）→ 第 9 章 §9.4", options: {} },
    ], { x: 5.45, y: 2.2, w: 3.7, h: 0.4, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0 });
    s.addText([
      { text: "③ 访问验证：", options: { bold: true } },
      { text: "curl 指定 Host 头访问 NodePort（见下方命令）", options: {} },
    ], { x: 5.45, y: 2.62, w: 3.7, h: 0.4, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", margin: 0 });
    s.addText("Service 是 Pod 之上的稳定访问层，Ingress 是集群入口的域名路由", { x: 5.45, y: 3.05, w: 3.7, h: 0.3, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
    codeBlock(s, 0.6, 3.75, 8.8, 0.6, "curl -H \"Host: wp.example.com\" http://节点IP:NodePort/", 12);
    s.addText("链路：wp.example.com → Ingress → Service → Pod（先通 Service，再接 Ingress，逐层验证）。", {
      x: 0.6, y: 4.55, w: 8.8, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
