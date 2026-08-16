// compile.js — 第12章 PPT 编译脚本
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "第12章 准入与容器安全";
pres.author = "Kubernetes 容器云原生实战课程";

const TOTAL = 18;
for (let i = 1; i <= TOTAL; i++) {
  const mod = require(`./slide-${String(i).padStart(2, `0`)}.js`);
  mod.createSlide(pres);
}

pres.writeFile({ fileName: `./output/ch12-准入与容器安全.pptx` })
  .then(() => console.log(`✅ ch12 生成成功 (${TOTAL}页)`))
  .catch(err => console.error(err));
