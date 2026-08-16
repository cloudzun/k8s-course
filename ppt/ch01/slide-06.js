// slide-06.js — 1.1.2 命名空间（表格）
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 6, title: "命名空间" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "命名空间（Namespaces）：隔离“看得见”", C.bgLight);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkFirst = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "命名空间", options: hdr }, { text: "隔离内容", options: hdr }, { text: "容器里看到", options: hdr }],
      [{ text: "PID", options: mkFirst(0) }, { text: "进程编号", options: celA }, { text: "自己是 PID 1，看不到宿主机其他进程", options: celA }],
      [{ text: "Mount", options: mkFirst(1) }, { text: "文件系统挂载点", options: celB }, { text: "只看到自己的根文件系统", options: celB }],
      [{ text: "Network", options: mkFirst(0) }, { text: "网络栈（网卡/IP/路由）", options: celA }, { text: "自己的 IP 和端口", options: celA }],
      [{ text: "UTS", options: mkFirst(1) }, { text: "主机名", options: celB }, { text: "自己的 hostname", options: celB }],
      [{ text: "IPC", options: mkFirst(0) }, { text: "进程间通信", options: celA }, { text: "独立的信号量 / 消息队列", options: celA }],
      [{ text: "User", options: mkFirst(1) }, { text: "用户 ID", options: celB }, { text: "独立 UID 映射（容器内 root ≠ 宿主机 root）", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.2, w: 8.8, colW: [1.4, 2.9, 4.5],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.52,
    });
    calloutBar(s, "命名空间让容器里的进程“以为”自己独占系统资源——每个容器创建时，内核为它建立独立的命名空间视图。", 5.0);
  }
};
