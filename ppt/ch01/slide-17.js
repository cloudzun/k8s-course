// slide-17.js — 1.3.2 单机场景的挑战（表格 + 结论）
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 17, title: "单机场景的挑战" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "单机场景的挑战（编排器的需求来源）");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkFirst = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "挑战", options: hdr }, { text: "具体问题", options: hdr }],
      [{ text: "单点故障", options: mkFirst(0) }, { text: "容器崩了谁重启？机器挂了谁迁移？", options: celA }],
      [{ text: "扩缩容", options: mkFirst(1) }, { text: "流量大了手动 docker run 复制十份？流量降了呢？", options: celB }],
      [{ text: "服务发现", options: mkFirst(0) }, { text: "容器 IP 每次重启都变，前端怎么找到后端？", options: celA }],
      [{ text: "负载均衡", options: mkFirst(1) }, { text: "多个副本之间流量怎么分发？", options: celB }],
      [{ text: "健康检查", options: mkFirst(0) }, { text: "容器“活着”不代表“能用”，谁来探测？", options: celA }],
      [{ text: "存储", options: mkFirst(1) }, { text: "容器删了数据没了，数据库怎么办？", options: celB }],
      [{ text: "配置与密钥", options: mkFirst(0) }, { text: "几十个容器的环境变量/密码怎么统一管理？", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.2, w: 8.8, colW: [1.8, 7.0],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.5,
    });
    calloutBar(s, "结论：单机 Docker 解决“如何跑一个容器”，编排器解决“如何运维一群容器”——这正是 Kubernetes 的定位（第 2 章）。", 5.0);
  }
};
