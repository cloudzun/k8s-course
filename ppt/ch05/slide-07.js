// slide-07.js — 5.2.1 三层结构
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 7, title: "Deployment 三层结构" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "三层结构：Deployment → ReplicaSet → Pod");
    // 左侧三层结构
    const box = (x, y, w, h, fill, stroke, title, sub) => {
      s.addShape("rect", { x, y, w, h, fill: { color: fill }, line: { color: stroke, width: 1.5 } });
      s.addText(title, {
        x: x + 0.15, y: y + 0.08, w: w - 0.3, h: 0.34,
        fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: stroke, margin: 0
      });
      s.addText(sub, {
        x: x + 0.15, y: y + 0.44, w: w - 0.3, h: 0.48,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    };
    box(0.6, 1.35, 4.4, 1.0, "E8F0FE", C.primary, "Deployment", "描述：期望 3 副本、镜像版本、更新策略");
    s.addText("▼ 管理（每次更新生成新的 RS）", {
      x: 0.6, y: 2.42, w: 4.4, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0
    });
    box(0.6, 2.8, 4.4, 1.0, "FFF3E0", "E08A3C", "ReplicaSet-1", "当前版本的“副本管家”：维持 3 个 Pod");
    s.addText("▼ 创建 / 删除", {
      x: 0.6, y: 3.87, w: 4.4, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.secondary, align: "center", margin: 0
    });
    box(0.6, 4.25, 4.4, 0.85, "E8F8E8", "5BA85B", "Pod × 3", "真正跑应用的（镜像 nginx:1.27）");
    // 右侧说明卡
    card(s, 5.4, 1.35, 4.0, 3.75, C.primary);
    s.addText("为什么中间要隔一层 ReplicaSet", {
      x: 5.7, y: 1.5, w: 3.4, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("· 为了“回滚”（§5.2.4）：每次更新（模板变化）都会生成一个新的 ReplicaSet，revision 递增（如 2）\n· 旧 RS 保留（带旧版本镜像的“历史记录”）但缩到 0 副本\n· 回滚 = 把期望状态改回旧模板，流量切回旧 RS\n· 没有 RS 这层，就没有“历史快照”，也就无法回滚", {
      x: 5.7, y: 1.95, w: 3.45, h: 2.9,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
    });
  }
};
