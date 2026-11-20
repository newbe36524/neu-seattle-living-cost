/**
 * 成本数据 —— 唯一的数据入口。
 * 页面只读取这里的内容;金额填写后会自动出现在站点上。
 *
 * amount: 数字(美元),尚未填写请保持 null,页面会显示「待补充」。
 */

export type CostUnit = 'month' | 'year' | 'one-time';

export interface CostItem {
  id: string;
  label: string;
  /** 美元金额;null 表示待补充 */
  amount: number | null;
  unit: CostUnit;
  /** 补充说明(区域、户型、假设等) */
  note?: string;
  /** 数据提供者;目前均为站点作者,未来可加入其他贡献者 */
  contributor?: string;
  /** 数据采集时间,格式 YYYY-MM */
  updated?: string;
}

export interface CostCategory {
  id: string;
  title: string;
  description: string;
  items: CostItem[];
}

export const defaultContributor = '站点作者';

export const categories: CostCategory[] = [
  {
    id: 'housing',
    title: '住房',
    description: '房租、押金、水电网络等与居住直接相关的费用。',
    items: [
      { id: 'rent', label: '房租', amount: null, unit: 'month' },
      { id: 'deposit', label: '押金', amount: null, unit: 'one-time' },
      { id: 'utilities', label: '水电燃气', amount: null, unit: 'month' },
      { id: 'internet', label: '网络', amount: null, unit: 'month' },
    ],
  },
  {
    id: 'food',
    title: '饮食',
    description: '日常买菜、外出就餐等。',
    items: [
      { id: 'groceries', label: '超市买菜', amount: null, unit: 'month' },
      { id: 'dining-out', label: '外出就餐', amount: null, unit: 'month' },
    ],
  },
  {
    id: 'transport',
    title: '交通',
    description: '通勤、公共交通、汽车相关费用。',
    items: [
      { id: 'transit', label: '公共交通', amount: null, unit: 'month' },
      { id: 'car', label: '车辆(保险/油费/停车)', amount: null, unit: 'month' },
    ],
  },
  {
    id: 'other',
    title: '其他',
    description: '手机、医疗保险、娱乐等其他常见开销。',
    items: [
      { id: 'phone', label: '手机通讯', amount: null, unit: 'month' },
      { id: 'health', label: '医疗保险', amount: null, unit: 'month' },
      { id: 'leisure', label: '娱乐休闲', amount: null, unit: 'month' },
    ],
  },
];

export const unitLabel: Record<CostUnit, string> = {
  month: '每月',
  year: '每年',
  'one-time': '一次性',
};

/** 已填写金额的每月合计(年费折算为月,一次性费用不计入) */
export function monthlyTotal(cats: CostCategory[] = categories) {
  let total = 0;
  let filled = 0;
  let pending = 0;
  for (const item of cats.flatMap((c) => c.items)) {
    if (item.unit === 'one-time') continue;
    if (item.amount === null) {
      pending += 1;
      continue;
    }
    filled += 1;
    total += item.unit === 'year' ? item.amount / 12 : item.amount;
  }
  return { total, filled, pending };
}
