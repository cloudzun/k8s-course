// slide-12.js — 12.3.1/12.3.2 默认风险与关键字段
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 12, title: "默认风险与关键字段" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "SecurityContext：容器加固（12.3.1 / 12.3.2）", C.bgLight);
    s.addText("默认风险：容器内 whoami 是 root（实验 09 Lab 7 实测）——容器内 root 与宿主机共享内核权限，容器被攻破 = 拿到宿主机 root 级别能力（有逃逸风险）。", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.6,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    codeBlock(s, 0.6, 1.85, 8.8, 2.6, [
      "spec:",
      "  securityContext:                      # Pod 级：对 Pod 内所有容器生效",
      "    runAsNonRoot: true                  # 禁止以 root（UID 0）运行，否则拒绝启动",
      "    runAsUser: 1000                     # 指定运行用户（UID）",
      "    fsGroup: 1000                       # 卷文件的属组",
      "  containers:",
      "  - name: app",
      "    securityContext:                    # 容器级：只对本容器生效",
      "      readOnlyRootFilesystem: true      # 根文件系统只读（防写入恶意文件）",
      "      capabilities:",
      "        drop: [\"ALL\"]                   # 丢弃全部 Linux 能力",
      "        add: [\"NET_BIND_SERVICE\"]       # 按需加回（绑定低端口）",
      "      allowPrivilegeEscalation: false   # 禁止提权（setuid 等）",
    ].join("\n"), 10.5);
    s.addText("（实验 09 Lab 7：非 root 运行 + 只读根文件系统 + drop 能力的实测对比；关键字段逐一说明见下页）", {
      x: 0.6, y: 4.6, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
