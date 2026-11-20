// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { hagilight, hagilightFavicon } from '@hagicode/hagilight/integration';

// 站点语言:与 HagiLight 支持的 10 种语言一致。运行时清单在 src/i18n/index.ts,改动要两处同步。
// 默认显示语言是英文;所有语言都在 /<语言>/ 下,根路径 / 是 HagiLight 的默认语言引导页(src/pages/index.astro)。
const locales = ['zh-CN', 'zh-Hant', 'en-US', 'ja-JP', 'ko-KR', 'de-DE', 'fr-FR', 'es-ES', 'pt-BR', 'ru-RU'];

// GitHub Pages project site: https://newbe36524.github.io/neu-seattle-living-cost/
// 本地 ND Console 节点在域名根路径提供站点,构建时用 SITE_BASE=/、SITE_URL=<节点地址> 覆盖(见 build:nd)。
// hagilight() 默认生成 sitemap、robots.txt、RSS、llms.txt、站点元数据,
// 并注入 PostHog(HagiCode 共享项目,仅生产构建)。
const base = process.env.SITE_BASE || '/neu-seattle-living-cost';

export default defineConfig({
  site: process.env.SITE_URL || 'https://newbe36524.github.io',
  base,
  trailingSlash: 'always',
  // 「成本明细」页已并入首页账本:旧链接转到对应语言的首页。
  redirects: Object.fromEntries(locales.map((l) => [`/${l}/costs`, `${base.replace(/\/$/, '')}/${l}/`])),
  i18n: {
    defaultLocale: 'en-US',
    locales,
    // 根路径由引导页自己提供,不要让 Astro 再生成指向默认语言的重定向。
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    // 自己声明 sitemap,为每个页面加上各语言版本的 hreflang;hagilight() 检测到后不再重复添加。
    sitemap({ i18n: { defaultLocale: 'en-US', locales: Object.fromEntries(locales.map((l) => [l, l])) } }),
    hagilight({
      // 本站不展示隐私同意弹窗:PostHog 在生产构建中直接加载。
      analytics: { consent: { enabled: false } },
    }),
    hagilightFavicon(),
  ],
});
