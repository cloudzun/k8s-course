// slide-19.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 19, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "卷（Pod 级）：emptyDir 临时共享 / hostPath 宿主机目录（绑节点）/ 配置卷（CM·Secret）——单机思维",
      "PV/PVC（集群级）：PV=管理员提供的存储资源，PVC=应用的存储请求，绑定一对一——解耦“提供”与“使用”",
      "生命周期：Provision → Bind → Use → Reclaim；访问模式是底层能力约束；回收策略 Retain 保数据 / Delete 自动删",
      "StorageClass（自动化）：provisioner 自动建 PV——声明即用；默认类；WaitForFirstConsumer 是节点本地存储的必需",
      "选型：local-path 单节点 → NFS/云盘（共享）→ CSI 生态（生产标准）——多副本共享的前提是存储可共享",
      "教学顺序：StorageClass 在实验 08 Lab 4 才安装（讲概念再动手）；实验 08 四个 Lab 顺序与本章一致",
    ];
    items.forEach((g, i) => {
      const y = 1.25 + i * 0.6;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.55,
        fontSize: 12, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("衔接：第 11 章安全（认证/授权）——存储的权限控制（谁能用哪个 PVC/Secret）也是安全的一部分；第 18 章 WordPress 持久化（PVC + local-path）落地本章知识", {
      x: 0.6, y: 5.0, w: 8.8, h: 0.45,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid,
      lineSpacingMultiple: 1.15, margin: 0
    });
  }
};
