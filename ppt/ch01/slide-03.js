// slide-03.js — 分隔页 1.1
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 3, title: "容器技术原理" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "1.1", "容器技术原理", [
      "从虚拟机到容器：为什么容器更快更轻",
      "命名空间（Namespaces）：隔离“看得见”",
      "cgroups：限制“能用多少”",
      "镜像分层（Layer）与 OCI 标准"
    ]);
  }
};
