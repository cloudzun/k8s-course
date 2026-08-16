// slide-12.js — 17.3.1/17.3.2 base + overlay 机制
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 12, title: "Kustomize 的 base/overlay 机制" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "定位与机制：不用模板，用覆盖");
    const code = [
      "base/（一份“标准”资源）",
      "  deployment.yaml",
      "    replicas: 3, image: nginx:1.27",
      "  service.yaml",
      "  kustomization.yaml   # 声明资源清单",
      "",
      "overlays/prod/（环境差异）",
      "  kustomization.yaml",
      "    - 改 replicas: 5",
      "    - 改 image tag: 1.28",
      "    - 改域名",
    ];
    codeBlock(s, 0.6, 1.3, 4.9, 3.2, code.join("\n"), 11);
    const notes = [
      "base：一份标准资源，其他环境都从它派生",
      "overlay：环境的差异描述——patches 补丁 / 覆盖 / 加前缀",
      "无需模板语法：diff 式思维“标准 + 差异”，差异即变更，容易 review",
    ];
    notes.forEach((n, i) => {
      const y = 1.3 + i * 1.02;
      card(s, 5.75, y, 3.65, 0.9, C.accent);
      s.addText(n, {
        x: 6.0, y: y + 0.12, w: 3.2, h: 0.66,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("kubectl apply -k overlays/prod    # -k = kustomize（kubectl 内置支持）", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: "Consolas", bold: true, color: C.primary, margin: 0
    });
    s.addText("（实验 13 Lab 3：Kustomize 多环境对比）", {
      x: 0.6, y: 5.15, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
