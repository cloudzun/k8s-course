// slide-17.js — 7.4.5 设计指南：多租户治理体系
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 17, title: "多租户治理体系" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "设计指南：多租户治理体系", C.bgLight);
    s.addText("命名空间规划模型（按组织规模选）", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.3,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const models = [
      "模型一：按环境划分（小团队）     dev / staging / production",
      "模型二：按团队 × 环境（中型组织）  team-order-dev / team-payment-prod",
      "模型三：按业务域划分（大型组织）  domain-trade / domain-payment（跨域 NetworkPolicy 隔离，第 9 章）",
    ];
    models.forEach((m, i) => {
      s.addText(m, {
        x: 0.6, y: 1.45 + i * 0.33, w: 8.8, h: 0.3,
        fontSize: 11.5, fontFace: "Consolas", color: C.textDark, margin: 0
      });
    });
    // 多租户隔离四层模型
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "层级", options: hdr }, { text: "机制", options: hdr }, { text: "隔离强度", options: hdr }, { text: "适用", options: hdr }],
      [{ text: "L1 逻辑隔离", options: mkF(0) }, { text: "Namespace + RBAC（第 11 章）", options: celA }, { text: "⭐⭐", options: celA }, { text: "同信任域内团队", options: celA }],
      [{ text: "L2 资源隔离", options: mkF(1) }, { text: "ResourceQuota + LimitRange（本章）", options: celB }, { text: "⭐⭐⭐", options: celB }, { text: "防 Noisy Neighbor（吵闹邻居）", options: celB }],
      [{ text: "L3 网络隔离", options: mkF(0) }, { text: "NetworkPolicy（第 9 章）", options: celA }, { text: "⭐⭐⭐⭐", options: celA }, { text: "跨团队安全边界", options: celA }],
      [{ text: "L4 节点隔离", options: mkF(1) }, { text: "Taint/Toleration + 专用节点池（第 6 章）", options: celB }, { text: "⭐⭐⭐⭐⭐", options: celB }, { text: "合规/安全敏感负载", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 2.52, w: 8.8, colW: [1.35, 3.35, 1.6, 2.5],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.42,
    });
    s.addText("超卖策略：测试 200-300%（requests 低、limits 高，允许争抢）· 生产 120-150%（requests 接近实际用量）· 核心服务 100%（Guaranteed QoS）；监控：节点实际利用率 ÷ requests 总和 > 85% 触发扩容", {
      x: 0.6, y: 4.68, w: 8.8, h: 0.55,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.2, valign: "top", margin: 0
    });
  }
};
