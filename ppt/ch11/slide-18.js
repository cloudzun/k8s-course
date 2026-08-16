// slide-18.js — 11.5 实验演练指引（实验 09）
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 18, title: "实验演练指引" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "实验演练指引（实验 09“认证与授权”Lab 1-6）");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11.5 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 11, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "实验", options: hdr }, { text: "内容", options: hdr }, { text: "对应章节", options: hdr }],
      [{ text: "Lab 1", options: mkF(0) }, { text: "生成用户证书：openssl 用 CA 签发 train 证书 + kubeconfig 三段式——认证≠授权的 Forbidden 实例", options: celA }, { text: "§11.2.3 / 11.3.6", options: celB }],
      [{ text: "Lab 2", options: mkF(1) }, { text: "创建 SA：kubectl create token 动态签发——v1.24+ 新机制", options: celB }, { text: "§11.2.4", options: celA }],
      [{ text: "Lab 3", options: mkF(0) }, { text: "给用户授权：ClusterRoleBinding + 自定义 Role rules——三要素写法", options: celA }, { text: "§11.3.4", options: celB }],
      [{ text: "Lab 4", options: mkF(1) }, { text: "给 SA 授权：RoleBinding 命名空间级 + 跨命名空间失败——两种 Binding 对比", options: celB }, { text: "§11.3.3", options: celA }],
      [{ text: "Lab 5", options: mkF(0) }, { text: "用户证书 API 方式（补充）：CSR API 签发证书（进阶）", options: celA }, { text: "§11.2.3 补充", options: celB }],
      [{ text: "Lab 6", options: mkF(1) }, { text: "dashboard 综合演练：SA + RBAC + Token 完整链路（浏览器输 Token 登录）", options: celB }, { text: "§11.2-11.4 总装", options: celA }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.25, w: 8.8, colW: [1.0, 6.0, 1.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.46,
    });
    s.addText("教学建议：Lab 1 重点体验“认证通过但 Forbidden”；Lab 3/4 对比两种 Binding 的生效范围；Lab 6 把全章机制串起来——浏览器输 Token 登录的背后就是本章全部机制。", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.6, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0, lineSpacingMultiple: 1.15
    });
  }
};
