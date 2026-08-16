// slide-04.js — 13.1 集群信任链三线
const { C, sectionTitle, card, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 4, title: "集群信任链三线" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "集群信任链总览");
    // CA 信任根
    s.addShape("rect", { x: 4.25, y: 1.25, w: 1.5, h: 0.62, fill: { color: "FFF3E0" }, line: { color: "E08A3C", width: 1 } });
    s.addText("CA 信任根\n（第 3 章生成）", {
      x: 4.3, y: 1.27, w: 1.4, h: 0.58,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
    });
    s.addText("↓ 签发全部组件证书", {
      x: 3.3, y: 1.95, w: 3.4, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.accentWarm, align: "center", margin: 0
    });
    // 三条安全线
    const lines = [
      { x: 0.6, strip: "4A90D9", title: "① 证书线", body: "apiserver / etcd / kubelet 组件证书——过期即瘫痪 → §13.2" },
      { x: 3.65, strip: "D94F4F", title: "② 数据线", body: "etcd 里的数据——Secret 默认明文 → §13.3 静态加密" },
      { x: 6.7, strip: "5BA85B", title: "③ 节点线", body: "kubelet API 访问控制——入口不裸奔 → §13.4" },
    ];
    lines.forEach(ln => {
      card(s, ln.x, 2.45, 2.8, 1.7, ln.strip);
      s.addText(ln.title, {
        x: ln.x + 0.2, y: 2.45, w: 2.4, h: 0.4,
        fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
      });
      s.addText(ln.body, {
        x: ln.x + 0.2, y: 3.0, w: 2.4, h: 1.05,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark,
        valign: "top", lineSpacingMultiple: 1.3, margin: 0
      });
    });
    calloutBar(s, "一句话总览：证书保证“通信可信”，静态加密保证“落盘安全”，kubelet 安全保证“节点入口不裸奔”——三条线缺一不可。", 4.45);
  }
};
