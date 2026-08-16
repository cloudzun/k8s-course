// slide-07.js — 分隔页 12.2 Pod Security Admission
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 7, title: "PSA：Pod 安全标准的强制执行" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "12.2", "PSA：Pod 安全标准的强制执行", [
      "PSP 已废弃（v1.21 弃用、v1.25 移除）——一律使用 PSA 命名空间标签方式",
      "三个安全级别：privileged（无限制）/ baseline（最小限制）/ restricted（最严格）",
      "三个动作：enforce 强制 · audit 审计 · warn 警告",
      "违规 Pod 创建即被拒绝——安全标准变成命名空间级强制规则",
    ]);
  }
};
