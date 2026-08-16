// slide-41.js — 2.8.2 kubeconfig
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 41, title: "kubeconfig 与上下文" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "kubeconfig 与上下文", C.bgLight);
    const code = [
      "clusters:      # 集群：连哪个 apiserver（地址 + CA 证书）",
      "- cluster:",
      "    server: https://192.168.0.114:6443",
      "    certificate-authority-data: <CA base64>",
      "  name: kubernetes",
      "users:         # 用户：用什么身份（客户端证书 / token）",
      "- name: kubernetes-admin",
      "  user:",
      "    client-certificate-data: <证书 base64>",
      "    client-key-data: <私钥 base64>",
      "contexts:      # 上下文：集群 + 用户 + 命名空间的组合",
      "- context:",
      "    cluster: kubernetes",
      "    user: kubernetes-admin",
      "    namespace: default",
      "  name: kubernetes-admin@kubernetes",
      "current-context: kubernetes-admin@kubernetes",
    ].join("\n");
    codeBlock(s, 0.6, 1.3, 5.2, 3.9, code, 10);
    s.addText("多集群 / 多身份切换（CKA 高频）：", {
      x: 6.1, y: 1.4, w: 3.3, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const cmds = [
      "kubectl config get-contexts",
      "   # 查看所有上下文（* 标记当前）",
      "kubectl config use-context <名>",
      "   # 切换上下文",
      "kubectl config current-context",
      "   # 看当前上下文",
    ].join("\n");
    codeBlock(s, 6.1, 1.8, 3.3, 2.0, cmds, 9.5);
    s.addText("生产上可能有“开发/生产集群、只读/管理员账号”——靠上下文切换，而不是反复改文件", {
      x: 6.1, y: 4.0, w: 3.3, h: 1.1,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark,
      lineSpacingMultiple: 1.35, margin: 0, valign: "top"
    });
  }
};
