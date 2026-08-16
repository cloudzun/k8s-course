// slide-20.js — 思考题
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "questions", index: 20, title: "思考题" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "思考题");
    const qs = [
      "为什么维护节点要“先 cordon 再 drain”而不是直接 drain？",
      "升级 worker 时为什么要逐台而不是全部一起升？（提示：集群容量与业务）",
      "为什么 kubeadm 不能跨次要版本升级？跳版本会怎样？",
      "etcd 备份恢复后，“丢失”的是什么？升级失败回滚时为什么能接受这个丢失？",
      "4 节点 etcd 比 3 节点更可靠吗？为什么？（提示：Raft 多数派）",
      "“没有验证过的备份 = 没有备份”——怎么才算“验证过”？",
    ];
    qs.forEach((q, i) => {
      const y = 1.25 + i * 0.62;
      s.addShape("ellipse", { x: 0.7, y: y + 0.03, w: 0.38, h: 0.38, fill: { color: C.primary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.03, w: 0.38, h: 0.38,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(q, {
        x: 1.25, y, w: 8.2, h: 0.55,
        fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("CKA 考点标注（域 1/5）：必考命令 etcdctl snapshot save/status/restore；必考流程——etcd 备份恢复五步、升级顺序、节点维护流程；必考概念——Raft 奇数节点、--control-plane-endpoint、版本兼容窗口。", {
      x: 0.6, y: 5.0, w: 8.8, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid,
      lineSpacingMultiple: 1.25, margin: 0, valign: "top"
    });
  }
};
