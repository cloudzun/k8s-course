// slide-42.js — 分隔页 2.9
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 42, title: "沙盒演练" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "2.9", "【沙盒演练】Killercoda：零成本接触真实集群", [
      "浏览器打开免费沙盒，1 分钟拿到现成集群",
      "五个演练：看组件 / describe / 建 Pod / 自愈 / Service+scale"
    ]);
  }
};
