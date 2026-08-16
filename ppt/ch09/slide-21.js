// slide-21.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 21, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "四层网络：节点（物理）/ Pod（每 Pod 一 IP，CNI）/ Service（虚拟 IP）/ 外部（NodePort / LB / Ingress）",
      "Service 机制：Endpoints（选后端）+ kube-proxy（规则写内核，iptables 随机 / IPVS 轮询）——流量不经过 kube-proxy 进程",
      "四种类型：ClusterIP / NodePort / LoadBalancer / ExternalName；headless 返回 Pod IP 列表（StatefulSet 稳定 DNS 名）",
      "集群 DNS：coredns 解析 svc.ns.svc；命名空间作用域是易错点",
      "Ingress：对象声明规则 + 控制器真正转发；host/path 路由 + TLS 终止——管路由（七层），Service 管负载均衡（四层）",
      "NetworkPolicy：默认全通 → 白名单制；podSelector / ipBlock + ingress / egress；依赖 CNI（Calico 行、Flannel 不行）；注意放行 DNS",
      "走查：DNS → Ingress → Service → kube-proxy → Pod，排障从外到内",
    ];
    items.forEach((g, i) => {
      const y = 1.2 + i * 0.56;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.52,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("衔接：第 10 章讲存储（PV/PVC/StorageClass）——“应用数据放哪”；第 11 章 RBAC 在 NetworkPolicy 之外提供“谁能做什么”的另一层安全。", {
      x: 0.6, y: 5.12, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
