// slide-23.js — 3.9 国内镜像获取策略
const { C, sectionTitle, card, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 23, title: "国内镜像获取策略" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "国内环境镜像获取策略（问题本质与思路）", C.bgLight);
    s.addShape("rect", { x: 0.6, y: 1.2, w: 8.8, h: 0.6, fill: { color: C.bgCard } });
    s.addShape("rect", { x: 0.6, y: 1.2, w: 0.06, h: 0.6, fill: { color: C.accent } });
    s.addText("问题的本质：官方组件镜像在 registry.k8s.io、业务镜像在 docker.io，国内网络访问不稳定——安装失败九成是镜像拉取失败（§3.5 的 wait-control-plane 就是典型）", {
      x: 0.9, y: 1.2, w: 8.2, h: 0.6,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    const sols = [
      { t: "① 控制面镜像：换仓库", b: "init 时 --image-repository 指向国内可达仓库（如阿里云）\n\n边界：只换控制面组件镜像仓库，管不到 kubelet 的沙箱镜像——引出最大的坑" },
      { t: "② kubelet 沙箱镜像（pause）：本地注入", b: "pause 由 kubelet 按内置默认名（registry.k8s.io/pause:3.10.1）拉取——从国内源拉取后 tag 成期望名字（多 tag 相近版本），重启 kubelet\n\n国内安装最大的坑（附录 F 有完整实测）" },
      { t: "③ 业务/CNI 镜像（docker.io）：加速站", b: "containerd 支持 per-registry 镜像加速配置（hosts.toml 指向加速站）\n\n要点：加速站可用性随时间变化（403/慢）——先实测再配置，必要时多站兜底" },
    ];
    sols.forEach((so, i) => {
      const x = 0.6 + i * 3.05;
      card(s, x, 2.0, 2.8, 2.3, C.primary);
      s.addText(so.t, {
        x: x + 0.15, y: 2.1, w: 2.5, h: 0.55,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0, lineSpacingMultiple: 1.05
      });
      s.addText(so.b, {
        x: x + 0.15, y: 2.7, w: 2.5, h: 1.5,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.12
      });
    });
    warnBar(s, "先测再装：版本源 + 镜像源各探一次 → 决定要不要变通 → 按“换仓库 / 本地注入 / 加速站”分类处理——别装到一半才发现（预测试脚本在实验手册前置检查）", 4.5);
  }
};
