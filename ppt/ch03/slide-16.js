// slide-16.js — 3.5 关键参数与失败排查
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 16, title: "关键参数与失败排查" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "关键参数与初始化失败排查");
    s.addText("关键参数及决策逻辑", {
      x: 0.6, y: 1.18, w: 4.5, h: 0.32,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const params = [
      { k: "--pod-network-cidr", v: "声明 Pod 网段（§3.2.3）——必须与 CNI 配置一致，不一致 → Pod 拿不到 IP" },
      { k: "--apiserver-advertise-address", v: "apiserver 对外宣告地址——用节点内网 IP（填公网 IP 会导致内网通信问题）" },
      { k: "--image-repository", v: "控制面镜像从哪拉（默认 registry.k8s.io）——国内环境第一个变通点（§3.9）" },
      { k: "--cri-socket", v: "指定容器运行时 socket——多运行时并存时显式指定更稳" },
    ];
    params.forEach((p, i) => {
      const y = 1.58 + i * 0.88;
      card(s, 0.6, y, 4.55, 0.8, C.primary);
      s.addText(p.k, {
        x: 0.85, y: y + 0.05, w: 4.1, h: 0.3,
        fontSize: 11.5, fontFace: "Consolas", bold: true, color: C.primary, margin: 0
      });
      s.addText(p.v, {
        x: 0.85, y: y + 0.36, w: 4.1, h: 0.4,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
      });
    });
    s.addText("初始化失败排查思路", {
      x: 5.4, y: 1.18, w: 4.0, h: 0.32,
      fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    const fixes = [
      { t: "卡在 wait-control-plane", d: "看 kubelet 日志找“第一个错误”——十有八九是镜像拉不下来（控制面镜像或 pause 沙箱镜像，§3.9）" },
      { t: "预检报错", d: "按提示逐项修复（swap / 内核 / 端口）——报错信息永远指向下一步（第 16 章展开）" },
      { t: "失败不要急着 kubeadm reset", d: "很多失败（如 pause 镜像）修复环境后重试 kubelet 即可恢复——reset 会清掉已生成的证书和配置，等于从头再来" },
    ];
    fixes.forEach((f, i) => {
      const y = 1.58 + i * 0.98;
      card(s, 5.4, y, 4.0, 0.9, C.accentWarm);
      s.addText(f.t, {
        x: 5.65, y: y + 0.05, w: 3.5, h: 0.3,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, margin: 0
      });
      s.addText(f.d, {
        x: 5.65, y: y + 0.36, w: 3.5, h: 0.5,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.05
      });
    });
  }
};
