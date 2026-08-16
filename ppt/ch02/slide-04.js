// slide-04.js — 2.1.1 定义与来历（四卡片）
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 4, title: "定义与来历" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "定义与来历", C.bgLight);
    const items = [
      { t: "Kubernetes（K8s）", d: "开源的容器编排平台——自动化容器的部署、扩缩容、调度、网络、存储与自愈", strip: C.primary },
      { t: "名字与出身", d: "希腊语“舵手”；K8s = K + 8 字母 + s\n源自 Google 内部集群系统 Borg——“开源版 Borg”", strip: C.secondary },
      { t: "CNCF 毕业项目", d: "2015 年捐赠 CNCF\n2018 年首个毕业项目（Graduated）", strip: C.accent },
      { t: "事实标准", d: "AWS(EKS) / Azure(AKS) / GCP(GKE)\n阿里云(ACK) / 华为云(CCE) 全部托管", strip: C.accentWarm },
    ];
    items.forEach((it, i) => {
      const x = 0.6 + (i % 2) * 4.55;
      const y = 1.4 + Math.floor(i / 2) * 1.85;
      card(s, x, y, 4.3, 1.65, it.strip);
      s.addText(it.t, {
        x: x + 0.2, y: y + 0.12, w: 3.9, h: 0.45,
        fontSize: 16, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(it.d, {
        x: x + 0.2, y: y + 0.62, w: 3.9, h: 0.95,
        fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.3, margin: 0, valign: "top"
      });
    });
  }
};
