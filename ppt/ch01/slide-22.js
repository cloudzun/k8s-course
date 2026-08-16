// slide-22.js — 1.5 编排器对比（表格）
const { C, sectionTitle, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "comparison", index: 22, title: "编排器三强对比" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "容器编排器对比", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const k8sHdr = { bold: true, color: C.textLight, fill: { color: C.accent }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkFirst = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.primary, bold: true, valign: "middle" });
    const k8sCel = { fill: { color: C.bgAccent }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle", bold: true };
    const rows = [
      [{ text: "能力", options: hdr }, { text: "Docker Swarm", options: hdr }, { text: "Apache Mesos", options: hdr }, { text: "Kubernetes", options: k8sHdr }],
      [{ text: "定位", options: mkFirst(0) }, { text: "Docker 原生集群", options: celA }, { text: "数据中心级资源调度", options: celA }, { text: "容器编排事实标准", options: k8sCel }],
      [{ text: "成熟度", options: mkFirst(1) }, { text: "简单但功能有限", options: celB }, { text: "复杂、运维门槛高", options: celB }, { text: "生态最完整", options: k8sCel }],
      [{ text: "服务发现/LB", options: mkFirst(0) }, { text: "内建（简单）", options: celA }, { text: "需额外组件", options: celA }, { text: "Service + Ingress（第 9 章）", options: k8sCel }],
      [{ text: "自愈/扩缩容", options: mkFirst(1) }, { text: "有限", options: celB }, { text: "有限", options: celB }, { text: "Deployment/HPA（第 5、7 章）", options: k8sCel }],
      [{ text: "存储/网络插件", options: mkFirst(0) }, { text: "少", options: celA }, { text: "少", options: celA }, { text: "丰富的 CSI/CNI 生态", options: k8sCel }],
      [{ text: "社区与生态", options: mkFirst(1) }, { text: "停滞", options: celB }, { text: "停滞", options: celB }, { text: "CNCF 最大项目，事实标准", options: k8sCel }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.25, w: 8.8, colW: [1.7, 2.1, 2.1, 2.9],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.52,
    });
    warnBar(s, "Kubernetes 胜出的根本：声明式 API + 控制循环——用户描述“期望状态”，控制器持续调和，设计优雅且可扩展。", 4.85);
  }
};
