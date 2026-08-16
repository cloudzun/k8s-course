// slide-09.js — 3.2.5 容量规划与节点选型
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "mixed", index: 9, title: "容量规划与节点选型" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "设计指南：容量规划与节点选型", C.bgLight);
    codeBlock(s, 0.6, 1.25, 4.95, 3.3,
`控制面节点（按集群规模）：
  <50 节点     4C / 8G / 50G SSD
  50-200 节点  8C / 16G / 100G SSD
  200+ 节点   16C / 32G / 200G SSD
              （etcd 独立部署）

Worker 节点（按负载类型）：
  通用型       8C / 32G（微服务）
  计算密集型  16C / 32G（CPU 密集）
  内存密集型   8C / 64G（缓存/JVM）
  GPU 节点     按 AI/ML 需求独立规划`, 10.5);
    card(s, 5.75, 1.25, 3.65, 1.35, C.primary);
    s.addText("黄金法则", {
      x: 5.95, y: 1.32, w: 3.2, h: 0.3,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("· 宁可多节点小规格，不要少节点大规格（爆炸半径更小）\n· 单节点 Pod 密度 ≤ 110（kubelet 默认上限）\n· 预留 kube-reserved + system-reserved ≈ 15-20%", {
      x: 5.95, y: 1.62, w: 3.25, h: 0.92,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    card(s, 5.75, 2.75, 3.65, 1.35, C.accent);
    s.addText("etcd 性能基线（控制面的命脉）", {
      x: 5.95, y: 2.82, w: 3.2, h: 0.3,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("· 生产必须 SSD（fsync < 10ms；机械盘导致选举超时、集群不稳定）\n· IOPS ≥ 3000；DB SIZE > 2GB 告警、> 8GB 紧急\n· 定期 compact + defrag 纳入运维日历（第 14 章）", {
      x: 5.95, y: 3.12, w: 3.25, h: 0.92,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    card(s, 5.75, 4.25, 3.65, 1.0, C.secondary);
    s.addText("CIDR 容量推演（Pod 网段 vs 节点规模）", {
      x: 5.95, y: 4.3, w: 3.2, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.secondary, margin: 0
    });
    s.addText("/16 → 每节点 /24 → 最多 256 节点 / 65,536 Pod\n/12 → 4,096 节点 / 1,048,576 Pod\nService /12 通常足够（4,096 个）", {
      x: 5.95, y: 4.6, w: 3.25, h: 0.6,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    s.addText("决策逻辑：先定业务规模（节点数/Pod 密度）→ 反推 CIDR 与节点规格 → 按 etcd 基线选磁盘 → 套内核调优——容量规划不是“越大越好”，是“匹配业务 + 留余量”", {
      x: 0.6, y: 4.85, w: 4.95, h: 0.55,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
