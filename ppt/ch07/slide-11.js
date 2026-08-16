// slide-11.js — 7.3.1 VPA 与 7.3.2 ClusterAutoscaler
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "compare", index: 11, title: "VPA 与 ClusterAutoscaler" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "VPA 与 7.3.2 ClusterAutoscaler：另外两个维度");
    // 左卡：VPA
    card(s, 0.6, 1.3, 4.3, 2.95, C.primary);
    s.addText("VPA（Vertical Pod Autoscaler）", {
      x: 0.86, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 14.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const vpa = [
      "▸ 原理：根据历史用量自动调整 Pod 的 requests/limits（而不是副本数）",
      "▸ 为什么需要：应用需求会变（内存膨胀、业务高峰），人工调 requests 很烦",
      "▸ 机制：VPA 建议 → 修改 Deployment 模板 → 滚动更新（需重建 Pod 生效）",
      "▸ 注意：VPA 与 HPA 在 CPU/内存上不能同时用——常用“VPA 调 requests + HPA 管副本”",
    ];
    vpa.forEach((b, i) => {
      s.addText(b, {
        x: 0.86, y: 1.9 + i * 0.48, w: 3.9, h: 0.46,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.2, valign: "top", margin: 0
      });
    });
    s.addText("⭐ v1.27+ In-place Pod Resource Updates：不重启 Pod 原地更新资源字段（v1.36 已支持）——对重启敏感的有状态服务意义重大", {
      x: 0.86, y: 3.9, w: 3.9, h: 0.32,
      fontSize: 10.5, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, lineSpacingMultiple: 1.2, valign: "top", margin: 0
    });
    // 右卡：CA
    card(s, 5.1, 1.3, 4.3, 2.95, C.accent);
    s.addText("ClusterAutoscaler（CA）", {
      x: 5.36, y: 1.42, w: 3.9, h: 0.4,
      fontSize: 14.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    const ca = [
      "▸ 原理：集群资源不足时自动增减节点（云环境，调用云厂商 API）",
      "▸ 触发：Pod 挤满所有节点（调度过滤失败 Pending）→ 加节点；节点长期空闲 → 减节点",
      "▸ 注意：需要云环境——裸机集群无法自动加机器",
      "▸ 与 HPA 配合：形成“应用级 + 节点级”双层弹性",
    ];
    ca.forEach((b, i) => {
      s.addText(b, {
        x: 5.36, y: 1.9 + i * 0.48, w: 3.9, h: 0.46,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.2, valign: "top", margin: 0
      });
    });
    s.addText("排障线索：Pod 长时间 Pending → 检查集群容量与 CA 是否扩容（结合第 6 章调度）", {
      x: 5.36, y: 3.9, w: 3.9, h: 0.32,
      fontSize: 10.5, fontFace: "Microsoft YaHei", bold: true, color: C.secondary, lineSpacingMultiple: 1.2, valign: "top", margin: 0
    });
    // 底部决策逻辑
    card(s, 0.6, 4.42, 8.8, 0.85, C.primary);
    s.addText("决策逻辑：默认 HPA（无状态应用的水平扩展是首选）；副本数不能随便加（有状态/单实例）→ VPA；节点容量瓶颈 → ClusterAutoscaler。三者可以组合（生产标准组合：HPA + CA）。", {
      x: 0.9, y: 4.5, w: 8.2, h: 0.7,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, valign: "middle", margin: 0
    });
  }
};
