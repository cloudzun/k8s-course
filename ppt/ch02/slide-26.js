// slide-26.js — 2.4.4 controller-manager + 2.4.5 cloud-controller-manager
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 26, title: "kube-controller-manager" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "kube-controller-manager：控制器集合", C.bgLight);
    s.addText("每个控制器负责调和一类资源（都是 §2.3 控制循环的实例）：", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const items = [
      { t: "Deployment 控制器", d: "副本/更新状态" },
      { t: "ReplicaSet 控制器", d: "副本数量（创建/删除 Pod）" },
      { t: "DaemonSet 控制器", d: "每节点一个副本" },
      { t: "Job / CronJob", d: "一次性任务 / 定时触发" },
      { t: "Node 控制器", d: "节点健康、驱逐" },
      { t: "Namespace 控制器", d: "命名空间删除（先清空）" },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + (i % 3) * 3.05;
      const y = 1.6 + Math.floor(i / 3) * 1.35;
      card(s, x, y, 2.85, 1.15, C.primary);
      s.addText(it.t, {
        x: x + 0.15, y: y + 0.1, w: 2.55, h: 0.35,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(it.d, {
        x: x + 0.15, y: y + 0.5, w: 2.55, h: 0.55,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    card(s, 0.6, 4.4, 8.8, 0.85, C.accentWarm);
    s.addText("为什么合并成一个进程？每个控制器逻辑上独立，但打包成一个二进制方便部署与升级（kubeadm 只需管一个 Pod）", {
      x: 0.86, y: 4.48, w: 8.3, h: 0.4,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, bold: true, margin: 0
    });
    s.addText("cloud-controller-manager（云环境）：对接云厂商 API（负载均衡/路由/云盘）——裸机/教学集群没有它", {
      x: 0.86, y: 4.88, w: 8.3, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
