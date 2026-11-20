---
name: 西雅图居住成本参考 (NEU Seattle Living Cost)
description: 一本公开的个人账本:东北大学西雅图校区学生的真实居住花费,逐条可追溯。
colors:
  nu-red: "#c8102e"
  nu-red-wash: "#fbecee"
  paper: "#ffffff"
  ink: "#1e2028"
  neutral-muted: "#49494d"
  hairline: "#e0e0e0"
  nu-canvas: "#f6f6f4"
typography:
  display:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Noto Sans CJK SC', sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.3
  headline:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Noto Sans CJK SC', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Noto Sans CJK SC', sans-serif"
    fontSize: "1.17rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Noto Sans CJK SC', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Noto Sans CJK SC', sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1.7
rounded:
  card: "0.75rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
  2xl: "2rem"
  3xl: "3rem"
components:
  site-nav-link:
    textColor: "{colors.slate-muted}"
    typography: "{typography.body}"
  site-nav-link-current:
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.ledger-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1rem 1.25rem"
  table-head-cell:
    textColor: "{colors.slate-muted}"
    typography: "{typography.label}"
    padding: "0.55rem 0.75rem"
  table-cell:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0.55rem 0.75rem"
  pending-value:
    textColor: "{colors.slate-muted}"
---

# Design System: 西雅图居住成本参考

## Overview

**Creative North Star: "学长学姐的账本"**

这是一本摊开的个人账本,不是一个品牌网站。每个数字背后都有一个真实的人、一个时间、一种假设,界面的工作就是让这些东西清楚、对齐、好扫读,然后退后。气质是工具感、精确:表格里的数字右对齐成列(`tabular-nums`),标题只用字重与字号分级,颜色是东北大学品牌的白、Canvas 与 Cool Black 中性色,加上东北大学红。

密度中等偏疏:正文行高 1.7,单列最大宽度 56rem,适合中文长句阅读。层次不靠阴影,而靠细边框(1px `hairline`)与一层极浅的底色(`ledger-card`)。站点只有一套亮色主题(与东北大学官网一致),不跟随系统深色模式。

强调色只有一个:东北大学红(NU Red,`#c8102e`)。它拥有一块明确的区域——整条页头色带——并承担链接、选中态、表头与分组规线、总计双线、底部合计栏顶线;「待补充」这类缺失状态不用红色,而是用弱化的斜体灰,因为缺数据是正常状态而不是警告。

**Key Characteristics:**
- 单一系统字体栈(含 PingFang SC / Noto Sans CJK SC),无 webfont。
- 扁平:无阴影、无渐变;层次靠 1px 细边框与浅底色。动效只服务于「解释」:通勤路线按交通方式用不同节奏走一遍(步行一步一步、公共交通走走停停、开车一气呵成、轮渡缓慢摇晃),其余内容按各自的性格入场(图表与分组稳稳升起、占比条从左铺开、住房图标窗灯逐扇亮起)。评价区(积极/消极/中性)是唯一允许更重的一处:徽章各演各的(积极:竖拇指弹出、抬一下、光环外扩;消极:倒拇指砸落、抖两下;中性:天平摆几下摆正),条目前的小标记自己画一遍,积极条目向上弹起、消极条目从左切入、中性条目慢慢浮现。评价区排在每月合计之后、明细之前,两组并排(窄屏上下堆叠);首屏内也会播放。全部进入视口时只播一次,`prefers-reduced-motion` 下直接是终态。
- 一个强调色,只有亮色主题;页头是整条 NU Red 色带,白字。
- 数字列使用等宽数字(`font-variant-numeric: tabular-nums`)且不换行。
- 缺失数据以斜体弱化文字「待补充」呈现,不使用占位数字。

## Colors

取自东北大学品牌色板(brand.northeastern.edu/color):白、NU Canvas、NU Cool Black 与其中性色阶,加一个东北大学红。只有亮色主题。

### Primary
- **东北大学红 NU Red** (`#c8102e`):唯一强调色。整条页头色带的底色(白字 5.88:1);文字链接(白底 5.88:1,Canvas 底 5.44:1);选中态边框与勾;表头、分组标题、总计的规线;底部合计栏顶线;文字选区、光标、复选框。
- **红色浅底 NU Red Wash** (`#fbecee`):选中的参考数据卡、可点分类卡悬停的底色;墨色文字对比度 14.19:1。

### Neutral
- **纸白 Paper** (`#ffffff`):页面底色。
- **墨色 Ink** (`#1e2028`,NU Cool Black):正文、标题。白底 16.25:1。
- **中性灰 Muted** (`#49494d`,品牌中性 700):次要说明、表头、「待补充」。白底 8.96:1,卡片底 8.28:1。
- **发丝线 Hairline** (`#e0e0e0`,品牌中性 300):页脚分隔线、表格行线、卡片边框。
- **账页底 NU Canvas** (`#f6f6f4`):卡片底色,取代纯白的品牌推荐底色。

### Named Rules
**The Red Region Rule.** 红色拥有页头色带这一块明确区域,并承担「可交互」与「被选中」两种角色(链接、选中、悬停)及结构规线。红色不表示警告、错误或缺失:缺数据不是错误,无效输入用墨色粗下划线加文字说明。

**The Ink Focus Rule.** 键盘焦点环用墨色,在红色色带内改用白色(墨色对 NU Red 只有 2.76:1,不达 3:1)。

## Typography

**Display / Body / Label Font:** `system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Noto Sans CJK SC', sans-serif`

**Character:** 单一系统无衬线字体,中文环境下直接用平台自带字体。层级只靠字号与字重表达,没有第二款字体。

### Hierarchy
- **Display** (700, 2rem,行高 1.3):页面 `h1`,每页一个。字号目前来自浏览器默认,未显式声明。
- **Headline** (700, 1.5rem,行高 1.3):分类标题 `h2`(如「住房」「饮食」)。
- **Title** (700, ≈1.17rem,行高 1.3):卡片标题 `h3`。
- **Body** (400, 1rem,行高 1.7):正文、表格单元格。中文长句行宽受容器 56rem 约束。
- **Label** (600, 0.9rem):表头 `th`;页脚文字为 0.9rem、权重 400。

### Named Rules
**The Tabular Figures Rule.** 金额列必须使用 `tabular-nums` 且 `white-space: nowrap`,保证数字按位对齐、不被换行拆开。

## Layout

单列、居中的阅读式布局:`.container` 最大宽度 56rem,左右留 1rem。页头与页脚是全宽带,内容区(`main`)上下内边距为 2rem / 3rem。首页的分类入口用自适应网格(`repeat(auto-fit, minmax(14rem, 1fr))`,间距 1rem),窄屏自动折成单列。导航在窄屏换行(`flex-wrap`),表格外层 `overflow-x: auto`,窄屏横向滚动而不是压缩。

页脚说明:扫描时工作区里有一项未提交的并行改动,把页脚替换为共享组件 `@hagicode/hagilight/Footer`,并把原免责声明条改名为 `.site-disclaimer`(样式不变)。该共享页脚不属于本站自有视觉系统,本文档不记录其样式。

间距使用 rem 阶梯:0.5 / 0.75 / 1 / 1.25 / 1.5 / 2 / 3。代码里还有两个零散值:表格单元格纵向 `0.55rem`,页头纵向 `0.9rem`,按现状记录。

### Named Rules
**The One Column Rule.** 不新增侧栏或多栏正文;需要对比时,用表格列或网格卡片,而不是并排的文章栏。

## Elevation & Depth

扁平。没有任何阴影、渐变或模糊。层次由两种手段构成:1px `hairline` 细线分隔(页头、页脚、表格行、卡片边框),以及 `ledger-card` 比页面底色深一级的底色。

### Named Rules
**The Flat-By-Default Rule.** 不引入阴影。需要强调某个区域时,改变底色层级或加一条细线,不要抬高它。

## Shapes

大部分元素是直角:表格、导航、分隔线、页头页脚。唯一的圆角是卡片的 `0.75rem`(12px),并带 1px `hairline` 边框。没有胶囊形、没有全圆、没有单边彩色条。

## Components

### Navigation(页头)
- **Style:** 页头底部 1px `hairline`;品牌名左侧(700,墨蓝,无下划线),导航链接右侧,间距 1.25rem。
- **States:** 默认灰蓝 `slate-muted`、无下划线;当前页(`aria-current='page'`)变墨蓝并加粗到 600。当前页没有额外装饰。
- **Mobile:** 容器 `flex-wrap`,品牌与导航在窄屏上下换行。

### Cards / Containers
- **Corner Style:** `0.75rem`
- **Background:** `ledger-card`
- **Shadow Strategy:** 无,见 Elevation。
- **Border:** 1px `hairline`
- **Internal Padding:** `1rem 1.25rem`
- **Variants:** 首页有两类:汇总卡(每月合计)与分类入口卡(整块可点链接,文字色继承、无下划线)。

### Cost Table(成本表格)
- **Signature component.** 每个分类一张表:项目 / 金额 / 周期 / 说明四列。
- **Head:** 表头 `th` 灰蓝、0.9rem、权重 600。
- **Cells:** `0.55rem 0.75rem` 内边距,仅用 1px `hairline` 行线,无竖线、无斑马纹。
- **Amount cell:** 等宽数字、不换行;金额为 `null` 时显示斜体灰蓝「待补充」。
- **Note cell:** 灰蓝弱化文字。
- **Overflow:** 外层 `overflow-x: auto`。

### Charts(图表)
- **Where:** 首页账本里的「每月开销占比」(分类环形图 + 带占比条的图例)与结算区的「年度累计开销」(三个关键数字 + 堆叠面积图);
- **Rule:** 图只是第二种读法——图例、占比与三个数字在没有 JS、图加载失败时仍是完整答案;图例与环、账本行互相高亮。
- **Color:** 分类色阶是 NU Red 与品牌中性色交替(`--cat-0…5`:红、浅红、中性 700、浅中性…),相邻色块靠 2px 白缝与直接标注区分,不靠颜色单独编码。`src/scripts/charts.ts` 里有同一套公式。
- **Honesty:** 年度图只画累计曲线(数据里没有逐月数字);一次性费用假设搬入时付清;`<1%` 代替取整后的 0%;估算项只在用户勾选「计入」时以虚线带出现。
- **Flat:** 无渐变、无阴影、直角提示框(墨色底白字);动效只用于数据变化与进入视口时的一次性入场(见 Key Characteristics),`prefers-reduced-motion` 下关闭。

### Pending Value(待补充)
- 斜体 + `slate-muted`。它是一等状态,不是错误:不使用红色,不加图标。

## Do's and Don'ts

### Do:
- **Do** 保持金额右侧的数字用 `tabular-nums` 并不换行。
- **Do** 用「待补充」表示缺失数据,并保持斜体灰蓝的弱化样式。
- **Do** 为每个新增颜色验证文字对比度 ≥ 4.5:1、控件与焦点 ≥ 3:1。
- **Do** 让红色只承担品牌色带、可交互/选中与结构规线(The Red Region Rule)。
- **Do** 让每个数字旁边在需要时能出现提供者、采集时间与假设(`contributor` / `updated` / `note`)。

### Don't:
- **Don't** 引入阴影、渐变或模糊来制造层次;动效不得循环抢眼,环境动效(轮渡摇晃、路面虚线)只在看得见时运行。
- **Don't** 用估算值、均值或占位数字填充「待补充」。
- **Don't** 用红色表示缺失、错误或警告。
- **Don't** 增加第二款字体或 webfont。
- **Don't** 增加侧栏、多栏正文,或把表格压缩到窄屏不可读。
