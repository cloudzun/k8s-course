// slide-04.js — 8.1 配置写死的三个痛点与两个答案
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "content", index: 4, title: "配置外部化的痛点与原则" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "为什么需要“配置外部化”");
    s.addText("第 4 章的 env / command 把配置写死在容器里——本章把配置从镜像 / yaml 中“抽”出来统一管理", {
      x: 0.6, y: 1.05, w: 8.8, h: 0.3,
      fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    const pains = [
      { t: "① 镜像不可变被破坏", d: "镜像一旦构建就不该改；改配置就得重新构建镜像、重新发布" },
      { t: "② 多环境无法复用", d: "dev / test / prod 的数据库地址、日志级别不同；写死一份只能服务一个环境" },
      { t: "③ 敏感信息暴露", d: "密码写进 yaml → 进 Git → 泄密；写进镜像 → 所有拉取镜像的人都能看到" },
    ];
    pains.forEach((p, i) => {
      const x = 0.6 + i * 3.02;
      card(s, x, 1.45, 2.76, 1.7, i === 2 ? C.accentWarm : C.primary);
      s.addText(p.t, {
        x: x + 0.2, y: 1.57, w: 2.4, h: 0.4,
        fontSize: 12.5, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
      });
      s.addText(p.d, {
        x: x + 0.2, y: 2.05, w: 2.4, h: 1.0,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
      });
    });
    s.addText("K8s 的答案：两个专用对象（机制几乎一样，唯一的本质区别是数据的敏感程度）", {
      x: 0.6, y: 3.32, w: 8.8, h: 0.3,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    card(s, 0.6, 3.7, 4.3, 0.78, C.primary);
    s.addText("ConfigMap", {
      x: 0.85, y: 3.78, w: 1.7, h: 0.6,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.primary, valign: "middle", margin: 0
    });
    s.addText("非敏感配置：连接串、开关、日志级别", {
      x: 2.6, y: 3.78, w: 2.15, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    card(s, 5.1, 3.7, 4.3, 0.78, C.accentWarm);
    s.addText("Secret", {
      x: 5.35, y: 3.78, w: 1.7, h: 0.6,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.accentWarm, valign: "middle", margin: 0
    });
    s.addText("敏感配置：密码、Token、证书", {
      x: 7.1, y: 3.78, w: 2.15, h: 0.6,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
    s.addText("十二要素（12-Factor）核心：配置与代码分离——同一份镜像，通过注入不同的配置运行在不同环境", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.4,
      fontSize: 11.5, fontFace: "Microsoft YaHei", italic: true, color: C.textMid, margin: 0
    });
  }
};
