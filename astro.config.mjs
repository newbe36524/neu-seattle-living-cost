// @ts-check
import { defineConfig } from 'astro/config';
import { hagilight, hagilightFavicon } from '@hagicode/hagilight/integration';

// GitHub Pages project site: https://newbe36524.github.io/neu-seattle-living-cost/
export default defineConfig({
  site: 'https://newbe36524.github.io',
  base: '/neu-seattle-living-cost',
  trailingSlash: 'always',
  integrations: [
    hagilight({
      // 站点没有文章流,不发布空的 RSS。
      rss: false,
      // HagiLight 默认注入 HagiCode 自己的 PostHog 项目;本站不向第三方上报访问数据。
      // 若以后要统计,换成自己的 key:analytics: { posthog: { apiKey: 'phc_...' } }
      analytics: { posthog: { enabled: false } },
    }),
    hagilightFavicon(),
  ],
});
