// slide-11.js — 18.3 验证体系：三层验证
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 11, title: "验证体系：三层验证" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "验证体系：怎么证明“能用了”", C.bgLight);
    s.addText("三个验证对应三层承诺：通不通（全链路）· 丢不丢（持久化）· 够不够（扩展）", {
      x: 0.6, y: 1.05, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    // ① 全链路验证
    card(s, 0.6, 1.5, 8.8, 1.25, C.primary);
    s.addText("① 全链路验证 —— 证明“链路通了”", { x: 0.85, y: 1.6, w: 8.3, h: 0.3, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    s.addText("curl -H \"Host: wp.example.com\" http://节点IP:NodePort/wp-admin/install.php  →  返回 WordPress 安装页", {
      x: 0.85, y: 1.95, w: 8.3, h: 0.32, fontSize: 11, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("→ 证明：Ingress 路由 ✓ → Service 转发 ✓ → Pod 运行 ✓ → MySQL 连通 ✓；首次访问 302 到安装页，用 -L 跟随（实验 11 实测）", {
      x: 0.85, y: 2.32, w: 8.3, h: 0.32, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    // ② 持久化验证
    card(s, 0.6, 2.9, 8.8, 1.15, C.accent);
    s.addText("② 持久化验证 —— 证明“数据不丢”", { x: 0.85, y: 3.0, w: 8.3, h: 0.3, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0 });
    s.addText("echo persistence-ok > /var/www/html/persist.txt（PVC 里） → 删除全部 WordPress Pod → 新 Pod cat 读取 → persistence-ok", {
      x: 0.85, y: 3.35, w: 8.3, h: 0.32, fontSize: 11, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("→ 证明：PVC 持久化生效（第 10 章“删 Pod 数据还在”）", {
      x: 0.85, y: 3.7, w: 8.3, h: 0.3, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    // ③ 扩展验证
    card(s, 0.6, 4.2, 8.8, 1.05, C.accentWarm);
    s.addText("③ 扩展验证 —— 证明“能扛流量”", { x: 0.85, y: 4.3, w: 8.3, h: 0.3, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0 });
    s.addText("kubectl scale deployment wordpress --replicas=5 → Pod 变 5；kubectl get hpa（CPU 超目标自动扩）", {
      x: 0.85, y: 4.62, w: 8.3, h: 0.3, fontSize: 11, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("→ 证明：弹性机制就绪（第 5 / 7 章）", {
      x: 0.85, y: 4.95, w: 8.3, h: 0.28, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
