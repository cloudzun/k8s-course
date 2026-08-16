// slide-05.js — 分隔页 10.2
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 5, title: "卷（Volume）" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "10.2", "卷（Volume）：Pod 内的存储抽象", [
      "emptyDir：Pod 内临时共享盘——Pod 删除即清空",
      "hostPath：宿主机目录——数据在节点磁盘，绑定节点",
      "configMap / secret：只读配置卷（第 8 章配置注入）",
      "边界认知：卷都“绑定节点”——单机思维，跨节点要靠集群级抽象"
    ]);
  }
};
