// slide-13.js — 19.4.2 配置易错点（考试高频扣分项）
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "list", index: 13, title: "配置易错点" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "配置易错点（考试高频扣分项）", C.bgLight);
    const items = [
      "selector 与标签不匹配：Deployment/Service 的 selector 与 Pod 标签必须一致——Service 后端为空（Endpoints 空）的根因",
      "命名空间：创建对象没带 -n → 建到 default（题目可能要求别的命名空间）",
      "apiGroups 写错：核心组是 \"\" 不是别的组（RBAC 题）",
      "RBAC 范围：RoleBinding vs ClusterRoleBinding——题目要求“命名空间内”还是“全集群”",
      "探针忘配 readiness：滚动更新/Service 相关题的关键",
      "镜像名照抄：题目给的镜像名原样使用（tag 影响拉取策略）",
      "PVC 忘写 storageClassName：有默认 SC 时走动态供应（题目可能要求静态绑定）",
    ];
    items.forEach((it, i) => {
      const y = 1.4 + i * 0.52;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(it, {
        x: 1.35, y, w: 8.0, h: 0.46,
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("这些坑都来自前面章节实验里的常见错误——踩过的坑就是考场的分。", {
      x: 0.7, y: 5.12, w: 8.6, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.accent, bold: true, margin: 0
    });
  }
};
