// slide-18.js — 14.6 运维日历 / 14.7 命名空间与资源治理
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "table", index: 18, title: "运维日历与资源治理" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "运维日历与资源治理");
    s.addText("第 16 章 SRE 规范的落地载体——把“该做的事”固定成日历，与第 16 章 SRE 规范配套：", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 12 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 11.5, color: C.primary, bold: true, valign: "middle", align: "center" });
    const rows = [
      [{ text: "频率", options: hdr }, { text: "运维项目", options: hdr }, { text: "执行标准", options: hdr }],
      [{ text: "每日", options: mkF(0) }, { text: "监控告警巡检 + Pod 异常扫描", options: celA }, { text: "自动化巡检脚本", options: celA }],
      [{ text: "每周", options: mkF(1) }, { text: "资源利用率分析 + 容量趋势", options: celB }, { text: "requests vs 实际使用", options: celB }],
      [{ text: "每月", options: mkF(0) }, { text: "证书有效期检查 + etcd 碎片整理", options: celA }, { text: "剩余 < 90 天必须续期（第 13 章）", options: celA }],
      [{ text: "每季度", options: mkF(1) }, { text: "安全漏洞扫描 + RBAC 权限审计", options: celB }, { text: "Trivy + kubectl auth can-i", options: celB }],
      [{ text: "每半年", options: mkF(0) }, { text: "灾备演练（etcd 恢复 + Velero 恢复）", options: celA }, { text: "必须验证 RTO/RPO 达标", options: celA }],
      [{ text: "按需", options: mkF(1) }, { text: "K8s 版本升级（不跨大版本）", options: celB }, { text: "先 staging → 再 production", options: celB }],
    ];
    s.addTable(rows, {
      fontFace: "Microsoft YaHei",
      x: 0.6, y: 1.55, w: 8.8, colW: [1.3, 4.7, 2.8],
      border: { type: "solid", pt: 0.5, color: C.border },
      rowH: 0.4,
    });
    // 14.7 治理
    card(s, 0.6, 4.5, 8.8, 1.0, C.accent);
    s.addText("命名空间与资源治理（运维视角）", {
      x: 0.8, y: 4.58, w: 8.4, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("▸ 配额巡检：kubectl get resourcequota -n <ns>——哪些命名空间接近配额（该扩容/清理了）\n▸ 对象清理：无用命名空间直接删（连带清空）；残留的 Failed/Completed Pod 定期清理（CronJob 的 historyLimit 配合）\n▸ 资源账单：按命名空间聚合用量（kubectl top + 配额数据）——成本归属", {
      x: 0.8, y: 4.92, w: 8.4, h: 0.5,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.2, margin: 0, valign: "top"
    });
  }
};
