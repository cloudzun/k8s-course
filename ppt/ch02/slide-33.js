// slide-33.js — 2.6.2 写旅程
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 33, title: "旅程二：写请求" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "旅程二：kubectl apply 创建 Deployment", C.bgLight);
    const steps = [
      "用户 kubectl apply -f web.yaml（发送期望状态）",
      "apiserver：认证 → 授权 → 准入 → 写入 etcd",
      "Deployment 控制器：Watch 到新 Deployment → 创建 ReplicaSet",
      "ReplicaSet 控制器：创建 3 个 Pod",
      "Scheduler：绑定 Pod → node2（写入 nodeName 字段）",
      "kubelet：Watch 到 Pod 已调度给我 → CRI 拉镜像、建沙箱、起容器",
      "kubelet 上报 Running + IP → apiserver 更新 etcd",
    ];
    steps.forEach((st, i) => {
      const y = 1.3 + i * 0.52;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.44, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.05, h: 0.44, fill: { color: i === 0 ? C.accent : C.primary } });
      s.addText((i + 1) + ". " + st, {
        x: 0.85, y, w: 8.3, h: 0.44,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "每一步都是“写对象 → Watch 通知 → 下一个组件处理”的接力；没有任何两个组件直连——这就是声明式。", 5.0);
  }
};

