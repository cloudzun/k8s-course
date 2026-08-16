// slide-25.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 25, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "Pod = 最小调度单元：共享网络 / 存储 / 生命周期；sidecar / 适配器 / 大使三种协作模式",
      "容器配置：拉取策略默认由 tag 决定；command / args 覆盖 ENTRYPOINT / CMD；文件型配置走 ConfigMap",
      "Init 容器：顺序执行、失败从头重跑、共享卷预置数据——“做完就撤”",
      "探针三兄弟：readiness 摘流量 / liveness 重启 / startup 慢启动保护；探测方式按协议选",
      "优雅终止：摘流量 → preStop → SIGTERM → 宽限期 → SIGKILL——发布不丢请求",
      "资源模型：requests 管调度、limits 管运行；CPU 可压缩（节流）、内存不可压缩（OOM 137）",
      "QoS 三档决定被杀顺序；内存 limits 是生产底线；Downward API 注入自身元数据",
      "生命周期走查环环相扣；实验 02 十个 Lab 对应本章全部机制",
    ];
    items.forEach((t, i) => {
      const y = 1.25 + i * 0.5;
      numBadge(s, 0.7, y + 0.02, i + 1);
      s.addText(t, {
        x: 1.35, y, w: 8.1, h: 0.48,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("衔接：第 5 章讲“管 Pod 的人”——Deployment 等控制器基于本章的 Pod 机制实现滚动更新、扩缩容与自愈", {
      x: 0.6, y: 5.32, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.accent, bold: true, margin: 0
    });
  }
};
