// slide-13.js — 16.3 典型故障图谱（速查表）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 13, title: "典型故障图谱" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "典型故障图谱（现象 → 根因 → 修复速查）");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 9.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "现象", options: hdr }, { text: "第一查", options: hdr }, { text: "常见根因", options: hdr }, { text: "修复", options: hdr }],
      [{ text: "节点 NotReady", options: mkF(0) }, { text: "journalctl -u kubelet", options: celA }, { text: "kubelet 挂/磁盘满/网络插件异常", options: celA }, { text: "修 kubelet/清磁盘/查 calico", options: celA }],
      [{ text: "Pod Pending", options: mkF(1) }, { text: "describe Events", options: celB }, { text: "资源不足/亲和不满足/污点不容忍", options: celB }, { text: "调 requests/删约束/加容忍", options: celB }],
      [{ text: "ImagePullBackOff", options: mkF(0) }, { text: "describe Events", options: celA }, { text: "镜像名错/私有仓库没凭据/加速站失效", options: celA }, { text: "改镜像名/配 imagePullSecrets", options: celA }],
      [{ text: "CrashLoopBackOff", options: mkF(1) }, { text: "logs --previous", options: celB }, { text: "命令错/配置错/启动即崩", options: celB }, { text: "改 command/配置", options: celB }],
      [{ text: "退出码 137", options: mkF(0) }, { text: "top 看内存", options: celA }, { text: "超内存 limits 被 OOM", options: celA }, { text: "调 limits/查内存泄漏", options: celA }],
      [{ text: "Service 502", options: mkF(1) }, { text: "get endpoints", options: celB }, { text: "selector 错 → Endpoints 空", options: celB }, { text: "修标签", options: celB }],
      [{ text: "DNS 解析失败", options: mkF(0) }, { text: "nslookup", options: celA }, { text: "名字/命名空间错、coredns 挂", options: celA }, { text: "改名字/查 coredns", options: celA }],
      [{ text: "PVC Pending", options: mkF(1) }, { text: "describe pvc", options: celB }, { text: "PV 不匹配", options: celB }, { text: "补 PV/改 SC", options: celB }],
      [{ text: "FailedMount", options: mkF(0) }, { text: "describe pod", options: celA }, { text: "存储节点问题/权限", options: celA }, { text: "修底层存储", options: celA }],
      [{ text: "探针 Unhealthy", options: mkF(1) }, { text: "describe pod", options: celB }, { text: "探针路径/端口/阈值不对", options: celB }, { text: "调探针（第 4 章）", options: celB }],
      [{ text: "exceeded quota", options: mkF(0) }, { text: "get resourcequota", options: celA }, { text: "命名空间配额用完", options: celA }, { text: "清资源/调配额", options: celA }],
      [{ text: "Forbidden", options: mkF(1) }, { text: "auth can-i", options: celB }, { text: "RBAC 没配/规则错", options: celB }, { text: "配 Binding/修 rules", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.12, w: 8.8, colW: [1.75, 1.85, 2.75, 2.45],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.31,
    });
    s.addShape("rect", { x: 0.6, y: 5.22, w: 8.8, h: 0.36, fill: { color: C.bgAccent } });
    s.addText("记忆法：每类故障的第一条命令 + describe 的 Events 段——覆盖 90% 的排障", {
      x: 0.85, y: 5.22, w: 8.3, h: 0.36,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, bold: true,
      valign: "middle", margin: 0
    });
  }
};
