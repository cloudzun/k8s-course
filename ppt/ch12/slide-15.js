// slide-15.js — 12.4 镜像安全
const { C, sectionTitle, codeBlock, warnBar, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 15, title: "镜像安全" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "镜像安全：凭据 · 最小镜像 · 签名", C.bgLight);
    codeBlock(s, 0.6, 1.3, 8.8, 2.3, [
      "① 创建凭据 Secret（存 .dockerconfigjson）",
      "   kubectl create secret docker-registry regcred \\",
      "     --docker-server=<仓库> --docker-username=<用户> --docker-password=<密码>",
      "② Pod 声明使用",
      "   spec:",
      "     imagePullSecrets:",
      "     - name: regcred",
      "③ kubelet 拉取时用该凭据认证",
    ].join("\n"), 11);
    warnBar(s, "imagePullSecrets 按命名空间生效——每个命名空间都要创建自己的凭据；Pod 必须显式引用（不会自动用）。", 3.75);
    card(s, 0.6, 4.4, 8.8, 0.95, C.accent);
    s.addText("最小镜像：distroless / alpine 精简基础镜像——攻击面小、体积小（第 3 章感受过镜像体积影响）。\n镜像签名（cosign 等）：发布时签名、部署时校验——防供应链攻击（进阶概念，知道存在即可）。", {
      x: 0.9, y: 4.45, w: 8.2, h: 0.85,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
  }
};
