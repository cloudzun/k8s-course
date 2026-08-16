// slide-45.js — 思考题
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 45, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "为什么“Pod 是调度的最小单元”而不是容器？Pod 内多容器共享什么？（提示：sidecar）",
      "控制循环中“观察”靠 apiserver 的哪个能力？“调和”由谁执行？",
      "如果 etcd 数据丢失，集群会发生什么？为什么第 3 章反复强调备份？",
      "kubectl create -f 与 apply -f 的根本区别？为什么 CI/CD 必须用 apply？",
      "一个请求从 kubectl 到容器启动，经过哪 5 个关键组件？每个做了什么？",
      "kube-proxy 是“代理进程”吗？流量真的经过它吗？（提示：规则写入内核）",
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
        fontSize: 12.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "CKA 考点（域 1，25%）：组件职责、apiserver 唯一入口、etcd 状态存储、kubelet 心跳、端口（6443/10250/2379）、apply vs create、控制循环、上下文切换。", 5.05);
  }
};
