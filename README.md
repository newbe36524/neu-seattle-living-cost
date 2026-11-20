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
  components/          # CostTable 与 components/pages/ 下的页面内容
  pages/[...lang]/     # index / costs / about 的路由;默认语言在根路径,其余在 /<语言>/
  styles/global.css    # 基础样式(含深色模式)
.github/workflows/deploy.yml   # 推送 main 后自动发布 Pages
```

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321/neu-seattle-living-cost/
npm run build    # 类型检查 + 构建到 dist/
npm run i18n:check   # 多语言审计(@hagicode/hagi18n),CI 里在构建前运行
```

## 填写数据

数据是 YAML,在 `src/data/` 下:

- `categories.yaml` 是成本项定义(与某个人无关),需要新项目或新分类时在这里加。
- `profiles/*.yaml` 是提供者的记录,**一位提供者一个文件**。新增一位同学 = 在 `profiles/` 新增一个 `.yaml`
  (可复制 `author-downtown.yaml` 当模板,文件头有字段说明);没给出的项目不写,页面自动显示「待补充」。
- 提供者只给出合计时,用一条记录覆盖多个 `items`(合并项),金额只计一次。
- 参考价格推算的数字写 `basis: estimate`,页面会标「估算」并与实报分开统计。
- 字段写错、引用不存在的项目、重复记录、基准语言缺文案都会让 `npm run build` 失败,并指出文件与原因。

## 多语言

站点提供 HagiLight 支持的全部 10 种语言:`zh-CN`(默认,不带前缀)、`zh-Hant`、`en-US`、`ja-JP`、`ko-KR`、
`de-DE`、`fr-FR`、`es-ES`、`pt-BR`、`ru-RU`,页面在 `/<语言>/` 下,例如 `/en-US/costs/`。

- 文案只在 `src/locales/<语言>/*.yml`,按 `文件名.键路径` 取用(如 `common.nav.home`)。**简体中文是基准语言**。
- `hagi18n.yaml` 配置 [`@hagicode/hagi18n`](https://www.npmjs.com/package/@hagicode/hagi18n):`npm run i18n:check`
  审计缺文件、缺键、多余键、占位符 `{{x}}` 不一致,以及与基准完全相同(疑似漏译)的值;刻意相同的值列在 `auditIdenticalAllowlist`。
- 新增文案:先写 `zh-CN`,运行 `npm run i18n:sync` 预演、`npm run i18n:sync -- --write` 把新键补到其他语言,再逐个翻译。
- 新增成本项/分类/提供者:数据 YAML 只放 id、周期与金额;名称、说明和备注写在各语言的 `data.yml`
  (`items.<id>.label|hint`、`categories.<id>.title|description`、`profiles.<id>.contributor|area|summary|notes`)。
  备注的键是该条记录 `items` 里的第一个项目 id;估算记录不写备注时显示通用的估算说明。
- 金额一律以美元、`en-US` 格式显示,不随语言变化。
- 新增语言:在 `src/i18n/index.ts` 与 `astro.config.mjs` 的语言清单里各加一项,并建立 `src/locales/<语言>/` 三个文件。

## 发布

在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**,之后每次推送到 `main` 都会自动部署。
