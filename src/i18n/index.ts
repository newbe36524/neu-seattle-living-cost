/**
 * 站点多语言的运行时加载。文案维护在 src/locales/<语言>/*.yml(由 @hagicode/hagi18n 审计),
 * 这里只负责:语言清单、按键取文案、生成各语言的路径。
 *
 * 键 = 文件名(不含扩展名)+ YAML 中的点分路径,例如 common.nav.home、pages.home.title。
 * 文案以简体中文为原文(hagi18n 基准),运行时缺键回退到默认显示语言(英文)并在构建日志里警告(i18n:check 会把缺键当作错误)。
 */

import { parse } from 'yaml';

/** HagiLight 支持的 10 种语言,与 @hagicode/hagilight-core 的 SITE_LOCALES 一致。 */
export const locales = [
  'zh-CN',
  'zh-Hant',
  'en-US',
  'ja-JP',
  'ko-KR',
  'de-DE',
  'fr-FR',
  'es-ES',
  'pt-BR',
  'ru-RU',
] as const;

export type Locale = (typeof locales)[number];

/**
 * 默认显示语言:英文。所有语言(含默认语言)都在 /<语言>/ 下;
 * 站点根路径 / 是 HagiLight 的默认语言引导页,自动转到默认语言,并列出其他语言入口。
 */
export const defaultLocale: Locale = 'en-US';

/** 语言切换器里显示的本语种名称。 */
export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-Hant': '繁體中文',
  'en-US': 'English',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'de-DE': 'Deutsch',
  'fr-FR': 'Français',
  'es-ES': 'Español',
  'pt-BR': 'Português (Brasil)',
  'ru-RU': 'Русский',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

type Tree = { [key: string]: string | Tree };

const files = import.meta.glob('../locales/*/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function flatten(tree: Tree, prefix: string, out: Map<string, string>, where: string) {
  for (const [k, v] of Object.entries(tree ?? {})) {
    const key = `${prefix}.${k}`;
    if (typeof v === 'string') out.set(key, v);
    else if (v && typeof v === 'object') flatten(v, key, out, where);
    else throw new Error(`[i18n] ${where}: "${key}" 必须是字符串或嵌套对象`);
  }
}

const messages = new Map<Locale, Map<string, string>>(locales.map((l) => [l, new Map()]));
for (const [path, raw] of Object.entries(files)) {
  const m = /\.\.\/locales\/([^/]+)\/([^/]+)\.yml$/.exec(path);
  if (!m) continue;
  const [, locale, name] = m;
  if (!isLocale(locale)) throw new Error(`[i18n] ${path}: "${locale}" 不是受支持的语言目录`);
  flatten(parse(raw) as Tree, name, messages.get(locale)!, path);
}

const warned = new Set<string>();

/** 取文案并替换 {{占位符}}。默认显示语言缺键直接抛错,让构建失败。 */
export function t(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  let text = messages.get(locale)!.get(key);
  if (text === undefined) {
    text = messages.get(defaultLocale)!.get(key);
    if (text === undefined) throw new Error(`[i18n] 缺少文案 "${key}"(默认语言 ${defaultLocale} 中也没有)`);
    const id = `${locale}:${key}`;
    if (!warned.has(id)) {
      warned.add(id);
      console.warn(`[i18n] ${locale} 缺少 "${key}",回退到 ${defaultLocale}。运行 npm run i18n:check 查看全部缺口。`);
    }
  }
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}

/** 某个键在该语言里是否有自己的译文(不回退)。用于可选文案,例如金额备注。 */
export function hasMessage(locale: Locale, key: string): boolean {
  return messages.get(locale)!.has(key);
}

export function createT(locale: Locale) {
  return (key: string, vars?: Record<string, string | number>) => t(locale, key, vars);
}

/** 文案里用反引号包住的片段渲染成 <code>。先转义 HTML,所以文案本身不能带标签。 */
export function rich(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** 站内路径(不含语言)→ 某语言下的路径。path 以 / 开头并以 / 结尾,例如 "/costs/"。 */
export function localePath(locale: Locale, path = '/'): string {
  return `${BASE}/${locale}${path}`;
}

/** 供 [lang] 路由的 getStaticPaths 使用:每种语言一份页面。 */
export function localeStaticPaths() {
  return locales.map((locale) => ({
    params: { lang: locale },
    props: { locale },
  }));
}
