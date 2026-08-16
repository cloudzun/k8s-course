// slide-08.js — 16.2.1 节点层 NotReady
const { C, sectionTitle, codeBlock, card } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 8, title: "节点层 NotReady" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "节点层：NotReady");
    s.addText("判断依据：kubectl get nodes 显示 NotReady（Ready 依赖 kubelet 心跳 + 网络就绪）", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 1.55, 8.8, 2.3,
`kubectl get nodes                    # 哪台 NotReady？
kubectl describe node node2          # 看 Conditions/事件
ssh 到该节点：
  systemctl status kubelet           # kubelet 活着吗？
  journalctl -u kubelet -n 50        # kubelet 日志（第一手线索）
  df -h / free -m                    # 磁盘满/内存不足？（节点资源压力）
  ip a                               # 网络通吗？（CNI 依赖）`, 11);
    card(s, 0.6, 4.05, 8.8, 1.3, C.accent);
    s.addText("常见根因", {
      x: 0.9, y: 4.18, w: 1.6, h: 0.4,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("kubelet 挂了/配置错 · 磁盘满（镜像清理）· 内存压力 · 网络插件（calico）异常 · 证书问题", {
      x: 0.9, y: 4.62, w: 8.2, h: 0.5,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
  }
};
