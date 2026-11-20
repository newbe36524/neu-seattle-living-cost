// @ts-check
import { defineConfig } from 'astro/config';
import { hagilight, hagilightFavicon } from '@hagicode/hagilight/integration';

// GitHub Pages project site: https://newbe36524.github.io/neu-seattle-living-cost/
// hagilight() 默认生成 sitemap、robots.txt、RSS、llms.txt、站点元数据,
// 并注入 PostHog(HagiCode 共享项目,生产构建、同意后才加载)。
export default defineConfig({
  site: 'https://newbe36524.github.io',
  base: '/neu-seattle-living-cost',
  trailingSlash: 'always',
  integrations: [hagilight(), hagilightFavicon()],
});
