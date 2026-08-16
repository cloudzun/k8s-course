// slide-14.js — 17.4 企业发布流程（Chart 版本化 + 多环境 + 安全）
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 14, title: "企业发布流程" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "企业发布流程（Helm + CI/CD）");
    // CI 五步闭环
    const steps = [
      { t: "① 构建镜像\n推仓库（tag v1.2.3）", c: "E8F4FD" },
      { t: "② 更新 Chart values\n（image tag）", c: "FFF3E0" },
      { t: "③ 打包\nhelm package", c: "E8F4FD" },
      { t: "④ 发布到 Chart 仓库\n（私有 repo / OCI）", c: "FFF3E0" },
      { t: "⑤ 部署\nhelm upgrade --install\n-f values-prod.yaml", c: "E8F8E8" },
    ];
    steps.forEach((st, i) => {
      const x = 0.6 + i * 1.78;
      s.addShape("rect", { x, y: 1.3, w: 1.62, h: 1.05, fill: { color: st.c }, line: { color: i === 4 ? "5BA85B" : (i % 2 ? "E08A3C" : "4A90D9"), width: 1 } });
      s.addText(st.t, {
        x: x + 0.06, y: 1.36, w: 1.5, h: 0.93,
        fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
      });
      if (i < 4) {
        s.addText("→", { x: x + 1.6, y: 1.52, w: 0.2, h: 0.5, fontSize: 14, fontFace: "Microsoft YaHei", color: C.accentWarm, align: "center", margin: 0 });
      }
    });
    s.addText("CI 五步闭环：镜像与 Chart 都版本化（v1.2.3）；打包 / 发布在 CI 自动完成，部署时只传参数（upgrade --install 幂等 + 环境 values）", {
      x: 0.6, y: 2.5, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    // 多环境
    s.addText("多环境管理：一套 Chart 跑所有环境（配置外部化——第 8 章思想在交付层的延伸）", {
      x: 0.6, y: 3.0, w: 8.8, h: 0.35,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    card(s, 0.6, 3.45, 8.8, 1.0, C.primary);
    s.addText("values.yaml 默认值 + 各环境独立覆盖：dev（副本 1 / latest / 测试域名）、prod（副本 5 / 固定 tag / 正式域名 + TLS）", {
      x: 0.9, y: 3.57, w: 8.2, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("helm upgrade --install myapp ./myapp -f values-dev.yaml  --namespace dev", {
      x: 0.9, y: 3.93, w: 8.2, h: 0.3,
      fontSize: 11, fontFace: "Consolas", color: C.primary, bold: true, margin: 0
    });
    s.addText("helm upgrade --install myapp ./myapp -f values-prod.yaml --namespace prod", {
      x: 0.9, y: 4.23, w: 8.2, h: 0.3,
      fontSize: 11, fontFace: "Consolas", color: C.primary, bold: true, margin: 0
    });
    // 安全
    s.addText("安全（概念）：Chart 签名验证（provenance，--verify）防供应链投毒 · 私有 Chart 仓库访问控制 · 生产用固定镜像 tag（不用 latest，复用第 4 章拉取策略）", {
      x: 0.6, y: 4.7, w: 8.8, h: 0.6,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
  }
};
