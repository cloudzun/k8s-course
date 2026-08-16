// slide-05.js — 18.1.2 架构设计：数据与应用分离
const { C, sectionTitle, card, bigCallout } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 5, title: "架构设计：数据与应用分离" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "架构设计：数据与应用分离（核心原则）");
    // 第一行：入口与分发
    s.addShape("rect", { x: 0.6, y: 1.2, w: 1.0, h: 0.7, fill: { color: C.bgWhite }, line: { color: C.secondary, width: 1 } });
    s.addText("用户", { x: 0.6, y: 1.2, w: 1.0, h: 0.7, fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0 });
    s.addText("→", { x: 1.66, y: 1.32, w: 0.25, h: 0.4, fontSize: 14, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    s.addShape("rect", { x: 1.95, y: 1.2, w: 2.35, h: 0.7, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
    s.addText("Ingress\nwp.example.com 域名路由 + TLS", { x: 2.0, y: 1.25, w: 2.25, h: 0.6, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0 });
    s.addText("→", { x: 4.36, y: 1.32, w: 0.25, h: 0.4, fontSize: 14, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0 });
    s.addShape("rect", { x: 4.65, y: 1.2, w: 2.0, h: 0.7, fill: { color: "E8F4FD" }, line: { color: "4A90D9", width: 1 } });
    s.addText("WordPress Service\nClusterIP 负载均衡", { x: 4.7, y: 1.25, w: 1.9, h: 0.6, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0 });
    s.addText("↓ 前端线", { x: 2.0, y: 1.98, w: 1.4, h: 0.3, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.primary, align: "center", margin: 0 });
    s.addText("↓ 数据线", { x: 6.6, y: 1.98, w: 1.4, h: 0.3, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.accent, align: "center", margin: 0 });
    // 第二行：两条数据线（前端 vs 数据库）
    card(s, 0.6, 2.35, 4.3, 1.3, C.primary);
    s.addText("WordPress Deployment（前端 · 无状态）", { x: 0.9, y: 2.5, w: 3.8, h: 0.32, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    s.addText("多副本 + HPA + 探针——删了重建不影响业务，可随时折腾（扩缩/滚动更新）", { x: 0.9, y: 2.85, w: 3.8, h: 0.34, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    s.addText("数据挂 PVC：wordpress-pvc（上传文件/主题）", { x: 0.9, y: 3.22, w: 3.8, h: 0.3, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
    card(s, 5.1, 2.35, 4.3, 1.3, C.accent);
    s.addText("MySQL StatefulSet（数据库 · 有状态）", { x: 5.4, y: 2.5, w: 3.8, h: 0.32, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0 });
    s.addText("稳定标识 mysql-0 · 有序启动 · 独立 PVC（数据持久、身份稳定）", { x: 5.4, y: 2.85, w: 3.8, h: 0.34, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    s.addText("密码 = Secret mysql-pass（不落 yaml）；经 MySQL Service 服务名连接", { x: 5.4, y: 3.22, w: 3.8, h: 0.3, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0 });
    // 读图要点
    s.addShape("rect", { x: 0.6, y: 3.85, w: 8.8, h: 0.55, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 3.85, w: 0.05, h: 0.55, fill: { color: C.primary } });
    s.addText("读图要点：一条入口、两条数据线——所有流量经 Ingress → Service 分发；前端无状态挂 PVC，数据库有状态独立 PVC + Secret。", {
      x: 0.85, y: 3.85, w: 8.3, h: 0.55, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    bigCallout(s, "决策记忆：“能无状态就无状态，必须有状态就给它最稳妥的家”——分离是容器化架构的第一原则。", 4.6, 0.85);
  }
};
