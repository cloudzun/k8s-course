// slide-06.js — 13.2.2 证书过期 = 集群瘫痪
const { C, sectionTitle, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 6, title: "证书过期 = 集群瘫痪" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "证书过期 = 集群瘫痪（为什么）");
    // 三阶段流程
    const steps = [
      { x: 0.7, fill: "E8F4FD", line: "4A90D9", text: "① 双向 TLS 通信\n双方互验证书（§2.6.3）\nkubeadm 证书默认 1 年" },
      { x: 3.65, fill: "FFF3E0", line: "E08A3C", text: "② 证书过期\n对方校验失败\nx509: certificate has expired" },
      { x: 6.6, fill: "FDECEA", line: "D94F4F", text: "③ 通信中断\napiserver 证书过期 →\nkubectl / 组件全连不上" },
    ];
    steps.forEach(st => {
      s.addShape("rect", { x: st.x, y: 1.3, w: 2.7, h: 1.15, fill: { color: st.fill }, line: { color: st.line, width: 1 } });
      s.addText(st.text, {
        x: st.x + 0.12, y: 1.38, w: 2.46, h: 1.0,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, align: "center", valign: "middle", margin: 0
      });
    });
    codeBlock(s, 0.6, 2.75, 8.8, 1.4, [
      "某组件证书过期 → 对方校验失败（x509: certificate has expired）→ 通信失败",
      "  apiserver 证书过期 → kubectl 连不上、所有组件连不上 → 集群“瘫痪”",
      "  kubelet 证书过期   → 节点与 apiserver 失联 → 节点 NotReady",
    ].join("\n"), 10.5);
    calloutBar(s, "结论：证书续期是集群的例行运维（不是可选项）——剩余 <90 天就安排续期。", 4.5);
  }
};
