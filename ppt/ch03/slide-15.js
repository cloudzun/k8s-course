// slide-15.js — 3.5 kubeadm init 七步
const { C, sectionTitle } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 15, title: "kubeadm init 七步" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "控制面初始化：kubeadm init 在做什么", C.bgLight);
    s.addText("一条 kubeadm init，背后是七个步骤——每一步对应第 2 章的一个知识点", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const steps = [
      "① 预检：swap / 内核模块 / CRI socket / 端口——按提示逐项修复（kubeadm 明确报缺什么）",
      "② 生成 PKI 证书：CA + 组件证书——组件互信基础（§2.6.3 在此落地，默认 1 年有效期）",
      "③ 生成 kubeconfig：admin.conf——kubectl 访问集群的凭证",
      "④ 生成静态 Pod 清单：/etc/kubernetes/manifests/——kubelet 直接拉起整个控制面（§2.5.1）",
      "⑤ kubelet 拉起控制面：等待 apiserver 健康（wait-control-plane）",
      "⑥ 部署附加组件：kube-proxy / coredns + 控制面污点",
      "⑦ 输出 join 命令：token + CA hash——worker 的“入场券”",
    ];
    steps.forEach((st, i) => {
      const y = 1.55 + i * 0.52;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.46, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.06, h: 0.46, fill: { color: C.primary } });
      s.addText(st, {
        x: 0.9, y, w: 8.2, h: 0.46,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("读图要点：证书（②）与静态 Pod 清单（④）是承上启下的两步——证书保证组件互信；静态 Pod 清单让 kubelet 直接拉起整个控制面；最后输出的 join 命令是 worker 的“入场券”", {
      x: 0.6, y: 5.2, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
