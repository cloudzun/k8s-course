// slide-24.js — 4.6 走查：一个 Pod 的完整生命周期
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 24, title: "Pod 完整生命周期走查" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "走查：一个 Pod 的完整生命周期", C.bgLight);
    const steps = [
      "提交：kubectl apply deployment.yaml（1 副本，带 readiness + liveness 探针）",
      "调度：scheduler 按 requests 过滤打分，选中 node2",
      "创建：kubelet 建 pause 沙箱 → 拉镜像 → 建容器（Waiting: Pulling）",
      "启动：容器 Running；postStart 钩子并发执行（注册 / 初始化）",
      "探针：startup 成功 → readiness 成功 → 加入 Service 接流量（liveness 失败即重启）",
      "更新 / 删除：摘流量 → preStop 排空 → SIGTERM → 优雅退出（超时 SIGKILL）",
      "回收：删除 Pod 对象（中途内存超限可能已 OOM 被杀，退出码 137）",
    ];
    steps.forEach((t, i) => {
      const y = 1.25 + i * 0.55;
      numBadge(s, 0.7, y + 0.02, i + 1);
      s.addText(t, {
        x: 1.35, y, w: 8.1, h: 0.5,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("对照第 2 章控制循环：Pod 的生死由 ReplicaSet 控制器监视——它死了，控制器立刻补一个新的（自愈）", {
      x: 0.6, y: 5.25, w: 8.8, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
