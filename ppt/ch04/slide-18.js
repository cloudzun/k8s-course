// slide-18.js — 4.4.3 探针实现方式
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 18, title: "探针实现方式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "探针的实现方式：怎么探测", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "方式", options: hdr }, { text: "原理", options: hdr }, { text: "适用", options: hdr }],
      [{ text: "httpGet", options: mkF(0) }, { text: "发 HTTP GET，状态码 200-399 视为成功", options: celA }, { text: "HTTP 服务（最常用）", options: celB }],
      [{ text: "tcpSocket", options: mkF(1) }, { text: "尝试建立 TCP 连接，能连上即成功", options: celA }, { text: "非 HTTP 协议（数据库、Redis）", options: celB }],
      [{ text: "exec", options: mkF(0) }, { text: "容器内执行命令，exit 0 视为成功", options: celA }, { text: "无法用端口判断（检查内部状态文件）", options: celB }],
      [{ text: "grpc", options: mkF(1) }, { text: "gRPC 健康检查协议（v1.24+）", options: celA }, { text: "gRPC 微服务，无需额外探针实现", options: celB }],
    ];
    s.addTable(rows, {
      x: 0.6, y: 1.4, w: 8.8, colW: [1.6, 4.3, 2.9],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.55, fontFace: "Microsoft YaHei"
    });
    s.addText("选择逻辑：HTTP 服务用 httpGet（最贴近真实可用性）；TCP 服务用 tcpSocket；都没有的用 exec；gRPC 服务用 grpc 探针（要求服务端实现 gRPC 健康检查协议）", {
      x: 0.6, y: 4.4, w: 8.8, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("注意：探测路径要选“真实反映可用性”的端点（如 /healthz），而不是只返回 200 的静态页", {
      x: 0.6, y: 4.9, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
