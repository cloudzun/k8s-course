// slide-10.js — 19.3.2 kubectl 效率技巧（dry-run / jsonpath）
const { C, sectionTitle, codeBlock, card } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 10, title: "kubectl 效率技巧" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "kubectl 效率技巧（核心）");
    s.addText("dry-run 生成 yaml 骨架再修改——比手写快且不易错，是考试最省时的技巧", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.32,
      fontSize: 13, fontFace: "Microsoft YaHei", color: C.textDark, margin: 0
    });
    s.addText("① dry-run 生成骨架 → 改 → apply", {
      x: 0.6, y: 1.46, w: 8.8, h: 0.26,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    codeBlock(s, 0.6, 1.74, 8.8, 1.52,
      "kubectl create deployment web --image=nginx --dry-run=client -o yaml > web.yaml\n" +
      "kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml\n" +
      "kubectl create job myjob --image=busybox --dry-run=client -o yaml > job.yaml\n" +
      "kubectl apply -f web.yaml                     # 改完应用",
      11);
    s.addText("② 写 yaml 查字段 / jsonpath 提取（CKA 常考 1-2 题）", {
      x: 0.6, y: 3.4, w: 8.8, h: 0.26,
      fontSize: 11.5, fontFace: "Microsoft YaHei", bold: true, color: C.accent, margin: 0
    });
    codeBlock(s, 0.6, 3.68, 8.8, 1.3,
      "kubectl explain pod.spec.containers.livenessProbe   # 无外网时的唯一字典\n" +
      "kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type==\"InternalIP\")].address}'\n" +
      "kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName",
      11);
    card(s, 0.6, 5.12, 8.8, 0.42, C.accentWarm);
    s.addText("别名与补全：alias k=kubectl · kubectl get pods -o wide · tmux 分屏（Ctrl+B 后 % 左右 / \" 上下——左屏敲命令、右屏看 yaml）", {
      x: 0.86, y: 5.12, w: 8.3, h: 0.42,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textDark, valign: "middle", margin: 0
    });
  }
};
