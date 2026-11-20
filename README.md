# neu-seattle-living-cost

西雅图居住成本参考,面向东北大学(Northeastern University)西雅图校区的学生。
数据与资料目前来自仓库作者的个人经验,后续可能加入其他同学的资料。

站点使用 [Astro](https://astro.build) 构建,通过 GitHub Pages 发布:
<https://newbe36524.github.io/neu-seattle-living-cost/>

## 结构

```
src/
  data/costs.ts        # 唯一的数据入口:分类、项目、金额(null = 待补充)
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

编辑 `src/data/costs.ts`,把对应项目的 `amount` 从 `null` 改为美元金额,
可选补充 `note`、`contributor`、`updated`。

## 发布

在仓库 Settings → Pages 中将 Source 设为 **GitHub Actions**,之后每次推送到 `main` 都会自动部署。
