// slide-26.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 26, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "为什么 Kubernetes v1.24 要移除 dockershim？用 containerd 和用 Docker 的本质区别是什么？",
      "三个网段（节点/Pod/Service）为什么必须互不重叠？如果 Pod 网段选了和节点一样的 192.168.0.0/16 会发生什么？",
      "kubeadm init 的七步里，哪一步对应第 2 章的“静态 Pod”？控制面组件为什么用静态 Pod 而非 Deployment 管理？",
      "worker join 为什么需要“token + CA hash”两样东西？缺一个会有什么风险？",
      "为什么没装 CNI 时节点一直是 NotReady？kubelet 是怎么知道“网络没就绪”的？",
      "如果只要求“Pod 能互通、不在乎网络策略”的小集群，你选什么 CNI？为什么？",
    ];
    qs.forEach((q, i) => {
      const y = 1.25 + i * 0.62;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.55,
        fontSize: 12, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "CKA 考点（域 1：集群架构、安装与配置 25%，权重最高的实操域）：kubeadm init 参数含义、token 续发、镜像预热、join 的 token + CA hash、CNI 与 Ready 的关系、wait-control-plane 排查、etcd 备份（snapshot save/restore，第 14 章展开）。", 5.05);
  }
};
