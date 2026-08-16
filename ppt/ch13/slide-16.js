// slide-16.js — 13.6 密钥与数据安全（汇总）
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 16, title: "密钥与数据安全汇总" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "密钥与数据安全（汇总）");
    // 左卡：Secret 三道保护
    card(s, 0.6, 1.25, 4.3, 2.55, C.primary);
    s.addText("Secret 的三道保护（§8.3.5 深化）", {
      x: 0.85, y: 1.38, w: 3.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const three = [
      { n: "①", t: "RBAC：谁能读 Secret（第 11 章授权）——读 Secret = 拿到全部值" },
      { n: "②", t: "静态加密：etcd 落盘密文（§13.3.2）——防备份 / 磁盘泄露" },
      { n: "③", t: "最小权限：只创建 / 挂载需要的 Secret；定期轮换" },
    ];
    three.forEach((r, i) => {
      s.addText(r.n, {
        x: 0.85, y: 1.85 + i * 0.5, w: 0.4, h: 0.42,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0
      });
      s.addText(r.t, {
        x: 1.3, y: 1.85 + i * 0.5, w: 3.35, h: 0.42,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addShape("rect", { x: 0.85, y: 3.45, w: 3.8, h: 0.75, fill: { color: C.bgAccent } });
    s.addText("三者缺一不可：只有 RBAC，备份泄露就全完；只有加密，授权失控也没用——纵深防御", {
      x: 1.0, y: 3.5, w: 3.5, h: 0.65,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", lineSpacingMultiple: 1.2, margin: 0
    });
    // 右卡：网络隔离
    card(s, 5.1, 1.25, 4.3, 2.55, C.accentWarm);
    s.addText("网络隔离（第 9 章 NetworkPolicy 视角）", {
      x: 5.35, y: 1.38, w: 3.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const net = [
      "静态加密防“数据被读走”；网络隔离防“流量到不了数据”",
      "数据库只允许业务 Pod 访问（podSelector 白名单）",
      "攻击者即使进集群也够不着数据库——纵深防御第一道物理防线",
    ];
    net.forEach((n, i) => {
      s.addText("▸ " + n, {
        x: 5.35, y: 1.85 + i * 0.5, w: 3.8, h: 0.45,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addShape("rect", { x: 5.35, y: 3.45, w: 3.8, h: 0.28, fill: { color: "E8F0FE" } });
    s.addText("数据库 = 最后一道门：默认拒绝 + 白名单放行（§9.5）", {
      x: 5.35, y: 3.5, w: 3.8, h: 0.2,
      fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", margin: 0
    });
    // 纵深防御全景
    s.addText("纵深防御全景（第 9-13 章串起来）", {
      x: 0.6, y: 4.05, w: 4.0, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const flow = [
      { x: 0.6, t: "① 网络隔离\n流量到不了" },
      { x: 2.8, t: "② RBAC\n权限拿不到" },
      { x: 5.0, t: "③ 静态加密\n读走解不开" },
      { x: 7.2, t: "④ 审计\n出事查得到" },
    ];
    flow.forEach(f => {
      s.addShape("rect", { x: f.x, y: 4.4, w: 2.0, h: 0.8, fill: { color: C.bgCard }, line: { color: C.primary, width: 1 } });
      s.addText(f.t, {
        x: f.x + 0.05, y: 4.44, w: 1.9, h: 0.72,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
      });
    });
    s.addText("→", { x: 2.62, y: 4.55, w: 0.18, h: 0.5, fontSize: 16, fontFace: "Microsoft YaHei", color: C.accentWarm, align: "center", margin: 0 });
    s.addText("→", { x: 4.82, y: 4.55, w: 0.18, h: 0.5, fontSize: 16, fontFace: "Microsoft YaHei", color: C.accentWarm, align: "center", margin: 0 });
    s.addText("→", { x: 7.02, y: 4.55, w: 0.18, h: 0.5, fontSize: 16, fontFace: "Microsoft YaHei", color: C.accentWarm, align: "center", margin: 0 });
  }
};
