# neu-seattle-living-cost

西雅图居住成本参考,面向东北大学(Northeastern University)西雅图校区的学生。
数据与资料目前来自仓库作者的个人经验,后续可能加入其他同学的资料。

站点使用 [Astro](https://astro.build) 构建,通过 GitHub Pages 发布:
<https://newbe36524.github.io/neu-seattle-living-cost/>

## 结构

```
src/
  data/categories.yaml # 成本项定义(分类、项目、周期),与具体某个人无关
  data/profiles/*.yaml # 每位提供者一个文件:金额记录,只引用项目 id
  data/costs.ts        # 类型、加载与构建期校验(不含数据)
  locales/<语言>/      # 站点文案:common.yml(通用)、pages.yml(页面)、data.yml(成本项与提供者的文字)
  i18n/index.ts        # 运行时加载:语言清单、t()、路径生成
  layouts/             # 页面布局(含语言切换器与 hreflang)
  components/          # 首页账本等组件与 components/pages/ 下的页面内容
  pages/index.astro    # 根路径:HagiLight 默认语言引导页,转到 /en-US/
  pages/[lang]/        # index / costs / about 的路由,每种语言在 /<语言>/ 下
  styles/global.css    # 基础样式(含深色模式)
.github/workflows/deploy.yml   # 推送 main 后自动发布 Pages
```

## 本地开发

```bash
pnpm install
pnpm run dev      # http://localhost:4321/neu-seattle-living-cost/
pnpm run build    # 类型检查 + 构建到 dist/
pnpm run i18n:check   # 多语言审计(@hagicode/hagi18n),CI 里在构建前运行
```

## 填写数据

数据是 YAML,在 `src/data/` 下:

- `categories.yaml` 是成本项定义(与某个人无关),需要新项目或新分类时在这里加。
- `profiles/*.yaml` 是提供者的记录,**一位提供者一个文件**。新增一位同学 = 在 `profiles/` 新增一个 `.yaml`
  (可复制 `author-downtown.yaml` 当模板,文件头有字段说明);没给出的项目不写,页面自动显示「待补充」。
- 提供者只给出合计时,用一条记录覆盖多个 `items`(合并项),金额只计一次。
- 参考价格推算的数字写 `basis: estimate`,页面会标「估算」并与实报分开统计。
- 字段写错、引用不存在的项目、重复记录、基准语言缺文案都会让 `pnpm run build` 失败,并指出文件与原因。

## 投稿(提交我的数据)

首页的「提交我的数据」按钮会跳到 GitHub issue 表单
(`.github/ISSUE_TEMPLATE/submit-data.yml`),表单里每个金额字段对应 `categories.yaml` 的一个成本项。

- 表单由 `scripts/gen-issue-template.mjs` 根据 `categories.yaml` 和 `en-US` 的 `data.yml` 生成,表单只有英文,**不要手改**。
  新增/改名成本项后运行 `pnpm run issue-template` 并提交;CI 里 `pnpm run issue-template -- --check` 会在表单过期时失败。
- 收到带 `data-submission` 标签的 issue 后,维护者核对,再按「填写数据」一节新增 `profiles/<id>.yaml` 和各语言 `data.yml` 的 `profiles.<id>` 文案。
  没填的项目不写;合并项和估算按 issue 里的「备注」「数字来源」处理。
- 首次启用前请在仓库里建一个 `data-submission` 标签(没有的话模板仍可用,只是不会自动打标签)。

## 通勤时间与提供者建议

除了金额,每份提供者记录还可以带几个可选的非金额字段(见 `profiles/*.yaml` 顶部注释):

- `housingType`:住房类型,`apartment`(公寓)/ `studio`(单间)/ `shared`(合租)/ `house`(独栋或联排)/ `dorm`(学生宿舍)。显示为带图标的徽标;名称在各语言 `common.yml` 的 `housing.type.<id>`。新增类型要同时改 `src/data/costs.ts` 的 `HOUSING_TYPES`、`Glyph.astro` 的图标、各语言文案和 `scripts/gen-issue-template.mjs` 的下拉选项。
- `commute`:住处到校园的单程通勤,按行程顺序分段,每段 `{ mode, minutes }`,`mode` 为 `drive`(开车)/ `transit`(公共交通)/ `ferry`(轮渡)/ `walk`(步行);总分钟数由各段相加。页面把它画成「住处 → 各段 → 校园」的路线,每种方式的动效节奏不同。时间也是成本,但不是美元,页面单独显示,**不计入任何美元合计**;没提供时显示「待补充」。
- `advice`:提供者本人的主观建议,每条 `{ kind, id }`,`kind` 为 `positive`(积极)/ `negative`(消极)/ `neutral`(中性);
  标题(一句话概括)和正文写在各语言 `data.yml` 的 `profiles.<id>.advice.<id>.title` / `.text` 下。页面按 积极、消极、中性 的顺序显示,没有建议就不显示这一块。该区域排在首页合计之后、通勤与各分类明细之前,积极与消极两组并排显示(各带数量)。

投稿表单里对应「住房类型」下拉、按通勤方式分开的四个分钟数输入框(步行/公共交通/轮渡/开车,行程顺序写在备注里)和三个「建议」文本框(一行一条),维护者整理时拆成 `advice` 条目。

## 多语言

站点提供 HagiLight 支持的全部 10 种语言:`en-US`(默认显示语言)、`zh-CN`、`zh-Hant`、`ja-JP`、`ko-KR`、
`de-DE`、`fr-FR`、`es-ES`、`pt-BR`、`ru-RU`,页面都在 `/<语言>/` 下,例如 `/en-US/about/`。根路径 `/` 是 HagiLight 的默认语言引导页(`RootTransit`),稍后自动转到 `/en-US/`,并列出其他语言入口。

- 文案只在 `src/locales/<语言>/*.yml`,按 `文件名.键路径` 取用(如 `common.nav.home`)。**简体中文是基准语言**。
- `hagi18n.yaml` 配置 [`@hagicode/hagi18n`](https://www.npmjs.com/package/@hagicode/hagi18n):`pnpm run i18n:check`
  审计缺文件、缺键、多余键、占位符 `{{x}}` 不一致,以及与基准完全相同(疑似漏译)的值;刻意相同的值列在 `auditIdenticalAllowlist`。
- 新增文案:先写 `zh-CN`,运行 `pnpm run i18n:sync` 预演、`pnpm run i18n:sync -- --write` 把新键补到其他语言,再逐个翻译。
- 新增成本项/分类/提供者:数据 YAML 只放 id、周期与金额;名称、说明和备注写在各语言的 `data.yml`
  (`items.<id>.label|hint`、`categories.<id>.title|description`、`profiles.<id>.contributor|area|summary|notes`)。
  备注的键是该条记录 `items` 里的第一个项目 id;估算记录不写备注时显示通用的估算说明。
- 金额一律以美元、`en-US` 格式显示,不随语言变化。
- 新增语言:在 `src/i18n/index.ts` 与 `astro.config.mjs` 的语言清单里各加一项,并建立 `src/locales/<语言>/` 三个文件。

## 发布

在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**,之后每次推送到 `main` 都会自动部署。
