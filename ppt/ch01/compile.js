// compile.js — 第1章 PPT 编译脚本（版式参照 FDE 课程范例）
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "第1章 容器与云原生基础";
pres.author = "Kubernetes 容器云原生实战课程";

const TOTAL = 25;
for (let i = 1; i <= TOTAL; i++) {
  const mod = require(`./slide-${String(i).padStart(2, `0`)}.js`);
  mod.createSlide(pres);
}

pres.writeFile({ fileName: `./output/ch01-容器与云原生基础.pptx` })
  .then(() => console.log(`✅ ch01-容器与云原生基础.pptx 生成成功 (${TOTAL}页)`))
  .catch(err => console.error(err));
