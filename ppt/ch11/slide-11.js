// slide-11.js — 11.3.1 RBAC 三要素 与 Group 绑定机制
const { C, sectionTitle, card, bigCallout, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "cards", index: 11, title: "RBAC 三要素与 Group" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "RBAC 三要素（CKA 必考）");
    bigCallout(s, "Subject（谁）＋ Role / ClusterRole（权限）＋ Binding（关联）＝ 授权", 1.15, 0.55);
    // 三要素卡片
    card(s, 0.6, 1.9, 2.75, 1.15, C.primary);
    s.addText("① Subject（谁）\nUser / SA / Group\n——授权对象", {
      x: 0.8, y: 1.98, w: 2.4, h: 1.0, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    card(s, 3.55, 1.9, 2.75, 1.15, C.accent);
    s.addText("② Role / ClusterRole（权限）\nrules 列表：能对哪些资源\n做什么操作", {
      x: 3.75, y: 1.98, w: 2.4, h: 1.0, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    card(s, 6.5, 1.9, 2.75, 1.15, C.secondary);
    s.addText("③ Binding（关联）\n把谁和什么权限绑一起\n生效范围由绑定方式决定", {
      x: 6.7, y: 1.98, w: 2.4, h: 1.0, fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0, lineSpacingMultiple: 1.1
    });
    // Group 绑定机制
    s.addText("Group（组）绑定机制：Subject 不只是单个 User/SA——组可以整体授权，管理成本大幅下降", {
      x: 0.6, y: 3.2, w: 8.8, h: 0.35, fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.primary, margin: 0
    });
    codeBlock(s, 0.6, 3.6, 8.8, 1.05,
`① 来源：证书 O（Organization）字段 = 组名（CN=train, O=devs → train 属于 devs 组）；OIDC 的 groups claim = 组
② 绑定：kubectl create clusterrolebinding devs-readonly --clusterrole=view --group=devs（组内所有用户生效）
③ 内置特殊组：system:masters（超级管理员）· system:serviceaccounts:<ns>（该 ns 全部 SA）· system:authenticated（所有已认证用户）`, 10.5);
    s.addText("认知：给“组”授权是生产惯例（人进人出只改 SSO 组成员，不改 K8s 绑定）；system:masters 是最高权限组（第 3 章 super-admin.conf 的 O 字段就是它）。", {
      x: 0.6, y: 4.85, w: 8.8, h: 0.55, fontSize: 11.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
