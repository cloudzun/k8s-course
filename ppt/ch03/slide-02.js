// slide-02.js — 学习目标
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "objectives", index: 2, title: "学习目标" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "学习目标", C.bgLight);
    const goals = [
      "对比三种集群安装方式（kubeadm / 托管 / 轻量单机），说出各自定位，并解释本课程为什么选 kubeadm",
      "说清安装前必须规划的四个方面：形态 / 版本 / 网络 / 环境，每个决策背后的原理",
      "解释“容器运行时为什么是 containerd 而不是 Docker”，以及 CRI-O、Kata 等运行时的适用场景",
      "完整描述 kubeadm 安装流程三阶段，理解 kubeadm init 每一步的原理（PKI 证书、静态 Pod、kubeconfig）",
      "解释 worker 加入的 token 机制与 TLS bootstrap 原理，理解 NotReady 是正常中间态",
      "对比主流 CNI 插件（Calico / Flannel / Cilium / Weave），说出选 Calico 的理由与“Pod 网段必须一致”",
      "了解国内环境镜像获取的问题本质与三类变通思路（换仓库 / 注入 pause / 加速站）",
      "知道装完集群要验证什么、为什么验证这些，以及 etcd 备份是维护起点",
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
