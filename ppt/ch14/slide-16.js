// slide-16.js — 14.5.3 etcd Raft：为什么是奇数节点
const { C, sectionTitle, codeBlock, bigCallout } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 16, title: "etcd Raft 奇数节点" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "etcd Raft：为什么是奇数节点");
    s.addText("etcd 集群用 Raft 共识算法（第 2 章 §2.4.2）：写操作需要多数派（超过一半）节点确认", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const code = [
      "3 节点 etcd：容忍 1 台挂（2/3 仍是多数派）",
      "5 节点 etcd：容忍 2 台挂（3/5 仍是多数派）",
      "偶数节点（如 4）：挂 2 台 = 2/4 不是多数派 → 集群只读/不可用",
      "    → 4 节点不比 3 节点更“高可用”（容错数相同），还多花钱",
    ].join("\n");
    codeBlock(s, 0.6, 1.6, 8.8, 2.2, code, 13);
    bigCallout(s, "为什么奇数：N 节点能容忍 (N-1)/2 台故障——3 和 4 容错都是 1 台，4 没有意义；所以 etcd 用 3/5/7 奇数节点（CKA 必考概念）。", 4.1, 0.95);
    s.addText("恢复会丢“快照之后的变更”，但升级失败回滚时——丢几分钟数据远优于集群瘫痪（呼应 §14.4.2）", {
      x: 0.6, y: 5.2, w: 8.8, h: 0.3,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
