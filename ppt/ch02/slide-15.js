// slide-15.js — 2.2.8 设计指南
const { C, sectionTitle, codeBlock, card } = require("./common");
module.exports = {
  slideConfig: { type: "guide", index: 15, title: "命名与标签规范" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "设计指南：企业级命名与标签规范");
    card(s, 0.6, 1.3, 4.5, 3.9, C.primary);
    s.addText("命名空间命名规范", {
      x: 0.86, y: 1.42, w: 4.0, h: 0.4,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("格式：{团队/业务域}-{环境}\n示例：order-dev / order-prod / infra-monitoring\n\n对象命名：\nDeployment: {app}-{component}\nService: {app}-{component}-svc\nConfigMap: {app}-{用途}-config\nPVC: {app}-{component}-data", {
      x: 0.86, y: 1.9, w: 4.0, h: 3.2,
      fontSize: 12, fontFace: "Consolas", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
    s.addText("命名是给“人”看的（可检索）、标签是给“机器”用的（可筛选）", {
      x: 0.86, y: 4.95, w: 4.0, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.gold, margin: 0
    });
    const code = [
      "labels:",
      "  app.kubernetes.io/name: order-service   # 应用名",
      "  app.kubernetes.io/version: \"1.2.3\"      # 版本号",
      "  app.kubernetes.io/component: api         # 组件角色",
      "  app.kubernetes.io/part-of: e-commerce    # 所属系统",
      "  app.kubernetes.io/managed-by: helm       # 管理工具",
      "annotations:",
      "  team: trade-team        # 负责团队（告警路由）",
      "  oncall: zhangsan@x.com  # 值班联系人",
    ].join("\n");
    codeBlock(s, 5.4, 1.3, 4.0, 3.9, code, 10.5);
    s.addText("K8s 官方推荐标签——Helm/监控/成本工具都识别它们", {
      x: 5.4, y: 5.3, w: 4.0, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
