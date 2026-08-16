// slide-10.js — 16.2.3 容器层：logs/exec/describe + kubectl debug
const { C, sectionTitle, codeBlock, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 10, title: "容器层排查" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "容器层：应用自己", C.bgLight);
    s.addText("Pod Running 但功能不对 → 进容器看应用（常见坑：环境变量/配置注入错了——describe 核对 Env 与 Mounts，第 8 章）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.32,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.55, 8.8, 1.5,
`kubectl logs <pod> --tail=50        # 当前日志
kubectl logs <pod> --previous       # 崩溃前的日志
kubectl exec -it <pod> -- sh        # 进容器（v1.36 用 --）
kubectl describe pod <pod>          # 状态/环境变量/挂载（验证配置对不对）`, 11);
    s.addText("Pod 里没有 shell/工具（精简镜像）怎么办？——不 SSH 进节点（不干净、权限大），用 kubectl debug：", {
      x: 0.6, y: 3.2, w: 8.8, h: 0.35,
      fontSize: 13.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    s.addText("① 临时容器（v1.23+ 稳定）：kubectl debug -it <pod> --image=nicolaka/netshoot --target=<容器名> -- sh（共享进程/网络命名空间，排障后自动消失）", {
      x: 0.6, y: 3.6, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("② 副本调试：kubectl debug <pod> -it --copy-to=debug-pod --image=busybox -- sh（启动调试副本，不改原 Pod）", {
      x: 0.6, y: 3.9, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("③ 节点调试：kubectl debug node/<节点名> -it --image=ubuntu（在节点上起特权调试 Pod，替代 SSH）", {
      x: 0.6, y: 4.2, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    warnBar(s, "决策逻辑：能进容器 → exec；容器没工具/进不去 → debug 临时容器；要查节点 → debug node——全程 kubectl，不给 SSH 权限。", 4.65);
  }
};
