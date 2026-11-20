/**
 * 成本数据的类型、加载与校验。页面只通过这里读取数据。
 *
 * 数据本身是 YAML,不在这个文件里:
 *  - categories.yaml:成本项「定义」(有哪些项目、周期是什么),与具体某个人无关。
 *  - profiles/*.yaml:每位提供者的「真实记录」,只引用项目 id 并给出金额。
 *    新增一位同学 = 在 profiles/ 里新增一个 .yaml 文件,无需改动定义或页面。
 *
 * 这里的数据不含任何语言的文字:分类名、项目名、提供者名称、备注等都在
 * src/locales/<语言>/data.yml(由 hagi18n 审计),页面用 src/i18n 按 id 取。
 *
 * 诚实原则:没有提供的数字保持缺省(页面显示「待补充」),不得估算或填充。
 */

import { parse } from 'yaml';
import { defaultLocale, hasMessage, createT, type Locale } from '../i18n';

export type CostUnit = 'month' | 'year' | 'one-time';

/** 成本项定义(不含金额、不含文字) */
export interface CostItem {
  id: string;
  unit: CostUnit;
}

export interface CostCategory {
  id: string;
  items: CostItem[];
}

/**
 * 一条金额记录。
 * items 列出它覆盖的项目 id:通常只有一个;提供者只给出合计时可以覆盖多个(合并项),
 * 此时金额只计一次,页面在这些项目上显示「含于合并项」。
 * 同一条记录覆盖的项目必须周期相同。
 */
export interface CostEntry {
  items: string[];
  /** 美元;null 表示已知需要填写但尚无数字 */
  amount: number | null;
  /**
   * 数字来源:reported = 提供者自己报的(默认);estimate = 参考价格估算,不是实际支出。
   * 页面会把估算值标出来,合计也分开统计。
   */
  basis?: 'reported' | 'estimate';
}

/** 一位数据提供者及其生活情境 */
export interface Profile {
  /** 来源文件(加载时自动填入,不写在 YAML 里) */
  file?: string;
  id: string;
  /** 数据采集时间,YYYY-MM */
  updated: string;
  entries: CostEntry[];
}

const categoryFiles = import.meta.glob('./categories.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const profileFiles = import.meta.glob('./profiles/*.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function load<T>(file: string, raw: string): T {
  try {
    return parse(raw) as T;
  } catch (err) {
    throw new Error(`[costs] ${file}: YAML 解析失败:${(err as Error).message}`);
  }
}

export const categories: CostCategory[] = Object.entries(categoryFiles).flatMap(([f, raw]) => load<CostCategory[]>(f, raw));

export const profiles: Profile[] = Object.entries(profileFiles)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([f, raw]) => ({ ...load<Profile>(f, raw), file: f }));

/** 周期在某语言下的名称 */
export function unitLabel(locale: Locale, unit: CostUnit): string {
  return createT(locale)(`common.units.${unit}`);
}

const itemById = new Map(categories.flatMap((c) => c.items).map((i) => [i.id, i]));

const UNITS: CostUnit[] = ['month', 'year', 'one-time'];
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

/** 构建期校验:YAML 写错(缺字段、类型不对、引用不存在的项目、重复、合并项周期不一致)会让构建失败。 */
function validate() {
  const fail = (where: string, msg: string): never => {
    throw new Error(`[costs] ${where}: ${msg}`);
  };
  /** 基准语言(简体中文)必须有这些文案;其他语言缺了由 hagi18n 审计报告,页面回退到基准语言。 */
  const needText = (where: string, ...keys: string[]) => {
    for (const k of keys) if (!hasMessage(defaultLocale, k)) fail(where, `缺少文案 "${k}"(在 src/locales/${defaultLocale}/ 中添加)`);
  };

  if (!Array.isArray(categories) || categories.length === 0) fail('categories.yaml', '应为非空的分类列表');
  const categoryIds = new Set<string>();
  const itemIds = new Set<string>();
  for (const c of categories) {
    if (!isStr(c?.id) || !Array.isArray(c.items)) fail('categories.yaml', `分类缺少 id/items:${JSON.stringify(c)}`);
    needText(`categories.yaml 分类 "${c.id}"`, `data.categories.${c.id}.title`, `data.categories.${c.id}.description`);
    if (categoryIds.has(c.id)) fail('categories.yaml', `分类 id "${c.id}" 重复`);
    categoryIds.add(c.id);
    for (const i of c.items) {
      if (!isStr(i?.id) || !UNITS.includes(i.unit))
        fail('categories.yaml', `项目需要 id 和合法的 unit(${UNITS.join('/')}):${JSON.stringify(i)}`);
      needText(`categories.yaml 项目 "${i.id}"`, `data.items.${i.id}.label`);
      if (itemIds.has(i.id)) fail('categories.yaml', `项目 id "${i.id}" 重复`);
      itemIds.add(i.id);
    }
  }

  const profileIds = new Set<string>();
  for (const p of profiles) {
    const where = p.file ?? p.id;
    if (!isStr(p.id)) fail(where, '需要 id');
    needText(where, `data.profiles.${p.id}.contributor`, `data.profiles.${p.id}.area`, `data.profiles.${p.id}.summary`);
    if (profileIds.has(p.id)) fail(where, `提供者 id "${p.id}" 重复`);
    profileIds.add(p.id);
    if (!isStr(p.updated) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(p.updated))
      fail(where, `updated 应为带引号的 "YYYY-MM":${JSON.stringify(p.updated)}`);
    if (!Array.isArray(p.entries)) fail(where, 'entries 应为列表');

    const seen = new Set<string>();
    for (const e of p.entries) {
      if (!Array.isArray(e?.items) || e.items.length === 0) fail(where, `记录缺少 items:${JSON.stringify(e)}`);
      if (e.amount !== null && !(typeof e.amount === 'number' && Number.isFinite(e.amount) && e.amount >= 0))
        fail(where, `amount 应为非负数字或 null:${JSON.stringify(e)}`);
      if (e.basis !== undefined && e.basis !== 'reported' && e.basis !== 'estimate')
        fail(where, `basis 只能是 reported 或 estimate:${JSON.stringify(e)}`);
      const units = new Set<CostUnit>();
      for (const id of e.items) {
        const item = itemById.get(id);
        if (!item) fail(where, `未知项目 "${id}"(不在 categories.yaml 中)`);
        if (seen.has(id)) fail(where, `项目 "${id}" 被重复记录`);
        seen.add(id);
        units.add(item!.unit);
      }
      if (units.size > 1) fail(where, `合并项 [${e.items}] 周期不一致`);
    }
  }
}
validate();

export type ItemStatus =
  | { kind: 'pending' }
  | { kind: 'amount'; amount: number; entry: CostEntry }
  | { kind: 'bundled'; amount: number; entry: CostEntry };

/** 某个项目在某位提供者记录中的状态 */
export function itemStatus(profile: Profile, itemId: string): ItemStatus {
  const entry = profile.entries.find((e) => e.items.includes(itemId));
  if (!entry || entry.amount === null) return { kind: 'pending' };
  return entry.items.length > 1
    ? { kind: 'bundled', amount: entry.amount, entry }
    : { kind: 'amount', amount: entry.amount, entry };
}

/** 一位提供者已填写的每月合计(年费折算为月;一次性费用不计入;合并项只计一次) */
export function monthlyTotal(profile: Profile) {
  let total = 0;
  for (const e of profile.entries) {
    if (e.amount === null) continue;
    const unit = itemById.get(e.items[0])!.unit;
    if (unit === 'one-time') continue;
    total += unit === 'year' ? e.amount / 12 : e.amount;
  }
  const recurring = [...itemById.values()].filter((i) => i.unit !== 'one-time');
  const pending = recurring.filter((i) => itemStatus(profile, i.id).kind === 'pending');
  return { total, pending: pending.map((i) => i.id) };
}

/** 一次性费用合计,按数字来源分开:提供者所报 vs 估算 */
export function oneTimeTotal(profile: Profile) {
  let reported = 0;
  let estimate = 0;
  for (const e of profile.entries) {
    if (e.amount === null || itemById.get(e.items[0])!.unit !== 'one-time') continue;
    if (e.basis === 'estimate') estimate += e.amount;
    else reported += e.amount;
  }
  return { reported, estimate };
}

/**
 * 一条记录在某语言下的备注。备注文字在 data.yml 的 profiles.<id>.notes.<该条 items 的第一个项目 id>;
 * 估算记录没写备注时显示通用的估算说明。
 */
export function entryNote(locale: Locale, profile: Profile, entry: CostEntry): string | undefined {
  const t = createT(locale);
  const estimate = t('common.estimateNote');
  const key = `data.profiles.${profile.id}.notes.${entry.items[0]}`;
  if (hasMessage(defaultLocale, key)) return t(key, { estimate });
  return entry.basis === 'estimate' ? estimate : undefined;
}
