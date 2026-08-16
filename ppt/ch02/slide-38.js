// slide-38.js — 2.7.4 Deployment 完整示例
const { C, sectionTitle, codeBlock } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 38, title: "Deployment 完整示例" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "完整示例：Deployment 对象逐字段", C.bgLight);
    const code = [
      "apiVersion: apps/v1              # 定位：apps 组的 v1 版本",
      "kind: Deployment                 # 类型：Deployment",
      "metadata:                        # 身份",
      "  name: web                      # 名称（default ns 内唯一）",
      "  namespace: default             # 命名空间",
      "  labels:                        # 本对象自己的标签",
      "    app: web",
      "spec:                            # 期望状态（用户写）",
      "  replicas: 3                    # 期望副本数 → 控制循环维护",
      "  selector:                      # 选择器：管哪些 Pod",
      "    matchLabels:",
      "      app: web",
      "  template:                      # Pod 模板：描述“要的 Pod 长什么样”",
      "    metadata:",
      "      labels:",
      "        app: web                 # Pod 标签（必须匹配 selector）",
      "    spec:",
      "      containers:",
      "      - name: nginx",
      "        image: nginx:1.27        # 镜像",
      "        ports:",
      "        - containerPort: 80",
      "# status 由系统填：availableReplicas、conditions 等",
    ].join("\n");
    codeBlock(s, 0.6, 1.3, 8.8, 3.9, code, 10.5);
    s.addText("这四层结构（apiVersion / kind / metadata / spec）是所有对象的统一骨架——学会看一个，就会看所有", {
      x: 0.6, y: 5.3, w: 8.8, h: 0.35,
      fontSize: 12.5, fontFace: "Microsoft YaHei", color: C.primary, bold: true, align: "center", margin: 0
    });
  }
};
