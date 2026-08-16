// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "解释“配置外部化”的必要性：镜像不可变、多环境复用、敏感信息暴露三大痛点",
      "解释 ConfigMap 的本质，以及两种消费方式（卷挂载 vs 环境变量）的机制差异",
      "解释“卷挂载支持热更新、env 注入需要重启”的底层原因",
      "解释 Secret 与 ConfigMap 的关系，理解“base64 是编码不是加密”的深刻含义",
      "说出 Secret 的四种类型及各自用途（Opaque / tls / dockerconfigjson / service-account-token）",
      "区分外部配置（ConfigMap / Secret）与自身元数据（Downward API）的界限",
      "说出 Secret 的安全边界：RBAC 收紧、etcd 静态加密、最小权限",
      "设计一个应用的完整配置方案：哪些进 ConfigMap、哪些进 Secret、哪些进 Downward API",
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
