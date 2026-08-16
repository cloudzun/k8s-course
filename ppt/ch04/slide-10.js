// slide-10.js — 4.2.5 SecurityContext 概览
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 10, title: "SecurityContext 安全基线" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "生产基线：SecurityContext 安全设置区", C.bgLight);
    s.addText("容器默认以 root 运行（与宿主机共享内核权限，被攻破有逃逸风险）——用 SecurityContext 声明降权与加固：", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const code = [
      "spec:",
      "  securityContext:                # Pod 级：对所有容器生效",
      "    runAsNonRoot: true            # 禁止 root（UID 0），否则拒绝启动",
      "    runAsUser: 1000               # 指定运行用户（UID）",
      "  containers:",
      "  - name: app",
      "    securityContext:              # 容器级：只对本容器生效",
      "      readOnlyRootFilesystem: true     # 根文件系统只读",
      "      capabilities:",
      "        drop: [\"ALL\"]             # 丢弃全部 Linux 能力",
    ].join("\n");
    codeBlock(s, 0.6, 1.6, 5.0, 3.05, code, 9.5);
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Consolas", fontSize: 10, color: C.primary, bold: true, valign: "middle" });
    const rows = [
      [{ text: "字段", options: hdr }, { text: "防什么", options: hdr }],
      [{ text: "runAsNonRoot", options: mkF(0) }, { text: "容器逃逸、root 权限滥用", options: celA }],
      [{ text: "readOnlyRootFilesystem", options: mkF(1) }, { text: "恶意文件写入（卷仍可写）", options: celB }],
      [{ text: "capabilities.drop ALL", options: mkF(0) }, { text: "危险内核能力（SYS_ADMIN 等）", options: celA }],
      [{ text: "allowPrivilegeEscalation: false", options: mkF(1) }, { text: "禁止子进程提权", options: celB }],
    ];
    s.addTable(rows, {
      x: 5.8, y: 1.6, w: 3.6, colW: [2.05, 1.55],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.5, fontFace: "Microsoft YaHei"
    });
    s.addText("先建立基线：容器默认不安全 → 用 SecurityContext 显式降权；第 12 章讲 PSA 如何强制它（“自觉 vs 强制”）", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
