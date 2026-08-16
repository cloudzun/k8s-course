// slide-10.js — 17.2.4 常用命令 + 17.2.5 版本与回滚机制
const { C, sectionTitle, card, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 10, title: "常用命令与版本回滚" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "常用命令（安装 / 升级 / 回滚）", C.bgLight);
    const code = [
      "helm repo add bitnami https://charts.bitnami.com/bitnami   # 添加仓库",
      "helm search repo nginx                                      # 搜索",
      "helm install my-release ./myapp                             # 安装（首次）",
      "helm install my-release ./myapp -f values-prod.yaml         # 带环境配置",
      "helm upgrade my-release ./myapp --set image.tag=1.28        # 升级（改 values）",
      "helm rollback my-release 1                                  # 回滚到 revision 1",
      "helm list                                                   # 查看 Release",
      "helm uninstall my-release                                   # 卸载",
    ];
    codeBlock(s, 0.6, 1.25, 8.8, 2.5, code.join("\n"), 11.5);
    card(s, 0.6, 4.0, 8.8, 0.62, C.primary);
    s.addText("版本与回滚：install → revision 1 → upgrade → revision 2 → rollback 回到 2——与第 5 章 Deployment 的 revision 机制同源", {
      x: 0.9, y: 4.1, w: 8.2, h: 0.42,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    calloutBar(s, "每次变更留历史、出问题一键回滚——包管理器的价值：应用级回滚，不止资源级（实验 09 Lab 6 装过 dashboard；实验 13 演练全流程）", 4.85);
  }
};
