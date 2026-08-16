// slide-08.js — 分隔页 14.3
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 8, title: "集群升级：完整流程" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "14.3", "集群升级：完整流程", [
      "升级前先做三件事：备份 etcd / 版本窗口 / 兼容性说明",
      "顺序铁律：kubeadm → 控制面 → worker 逐台（容量只少一台）",
      "失败回滚靠 etcd 快照；版本兼容窗口 ±1 次版本（不能跳版本）",
      "Addons 升级是容易漏的一环"
    ]);
  }
};
