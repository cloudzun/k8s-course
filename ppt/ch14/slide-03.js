// slide-03.js — 分隔页 14.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "运维思维：从“命令”到“流程”" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "14.1", "运维思维：从“命令”到“流程”", [
      "本章定位：从“会敲命令”升级为“懂流程”——维护窗口、升级、备份都是流程",
      "集群运维围绕四大对象：节点 / 控制面 / 数据 / 版本",
      "运维铁律：先备份再动集群、先演练再上生产"
    ]);
  }
};
