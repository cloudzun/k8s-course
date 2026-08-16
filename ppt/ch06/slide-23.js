// slide-23.js — 本章小结
const { C, sectionTitle, numBadge } = require("./common");
module.exports = {
  slideConfig: { type: "summary", index: 23, title: "本章小结" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgWhite };
    sectionTitle(s, "本章小结");
    const items = [
      "调度本质：新 Pod（Pending）→ 调度器两阶段（过滤硬条件 + 打分选最优）→ 写 nodeName → kubelet 拉起；调度器可替换（schedulerName），Descheduler 补“运行期再平衡”",
      "过滤项：资源 / 亲和 / 污点容忍 / 端口等（一票否决）；打分项：资源均衡 / Pod 分散 / 软偏好（择优录取）",
      "节点选择：nodeSelector（等值 =）→ nodeAffinity（表达式 + 软硬约束）——要“或 / 非 / 软偏好”用亲和；nodeName 仅调试",
      "Pod 亲和：topologyKey 定义“同一处”（hostname = 同节点、zone = 同可用区）；反亲和分散副本保高可用——副本数 ≤ 拓扑域数",
      "污点 / 容忍：节点主动拒（NoSchedule 挡新 / NoExecute 连旧一起驱逐，tolerationSeconds 延迟驱逐）；内置污点解释“控制面不跑业务”与“DaemonSet 上控制面”",
      "维护三步曲：cordon（挡新）→ drain（驱逐，走优雅终止）→ uncordon（恢复）",
      "PDB：只保护“主动驱逐”的副本数（ALLOWED = 可用数 − minAvailable）——核心服务必配",
      "三层设计：副本数（第 5 章）+ 落点约束（本章）+ 运行期保护（PDB / 探针）",
    ];
    items.forEach((g, i) => {
      const y = 1.12 + i * 0.49;
      numBadge(s, 0.7, y + 0.02, i + 1);
      s.addText(g, {
        x: 1.35, y, w: 8.0, h: 0.46,
        fontSize: 11.5, fontFace: "Microsoft YaHei",
        color: C.textDark, valign: "middle", margin: 0, lineSpacingMultiple: 1.05
      });
    });
    s.addText("衔接：第 7 章讲“资源不够了怎么办”——扩缩容（HPA）与资源治理（requests / limits 体系、LimitRange、ResourceQuota）；调度器过滤里的“资源”就是第 7 章的主角", {
      x: 0.6, y: 5.15, w: 8.8, h: 0.4,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0, lineSpacingMultiple: 1.1
    });
  }
};
