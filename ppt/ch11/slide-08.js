// slide-08.js — 11.2.3 X.509 证书认证机制 与 11.2.5 kubeconfig 多身份
const { C, sectionTitle, numBadge, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "steps", index: 8, title: "X.509 证书认证机制" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "X.509 证书认证的机制（实验 09 Lab 1）");
    const steps = [
      "管理员用 CA 签发用户证书：openssl 生成密钥 → 用 ca.key 签发；证书 CN = 用户名（CN=train → 用户 train），O = 用户组",
      "kubeconfig 里配置三段：cluster（apiserver 地址 + CA）+ user（客户端证书）+ context",
      "请求时：kubectl 出示客户端证书 → apiserver 用 CA 校验签名 → 通过",
      "认证结果：用户名 = 证书 CN（如 train），进入授权环节",
    ];
    steps.forEach((t, i) => {
      const y = 1.25 + i * 0.62;
      numBadge(s, 0.7, y + 0.03, i + 1, C.primary);
      s.addText(t, {
        x: 1.35, y, w: 8.1, h: 0.55,
        fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("kubeconfig 多身份：一个 kubeconfig 可装多个 cluster/user/context，用 context 切换身份——“同一台机器上管理员与普通用户身份并存”（实验 09 Lab 1/2 亲手建了多个 context）", {
      x: 0.6, y: 3.85, w: 8.8, h: 0.35, fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 0.6, 4.25, 8.8, 0.75,
`kubectl config get-contexts                       # 列出（* 当前）
kubectl config use-context train@kubernetes       # 切到 train 身份`, 11);
    calloutBar(s, "核心认知：“签发证书”就是“创建用户”——集群没有用户注册表，信任链就是 CA 签名；证书泄露 = 身份泄露（私钥要保管好）。", 5.1);
  }
};
