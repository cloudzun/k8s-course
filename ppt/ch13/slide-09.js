// slide-09.js — 分隔页 13.3
const { divider } = require("./common");
module.exports = {
  slideConfig: { type: "divider", index: 9, title: "etcd 安全" },
  createSlide(pres) {
    const s = pres.addSlide();
    divider(s, "13.3", "etcd 安全", [
      "通信层面：全链路 TLS（2379 / 2380）——没有明文",
      "落盘层面：静态加密（EncryptionConfiguration）——Secret 默认明文是问题",
      "备份层面：快照含明文 Secret——当敏感数据对待"
    ]);
  }
};
