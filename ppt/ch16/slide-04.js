// slide-04.js — 16.1.1 分层排查框架（五层图）
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 4, title: "分层排查框架" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "分层排查框架：从外到内，逐层定位");
    const layers = [
      { t: "节点层", q: "机器/kubelet 正常吗？（NotReady？）", c: "systemctl / journalctl / df / free", fill: "E8F4FD", line: "4A90D9" },
      { t: "Pod 层", q: "调度/镜像/状态正常吗？（Pending/CrashLoop？）", c: "kubectl get pods -o wide / describe", fill: "E8F4FD", line: "4A90D9" },
      { t: "容器层", q: "应用本身正常吗？（日志/退出码）", c: "kubectl logs --previous / exec", fill: "FFF3E0", line: "E08A3C" },
      { t: "网络层", q: "流量/名字解析通吗？（Endpoints/DNS）", c: "kubectl get endpoints / nslookup", fill: "FFF3E0", line: "E08A3C" },
      { t: "存储层", q: "卷挂载/绑定正常吗？（Pending/FailedMount）", c: "kubectl get pvc / describe", fill: "FDECEA", line: "D94F4F" },
    ];
    layers.forEach((L, i) => {
      const y = 1.3 + i * 0.78;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.68, fill: { color: L.fill }, line: { color: L.line, width: 1.2 } });
      numBadge(s, 0.75, y + 0.12, i + 1, L.line);
      s.addText(`${L.t}：${L.q}`, {
        x: 1.4, y: y + 0.08, w: 5.2, h: 0.5,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark,
        valign: "middle", margin: 0
      });
      s.addText(L.c, {
        x: 6.6, y: y + 0.08, w: 2.6, h: 0.5,
        fontSize: 10, fontFace: "Consolas", color: "55606E",
        valign: "middle", margin: 0
      });
    });
    s.addShape("rect", { x: 0.6, y: 5.2, w: 8.8, h: 0.42, fill: { color: C.bgCard } });
    s.addText("读图要点：先确认“下面一层没白查”——节点挂了，查 Pod 日志是浪费；每层都有专属命令。", {
      x: 0.85, y: 5.2, w: 8.3, h: 0.42,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, bold: true,
      valign: "middle", margin: 0
    });
  }
};
