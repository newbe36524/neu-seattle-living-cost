/**
 * 首页「活账本」用的视图模型:把某位提供者的记录整理成按分类分组的账本行。
 *
 * 只做整理,不产生任何新数字:金额、来源、说明全部来自 costs.ts 读到的 YAML。
 * 账本行 = 一条记录(CostEntry)。合并项(如水电网络买菜合计)只出现一行,金额只计一次;
 * 没有被任何记录覆盖的项目是「待补充」行,用户可在计算器里填自己的数字。
 *
 * 所有文字(项目名、说明、分类名、提供者信息)按 locale 从 src/locales 取;locale 缺省为默认语言。
 */

import { categories, profiles, monthlyTotal, oneTimeTotal, entryNote, unitLabel, type CostUnit, type Profile } from './costs';
import { createT, defaultLocale, hasMessage, type Locale } from '../i18n';

export interface LedgerLine {
  /** 行的唯一键:所覆盖的第一个项目 id */
  key: string;
  label: string;
  /** 单项时来自项目定义的 hint(口径说明);合并项没有 */
  hint?: string;
  unit: CostUnit;
  /** null = 待补充 */
  amount: number | null;
  basis: 'reported' | 'estimate';
  /** 合并项:一笔金额覆盖多个项目 */
  bundled: boolean;
  note?: string;
}

export interface LedgerGroup {
  id: string;
  title: string;
  lines: LedgerLine[];
  /** 含有每月/每年项目。只含一次性费用的分组默认折叠 */
  recurring: boolean;
}

export interface LedgerProfile {
  id: string;
  contributor: string;
  area: string;
  summary: string;
  updated: string;
  groups: LedgerGroup[];
  /** 每月合计(年费折算,一次性不计,合并项只计一次),未取整 */
  monthly: number;
  /** 尚未填写的每月/每年项目名 */
  pendingRecurring: string[];
  /** 一次性费用:所报 vs 估算 */
  oneTime: { reported: number; estimate: number };
}

export { unitLabel };

export function buildLedger(profile: Profile, locale: Locale = defaultLocale): LedgerProfile {
  const t = createT(locale);
  const hintOf = (id: string) => (hasMessage(defaultLocale, `data.items.${id}.hint`) ? t(`data.items.${id}.hint`) : undefined);
  const emitted = new Set<object>();
  const groups: LedgerGroup[] = [];

  for (const cat of categories) {
    const lines: LedgerLine[] = [];
    for (const item of cat.items) {
      const entry = profile.entries.find((e) => e.items.includes(item.id));
      if (entry) {
        if (emitted.has(entry)) continue;
        emitted.add(entry);
        const members = entry.items.map((id) => categories.flatMap((c) => c.items).find((i) => i.id === id)!);
        lines.push({
          key: members[0].id,
          label: members.map((m) => t(`data.items.${m.id}.label`)).join(' + '),
          hint: members.length === 1 ? hintOf(members[0].id) : undefined,
          unit: members[0].unit,
          amount: entry.amount,
          basis: entry.basis ?? 'reported',
          bundled: members.length > 1,
          note: entryNote(locale, profile, entry),
        });
      } else {
        lines.push({
          key: item.id,
          label: t(`data.items.${item.id}.label`),
          hint: hintOf(item.id),
          unit: item.unit,
          amount: null,
          basis: 'reported',
          bundled: false,
        });
      }
    }
    if (lines.length === 0) continue;
    groups.push({ id: cat.id, title: t(`data.categories.${cat.id}.title`), lines, recurring: lines.some((l) => l.unit !== 'one-time') });
  }

  const { total, pending } = monthlyTotal(profile);
  return {
    id: profile.id,
    contributor: t(`data.profiles.${profile.id}.contributor`),
    area: t(`data.profiles.${profile.id}.area`),
    summary: t(`data.profiles.${profile.id}.summary`),
    updated: profile.updated,
    groups,
    monthly: total,
    pendingRecurring: pending.map((id) => t(`data.items.${id}.label`)),
    oneTime: oneTimeTotal(profile),
  };
}

/** 某语言下所有提供者的账本;页面按自己的 locale 取。 */
export function ledgersFor(locale: Locale): LedgerProfile[] {
  return profiles.map((p) => buildLedger(p, locale));
}

/** 默认语言(简体中文)的账本。 */
export const ledgers: LedgerProfile[] = ledgersFor(defaultLocale);

/** 计算器默认值:覆盖 12 个月、不计入估算的搬入采购。服务端首屏与客户端计算共用同一口径。 */
export const DEFAULT_MONTHS = 12;

export function periodTotal(monthly: number, once: number, months = DEFAULT_MONTHS) {
  return monthly * months + once;
}
