const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Kubernetes 容器云原生实战课程";
pres.author = "Kubernetes 容器云原生实战课程";
const TOTAL = 4;
for (let i = 1; i <= TOTAL; i++) {
  const mod = require(`./slide-${String(i).padStart(2, `0`)}.js`);
  mod.createSlide(pres);
}
pres.writeFile({ fileName: `./output/course-master.pptx` })
  .then(() => console.log(`✅ course-master 生成成功 (${TOTAL}页)`))
  .catch(err => console.error(err));
