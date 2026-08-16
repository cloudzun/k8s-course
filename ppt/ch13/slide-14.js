// slide-14.js — 13.4 kubelet 认证授权
const { C, sectionTitle, card, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 14, title: "kubelet 认证授权" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "kubelet 安全：10250 入口与认证授权");
    codeBlock(s, 0.6, 1.2, 4.3, 2.6, [
      "# /var/lib/kubelet/config.yaml",
      "authentication:",
      "  anonymous:",
      "    enabled: false   # 禁止匿名访问",
      "  webhook:",
      "    enabled: true    # TokenReview 认证",
      "authorization:",
      "  mode: Webhook      # SubjectAccessReview",
    ].join("\n"), 10.5);
    card(s, 5.2, 1.2, 4.2, 2.6, C.primary);
    s.addText("机制解读：全部委托 apiserver", {
      x: 5.45, y: 1.32, w: 3.7, h: 0.35,
      fontSize: 13, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
    });
    const pts = [
      "认证：请求者 token 交给 apiserver 的 TokenReview 验证——kubelet 自己不存用户",
      "授权：能否对 pod/xxx 做 exec 交给 SubjectAccessReview——与集群 RBAC 一套规则",
      "谁连 10250：apiserver 取日志 / 执行命令 / metrics；匿名不禁 = 任何人都能操作节点容器",
    ];
    pts.forEach((p, i) => {
      s.addText((i + 1) + ". " + p, {
        x: 5.45, y: 1.75 + i * 0.66, w: 3.7, h: 0.62,
        fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark,
        valign: "top", lineSpacingMultiple: 1.2, margin: 0
      });
    });
    s.addText("apiserver → kubelet 使用 apiserver-kubelet-client 证书（§13.2.1）——节点侧同样验证对端身份。（实验 09 Lab 9 查看安全配置）", {
      x: 0.6, y: 4.0, w: 8.8, h: 0.4,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, valign: "middle", margin: 0
    });
    calloutBar(s, "一句话：kubelet 的入口与 apiserver 共用同一套身份体系——生产不要改成 anonymous 允许或 AlwaysAllow，那等于节点裸奔。", 4.55);
  }
};
