# AGENTS.md

覃宇的中文技术博客。Hugo Extended + Anatole。线上站点：[www.qinyu.info](https://www.qinyu.info)。

本文件是所有 coding agent 的单一事实源。Claude Code 通过 `CLAUDE.md` 的 `@AGENTS.md` 导入它。只写 agent 读仓库读不出来的约定。多步流程或只对某一类任务有用的内容，抽成 skill，不堆在这里。

目标篇幅约 100 行、不超过 200 行。删一条不会让 agent 再犯错的，就删。

## 工作方式

源自 [Karpathy 对 LLM 编码失误的观察](https://x.com/karpathy/status/2015883857489522876) 与 [Boris Cherny / Anthropic 的 CLAUDE.md 实践](https://code.claude.com/docs/en/claude-md)。琐碎改动（错字、改一个日期）按判断跳过，不必走完全套。

**Think first.** 有多种合理解读时先摆出来，不要默选。假设会影响范围或上线结果就说出来；说不清就停下来问。有更简单的做法就提出来。

**Simplicity.** 用最小改动解决当前请求。不为假想的未来加抽象、配置或扩展点。

**Surgical.** 只改任务需要的行。顺手重构、重排格式、删别人的死代码都不做；发现了就在回复里提一声。自己改出来的残留（未引用图片、失效链接）清掉。

**Verified loop.** 先把成功标准写成可检查的结果，再动手；声称完成前跑检查。本仓库没有测试套件，构建即检查：

```bash
hugo --minify
```

退出码 0 才算构建通过。这条命令不含草稿，和 GitHub Pages 生产构建一致。预览草稿用 `hugo server -D`。

改完后若用户纠正了做法：在文末「Learnings」追加一条具体规则（「做 X」而不是「注意 Y」），让下次会话不再犯。已有规则覆盖了就收紧那一行，不要再加一条同义句。

## 这个站点

- 规范域名是 `https://www.qinyu.info`。`config/_default/config.yml` 里的 `baseURL` 仍是 `https://qinyu.github.io`，GitHub Pages 会 301 过去。不要「修正」`baseURL`，除非用户明确要求。
- 推到 `main` 会触发 `.github/workflows/gh-pages.yml`，构建并发布到线上。用户没说 push，就停在本地。
- 文章写在 `content/post/<kebab-topic>/index.md`，图片和文章放在同一目录。站点级页面在 `content/` 根下（`about.md`、`books.md`、`courses.md`、`wechat.md`）。
- `themes/anatole` 是 git submodule。改内容和 `config/`；用户没要求更新主题，就不要动主题目录，也不要换主题。Anatole 的 RSS 用站点里的 `layouts/_default/rss.xml` 覆盖（Hugo 0.158+ 去掉了 `.Site.Author`）。
- `content/temp/` 已被 gitignore，也在 `config.yml` 的 `ignoreFiles` 里排除，是抓取/草稿暂存，不是站点内容。
- 生产构建忽略 `draft: true`。没说「发布」，就保持草稿。架构编年史三篇和 Wardley Maps 第 7 章目前都是草稿。

## 文章约定

新建：

```bash
hugo new post/<kebab-topic>/index.md
```

原型文件只有 title/date/draft。补全下面这些字段后再写正文。

文章用 YAML frontmatter（`---`）。已有的 about/books/courses 是 TOML（`+++`）：改哪篇就跟哪篇。作者写 `覃宇`。

已有 series，沿用不要自造：

- `LangChain`
- `Wardley Maps Book`
- `软件架构编年史`

目录 kebab-case。专有名词 tag 大写（`LangChain`、`Wardley Maps`），普通词小写（`翻译`、`效率`）。

原创帖：第一人称中文；开头「太长不读」摘要；摘要后放 `<!--more-->`。翻译帖：标题带 `（译）`，跟同系列已有章节的中英混排方式。内链用 `{{< ref "post/topic-name" >}}`。配图用 `{{< figure src="file.png" class="medium" >}}`（`small` / `medium` / `large`），不要用会断掉的裸相对路径去站外静态目录。

提交说明跟仓库历史走，写清为什么，例如 `add wechat page`、`fix Wardley Maps chapter 7 translation`。用户没要求 commit，就不要 commit。

## 发一篇文章

1. 看最近两三篇同类文章（原创看 LangChain，翻译看 Wardley Maps），对齐 frontmatter、摘要和 shortcode。
2. 用 `hugo new` 建 bundle，或在已有草稿上改。
3. `draft` 与用户意图一致：没说发布就 `true`。
4. 跑 `hugo --minify`，退出码 0。

完成：构建通过，且草稿开关、series、作者、图片路径都对得上现有文章。

## Learnings

纠错日志。只记录真实发生过的失误。

- 要改视觉时留在当前主题上改 CSS / 配置，不要换 Hugo 主题。
- 浅色模式正文用接近黑的颜色（中性 800 以上），不要用灰字配米色底。
