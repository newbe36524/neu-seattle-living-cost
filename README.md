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
  layouts/             # 页面布局
  components/          # CostTable 等组件
  pages/               # index / costs / about
  styles/global.css    # 基础样式(含深色模式)
.github/workflows/deploy.yml   # 推送 main 后自动发布 Pages
```

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321/neu-seattle-living-cost/
npm run build    # 类型检查 + 构建到 dist/
```

## 填写数据

数据是 YAML,在 `src/data/` 下:

- `categories.yaml` 是成本项定义(与某个人无关),需要新项目或新分类时在这里加。
- `profiles/*.yaml` 是提供者的记录,**一位提供者一个文件**。新增一位同学 = 在 `profiles/` 新增一个 `.yaml`
  (可复制 `author-downtown.yaml` 当模板,文件头有字段说明);没给出的项目不写,页面自动显示「待补充」。
- 提供者只给出合计时,用一条记录覆盖多个 `items`(合并项),金额只计一次。
- 参考价格推算的数字写 `basis: estimate`,页面会标「估算」并与实报分开统计。
- 字段写错、引用不存在的项目、重复记录都会让 `npm run build` 失败,并指出文件与原因。

## 发布

在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**,之后每次推送到 `main` 都会自动部署。
