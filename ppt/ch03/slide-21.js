// slide-21.js — 分隔页 3.8-3.11 验证、国内变通、维护与实验
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 21, title: "验证、国内变通、维护与实验" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "3.8-3.11", "验证、国内变通、维护与实验", [
      "验证四层：节点 Ready / 组件 Running / 跨节点调度 / 镜像拉取",
      "国内镜像：换仓库 / 本地注入 pause / 加速站——先测再配",
      "维护起点：etcd 备份是装完集群的第一件事（CKA 必考）",
      "实验指引：实验 01 手动安装 + 实验 12 集群维护 + 附录 A-F"
    ]);
  }
};
