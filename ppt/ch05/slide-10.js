// slide-10.js — 5.2.4 回滚：出问题一键还原
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 10, title: "回滚机制与 rollout 命令" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "回滚：出问题一键还原", C.bgLight);
    s.addText("机制：每次更新（模板变化）→ 生成新的 ReplicaSet（revision 递增，如 revision 2），旧 RS（revision 1）保留但缩到 0 副本", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.55, 8.8, 1.9,
`kubectl set image deployment/web nginx=nginx:1.28      # 更新 → revision 2（新 RS）
kubectl rollout status deployment/web                  # 等更新完成
kubectl rollout history deployment/web                 # REVISION 1（1.27）/ 2（1.28）
kubectl rollout undo deployment/web                    # 回滚到上一个 revision
kubectl rollout undo deployment/web --to-revision=1    # 回滚到指定版本`, 11.5);
    card(s, 0.6, 3.65, 8.8, 1.15, C.accent);
    s.addText("为什么能回滚：旧 RS 的 Pod 模板还在（历史快照）——回滚 = 把期望状态改回旧模板，滚动更新反向执行", {
      x: 0.9, y: 3.75, w: 8.2, h: 0.38,
      fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("排障关联：更新后 CrashLoopBackOff（实验 10 Lab 2）→ 第一反应 rollout undo 快速恢复，再慢慢查原因——先恢复业务，再排查问题", {
      x: 0.9, y: 4.2, w: 8.2, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
  }
};
