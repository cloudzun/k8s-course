// slide-14.js — 15.4 事件（Events）与审计
const { C, sectionTitle, codeBlock, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 14, title: "事件与审计" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "事件（Events）与审计", C.bgLight);
    // 15.4.1 事件
    s.addText("事件：对象状态变化的流水账（第 2 章 describe 里见过）", { x: 0.6, y: 1.18, w: 8.8, h: 0.3, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    codeBlock(s, 0.6, 1.52, 8.8, 0.72,
      "kubectl get events -A                       # 全集群事件\nkubectl get events --sort-by=.lastTimestamp    # 按时间排\nkubectl describe pod xxx                        # 单对象的事件（Events 段）", 10);
    s.addText("典型事件：Scheduled（调度成功）、Pulled（拉镜像）、FailedScheduling（调度失败）、Unhealthy（探针失败）、Killing（终止）、BackOff（重启退避）——排障时“发生了什么”的第一手来源", { x: 0.6, y: 2.3, w: 8.8, h: 0.5, fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
    warnBar(s, "注意：Event 是临时的（默认 1 小时左右清理）——出问题要“趁热看”；生产可配置事件持久化（进阶）", 2.9);
    // 15.4.2 审计
    s.addText("审计日志：apiserver 请求全记录（概念）", { x: 0.6, y: 3.55, w: 8.8, h: 0.3, fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0 });
    codeBlock(s, 0.6, 3.9, 8.8, 0.45,
      "kubectl delete pod web-1  →  审计日志：用户 kubernetes-admin 在 12:00:03 DELETE pods/web-1（200 OK）", 10);
    s.addText("▸ 用途：安全审计（谁删了 Secret？）、合规、取证\n▸ 默认不启用（要配置 AuditPolicy 指定记录级别）\n▸ 一句话：事件 =“对象发生了什么”；审计 =“谁对 apiserver 做了什么”", { x: 0.6, y: 4.45, w: 8.8, h: 0.72, fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0 });
  }
};
