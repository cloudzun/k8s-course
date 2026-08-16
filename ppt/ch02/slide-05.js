// slide-05.js — 2.1.2 它解决什么（表格）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 5, title: "它解决什么" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "它解决什么（承接第 1 章痛点）");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "单机容器痛点", options: hdr }, { text: "Kubernetes 的机制", options: hdr }],
      [{ text: "容器崩了、机器挂了没人管", options: mkF(0) }, { text: "自愈：控制器自动重建、节点故障驱逐（§2.3、第 5 章）", options: celA }],
      [{ text: "流量波动需要扩缩容", options: mkF(1) }, { text: "弹性：手动 scale + 自动 HPA（第 7 章）", options: celB }],
      [{ text: "容器 IP 每次重启都变", options: mkF(0) }, { text: "Service：稳定虚拟 IP + DNS 名（§2.2.4、第 9 章）", options: celA }],
      [{ text: "多副本流量如何分发", options: mkF(1) }, { text: "负载均衡：Service + kube-proxy（§2.5.2）", options: celB }],
      [{ text: "“活着”不等于“能用”", options: mkF(0) }, { text: "探针：readiness/liveness 健康检查（第 4 章）", options: celA }],
      [{ text: "容器删除数据丢失", options: mkF(1) }, { text: "持久化：PV/PVC、StorageClass（第 10 章）", options: celB }],
      [{ text: "配置和密码散落各处", options: mkF(0) }, { text: "ConfigMap / Secret（第 8 章）", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.25, w: 8.8, colW: [3.6, 5.2],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
  }
};
