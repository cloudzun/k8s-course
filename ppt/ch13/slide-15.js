// slide-15.js — 13.5 API Server 审计日志
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 15, title: "API Server 审计日志" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "API Server 审计日志（集群的“天眼”）", C.bgLight);
    // 审计 vs 事件
    card(s, 0.6, 1.2, 4.3, 0.95, C.secondary);
    s.addText("事件（Events）", {
      x: 0.85, y: 1.28, w: 3.8, h: 0.3,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("对象状态变化的流水账（第 15 章，1 小时 TTL）", {
      x: 0.85, y: 1.6, w: 3.8, h: 0.45,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    card(s, 5.1, 1.2, 4.3, 0.95, C.primary);
    s.addText("审计（Audit）", {
      x: 5.35, y: 1.28, w: 3.8, h: 0.3,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("所有访问 apiserver 的请求全记录——谁（用户/SA）、何时、做了什么、结果如何——安全审计 / 合规 / 入侵检测的“天眼”", {
      x: 5.35, y: 1.6, w: 3.8, h: 0.45,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    // 四个审计等级
    const lv = [
      { x: 0.6, fill: "F5F5F5", line: "666666", t: "None\n不记录" },
      { x: 2.75, fill: "E8F8E8", line: "5BA85B", t: "Metadata\n元数据（默认推荐）" },
      { x: 4.9, fill: "FFF3E0", line: "E08A3C", t: "Request\n+ 请求体" },
      { x: 7.05, fill: "FDECEA", line: "D94F4F", t: "RequestResponse\n+ 响应体（最贵）" },
    ];
    lv.forEach(l => {
      s.addShape("rect", { x: l.x, y: 2.3, w: 2.05, h: 0.7, fill: { color: l.fill }, line: { color: l.line, width: 1 } });
      s.addText(l.t, {
        x: l.x + 0.05, y: 2.34, w: 1.95, h: 0.62,
        fontSize: 9.5, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
      });
    });
    s.addText("记录粒度 → 成本递增", {
      x: 3.3, y: 3.05, w: 3.4, h: 0.3,
      fontSize: 10, fontFace: "Microsoft YaHei", color: C.textMid, align: "center", margin: 0
    });
    // Audit Policy
    codeBlock(s, 0.6, 3.4, 4.4, 1.7, [
      "# /etc/kubernetes/audit-policy.yaml",
      "rules:",
      "- level: Metadata",
      "  resources: [\"secrets\"]   # 重点盯",
      "- level: RequestResponse",
      "  resources: [\"pods\"]",
      "- level: None               # 兜底",
    ].join("\n"), 9);
    // 存储与用途
    card(s, 5.2, 3.4, 4.2, 1.7, C.accent);
    s.addText("存储与用途", {
      x: 5.45, y: 3.5, w: 3.7, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const use = [
      "输出：文件 / webhook 后端（--audit-log-path）→ 集中采集",
      "用途：谁删了 Secret（取证）→ 合规审查 → 入侵检测",
      "默认不启用：需 policy 文件 + apiserver 参数（改 manifest 重启生效）",
    ];
    use.forEach((u, i) => {
      s.addText("▸ " + u, {
        x: 5.45, y: 3.85 + i * 0.4, w: 3.7, h: 0.38,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("生产建议：Metadata 起步（够审计用），敏感资源（Secret/证书）单独加细；RequestResponse 极少用（控制面压力大）；审计是等保合规常见要求。", {
      x: 0.6, y: 5.2, w: 8.8, h: 0.35,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
