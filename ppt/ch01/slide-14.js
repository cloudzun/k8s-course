// slide-14.js — 1.2.2 常用命令速查（代码块）
const { C, sectionTitle, codeBlock, calloutBar } = require("./common");
module.exports = {
  slideConfig: { type: "code", index: 14, title: "常用命令速查" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "常用命令速查");
    const code = [
      "docker build -t myapp:v1 .        # 构建镜像",
      "docker images                     # 查看本地镜像",
      "docker pull nginx:latest          # 拉取镜像",
      "docker run -d -p 8080:80 nginx    # 运行容器（后台、端口映射）",
      "docker exec -it <容器> /bin/bash  # 进入容器",
      "docker logs <容器>                # 查看日志",
      "docker rm -f <容器>               # 删除容器",
      "docker rmi <镜像>                 # 删除镜像",
    ].join("\n");
    codeBlock(s, 0.6, 1.3, 8.8, 3.4, code, 13);
    calloutBar(s, "与 Kubernetes 的衔接：K8s 用 containerd（OCI 兼容）替代 Docker，但镜像构建、仓库、分层机制完全一致。", 5.0);
  }
};
