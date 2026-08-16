// slide-11.js — 9.3 集群 DNS：名字解析
const { C, sectionTitle, card, codeBlock, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 11, title: "集群 DNS：名字解析" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "集群 DNS：名字解析", C.bgLight);
    card(s, 0.6, 1.3, 8.8, 0.9, C.primary);
    s.addText("coredns 的角色：集群内每个 Pod 的 /etc/resolv.conf 指向 coredns（kube-system 里的 Deployment）——应用用 Service 名访问，DNS 解析成 ClusterIP。", {
      x: 0.9, y: 1.4, w: 8.2, h: 0.7,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    s.addText("解析规则（从简写到完整）：", {
      x: 0.6, y: 2.35, w: 4.0, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    codeBlock(s, 0.6, 2.7, 8.8, 1.5, [
      "<svc名>                              → 当前命名空间的 Service（简写）",
      "<svc名>.<命名空间>                    → 指定命名空间",
      "<svc名>.<命名空间>.svc                → 完整形式（FQDN，svc 是固定段）",
      "<svc名>.<命名空间>.svc.cluster.local  → 带集群域（默认 cluster.local）",
    ].join("\n"), 11);
    warnBar(s, "易错点：命名空间作用域——Pod 里写 mysql 只解析“当前命名空间”的 mysql；跨命名空间必须写 mysql.<命名空间>.svc。", 4.35);
    s.addText("排障视角：kubectl exec -it <pod> -- nslookup <svc>.<ns>.svc 返回 IP = DNS 正常；解析失败先查：Service 存在吗（名字 / 命名空间对了吗）→ coredns 正常吗（实验 07 Lab 4 完整流程）", {
      x: 0.6, y: 4.95, w: 8.8, h: 0.5,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
  }
};
