// slide-25.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 25, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "方式抉择：kubeadm（过程可见、可扩展、CKA 考）＞ 托管（生产黑盒）＞ 轻量单机（本地体验）",
      "规划四件事：形态（3 节点教学最优）、版本（三件套一致 + 锁定）、网络（三个网段互不重叠）、环境（swap/内核每项有原理）",
      "运行时选型：containerd（直接实现 CRI、轻量、CNCF 托管）取代 dockershim 时代；SystemdCgroup 必须与 kubelet 对齐",
      "init 原理：预检 → PKI 证书 → kubeconfig → 静态 Pod 清单 → 拉起控制面 → 附加组件 → join 命令；失败先查镜像，别急着 reset",
      "join 原理：token（入场券）+ CA hash（防中间人）+ TLS bootstrap（换取长期证书）；NotReady 是等 CNI 的正常中间态",
      "CNI 选型：Calico（BGP 性能 + NetworkPolicy + 生产主流）vs Flannel（极简）vs Cilium（更强更复杂）；Pod 网段必须与 init 一致",
      "验证四层：节点 Ready / 组件 Running / 跨节点调度 / 镜像拉取",
      "国内变通：问题本质是镜像可达性；三类思路（换仓库 / 本地注入 pause / 加速站）；先测再配",
      "维护起点：etcd 备份是装完集群的第一件事（CKA 必考）",
    ];
    items.forEach((g, i) => {
      const y = 1.2 + i * 0.47;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.43,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
