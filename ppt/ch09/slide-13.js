// slide-13.js — 9.4.1-9.4.2 Ingress 原理：对象 + 控制器
const { C, sectionTitle, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 13, title: "Ingress 原理：对象 + 控制器" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "Ingress 原理：对象 + 控制器");
    s.addText("NodePort / LoadBalancer 是四层（IP+端口）：每个服务都要开一个端口（端口资源有限、管理混乱）；没有“按域名 / 路径路由”能力（两个域名共用 80 端口做不到）。Ingress = 七层（HTTP/HTTPS）入口。", {
      x: 0.6, y: 1.12, w: 8.8, h: 0.75,
      fontSize: 12, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    const steps = [
      "① Ingress 对象：声明路由规则——哪个域名 / 路径 → 哪个 Service",
      "② 控制器（ingress-nginx，实验 07 安装）Watch 它",
      "③ 控制器生成 nginx 配置（server_name / location 规则）并加载",
      "④ 外部流量 → ingress-nginx（NodePort / LoadBalancer）→ 按规则路由",
    ];
    steps.forEach((st, i) => {
      const y = 2.0 + i * 0.62;
      s.addShape("rect", { x: 0.6, y, w: 8.8, h: 0.52, fill: { color: i % 2 ? C.bgWhite : C.bgCard } });
      s.addShape("rect", { x: 0.6, y, w: 0.06, h: 0.52, fill: { color: C.primary } });
      s.addText(st, {
        x: 0.85, y, w: 8.3, h: 0.52,
        fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
      });
    });
    calloutBar(s, "关键认知：Ingress 对象本身不做转发——它只是“规则声明”；真正转发的是 Ingress 控制器。没有控制器，Ingress 对象是死的。", 4.75);
  }
};
