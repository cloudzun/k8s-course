// slide-17.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 17, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "本章小结", C.bgLight);
    const items = [
      "准入控制（第三道门）：认证授权之后、写入 etcd 之前——Mutating 改请求（补默认值）、Validating 拒请求；LimitRange / ResourceQuota / PSA 都靠它",
      "PSA：三个级别（privileged / baseline / restricted）+ 三个动作（enforce / audit / warn）+ 命名空间标签实施——baseline 是生产默认，渐进式落地（warn → enforce）",
      "SecurityContext：runAsNonRoot / runAsUser（非 root）、readOnlyRootFilesystem（只读根）、capabilities drop / add（最小能力）、Pod 级 vs 容器级",
      "自觉 vs 强制：SecurityContext 是声明、PSA 是执行——PSA 定红线、SC 落实细节；restricted 要求的正是 SC 那套字段",
      "镜像安全：imagePullSecrets（私有仓库凭据，命名空间级）、最小镜像、签名（概念）",
      "衔接第 13 章：集群级安全（证书体系 / etcd 加密 / kubelet 安全）——从“Pod 安不安全”上升到“集群信任链安不安全”",
    ];
    items.forEach((g, i) => {
      const y = 1.2 + i * 0.52;
      numBadge(s, 0.7, y + 0.03, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.46,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0
      });
    });
  }
};
