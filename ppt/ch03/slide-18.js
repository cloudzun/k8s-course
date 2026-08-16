// slide-18.js — 3.6 worker 加入机制
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 18, title: "token 机制与 TLS bootstrap" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "工作节点加入：token 机制与 TLS bootstrap", C.bgLight);
    s.addText("worker 加入不是“复制个文件”，而是一个带安全校验的引导流程", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const steps = [
      { t: "token（入场券）", d: "init 时生成的一次性口令（默认 24 小时有效）——worker 凭它向 apiserver 证明“我是被邀请加入的”" },
      { t: "CA hash（防中间人）", d: "join 命令带 --discovery-token-ca-cert-hash（apiserver 证书指纹）——worker 用它校验对方真的是我们的 apiserver，防止假 apiserver 骗取证书；token 与 CA hash 二者缺一不可" },
      { t: "TLS bootstrap（证书交换）", d: "worker 用 token 向 apiserver 申请自己的客户端证书，CA 签发（§2.6.3 双向 TLS）——之后 kubelet 就用这张证书通信，不再用 token" },
      { t: "join 后为什么 NotReady", d: "节点已注册进集群但还没有网络插件——kubelet 一直检查“网络是否就绪”（CNI 是否装好）；装完 CNI 自动变 Ready（正常中间态）" },
    ];
    steps.forEach((st, i) => {
      const y = 1.55 + i * 0.62;
      card(s, 0.6, y, 8.8, 0.55, i === 3 ? C.accentWarm : C.primary);
      s.addText(st.t, {
        x: 0.9, y, w: 2.6, h: 0.55,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, valign: "middle", margin: 0
      });
      s.addText(st.d, {
        x: 3.6, y, w: 5.6, h: 0.55,
        fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("token 过期怎么办：在控制面节点执行 kubeadm token create --print-join-command 重新生成 join 命令即可——token 只是引导凭证，丢了/过期不影响已加入的节点", {
      x: 0.6, y: 4.35, w: 8.8, h: 0.4,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    s.addText("这个现象也印证第 2 章“节点 Ready 依赖 kubelet + 网络就绪”", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.35,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
