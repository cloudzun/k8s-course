// compile.js — 第9章 PPT 编译脚本
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "第9章 服务、负载均衡与网络";
pres.author = "Kubernetes 容器云原生实战课程";

const TOTAL = 22;
for (let i = 1; i <= TOTAL; i++) {
  const mod = require(`./slide-${String(i).padStart(2, `0`)}.js`);
  mod.createSlide(pres);
}

pres.writeFile({ fileName: `./output/ch09-服务、负载均衡与网络.pptx` })
  .then(() => console.log(`✅ ch09 生成成功 (${TOTAL}页)`))
  .catch(err => console.error(err));
