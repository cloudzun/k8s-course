// slide-07.js — 19.2 域 2 工作负载与调度 + 域 3 服务与网络
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 7, title: "域 2 与域 3 考点" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "域 2 工作负载与调度（15%） · 域 3 服务与网络（20%）");
    const mkTitle = (t, x) => {
      s.addText(t, {
        x, y: 1.1, w: 4.3, h: 0.3,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
    };
    mkTitle("域 2 工作负载与调度（15%）", 0.6);
    mkTitle("域 3 服务与网络（20%）", 5.1);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgCard : C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    const mkL = (i) => ({ fill: { color: i % 2 ? C.bgCard : C.bgWhite }, fontFace: "Consolas", fontSize: 10, color: C.accent, valign: "middle" });
    const rowsL = [
      [{ text: "考点 / 机制", options: hdr }, { text: "教材/实验", options: hdr }],
      [{ text: "Pod 配置：探针三件套、resources、restartPolicy、imagePullPolicy", options: mkF(0) }, { text: "第4章/实验02", options: mkL(0) }],
      [{ text: "控制器：Deployment 滚动更新/回滚（rollout status/undo）、STS/DS/Job/CronJob", options: mkF(1) }, { text: "第5章/实验03", options: mkL(1) }],
      [{ text: "调度：nodeSelector、亲和（required/preferred）、污点容忍（三种 effect）、PDB", options: mkF(0) }, { text: "第6章/实验04", options: mkL(0) }],
      [{ text: "HPA：kubectl autoscale --cpu=60% --min --max", options: mkF(1) }, { text: "第7章/实验05", options: mkL(1) }],
    ];
    const rowsR = [
      [{ text: "考点 / 机制", options: hdr }, { text: "教材/实验", options: hdr }],
      [{ text: "Service：expose、类型（ClusterIP/NodePort/headless）、Endpoints", options: mkF(0) }, { text: "第9章/实验07", options: mkL(0) }],
      [{ text: "Ingress：host/path 规则、TLS（tls Secret）、ingressClassName", options: mkF(1) }, { text: "第9章/实验07", options: mkL(1) }],
      [{ text: "NetworkPolicy：podSelector/ipBlock、ingress/egress、放行 DNS", options: mkF(0) }, { text: "第9章/实验07", options: mkL(0) }],
      [{ text: "DNS：svc.ns.svc 解析、nslookup", options: mkF(1) }, { text: "第9章", options: mkL(1) }],
    ];
    s.addTable(rowsL, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.5, w: 4.3, colW: [3.05, 1.25],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.62,
    });
    s.addTable(rowsR, {
      fontFace: "Microsoft YaHei",
      x: 5.1, y: 1.5, w: 4.3, colW: [3.05, 1.25],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.62,
    });
    s.addText("域 2 + 域 3 合计 35%：对应实验 02（Pod）/ 03（控制器）/ 04（调度）/ 05（HPA）/ 07（Service、Ingress、NetworkPolicy）。", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
