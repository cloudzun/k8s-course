// slide-16.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 16, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "Chart、Release、Repository 分别是什么？两次 helm install same-chart 会产生什么？",
      "values 的优先级顺序是什么？--set 与 -f 文件、values.yaml 谁覆盖谁？",
      "helm template 有什么用途？（提示：先看渲染结果再装）",
      "Helm 与 Kustomize 的核心机制差异？什么场景选 Kustomize？",
      "为什么生产推荐固定镜像 tag 而不是 latest？（结合第 4 章拉取策略）",
      "helm upgrade --install 的幂等语义是什么？生产为什么常用它？",
    ];
    qs.forEach((q, i) => {
      const y = 1.25 + i * 0.62;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.55,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "考点标注：Helm 为 CKAD 考点（Chart 安装 / 升级 / 回滚、values 定制）；Kustomize 的 kubectl apply -k 属 CKAD 常用操作；CKA 以实验 13 实践为主、非直接考点。", 5.05);
  }
};
