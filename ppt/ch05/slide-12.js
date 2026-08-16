// slide-12.js — 分隔页 5.3 StatefulSet
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 12, title: "StatefulSet" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "5.3", "StatefulSet：有状态应用的正确打开方式", [
      "有状态三难题：身份要稳定 / 存储要固定 / 启动要有序",
      "稳定命名 web-0/1/2 + headless Service → 稳定 DNS 名",
      "volumeClaimTemplates：每副本独立 PVC，数据与身份绑定",
      "有序部署/缩容/更新；podManagementPolicy 可并行加速"
    ]);
  }
};
