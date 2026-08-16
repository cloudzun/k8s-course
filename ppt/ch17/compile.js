// compile.js — 第17章 PPT 编译脚本
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "第17章 Helm 与 Kustomize";
pres.author = "Kubernetes 容器云原生实战课程";

const TOTAL = 16;
for (let i = 1; i <= TOTAL; i++) {
  const mod = require(`./slide-${String(i).padStart(2, `0`)}.js`);
  mod.createSlide(pres);
}

pres.writeFile({ fileName: `./output/ch17-Helm 与 Kustomize.pptx` })
  .then(() => console.log(`✅ ch17 生成成功 (${TOTAL}页)`))
  .catch(err => console.error(err));
