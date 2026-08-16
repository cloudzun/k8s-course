// slide-15.js — 7.4.3 第三层：ResourceQuota
const { C, sectionTitle, codeBlock, warnBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 15, title: "ResourceQuota 第三层防线" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "第三层：ResourceQuota（约束命名空间总量）", C.bgLight);
    s.addText("约束整个命名空间的累计用量——所有 Pod 的 requests/limits 加起来不能超过配额；超配额 → 新对象创建被拒；资源释放后自动恢复；还能配额对象数量（pods/services/pvc 等）防无限膨胀。", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.55,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, lineSpacingMultiple: 1.25, valign: "top", margin: 0
    });
    codeBlock(s, 0.6, 1.82, 4.35, 2.3, `# 命名空间 dev 的 ResourceQuota：
requests.cpu: 10 核
requests.memory: 20Gi
limits.cpu: 20 核
limits.memory: 40Gi
pods: 100    services: 50
pvc: 20`, 10.5);
    codeBlock(s, 5.05, 1.82, 4.35, 2.3, `# 超过配额 → 创建被拒
kubectl -n dev apply -f new-pod.yaml
Error from server (Forbidden):
exceeded quota: dev-quota,
requested: requests.cpu=500m,
used: requests.cpu=9.7,
limited: requests.cpu=10`, 10.5);
    warnBar(s, "排障关联（CKA 域 5）：创建 Pod 报 exceeded quota → 看报错里的 Used / Hard——报错直说超了哪个配额，删除占用后自动恢复。", 4.5);
  }
};
