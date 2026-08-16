// slide-03.js — 分隔页 11.1 安全模型总览：三道门
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "安全模型总览：三道门" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "11.1", "安全模型总览：三道门", [
      "apiserver 安全部分展开为三道门：认证 → 授权 → 准入控制",
      "每道门各有独立拒绝出口：401 Unauthorized / 403 Forbidden / 拒绝",
      "“能登录但不让操作”= 第一道门过了、第二道门没过",
      "本章讲前两道门；第 12 章讲第三道门（准入控制）"
    ]);
  }
};
