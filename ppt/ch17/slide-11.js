// slide-11.js — 分隔页 17.3
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 11, title: "Kustomize：环境化定制" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "17.3", "Kustomize：环境化定制", [
      "理念相反：不引入模板语言——资源保持原样，用覆盖表达差异",
      "机制：base（标准资源）+ overlay（环境差异补丁）",
      "kubectl apply -k：kubectl 内置支持，无需额外工具"
    ]);
  }
};
