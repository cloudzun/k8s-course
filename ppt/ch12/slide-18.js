// slide-18.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 18, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "准入控制在请求处理流程的哪个位置？“补默认值”和“拒绝请求”分别是哪类控制器？",
      "第 7 章的“exceeded quota”报错，是哪道门拦下的？（提示：不是认证也不是授权）",
      "baseline 和 restricted 的核心区别是什么？生产默认推荐哪个？",
      "一个应用必须以 root 跑（老镜像改不了），PSA enforce=restricted 会发生什么？怎么处理（提示：audit / warn 或专门命名空间）？",
      "SecurityContext 的 runAsNonRoot: true 与 runAsUser: 1000 各自防什么？只写其中一个够吗？",
      "私有仓库的 Pod 拉镜像报 ImagePullBackOff（ErrImagePull），可能是什么原因？（提示：imagePullSecrets）",
    ];
    qs.forEach((q, i) => {
      const y = 1.2 + i * 0.62;
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
    calloutBar(s, "CKA 考点（域 1/2/3）：kubectl label ns xxx pod-security.kubernetes.io/enforce=baseline、PSA 三级别三动作、SecurityContext 关键字段、imagePullSecrets；排障（域 5）：violates PodSecurity / ImagePullBackOff。", 5.05);
  }
};
