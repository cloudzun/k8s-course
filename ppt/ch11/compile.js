// compile.js — 第11章 PPT 编译脚本
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "第11章 认证与授权";
pres.author = "Kubernetes 容器云原生实战课程";

const TOTAL = 20;
for (let i = 1; i <= TOTAL; i++) {
  const mod = require(`./slide-${String(i).padStart(2, `0`)}.js`);
  mod.createSlide(pres);
}

pres.writeFile({ fileName: `./output/ch11-认证与授权.pptx` })
  .then(() => console.log(`✅ ch11 生成成功 (${TOTAL}页)`))
  .catch(err => console.error(err));
