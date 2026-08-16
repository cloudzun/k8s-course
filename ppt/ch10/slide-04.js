// slide-04.js — 10.1 存储问题全景
const { C, sectionTitle, card, numBadge, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 4, title: "存储问题全景" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "存储问题全景", C.bgLight);
    // 10.1.1 痛点
    card(s, 0.6, 1.15, 8.8, 1.1, C.primary);
    s.addText("容器文件系统为什么“靠不住”：写入发生在镜像可写层——容器删除，可写层一起消失", {
      x: 0.9, y: 1.25, w: 8.2, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("Pod 重建 → 容器内文件全部丢失　｜　Pod 被调度到其他节点 → 原节点上的数据够不着", {
      x: 0.9, y: 1.7, w: 8.2, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    // 10.1.2 三个存储需求
    const needs = [
      { t: "持久化", d: "数据跨 Pod 生命周期存活——删了重建，数据还在", strip: C.primary },
      { t: "共享", d: "Pod 内多个容器共享数据（sidecar 读主容器日志）", strip: C.accent },
      { t: "解耦", d: "应用不关心底层细节（本地盘/网络盘/云盘一样用）", strip: C.secondary },
    ];
    needs.forEach((n, i) => {
      const x = 0.6 + i * 3.0;
      card(s, x, 2.5, 2.8, 1.4, n.strip);
      numBadge(s, x + 0.15, 2.65, i + 1, n.strip);
      s.addText(n.t, {
        x: x + 0.7, y: 2.62, w: 2.0, h: 0.45,
        fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(n.d, {
        x: x + 0.2, y: 3.15, w: 2.45, h: 0.7,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.2, margin: 0
      });
    });
    s.addText("承接第 4 章 Pod“无状态”认知：需要持久数据的应用（数据库 / 上传文件）必须显式挂存储", {
      x: 0.6, y: 4.1, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    calloutBar(s, "K8s 的答案：层层抽象——卷（Pod 级）→ PV/PVC（集群级）→ StorageClass（自动化）", 4.7);
  }
};
