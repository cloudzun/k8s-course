// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "解释准入控制（Admission）的时机与角色，区分 Mutating 与 Validating 两类",
      "列举常见准入控制器（LimitRange / ResourceQuota / PSA）并说出它们各自拦什么",
      "解释 Pod Security Admission 的三个级别（privileged / baseline / restricted）与命名空间标签实施方式",
      "解释 SecurityContext 的关键字段（runAsNonRoot / readOnlyRootFilesystem / capabilities）",
      "区分 Pod 级与容器级 securityContext 的生效范围",
      "解释“SecurityContext 是自觉、PSA 是强制”的配合关系",
      "解释 imagePullSecrets 的机制（私有仓库凭据怎么注入）",
    ];
    goals.forEach((g, i) => {
      const y = 1.2 + i * 0.52;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.46,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
