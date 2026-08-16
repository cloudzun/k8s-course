// slide-03.js — 分隔页 12.1 准入控制：第三道门
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "准入控制：第三道门" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "12.1", "准入控制：第三道门", [
      "认证、授权之后、写入 etcd 之前——资源落地前的最后一道闸",
      "Mutating 补默认值 · Validating 拒绝请求",
      "LimitRange / ResourceQuota / PSA 都靠这一关执行",
      "第 7 章“自动填 requests”“Forbidden 拒绝”都来自这里",
    ]);
  }
};
