// slide-11.js — 8.3.1 / 8.3.2 Secret 与 ConfigMap 的关系 / base64 认知
const { C, sectionTitle, card, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 11, title: "Secret 与 ConfigMap 的关系" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "Secret 与 ConfigMap 的关系", C.bgLight);
    codeBlock(s, 0.6, 1.15, 5.2, 2.6, [
      "apiVersion: v1",
      "kind: Secret",
      "metadata:",
      "  name: mysql-pass",
      "type: Opaque",
      "data:",
      "  password: d29yZHByZXNzMTIz",
      "  # 值必须 base64 编码（\"wordpress123\"）",
    ].join("\n"), 11);
    card(s, 6.05, 1.15, 3.35, 2.6, C.primary);
    s.addText("与 ConfigMap 的差别", {
      x: 6.3, y: 1.25, w: 3.0, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const pts = [
      "值必须 base64 编码（CM 是明文）",
      "describe / get 默认不显示内容",
      "有 type 类型字段（§8.3.3）",
      "RBAC 可单独收紧授权",
      "消费方式相同：secret 卷 / secretKeyRef，挂载后自动还原明文",
    ];
    pts.forEach((p, i) => {
      s.addText("▸ " + p, {
        x: 6.3, y: 1.7 + i * 0.4, w: 2.95, h: 0.38,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("kubectl get secret mysql-pass -o yaml → 密文直接可读、秒还原（实验 06 Lab 4 亲手验证）", {
      x: 0.6, y: 3.95, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Consolas", color: C.textMid, margin: 0
    });
    s.addText("base64 只是“字节 → 可打印字符”的编码，任何人都能解码——“传输 / 存储格式”不等于安全", {
      x: 0.6, y: 4.35, w: 8.8, h: 0.3,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    calloutBar(s, "base64 是编码不是加密：任何人拿到 yaml 都能秒解码——Secret 的真正安全依赖 RBAC + etcd 静态加密 + 最小权限（CKA 认知考点）。", 4.75);
  }
};
