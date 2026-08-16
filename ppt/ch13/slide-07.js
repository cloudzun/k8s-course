// slide-07.js — 13.2.3 检查与续期
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 7, title: "检查与续期" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "检查与续期（例行运维）", C.bgLight);
    codeBlock(s, 0.6, 1.2, 8.8, 0.85, [
      "kubeadm certs check-expiration    # 检查：每个证书的到期时间与剩余时间",
      "kubeadm certs renew all           # 续期全部（到期时间顺延 1 年）",
    ].join("\n"), 11);
    // 样例输出
    s.addShape("rect", { x: 0.6, y: 2.2, w: 8.8, h: 1.0, fill: { color: C.bgCard } });
    s.addText([
      "CERTIFICATE                EXPIRES                  RESIDUAL TIME",
      "admin.conf                 Aug 15, 2027 13:52 UTC   364d",
      "apiserver                  Aug 15, 2027 13:52 UTC   364d",
      "kubelet.conf               Aug 15, 2027 13:52 UTC   364d",
    ].join("\n"), {
      x: 0.8, y: 2.28, w: 8.4, h: 0.85,
      fontSize: 9.5, fontFace: "Consolas", color: C.textDark, margin: 0, lineSpacingMultiple: 1.2
    });
    s.addText("续期后的注意事项", {
      x: 0.6, y: 3.4, w: 4.0, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const notes = [
      "控制面静态 Pod 由 kubelet 自动重建（加载新证书）",
      "kubeconfig（admin.conf 等）不会自动更新 → kubeadm init phase kubeconfig admin 重新生成",
      "续期后验证：kubectl get nodes 正常；kubelet 节点证书自动轮换（实验 09 Lab 9）",
    ];
    notes.forEach((n, i) => {
      const y = 3.82 + i * 0.42;
      s.addShape("ellipse", { x: 0.7, y: y + 0.06, w: 0.26, h: 0.26, fill: { color: C.secondary } });
      s.addText(String(i + 1), {
        x: 0.7, y: y + 0.06, w: 0.26, h: 0.26,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textLight, bold: true,
        align: "center", valign: "middle", margin: 0
      });
      s.addText(n, {
        x: 1.1, y, w: 8.2, h: 0.38,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("生产实践：证书续期纳入例行维护（配合实验 12 维护窗口）；剩余 <90 天就安排续期。", {
      x: 0.6, y: 5.15, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
