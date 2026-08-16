// slide-14.js — 7.4.1/7.4.2 第一、二层：requests/limits 与 LimitRange
const { C, sectionTitle, card, numBadge, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 14, title: "LimitRange 第二层防线" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "第一、二层：requests/limits 与 LimitRange");
    // 第一层
    card(s, 0.6, 1.15, 8.8, 0.85, C.secondary);
    s.addText("第一层：requests/limits（Pod 自己声明）", {
      x: 0.86, y: 1.23, w: 8.3, h: 0.3,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("每容器声明“要多少 / 最多用多少”（实验 02 Lab 10）。问题：靠自觉——Pod 不写就没有；写小了节点可能超卖；写大了浪费。", {
      x: 0.86, y: 1.55, w: 8.3, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 第二层
    s.addText("第二层：LimitRange——命名空间级别给“单个对象”设默认值与上下限（准入控制实现，第 12 章展开）", {
      x: 0.6, y: 2.12, w: 8.8, h: 0.42,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const acts = [
      "校验：Pod 声明超出范围 → 创建被拒（Forbidden）",
      "填充：Pod 没声明 → 自动补默认值（防止“裸奔”Pod——最重要的一条）",
      "约束：统一命名空间的资源声明口径",
    ];
    acts.forEach((a, i) => {
      const y = 2.66 + i * 0.6;
      numBadge(s, 0.7, y + 0.02, i + 1);
      s.addText(a, {
        x: 1.35, y, w: 3.95, h: 0.5,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    codeBlock(s, 5.5, 2.62, 3.9, 1.85, `# 命名空间 dev 的 LimitRange：
# requests 必须 50m~2 核、内存 32Mi~1Gi
# 没写 requests/limits → 自动填默认值
kubectl -n dev apply -f lr-pod.yaml
# requests 4 核 > 上限 2 核
Error from server (Forbidden):
... maximum cpu usage per Pod is 2,
but request is 4`, 10.5);
    calloutBar(s, "核心认知：LimitRange 解决“单个 Pod 不守规矩”——要么超限被拒（Forbidden），要么没写被填默认值。", 4.62);
  }
};
