// slide-08.js — 3.2.4 环境前置条件
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 8, title: "环境前置条件" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "环境前置条件：每项的“为什么”");
    const items = [
      { k: "关闭 swap（交换分区）", v: "kubelet 用 cgroup 精确限制 Pod 内存，swap 让“内存超限”不可控——预检直接拒绝" },
      { k: "内核模块 overlay", v: "容器镜像分层文件系统的底层支撑——没有它 containerd 无法工作" },
      { k: "内核模块 br_netfilter", v: "让经过网桥的流量也能被 iptables 处理——CNI 的网络策略（第 9 章）依赖它" },
      { k: "ip_forward=1", v: "节点内核转发——跨节点 Pod 通信、Service 转发的必经之路" },
      { k: "主机名与 hosts 解析", v: "kubeadm 用主机名标识节点，节点间必须能互相解析（否则证书请求和注册都会失败）" },
    ];
    items.forEach((it, i) => {
      const y = 1.25 + i * 0.55;
      card(s, 0.6, y, 8.8, 0.47, i % 2 ? C.accent : C.primary);
      s.addText(it.k, {
        x: 0.85, y, w: 2.55, h: 0.47,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.primary, valign: "middle", margin: 0
      });
      s.addText(it.v, {
        x: 3.5, y, w: 5.7, h: 0.47,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("kubeadm preflight 在 init 时逐项检查——缺什么会明确报错，按提示修复即可；理解每项原理，比背命令更重要", {
      x: 0.6, y: 4.2, w: 8.8, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
  }
};
