// slide-17.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 17, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "信任链三线：证书（通信可信）/ 静态加密（落盘安全）/ kubelet 安全（节点入口）",
      "证书体系：ca.key 最宝贵；过期 = 集群瘫痪；check-expiration / renew 例行化（kubeconfig 需手动重生成）",
      "etcd 静态加密：aescbc 写 + identity 兜底读存量；验证看 k8s:enc:aescbc:v1:key1:；生产密钥用 KMS",
      "kubelet 安全：anonymous 禁用 + 认证授权全 Webhook 委托——与集群一套身份体系",
      "Secret 三道保护：RBAC + 静态加密 + 最小权限——纵深防御",
      "全景：网络隔离 → RBAC → 静态加密 → 审计（机制在本章，流程在第 14 章运维）",
    ];
    items.forEach((g, i) => {
      const y = 1.25 + i * 0.56;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.5,
        fontSize: 12, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
    s.addText("实验 09 Lab 9（本章核心实操）：kubeadm certs check-expiration / renew + etcd 静态加密完整实操（enc.yaml → manifest → etcdctl 验证）+ kubelet 安全配置查看。", {
      x: 0.6, y: 4.8, w: 8.8, h: 0.5,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, valign: "middle", margin: 0
    });
  }
};
