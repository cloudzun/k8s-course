// slide-21.js — 分隔页 1.5
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 21, title: "容器编排器对比" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "1.5", "容器编排器对比：为什么是 Kubernetes", [
      "Docker Swarm / Apache Mesos / Kubernetes 三强对比",
      "Kubernetes 胜出的四大核心理由"
    ]);
  }
};
