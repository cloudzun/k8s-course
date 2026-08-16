// compile.js — 第2章 PPT 编译脚本
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "第2章 Kubernetes 概述与架构";
pres.author = "Kubernetes 容器云原生实战课程";

const TOTAL = 45;
for (let i = 1; i <= TOTAL; i++) {
  const mod = require(`./slide-${String(i).padStart(2, `0`)}.js`);
  mod.createSlide(pres);
}

pres.writeFile({ fileName: `./output/ch02-kubernetes-概述与架构.pptx` })
  .then(() => console.log(`✅ ch02 生成成功 (${TOTAL}页)`))
  .catch(err => console.error(err));
