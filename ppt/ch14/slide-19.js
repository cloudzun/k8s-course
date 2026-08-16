// slide-19.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 19, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "运维 = 流程：维护窗口三步曲、升级五步走、备份三件套——每个动作都有“为什么这个顺序”",
      "节点维护：cordon（挡新）→ drain（排空，PDB 保护）→ 维护 → uncordon；污点用于故障隔离/专用节点",
      "升级：备份 → kubeadm 先升 → 控制面 apply → worker 逐台 → 验证；不能跳版本（±1 兼容窗口）；回滚靠 etcd 快照",
      "备份策略：每日+变更后、滚动保留、异地存放、定期恢复演练（“没验证过的备份 = 没有备份”）；恢复丢“快照之后的变更”",
      "控制面高可用：多控制面 + VIP（--control-plane-endpoint）；etcd Raft 奇数节点（3/5/7，容错 (N-1)/2）",
      "治理：配额巡检、对象清理、按命名空间归账",
    ];
    items.forEach((g, i) => {
      const y = 1.25 + i * 0.62;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.58,
        fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("衔接：第 15 章讲可观测性（监控/日志/事件三支柱）——“集群管得好不好”要用数据说话；第 16 章讲排障方法论（故障来了怎么查）。", {
      x: 0.6, y: 5.0, w: 8.8, h: 0.45,
      fontSize: 11.5, fontFace: "Microsoft YaHei", italic: true, color: C.textMid,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
  }
};
