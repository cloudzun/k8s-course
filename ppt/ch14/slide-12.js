// slide-12.js — 14.3.6 Addons 升级管理
const { C, sectionTitle, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 12, title: "Addons 升级管理" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Addons 升级管理（容易漏的一环）");
    s.addText("kubeadm upgrade 只升级核心组件（控制面 + kubelet）——不升级 Addons（CNI 插件、CoreDNS、ingress-nginx、metrics-server 等）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const code = [
      "升级后核对清单：",
      "① CNI（Calico）：版本是否兼容新 K8s？→ 查官方兼容矩阵，按需升级",
      "   （升级 CNI 是高风险操作，先 drain 或选低峰）",
      "② CoreDNS：kubeadm 会提示可升级版本",
      "   → kubectl -n kube-system rollout restart deploy/coredns 前先确认镜像",
      "③ 其他组件（ingress-nginx/metrics-server/dashboard）：",
      "   各自按官方发布节奏升级",
    ].join("\n");
    codeBlock(s, 0.6, 1.6, 8.8, 2.5, code, 11);
    calloutBar(s, "生产教训：K8s 升级后“集群正常但功能异常”（网络策略失效/ingress 行为变化/指标没了），八成是 Addons 版本不兼容——把 Addons 升级写进升级流程清单（14.3.2 顺序口诀的补充项）。", 4.45);
    s.addText("节点自动扩缩（Cluster Autoscaler/Karpenter，云环境）概念见第 7 章 §7.3.2", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.35,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
