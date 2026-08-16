// slide-12.js — 13.3.2 静态加密：验证与密钥管理
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 12, title: "静态加密验证与密钥管理" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "静态加密：验证与密钥管理", C.bgLight);
    s.addText("验证思路：创建新 Secret 后，读 etcd 原始数据应看到 k8s:enc:aescbc:v1:key1: 前缀（密文）；而 kubectl get secret 仍正常返回明文——对应用透明。", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.6,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", lineSpacingMultiple: 1.25, margin: 0
    });
    codeBlock(s, 0.6, 1.85, 8.8, 2.05, [
      "kubectl -n kube-system exec etcd-node1 -- etcdctl \\",
      "  --endpoints=https://127.0.0.1:2379 \\",
      "  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\",
      "  --cert=/etc/kubernetes/pki/etcd/server.crt \\",
      "  --key=/etc/kubernetes/pki/etcd/server.key \\",
      "  get /registry/secrets/<ns>/<name>",
      "# 输出以 k8s:enc:aescbc:v1:key1: 开头（密文）→ 加密生效",
    ].join("\n"), 9.5);
    // 两张小卡
    card(s, 0.6, 4.1, 4.3, 1.25, C.accentWarm);
    s.addText("为什么 etcdctl 要进容器执行", {
      x: 0.85, y: 4.22, w: 3.8, h: 0.32,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("kubeadm 宿主机不带 etcdctl；etcd 静态 Pod 走 hostNetwork，容器内 127.0.0.1 即宿主 etcd（实验 09 Lab 9 实测修正）", {
      x: 0.85, y: 4.56, w: 3.8, h: 0.7,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", lineSpacingMultiple: 1.2, margin: 0
    });
    card(s, 5.1, 4.1, 4.3, 1.25, C.accent);
    s.addText("密钥管理", {
      x: 5.35, y: 4.22, w: 3.8, h: 0.32,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    s.addText("密钥泄露 = 数据可解——生产用 KMS（云厂商密钥服务）托管密钥，让加密密钥与密文分离存储、可轮换", {
      x: 5.35, y: 4.56, w: 3.8, h: 0.7,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "top", lineSpacingMultiple: 1.2, margin: 0
    });
  }
};
