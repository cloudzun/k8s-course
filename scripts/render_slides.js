// render_slides.js — 把 ppt/chXX/slide-NN.js 渲染为 reveal.js 网页课件（HTML）
// 同一套 slide 源码：compile.js → PPTX；本脚本 → HTML 网页课件
// 用法: node scripts/render_slides.js   （本地与 CI 通用，输出到 build/slides/）
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PPT_DIR = path.join(ROOT, "ppt");
const OUT_DIR = path.join(ROOT, "build", "slides");

// ---------- HTML 渲染适配器（pptxgenjs 兼容接口） ----------
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

class HtmlSlide {
  constructor() {
    this.elems = [];
    this.bg = "#FFFFFF";
    this.bgImg = null;
  }
  set background(v) {
    if (typeof v === "string") { this.bg = v; return; }
    if (v && v.color) this.bg = "#" + String(v.color).replace(/^#/, "");
    if (v && v.image) this.bgImg = v.image;
  }
  addText(text, opts = {}) {
    this.elems.push({ type: "text", text, opts });
  }
  addShape(shape, opts = {}) {
    this.elems.push({ type: "shape", shape, opts });
  }
  addTable(rows, opts = {}) {
    this.elems.push({ type: "table", rows, opts });
  }
}

class HtmlPres {
  constructor() {
    this.slides = [];
    this._layout = "16x9";
  }
  set layout(v) { this._layout = v; }
  get layout() { return this._layout; }
  addSlide() {
    const s = new HtmlSlide();
    this.slides.push(s);
    return s;
  }
  writeFile() { /* 由本脚本自行输出 */ }
}

// ---------- 元素 → HTML ----------
const SCALE = 96; // 10in x 5.625in → 960 x 540 px
const W = 960, H = 540;

function cssColor(c) {
  if (!c) return null;
  let s = String(c).replace(/^#/, "");
  if (s.length === 6 || s.length === 3) return "#" + s;
  return c;
}
function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

function shadowCss(sh) {
  if (!sh) return "";
  return `box-shadow:0 ${num(sh.offset) || 2}px ${num(sh.blur) || 6}px rgba(0,0,0,${num(sh.opacity) || 0.08});`;
}

function renderText(el) {
  const o = el.opts;
  const x = num(o.x) * SCALE, y = num(o.y) * SCALE;
  const w = num(o.w) * SCALE, h = num(o.h) * SCALE;
  const size = num(o.fontSize) || 18;
  const color = cssColor(o.color) || "#333333";
  const align = o.align || "left";
  const valign = o.valign || "top";
  const bold = o.bold ? "font-weight:700;" : "";
  const italic = o.italic ? "font-style:italic;" : "";
  const family = o.fontFace || "Microsoft YaHei";
  const spacing = o.lineSpacingMultiple ? `line-height:${num(o.lineSpacingMultiple)};` : "";
  const txt = String(el.text).split("\n").map(escapeHtml).join("<br>");
  let vAlignCss = "";
  if (valign === "middle") vAlignCss = "display:flex;flex-direction:column;justify-content:center;";
  else if (valign === "bottom") vAlignCss = "display:flex;flex-direction:column;justify-content:flex-end;";
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:hidden;text-align:${align};font-size:${size}pt;font-family:'${family}',sans-serif;color:${color};${bold}${italic}${spacing}${vAlignCss}">${txt}</div>`;
}

function renderShape(el) {
  const o = el.opts;
  const x = num(o.x) * SCALE, y = num(o.y) * SCALE;
  const w = num(o.w) * SCALE, h = num(o.h) * SCALE;
  const fill = (o.fill && o.fill.color) ? `background:${cssColor(o.fill.color)};` : "";
  const radius = el.shape === "ellipse" ? "border-radius:50%;" : "";
  let border = "";
  if (o.line && o.line.color) {
    const bw = num(o.line.width) || 1;
    border = `border:${bw}pt solid ${cssColor(o.line.color)};`;
  }
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${fill}${radius}${border}${shadowCss(o.shadow)}"></div>`;
}

function renderTable(el) {
  const o = el.opts;
  const x = num(o.x) * SCALE, y = num(o.y) * SCALE;
  const w = num(o.w) * SCALE;
  const colW = (o.colW || []).map((c) => num(c) * SCALE);
  const rowH = num(o.rowH) * SCALE || 36;
  const borderColor = o.border && o.border.color ? cssColor(o.border.color) : "#D5DBDB";
  let html = `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;">`;
  html += `<table style="border-collapse:collapse;width:100%;font-family:'Microsoft YaHei',sans-serif;">`;
  el.rows.forEach((row, ri) => {
    html += "<tr>";
    row.forEach((cell, ci) => {
      const co = cell.options || {};
      const cw = colW[ci] ? `width:${colW[ci]}px;` : "";
      const fill = co.fill && co.fill.color ? `background:${cssColor(co.fill.color)};` : "";
      const size = num(co.fontSize) || 12;
      const color = cssColor(co.color) || "#333333";
      const bold = co.bold ? "font-weight:700;" : "";
      const al = co.align || "left";
      const va = co.valign || "middle";
      const vCss = va === "middle" ? "vertical-align:middle;" : "";
      const pad = "padding:3px 8px;";
      html += `<td style="border:0.5pt solid ${borderColor};${cw}${fill}${pad}font-size:${size}pt;color:${color};${bold}text-align:${al};${vCss}">${escapeHtml(cell.text)}</td>`;
    });
    html += "</tr>";
  });
  html += "</table></div>";
  return html;
}

function renderSlide(slide) {
  let html = "";
  for (const el of slide.elems) {
    if (el.type === "text") html += renderText(el);
    else if (el.type === "shape") html += renderShape(el);
    else if (el.type === "table") html += renderTable(el);
  }
  const bg = cssColor(slide.bg) || "#FFFFFF";
  return `<section><div style="position:relative;width:${W}px;height:${H}px;background:${bg};overflow:hidden;">${html}</div></section>`;
}

// ---------- 页面骨架 ----------
function buildHtml(title, slidesHtml) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="../assets/reveal/reveal.css">
<link rel="stylesheet" href="../assets/reveal/white.css">
<style>
  /* K8s 课程课件样式 */
  .reveal { font-family: "Microsoft YaHei", "PingFang SC", sans-serif; }
  .reveal section { top: 0 !important; }
  .reveal .slide-number { font-size: 14px; }
  .reveal .controls, .reveal .progress { color: #326CE5; }
  ::selection { background: #326CE5; color: #fff; }
</style>
</head>
<body>
<div class="reveal"><div class="slides">
${slidesHtml}
</div></div>
<script src="../assets/reveal/reveal.js"></script>
<script>
  Reveal.initialize({
    width: ${W}, height: ${H},
    hash: true, controls: true, progress: true,
    slideNumber: true, center: false, transition: "slide",
    keyboard: true, overview: true
  });
</script>
</body>
</html>
`;
}

function buildWrapperMd(chapter, title) {
  return `# ${title}（网页课件）

> 本页为课件网页版（reveal.js 播放，← → 翻页，F 全屏，O 总览）。同一源码的 PPTX 版见课程仓库 \`ppt/ch${String(chapter).padStart(2, "0")}/\`。

<iframe src="ch${String(chapter).padStart(2, "0")}.html" style="width:100%;height:600px;border:1px solid #d5dbdb;border-radius:4px;" allowfullscreen></iframe>
`;
}

// ---------- 主流程 ----------
const CHAPTERS = [
  [1, "第 1 章 容器与云原生基础"], [2, "第 2 章 Kubernetes 概述与架构"],
  [3, "第 3 章 集群安装与配置"], [4, "第 4 章 Pod 与容器"],
  [5, "第 5 章 工作负载控制器"], [6, "第 6 章 调度与 Pod 放置"],
  [7, "第 7 章 自动扩缩与资源治理"], [8, "第 8 章 配置管理"],
  [9, "第 9 章 服务、负载均衡与网络"], [10, "第 10 章 存储"],
  [11, "第 11 章 认证与授权"], [12, "第 12 章 准入与容器安全"],
  [13, "第 13 章 集群安全加固"], [14, "第 14 章 集群维护与运维"],
  [15, "第 15 章 可观测性"], [16, "第 16 章 故障排查与可靠性"],
  [17, "第 17 章 Helm 与 Kustomize"], [18, "第 18 章 综合实战"],
  [19, "第 19 章 CKA 考试指南"],
];

fs.mkdirSync(OUT_DIR, { recursive: true });
let total = 0;
for (const [ch, title] of CHAPTERS) {
  const dir = path.join(PPT_DIR, "ch" + String(ch).padStart(2, "0"));
  const files = fs.readdirSync(dir).filter((f) => /^slide-\d+\.js$/.test(f)).sort();
  if (files.length === 0) { console.log(`跳过 ch${ch}（无 slide 文件）`); continue; }
  const pres = new HtmlPres();
  for (const f of files) {
    const mod = require(path.join(dir, f));
    if (typeof mod.createSlide === "function") mod.createSlide(pres);
  }
  const slidesHtml = pres.slides.map(renderSlide).join("\n");
  const html = buildHtml(title, slidesHtml);
  fs.writeFileSync(path.join(OUT_DIR, `ch${String(ch).padStart(2, "0")}.html`), html, "utf-8");
  fs.writeFileSync(path.join(OUT_DIR, `ch${String(ch).padStart(2, "0")}.md`), buildWrapperMd(ch, title), "utf-8");
  total += pres.slides.length;
  console.log(`ch${String(ch).padStart(2, "0")}: ${pres.slides.length} 页 → ch${String(ch).padStart(2, "0")}.html`);
}
console.log(`✅ 网页课件渲染完成：${CHAPTERS.length} 章共 ${total} 页 → ${OUT_DIR}`);
