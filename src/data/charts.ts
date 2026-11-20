/**
 * 图表用的数据整理:纯函数,不读 YAML、不产生新数字。
 * 服务端渲染首屏和浏览器里重算共用这里,保证两边口径一致。
 *
 * 口径与账本一致:每月 = 每月项 + 每年项 ÷ 12;一次性单独算,不并入每月;
 * 估算的搬入采购只在用户勾选「计入」时才进入累计。
 */

import type { LedgerLine, LedgerProfile } from './ledger';

/** 图表一次绘制所需的全部输入。写在元素的 data-chart 里,脚本据此重绘。 */
export interface ChartState {
  /** 每个有每月项目的分类及其每月小计 */
  groups: { id: string; label: string; value: number }[];
  /** 一次性费用(提供者所报) */
  once: number;
  /** 估算的搬入采购;includeEstimate 为 true 时才计入 */
  estimate: number;
  includeEstimate: boolean;
  months: number;
}

export const monthlyOf = (l: Pick<LedgerLine, 'amount' | 'unit'>): number =>
  l.amount === null || l.unit === 'one-time' ? 0 : l.unit === 'year' ? l.amount / 12 : l.amount;

export function chartStateOf(p: LedgerProfile, months: number, includeEstimate = false): ChartState {
  return {
    groups: p.groups
      .filter((g) => g.recurring)
      .map((g) => ({ id: g.id, label: g.title, value: g.lines.reduce((s, l) => s + monthlyOf(l), 0) })),
    once: p.oneTime.reported,
    estimate: p.oneTime.estimate,
    includeEstimate,
    months,
  };
}

export const monthlyOfState = (s: ChartState): number => s.groups.reduce((sum, g) => sum + g.value, 0);

/** 把一组非负数换算成加起来恰好为 100 的整数百分比(最大余数法);全为 0 时返回全 0。 */
export function percentages(values: number[]): number[] {
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((v) => (v / total) * 100);
  const floors = raw.map(Math.floor);
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, rem: r - Math.floor(r) })).sort((a, b) => b.rem - a.rem);
  for (const { i } of order) {
    if (left <= 0) break;
    floors[i]++;
    left--;
  }
  return floors;
}

/** 百分比的显示文字:金额不为 0 但取整后是 0 的,显示「<1」而不是误导的「0」。 */
export const pctText = (value: number, pct: number): string => (value > 0 && pct === 0 ? '<1' : String(pct));

/** 累计开销:第 0 个月是搬入时的一次性费用,第 k 个月再加 k 个月的每月开销。 */
export function cumulative(s: ChartState) {
  const monthly = monthlyOfState(s);
  const est = s.includeEstimate ? s.estimate : 0;
  const labels = Array.from({ length: s.months + 1 }, (_, k) => k);
  return {
    labels,
    once: labels.map(() => s.once),
    estimate: labels.map(() => est),
    recurring: labels.map((k) => monthly * k),
    total: labels.map((k) => s.once + est + monthly * k),
  };
}

/** 年度图旁的三个数字。 */
export function yearFigures(s: ChartState) {
  const monthly = monthlyOfState(s);
  const upfront = s.once + (s.includeEstimate ? s.estimate : 0);
  return { first: upfront + monthly, monthly, grand: upfront + monthly * s.months };
}
