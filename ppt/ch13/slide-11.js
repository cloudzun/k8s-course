// slide-11.js — 13.3.2 静态加密：机制与配置
const { C, sectionTitle, card, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 11, title: "静态加密机制与配置" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "静态加密：机制与配置（数据线核心）");
    s.addText("问题：etcd 里存的 Secret 默认是明文——base64 只是格式（第 8 章）！落盘即密文是目标：", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.3,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    codeBlock(s, 0.6, 1.5, 4.5, 3.5, [
      "apiVersion: apiserver.config.k8s.io/v1",
      "kind: EncryptionConfiguration",
      "resources:",
      "- resources: [\"secrets\"]",
      "  providers:",
      "  - aescbc:",
      "      keys:",
      "      - name: key1",
      "        secret: <32字节随机密钥>",
      "  - identity: {}   # 兜底：解密旧数据",
    ].join("\n"), 9.5);
    card(s, 5.3, 1.5, 4.1, 3.5, C.accent);
    s.addText("机制要点", {
      x: 5.55, y: 1.62, w: 3.6, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const pts = [
      "apiserver 写数据前加密、读数据时解密——落盘即密文",
      "启用：--encryption-provider-config 参数（改 manifest，静态 Pod 自动重启）",
      "provider 顺序 = 加密优先级：aescbc 加密写入，identity 兜底解密存量明文（必须放最后）",
      "只对新写入的数据加密；旧数据下次更新时加密（最终一致）",
    ];
    pts.forEach((p, i) => {
      s.addText((i + 1) + ". " + p, {
        x: 5.55, y: 2.05 + i * 0.72, w: 3.6, h: 0.68,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
        valign: "top", lineSpacingMultiple: 1.2, margin: 0
      });
    });
    s.addText("（实验 09 Lab 9）完整实操：enc.yaml → 改 apiserver manifest → 容器内 etcdctl 验证加密前缀。", {
      x: 0.6, y: 5.15, w: 8.8, h: 0.35,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
