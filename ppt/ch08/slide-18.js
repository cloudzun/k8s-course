// slide-18.js — 思考题
const { C, sectionTitle, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 18, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "为什么“改 env 注入的配置”要重启 Pod，而“改卷挂载的配置”不用？（提示：进程启动时注入 vs 文件系统挂载）",
      "kubectl get secret xxx -o yaml 里能看到密码吗？怎么防？（提示：编码 vs 加密）",
      "私有镜像仓库的凭据用什么 Secret 类型？Pod 怎么用它？",
      "数据库密码、日志级别、Pod 所在节点名，分别应该用 CM / Secret / Downward 哪个？",
      "为什么 Secret 的“值”要 base64 编码？ConfigMap 为什么不用？",
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
        fontSize: 12, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    warnBar(s, "CKA 考点（域 1/2）：create configmap / secret（--from-literal / --from-file）、configMapKeyRef / secretKeyRef、configMap / secret 卷、imagePullSecrets、create secret tls / docker-registry；卷挂载热更新 vs env 需重启、base64 是编码不是加密。排障（域 5）：secret \"xxx\" not found（引用名 / 命名空间错）、env 没生效（改了没重启）。", 4.4);
  }
};
