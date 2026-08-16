// slide-10.js — 分隔页 3.3 容器运行时
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 10, title: "容器运行时：为什么是 containerd" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "3.3", "容器运行时：为什么是 containerd，而不是 Docker", [
      "运行时 = 被 kubelet 通过 CRI 驱动的容器引擎（gRPC 协议）",
      "历史纠葛：v1.24 移除 dockershim——containerd 直接实现 CRI",
      "CRI-O / Kata / gVisor 各有适用场景",
      "SystemdCgroup：containerd 与 kubelet 的 cgroup 驱动必须对齐"
    ]);
  }
};
