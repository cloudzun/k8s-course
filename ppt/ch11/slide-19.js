// slide-19.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 19, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "三道门：认证（你是谁）→ 授权（你能干啥）→ 准入（请求合法吗）——依次通过",
      "认证：User（人，证书 CN 即用户名）/ SA（程序，动态 token）；签发证书 = 创建用户；v1.24+ 用 kubectl create token 动态签发",
      "RBAC 三要素：Subject + Role/ClusterRole + Binding——Role 定权限内容、Binding 定生效范围",
      "两种范围：Role（命名空间）/ClusterRole（集群）；RoleBinding（命名空间）/ClusterRoleBinding（全集群）；RoleBinding 绑 ClusterRole 时限制在命名空间内",
      "rules 三要素：apiGroups（核心组 \"\"）/ resources（复数）/ verbs——写错 apiGroups 是最常见错误",
      "内置角色：cluster-admin / admin / edit / view——优先内置，不够自定义",
      "认证 ≠ 授权：Forbidden 实例（能登录但不让操作）；授权即时生效",
      "最小权限：够用就行 + kubectl auth can-i 验证",
    ];
    items.forEach((g, i) => {
      const y = 1.2 + i * 0.49;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.44,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("衔接：第 12 章讲第三道门（准入控制与容器安全）——PSA 强制安全标准、SecurityContext 容器加固；第 13 章讲集群级安全（证书续期 / etcd 加密）。", {
      x: 0.6, y: 5.15, w: 8.8, h: 0.35, fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
