// slide-14.js — 3.4 kubeadm 安装流程三阶段
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "diagram", index: 14, title: "kubeadm 安装流程总览" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "kubeadm 安装流程总览：一条流水线");
    const stages = [
      { t: "阶段一：准备\n（每台节点）", b: "系统参数（swap/内核/主机名）→ 容器运行时（containerd）→ kubeadm / kubelet / kubectl 三件套", c1: "E8F4FD", c2: "4A90D9" },
      { t: "阶段二：控制面\n（master 一台）", b: "kubeadm init → 生成证书与配置 → 拉起控制面静态 Pod → 配好 kubectl（输出 join 命令）", c1: "FFF3E0", c2: "E08A3C" },
      { t: "阶段三：加入与联网\n（worker 每台 + 控制面）", b: "kubeadm join（token + CA 校验）→ 装 CNI 网络插件 → 全部节点 Ready → 验收", c1: "E8F8E8", c2: "5BA85B" },
    ];
    stages.forEach((st, i) => {
      const x = 0.6 + i * 3.05;
      s.addShape("rect", { x, y: 1.4, w: 2.8, h: 2.0, fill: { color: st.c1 }, line: { color: st.c2, width: 1 } });
      s.addText(st.t, {
        x: x + 0.12, y: 1.52, w: 2.56, h: 0.55,
        fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: st.c2, valign: "middle", margin: 0
      });
      s.addText(st.b, {
        x: x + 0.12, y: 2.12, w: 2.56, h: 1.2,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.15
      });
      if (i < 2) {
        s.addText("→", { x: x + 2.83, y: 2.15, w: 0.18, h: 0.4, fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.accent, align: "center", margin: 0 });
      }
    });
    s.addText("为什么是这个顺序", {
      x: 0.6, y: 3.7, w: 4.0, h: 0.35,
      fontSize: 15, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const whys = [
      "先备好运行时，控制面才能被“跑起来”——apiserver 等控制面组件本身也是容器",
      "先初始化控制面，才有 apiserver 可供 worker 注册",
      "先加入 worker，最后装 CNI——CNI 是集群级组件，装一次管所有节点",
      "装完 CNI，所有节点才真正 Ready（对应 §3.8 验证第一层）",
    ];
    whys.forEach((t, i) => {
      const y = 4.1 + i * 0.35;
      s.addShape("ellipse", { x: 0.7, y: y + 0.06, w: 0.14, h: 0.14, fill: { color: C.accent } });
      s.addText(t, {
        x: 0.95, y, w: 8.4, h: 0.33,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
