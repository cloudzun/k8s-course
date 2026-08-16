// slide-09.js — 分隔页 19.3 考试技巧
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 9, title: "考试技巧" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "19.3", "考试技巧", [
      "时间管理：先易后难 · 每题限时 7 分钟 · 留 15 分钟复查",
      "kubectl 效率：dry-run 生成 yaml · jsonpath · tmux 分屏",
      "上下文切换：每题的“第一动作”，切完立即验证"
    ]);
  }
};
