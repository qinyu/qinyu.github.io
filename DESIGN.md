---
version: alpha
name: qinyu.info Mars
description: >-
  Dark Mars-plate blog UI on Anatole. Ochre sand accent on void black;
  NASA half-disk background with continuous breath/parallax.
colors:
  primary: "#c4945a"
  secondary: "#a27642"
  tertiary: "#daac70"
  neutral: "#000000"
  void: "#000000"
  sand: "#c4945a"
  sand-bright: "#daac70"
  sand-deep: "#a27642"
  line: "#8a6430"
  contrast-dark: "#1a1610"
  text-white: "#ffffff"
  text-heading: "#f3efe6"
  text-body: "#e8e4dc"
  text-secondary: "#e4ded3"
  text-subtle: "#ddd8ce"
  text-quote: "#cfc8bc"
  text-muted: "#8a8478"
  text-dim: "#5c574f"
  code-bg: "#282828"
  code-fg: "#ebdbb2"
typography:
  body:
    fontFamily: Anatole theme default
    fontSize: 1rem
  heading:
    fontFamily: Anatole theme default
    fontSize: 2.1rem
  sidebar-title:
    fontFamily: Anatole theme default
    fontSize: 1.4rem
  meta:
    fontFamily: Anatole theme default
    fontSize: 1.2rem
  tag:
    fontFamily: Anatole theme default
    fontSize: 1.2rem
rounded:
  sm: 2px
  pill: 999px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
components:
  canvas:
    backgroundColor: "{colors.void}"
    textColor: "{colors.text-body}"
  heading:
    textColor: "{colors.text-heading}"
    typography: "{typography.heading}"
  body-text:
    textColor: "{colors.text-body}"
    typography: "{typography.body}"
  meta:
    textColor: "{colors.text-muted}"
    typography: "{typography.meta}"
  quote:
    textColor: "{colors.text-quote}"
  divider:
    backgroundColor: "{colors.line}"
  link:
    textColor: "{colors.sand}"
  link-hover:
    textColor: "{colors.sand-bright}"
  link-visited:
    textColor: "#c4945a"
  nav-active:
    textColor: "{colors.sand}"
  scrollbar:
    backgroundColor: "{colors.sand-deep}"
  tag-chip:
    textColor: "{colors.text-white}"
    backgroundColor: "transparent"
    rounded: "{rounded.pill}"
  tag-chip-active:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.void}"
  code-block:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-fg}"
    rounded: "{rounded.sm}"
---

## Overview

覃宇技术博客的视觉身份：**深空黑底 + 火星赭石（sand）强调色**，全幅 NASA 半火星盘作氛围底图。UI 叠在 Anatole 主题之上，自定义只进 `assets/css/custom.css` 与 `assets/js/parallax.js`，不改 `themes/anatole`。

实现里的 CSS 变量（`--color-*` / `--sand` / `--bg-*`）是运行时真相；本文件是给 agent 的稳定摘要。改色或组件外观时：先改 CSS，再同步这里的 token。

## Colors

- **void / neutral (`#000000`)：** 画布与面板底，不铺米色/浅色阅读底。
- **sand (`#c4945a`)：** 唯一主强调——链接、激活态、边框点缀。`:visited` 必须同时写字面 hex `#c4945a`（Chrome 对 `var()` 的 visited 会回落成默认蓝）。
- **sand-bright / sand-deep：** hover 与压深，不另开第二套强调色。
- **line (`#8a6430`)：** 分隔线；比 sand 暗，在 veil 与火星底上都可读。
- **text-\*：** 深色模式下的中性字阶；正文用 `text-body` 及以上亮度，避免灰字配浅底。
- **code-\*：** Gruvbox 代码块，与正文 sand 体系分开。

禁止默认成「紫渐变白底」「奶油底 + 衬线大字 + 陶土色」或报纸细线多栏风。

## Typography

字体族跟 Anatole 默认走，本站不另引展示字体。字号以 `custom.css` 为准（侧栏名约 `1.4rem`，文题约 `2.1rem`，标签/图注约 `1.2rem`）。中文第一人称正文，链接与强调用 sand，不用高饱和多色。

## Layout

- 桌面：侧栏 + 主栏；版权钉在侧栏底部。
- 内容页配图 **左对齐**，不居中。`figure` 宽度档：`tiny`（微信码）/ `small` / `medium` / `large`。
- 火星底：cover + overflow，不用 contain。横屏 poster 约 `115%` 宽；竖屏左锚，手机竖屏用 `--bg-shift-x` 把盘体更靠左。
- 球心（图内 %）：竖屏约 `6.65% / 46.06%`，横屏约 `3.16% / 50.02%`；裁切后视口 X 可能 `< 0`。竖屏 scale origin 跟球心；横屏 scale origin 留在 **板心**。

## Elevation & Depth

无多层卡片阴影堆叠。深度来自：全幅火星图、左侧暗化 veil 渐变、少量 `ochre-wash`。书架/系列封面可用轻微 glow，但不要通用大阴影卡片墙。

## Shapes

默认少圆角。代码块 `2px`；标签 chip 用 pill（`999px`）。不把二维码中心图标拉成正方形——保原始宽高比。

## Components

- **链接：** sand → sand-bright hover；visited 用字面 `#c4945a`。
- **标签：** 文章页只留顶部一组；白字、sand 边框（与侧栏一致），不要文末再挂一排。
- **系列卡：** 状态文案来自 `data/series.yaml`（`翻译完结` / `翻译中`）。
- **火星呼吸 / 视差（`parallax.js`）：** 顶静止 `1.04±0.04`（约 `1.00–1.08`）；滚动中与页底停下仍叠加正弦；仅下拉回弹暂停。改 origin/球心时不改这组包络。

## Do's and Don'ts

**Do**

- 改视觉只动 `assets/css/custom.css`（必要时 `parallax.js`），并同步本文件 token。
- 深色字阶保持高对比；强调色只用 sand 家族。
- 配图左对齐；微信码用 `tiny`。

**Don't**

- 不要换 Hugo 主题或编辑 `themes/anatole`。
- 不要用滚出门控或页底 headroom=0 掐掉呼吸。
- 不要把系列落地页铺进首页「最近更新」卡片流（整批上线只发一篇说明入口）。
