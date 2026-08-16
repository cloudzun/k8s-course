// slide-11.js — 10.3.4 生命周期 + 10.3.5 静态 vs 动态
const { C, sectionTitle, card } = require("./common");
module.exports = {
  slideConfig: { type: "process", index: 11, title: "生命周期与两种供应方式" },
  createSlide(pres) {
    const s = pres.addSlide();
    s.background = { color: C.bgLight };
    sectionTitle(s, "生命周期 · 静态 vs 动态", C.bgLight);
    // 四阶段流程
    const steps = [
      { t: "① Provision 供应", d: "管理员建 PV / 动态供应自动建", fill: "E8F0FE", line: "326CE5" },
      { t: "② Bind 绑定", d: "PVC 匹配 PV → 状态 Bound", fill: "FFF3E0", line: "E08A3C" },
      { t: "③ Use 使用", d: "Pod 挂载 PVC 写数据", fill: "E8F8E8", line: "5BA85B" },
      { t: "④ Reclaim 回收", d: "PVC 删除 → 按回收策略处理 PV", fill: "E8F4FD", line: "4A90D9" },
    ];
    steps.forEach((st, i) => {
      const x = 0.6 + i * 2.35;
      s.addShape("rect", { x, y: 1.2, w: 2.15, h: 1.05, fill: { color: st.fill }, line: { color: st.line, width: 1 } });
      s.addText(st.t, {
        x: x + 0.1, y: 1.28, w: 1.95, h: 0.35,
        fontSize: 12, fontFace: "Microsoft YaHei", bold: true, color: C.textDark, margin: 0
      });
      s.addText(st.d, {
        x: x + 0.1, y: 1.65, w: 1.95, h: 0.55,
        fontSize: 10, fontFace: "Microsoft YaHei", color: C.textDark,
        lineSpacingMultiple: 1.15, margin: 0
      });
      if (i < 3) {
        s.addText("→", {
          x: x + 2.15, y: 1.45, w: 0.2, h: 0.4,
          fontSize: 14, fontFace: "Microsoft YaHei", bold: true, color: C.secondary,
          align: "center", margin: 0
        });
      }
    });
    // 状态流转 + 排障
    card(s, 0.6, 2.45, 8.8, 1.05, C.secondary);
    s.addText("PV：Available（待绑定）→ Bound（已绑定）→ Released（PVC 删了，Retain 后）→ Available / 删除", {
      x: 0.9, y: 2.52, w: 8.2, h: 0.3,
      fontSize: 10.5, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("PVC：Pending（等待匹配）→ Bound（匹配成功）→ 删除", {
      x: 0.9, y: 2.87, w: 8.2, h: 0.3,
      fontSize: 10.5, fontFace: "Consolas", color: C.textDark, margin: 0
    });
    s.addText("排障：PVC 一直 Pending → kubectl describe 看 Events——检查 PV 是否存在 / 容量 / 访问模式 / SC 是否一致", {
      x: 0.9, y: 3.2, w: 8.2, h: 0.28,
      fontSize: 10.5, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
    // 静态 vs 动态对比表
    const hdr = { bold: true, color: C.textLight, fill: { color: C.primary }, align: "center", valign: "middle", fontFace: "Microsoft YaHei", fontSize: 11 };
    const celA = { fill: { color: C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const celB = { fill: { color: C.bgWhite }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.textDark, valign: "middle" };
    const mkF = (i) => ({ fill: { color: i % 2 ? C.bgWhite : C.bgCard }, fontFace: "Microsoft YaHei", fontSize: 10.5, color: C.primary, bold: true, valign: "middle" });
    s.addTable([
      [{ text: "对比", options: hdr }, { text: "静态绑定", options: hdr }, { text: "动态供应", options: hdr }],
      [{ text: "谁建 PV", options: mkF(0) }, { text: "管理员手动建", options: celA }, { text: "StorageClass 自动建", options: celB }],
      [{ text: "适用", options: mkF(1) }, { text: "存储资源固定 / 要精细控制", options: celB }, { text: "大量 PVC、云环境自动扩", options: celA }],
      [{ text: "成本", options: mkF(0) }, { text: "每个 PV 都要手工", options: celA }, { text: "声明即用", options: celB }],
    ], {
      fontFace: "Microsoft YaHei", x: 0.6, y: 3.75, w: 8.8, colW: [1.4, 3.7, 3.7],
      border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.34
    });
    s.addText("（实验 08 Lab 3 手动建 PV + PVC 静态绑定；Lab 4 动态供应——亲手对比两种方式）", {
      x: 0.6, y: 5.2, w: 8.8, h: 0.3,
      fontSize: 11, fontFace: "Microsoft YaHei", color: C.textMid, margin: 0
    });
  }
};
