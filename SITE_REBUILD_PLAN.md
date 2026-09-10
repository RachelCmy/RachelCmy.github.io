# 个人主页：进展与待办

最后更新：2026-09-07

这份文档只保留会影响后续维护、内容确认和发布的关键信息。历史上的间距、字号和局部样式微调不再逐项记录。

## 当前状态

- 网站已用 Astro + TypeScript 重建为静态站点，包含主页和 `/team/` People 页面。
- 本地生产构建与内容校验均通过；主页和 People 页面可正常访问。
- 媒体性能优化已进入提交 `e511c66`；本地 `main` 与 `origin/main` 一致，公开站点可以访问。
- GitHub Pages 工作流会在 push 到 `main` 后自动部署；本次只有这份文档整理尚未提交。

## 关键实现

### 内容与结构

- 主页包含 Bio、News、Publications、Preprints、Funding、Service 和 Contact。
- News 按年份切换，默认只展示最新年份；每条记录都有说明链接。
- Funding 展示项目类别、中英文项目题目、负责人角色和时间。
- Service 采用简洁列表；长期技术程序委员会经历合并展示。
- People 页面按 VCL Faculty Collaborators、Frequent Collaborators、VCL Physics Group、Undergraduate Students 排列，共 26 人。

### Publications

- `works.bib` 是标题、作者、venue、年份、月份、DOI 和原始 URL 的主要来源。
- `src/data/publications.yml` 只补充缩略图/视频、短描述、venue 简称、分类及 Project、Paper、Code、Video 等链接。
- 当前共 22 篇：19 篇正式发表论文、3 篇 Preprints；Preprints 可单独导航。
- 排序规则为年份降序，同年按明确的 `date` 或 `month` 降序；没有月份的论文排在该年有明确月份的论文之后。
- 作者主页集中维护在 `src/data/authors.yml`；当前论文均有 Paper 链接和对应媒体。
- 缩略图使用完整画面 `contain`，不会裁剪；视频使用 WebP poster，并在进入视口前不预加载内容。

### 性能与质量

- RainyGS 与 TecoGAN 的大 GIF 已转换为 H.264 MP4；10 张大型论文图已缩放并转换为 WebP。
- 页面引用的媒体总量约由 27.7 MB 降至 5.56 MB；生产目录约由 31.25 MB 降至 6.97 MB。
- 已删除被替换的旧 PNG/JPG/GIF、重复的 PINF 视频及未引用的公开版 `hat.jpg`。
- 自动校验覆盖 BibTeX 映射、重复条目、媒体路径、作者链接、News 链接、People 分组、元数据、GIF 回归和视频预加载策略。
- 最近一次验证：Astro 0 errors / 0 warnings，22 篇论文和 26 位 People 均通过内容检查，两个页面均返回 HTTP 200。

## 尚未完成

### 发布确认

- 尚未在本文档中记录 `e511c66` 对应的 GitHub Actions 最终运行结果。
- 下一次正式发布后仍需做一次线上 smoke test：主页、People 页面、媒体资源、外部链接和社交分享卡片。

### 内容确认

- 22 篇论文中有 13 篇尚未填写自定义 `summary`；可在 `src/data/publications.yml` 中逐篇补充一至两句。
- `works.bib` 中有 13 篇尚无明确 `month` 或 `date`；它们的同年精确先后顺序仍不能完全确定。
- Funding 尚无项目编号；现有英文项目题目是工作版本，若有官方英文名称应替换确认。
- 11 位 People 暂无个人主页链接，当前使用 VCL roster、DBLP 或无链接；其中三位本科生也暂无头像。
- 尚未提供 CV 文件，因此页面没有 CV 下载入口。
- News 内容系统已经完成，但今后的 talk、活动、奖项和新论文仍需持续补充。

## 日常维护入口

| 要更新的内容 | 文件 |
| --- | --- |
| 个人信息、Bio、Research Interests、联系方式 | `src/data/profile.yml` |
| News | `src/data/news.yml` |
| Funding | `src/data/fundings.yml` |
| Service | `src/data/service.yml` |
| People | `src/data/team.yml` |
| 论文书目信息和月份 | `works.bib` |
| 论文描述、媒体和扩展链接 | `src/data/publications.yml` |
| 作者主页 | `src/data/authors.yml` |

新增或修改内容后运行 `pnpm build`。该命令同时执行类型检查、静态构建和内容完整性验证。
