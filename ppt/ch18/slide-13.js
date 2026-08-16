// slide-13.js — 18.5 CRD 与 Operator（集群扩展机制）
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 13, title: "展望：CRD 与 Operator" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "展望：CRD 与 Operator（集群扩展机制）", C.bgLight);
    s.addText("前 17 章用的是 Kubernetes 内置资源（Pod / Deployment / Service…）；生产中还常见“会自我管理”的扩展资源（cert-manager 自动签发证书、Prometheus Operator 管理监控）——它们的底座就是 CRD + Operator。", {
      x: 0.6, y: 1.02, w: 8.8, h: 0.45,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // CRD 卡
    card(s, 0.6, 1.55, 4.25, 1.5, C.primary);
    s.addText("CRD：自定义资源定义", { x: 0.9, y: 1.68, w: 3.75, h: 0.3, fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    s.addText("让 Kubernetes 认识“你自己的资源类型”——业务对象成为一等公民", { x: 0.9, y: 2.0, w: 3.7, h: 0.3, fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    s.addText("kind: Certificate → apply 创建 → kubectl get certificates 查看", { x: 0.9, y: 2.3, w: 3.7, h: 0.3, fontSize: 10.5, fontFace: "Consolas", color: C.textDark, margin: 0 });
    s.addText("注意：CRD 只是“数据表”——对象创建了，谁来处理它？", { x: 0.9, y: 2.62, w: 3.7, h: 0.3, fontSize: 11, fontFace: "Microsoft YaHei", color: C.accentWarm, margin: 0 });
    // Operator 卡
    card(s, 5.15, 1.55, 4.25, 1.5, C.accent);
    s.addText("Operator：CRD + 控制器", { x: 5.45, y: 1.68, w: 3.75, h: 0.3, fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0 });
    s.addText("“会处理自定义资源的控制器”（第 5 章控制循环模式复用）", { x: 5.45, y: 2.0, w: 3.7, h: 0.3, fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    s.addText("cert-manager：声明 Certificate → 自动申请/校验/签发 → 写入 tls Secret → 到期续期", { x: 5.45, y: 2.3, w: 3.7, h: 0.42, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    s.addText("（第 9 章 Ingress TLS 的证书从此“自动化”）", { x: 5.45, y: 2.72, w: 3.7, h: 0.28, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
    // 生态表
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "Operator", options: hdr }, { text: "管理什么", options: hdr }],
      [{ text: "cert-manager", options: mkF(0) }, { text: "证书自动签发与续期", options: celA }],
      [{ text: "Prometheus Operator", options: mkF(1) }, { text: "Prometheus / Grafana 实例的生命周期", options: celB }],
      [{ text: "云厂商 Operator", options: mkF(0) }, { text: "云资源（数据库 / 负载均衡）即代码", options: celA }],
      [{ text: "数据库 Operator", options: mkF(1) }, { text: "MySQL / PostgreSQL 集群（主从 / 备份）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 3.2, w: 8.8, colW: [2.9, 5.9],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: [0.36, 0.35, 0.35, 0.35, 0.35],
    });
    s.addText("决策逻辑：资源是“标准 K8s 对象”→ 用 Helm 装（第 17 章）；需要“应用自身运维逻辑”→ 找/写 Operator（CRD + 控制器）——Helm 解决“怎么装”，Operator 解决“装完怎么自我管理”。", {
      x: 0.6, y: 5.1, w: 8.8, h: 0.45,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
