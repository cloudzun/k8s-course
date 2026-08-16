// slide-16.js — 8.5 配置管理最佳实践 + 8.6 实验演练指引
const { C, sectionTitle, card, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 16, title: "配置管理最佳实践与实验指引" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "配置管理最佳实践 · 实验演练指引", C.bgLight);
    // 左：最佳实践
    card(s, 0.6, 1.15, 4.9, 3.7, C.primary);
    s.addText("最佳实践（生产）", {
      x: 0.9, y: 1.25, w: 4.3, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const bps = [
      "配置全进对象：Deployment yaml 零硬编码（地址 / 密码 / 开关不出现）",
      "按敏感性分流：非敏感 → ConfigMap；敏感 → Secret（别全放 CM）",
      "文件名即配置：配置文件用卷挂载（热更新）；少量参数用 env",
      "Secret 最小权限：RBAC 收紧 + etcd 加密 + 定期轮换",
      "多环境复用：同一镜像 + 不同命名空间的 CM/Secret = 一套镜像跑 dev/prod",
      "修改流程：改 CM（卷方式）→ 自动热更新；改 env → 滚动重启 Pod",
    ];
    bps.forEach((b, i) => {
      const y = 1.68 + i * 0.53;
      numBadge(s, 0.85, y + 0.03, i + 1);
      s.addText(b, {
        x: 1.45, y, w: 3.9, h: 0.5,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    // 右：实验指引
    card(s, 5.7, 1.15, 3.7, 3.7, C.accent);
    s.addText("实验 06 指引（5 Lab + 2 补充）", {
      x: 6.0, y: 1.25, w: 3.3, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const labs = [
      "Lab 1 文件型 CM：--from-file + 卷挂载进 mysql",
      "Lab 2 键值对 CM：--from-literal、键变文件",
      "Lab 3 env 映射：configMapKeyRef 注入",
      "Lab 4 Secret：base64 + secretKeyRef 注入 mysql 密码（亲手验证“秒还原”）",
      "Lab 5 文件型 Secret：配置文件封进 Secret、挂载还原明文",
      "补充 1：Secret 类型（tls / dockerconfigjson）",
      "补充 2：Downward API（fieldRef env + downwardAPI 卷）",
    ];
    labs.forEach((l, i) => {
      s.addText("▸ " + l, {
        x: 6.0, y: 1.68 + i * 0.46, w: 3.3, h: 0.44,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("教学建议：Lab 1-3 对比记忆“卷 vs env”两种消费；Lab 4 重点体验“编码 ≠ 加密”", {
      x: 0.6, y: 5.05, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
  }
};
