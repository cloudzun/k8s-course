// slide-11.js — 5.2.6 生产发布策略
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 11, title: "发布策略选型矩阵" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "设计指南：生产发布策略");
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "策略", options: hdr }, { text: "原理", options: hdr }, { text: "回滚速度", options: hdr }, { text: "资源开销", options: hdr }, { text: "适用场景", options: hdr }, { text: "K8s 实现", options: hdr }],
      [{ text: "滚动更新", options: mkF(0) }, { text: "逐批替换（§5.2.3）", options: celA }, { text: "中", options: celB }, { text: "低（+1 Pod）", options: celA }, { text: "大多数无状态服务", options: celB }, { text: "Deployment 原生", options: celA }],
      [{ text: "蓝绿部署", options: mkF(1) }, { text: "新旧两套环境，切换 Service 指向", options: celB }, { text: "极快（切 selector）", options: celA }, { text: "高（2x 资源）", options: celB }, { text: "需要瞬间切换 / 瞬间回滚", options: celA }, { text: "两个 Deployment + Service 切换", options: celB }],
      [{ text: "金丝雀发布", options: mkF(0) }, { text: "小比例流量验证后逐步放大", options: celA }, { text: "快", options: celB }, { text: "中", options: celA }, { text: "高风险变更", options: celB }, { text: "两个 Deployment + Ingress 权重 / Argo Rollouts", options: celA }],
      [{ text: "A/B 测试", options: mkF(1) }, { text: "按用户特征分流", options: celB }, { text: "快", options: celA }, { text: "中", options: celB }, { text: "功能验证", options: celA }, { text: "Ingress Header 路由 / Service Mesh", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.3, w: 8.8, colW: [1.0, 1.75, 0.9, 0.85, 1.8, 2.5],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.58,
    });
    s.addText("决策逻辑：默认滚动更新（成本最低）；要“瞬间切换/回滚”→ 蓝绿；高风险变更要“小流量验证”→ 金丝雀；功能对比 → A/B。发布策略的核心是“可回滚 + 可控观察”", {
      x: 0.6, y: 4.42, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("变更窗口：常规变更工作日 10:00-16:00；高风险变更周二/周三 10:00-14:00（禁止：周五下午、节假日前一天、大促期间）· 流程：申请 → 评审 → 预发 → 灰度（≤10% 流量）→ 观察（≥15 分钟）→ 全量 → 验证", {
      x: 0.6, y: 4.82, w: 8.8, h: 0.3,
      fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    s.addText("回滚决策：错误率 > 基线 2 倍 或 P99 延迟 > 基线 3 倍 → 立即回滚；任何数据异常 → 回滚并暂停", {
      x: 0.6, y: 5.12, w: 8.8, h: 0.3,
      fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
