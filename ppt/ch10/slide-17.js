// slide-17.js — 10.5.1/10.5.2 local-path 局限 + 共享存储
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 17, title: "local-path 局限与共享存储" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "local-path 的本质与局限 · 共享存储");
    // 左：local-path
    card(s, 0.6, 1.15, 4.35, 3.4, C.accentWarm);
    s.addText("local-path：PV = 节点上的一个本地目录", {
      x: 0.8, y: 1.25, w: 3.95, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("路径：/opt/local-path-provisioner/<pvc名>", {
      x: 0.8, y: 1.68, w: 3.95, h: 0.3,
      fontSize: 10.5, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("优点：零成本、快（本地盘）、教学演示动态供应足够", {
      x: 0.8, y: 2.0, w: 3.95, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("局限（必须理解）：", {
      x: 0.8, y: 2.32, w: 3.95, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("① 单节点：Pod 漂移/扩容到其他节点 → 数据够不着\n② 多副本挂同一 PVC（RWX）不支持——local-path 只能 RWO\n③ 节点故障 = 数据风险：本地盘没有冗余", {
      x: 0.8, y: 2.64, w: 3.95, h: 1.0,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.25, margin: 0
    });
    s.addText("（实验 11 WordPress 多副本共享 PVC 受限的根源）", {
      x: 0.8, y: 3.9, w: 3.95, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    // 右：共享存储对比表
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    s.addTable([
      [{ text: "方案", options: hdr }, { text: "特点 · 适用", options: hdr }],
      [{ text: "NFS", options: mkF(0) }, { text: "网络文件系统：一台服务器导出目录，所有节点挂载（支持 RWX）——自建环境多副本共享存储，教学扩展首选", options: celA }],
      [{ text: "云盘 CSI", options: mkF(1) }, { text: "云盘挂到节点，一般 RWO；对象存储 OSS/S3 天然共享——云环境生产", options: celB }],
      [{ text: "分布式存储", options: mkF(0) }, { text: "Ceph / Longhorn：软件定义存储，强一致/多副本——大规模生产", options: celA }],
    ], {
      fontFace: "Microsoft YaHei", x: 5.1, y: 1.15, w: 4.3, colW: [1.15, 3.15],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.85
    });
    calloutBar(s, "水平扩展的前提是存储可共享——这也是 local-path 最本质的局限（实验 11 的教训）", 4.75);
    s.addText("选型要点：要共享 → 必须 RWX 方案（local-path 不行）；要生产 → 必须可托底的方案（云盘 / 分布式）", {
      x: 0.6, y: 5.25, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
