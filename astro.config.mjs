// @ts-check
import { defineConfig } from 'astro/config';
import { hagilight, hagilightFavicon } from '@hagicode/hagilight/integration';

// GitHub Pages project site: https://newbe36524.github.io/neu-seattle-living-cost/
// hagilight() 默认生成 sitemap、robots.txt、RSS、llms.txt、站点元数据,
// 并注入 PostHog(HagiCode 共享项目,仅生产构建)。
export default defineConfig({
  site: 'https://newbe36524.github.io',
  base: '/neu-seattle-living-cost',
  trailingSlash: 'always',
  integrations: [
    hagilight({
      // 本站不展示隐私同意弹窗:PostHog 在生产构建中直接加载。
      analytics: { consent: { enabled: false } },
    }),
    hagilightFavicon(),
  ],
});
