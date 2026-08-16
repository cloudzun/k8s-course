// compile.js — 第15章 PPT 编译脚本
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "第15章 可观测性：监控、日志与事件";
pres.author = "Kubernetes 容器云原生实战课程";

const TOTAL = 18;
for (let i = 1; i <= TOTAL; i++) {
  const mod = require(`./slide-${String(i).padStart(2, `0`)}.js`);
  mod.createSlide(pres);
}

pres.writeFile({ fileName: `./output/ch15-可观测性：监控、日志与事件.pptx` })
  .then(() => console.log(`✅ ch15 生成成功 (${TOTAL}页)`))
  .catch(err => console.error(err));
