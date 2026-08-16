// slide-10.js — 9.2.5 多端口与端口命名
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 10, title: "多端口与端口命名" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "多端口与端口命名");
    s.addText("一个 Service 可以暴露多个端口（如 80 HTTP + 443 HTTPS），每个端口必须有名字：", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.6, 5.2, 2.6, [
      "spec:",
      "  ports:",
      "  - name: http",
      "    port: 80",
      "    targetPort: 8080   # 转发到 Pod 的 8080",
      "  - name: https",
      "    port: 443",
      "    targetPort: 8443",
    ].join("\n"), 12);
    card(s, 6.0, 1.6, 3.4, 2.6, C.primary);
    s.addText("字段说明", {
      x: 6.3, y: 1.72, w: 2.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("· name：端口名（必须唯一）\n· port：Service 对外端口\n· targetPort：转发到 Pod 的端口\n· nodePort：NodePort 类型时指定", {
      x: 6.3, y: 2.1, w: 2.8, h: 1.9,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, margin: 0
    });
    s.addShape("rect", { x: 0.6, y: 4.45, w: 8.8, h: 0.6, fill: { color: C.bgBlue } });
    s.addShape("rect", { x: 0.6, y: 4.45, w: 0.06, h: 0.6, fill: { color: C.primary } });
    s.addText("targetPort 可以是端口号或容器端口名（第 4 章 ports.name）——用名字的好处：改端口号不用改 Service。", {
      x: 0.85, y: 4.45, w: 8.3, h: 0.6,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
  }
};
