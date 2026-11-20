/**
 * 图表的客户端部分。服务端已经把数字和图例渲染好了;这里只在浏览器里把图画上去,并让它跟着账本变。
 *
 * - Chart.js 在图表接近视口时才动态加载(首屏不付这笔代价)。
 * - 数据来源只有一个:元素上的 data-chart(服务端写入),首页账本每次重算会把最新值放在所在账页的
 *   data-live 并发出 ledger:state 事件。图表只读这两处,不自己算任何金额。
 * - 图表之外的文字(图例、三个数字)在任何情况下都是完整答案,图只是更直观的第二种读法。
 */

import { cumulative, monthlyOfState, pctText, percentages, yearFigures, type ChartState } from '../data/charts';

type ChartInstance = import('chart.js').Chart;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const money = (n: number) => usd.format(Math.round(n));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, k: string) => (k in vars ? String(vars[k]) : whole));

// ───────── 取色:与 global.css 同一套调色板(NU Red + 品牌中性色),不引入新颜色 ─────────
const root = getComputedStyle(document.documentElement);
const cssVar = (name: string) => root.getPropertyValue(name).trim();

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}
/** 与 CSS color-mix(in srgb, a pct%, b) 同一公式 */
function mix(a: string, pct: number, b: string): string {
  const [ar, ag, ab] = rgb(a);
  const [br, bg, bb] = rgb(b);
  const k = pct / 100;
  const ch = (x: number, y: number) => Math.round(x * k + y * (1 - k));
  return `rgb(${ch(ar, br)}, ${ch(ag, bg)}, ${ch(ab, bb)})`;
}
const palette = () => {
  const accent = cssVar('--accent');
  const bg = cssVar('--bg');
  const muted = cssVar('--muted');
  return {
    accent, bg, muted, fg: cssVar('--fg'), border: cssVar('--border'),
    /** 分类色阶:要与 global.css 里的 --cat-0…5 一致 */
    cats: [accent, mix(accent, 55, bg), muted, mix(muted, 50, bg), mix(accent, 30, bg), mix(muted, 28, bg)],
    onceFill: mix(muted, 22, bg),
    recurringFill: mix(accent, 18, bg),
    estimateFill: mix(muted, 10, bg),
  };
};

/** 读取一个图表根元素当前应该画的状态:服务端写的基础值,叠加所在账页的实时值 */
function stateOf(el: HTMLElement): ChartState {
  const base = JSON.parse(el.dataset.chart || '{}') as ChartState;
  const live = el.closest<HTMLElement>('[data-panel]')?.dataset.live;
  if (!live) return base;
  const l = JSON.parse(live) as { groups: Record<string, number>; once: number; estimate: number; includeEstimate: boolean; months: number };
  return {
    groups: base.groups.map((g) => ({ ...g, value: l.groups[g.id] ?? g.value })),
    once: l.once,
    estimate: l.estimate,
    includeEstimate: l.includeEstimate,
    months: l.months,
  };
}

let lib: Promise<typeof import('./chart-lib')> | undefined;
const loadLib = () =>
  (lib ??= import('./chart-lib').then((m) => {
    const body = getComputedStyle(document.body);
    m.Chart.defaults.font.family = body.fontFamily;
    m.Chart.defaults.font.size = 13;
    m.Chart.defaults.color = cssVar('--muted');
    return m;
  }));

const tooltipBase = (p: ReturnType<typeof palette>) => ({
  backgroundColor: p.fg,
  titleColor: '#ffffff',
  bodyColor: '#ffffff',
  footerColor: '#ffffff',
  cornerRadius: 0,
  padding: 10,
  boxPadding: 4,
  displayColors: true,
});
const motion = (ms: number) => (reduced ? false : { duration: ms, easing: 'easeOutQuart' as const });

// ───────── 每月占比:环形图 ─────────
function mountShare(el: HTMLElement) {
  const canvas = el.querySelector<HTMLCanvasElement>('[data-canvas]')!;
  const donut = el.querySelector<HTMLElement>('[data-donut]')!;
  const items = [...el.querySelectorAll<HTMLElement>('[data-legend]')];
  const dict = JSON.parse(el.dataset.i18n || '{}') as Record<string, string>;
  const panel = el.closest<HTMLElement>('[data-panel]');
  const pal = palette();
  let chart: ChartInstance | undefined;
  let state = stateOf(el);

  const values = () => state.groups.map((g) => Math.max(0, g.value));
  const emptyRing = () => monthlyOfState(state) <= 0;

  function renderText() {
    const total = monthlyOfState(state);
    const pct = percentages(values());
    el.querySelector('[data-donut-total]')!.textContent = money(total);
    items.forEach((li, i) => {
      const g = state.groups.find((x) => x.id === li.dataset.legend);
      if (!g) return;
      li.querySelector('[data-lg-amount]')!.textContent = money(g.value);
      li.querySelector('[data-lg-pct]')!.textContent = total > 0 ? `${pctText(g.value, pct[i])}%` : '—';
      li.style.setProperty('--w', `${pct[i]}%`);
      li.style.setProperty('--m', g.value > 0 ? '3px' : '0px');
    });
  }

  function highlight(id: string | null, fromChart = false) {
    items.forEach((li) => li.toggleAttribute('data-on', li.dataset.legend === id));
    el.toggleAttribute('data-has-on', id !== null);
    if (!chart || fromChart) return;
    const i = state.groups.findIndex((g) => g.id === id);
    const arc = i >= 0 && !emptyRing() ? chart.getDatasetMeta(0).data[i] : undefined;
    if (arc && state.groups[i].value > 0) {
      const active = [{ datasetIndex: 0, index: i }];
      chart.setActiveElements(active);
      chart.tooltip?.setActiveElements(active, arc.tooltipPosition(true));
    } else {
      chart.setActiveElements([]);
      chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
    }
    chart.update('none');
  }

  async function create() {
    const { Chart } = await loadLib();
    const empty = emptyRing();
    chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: state.groups.map((g) => g.label),
        datasets: [{
          data: empty ? [1] : values(),
          backgroundColor: empty ? [pal.border] : state.groups.map((_, i) => pal.cats[i % pal.cats.length]),
          borderColor: pal.bg,
          borderWidth: 2,
          hoverOffset: 6,
          hoverBorderColor: pal.bg,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        cutout: '68%',
        animation: motion(650),
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipBase(pal),
            enabled: true,
            filter: () => !emptyRing(),
            callbacks: {
              title: () => '',
              label: (c) => {
                const pct = percentages(values())[c.dataIndex];
                return fill(dict['charts.share.tooltip'] ?? '{{label}}', { label: c.label, amount: money(c.parsed), percent: pctText(c.parsed, pct) });
              },
            },
          },
        },
        onHover: (_e, active) => highlight(active.length ? state.groups[active[0].index].id : null, true),
      },
    });
    donut.dataset.ready = '';
    canvas.addEventListener('pointerleave', () => highlight(null, true));
  }

  function update() {
    state = stateOf(el);
    renderText();
    if (!chart) return;
    const empty = emptyRing();
    const ds = chart.data.datasets[0];
    ds.data = empty ? [1] : values();
    ds.backgroundColor = empty ? [pal.border] : state.groups.map((_, i) => pal.cats[i % pal.cats.length]);
    chart.update();
  }

  // 图例 ↔ 环 ↔ 账本行 三者互相高亮
  items.forEach((li) => {
    li.addEventListener('pointerenter', () => highlight(li.dataset.legend!));
    li.addEventListener('pointerleave', () => highlight(null));
  });
  if (panel) {
    const rowGroup = (ev: Event) => (ev.target as HTMLElement).closest<HTMLElement>('[data-row]')?.dataset.group ?? null;
    panel.addEventListener('pointerover', (ev) => highlight(rowGroup(ev)));
    panel.addEventListener('pointerleave', () => highlight(null));
    panel.addEventListener('focusin', (ev) => highlight(rowGroup(ev)));
    panel.addEventListener('focusout', () => highlight(null));
    panel.addEventListener('ledger:state', update);
  }
  update();
  whenNear(el, create);
}

// ───────── 年度累计:堆叠面积图 ─────────
function mountYear(el: HTMLElement) {
  const canvas = el.querySelector<HTMLCanvasElement>('[data-canvas]')!;
  const dict = JSON.parse(el.dataset.i18n || '{}') as Record<string, string>;
  const panel = el.closest<HTMLElement>('[data-panel]');
  const pal = palette();
  let chart: ChartInstance | undefined;
  let state = stateOf(el);

  function renderText() {
    const f = yearFigures(state);
    const set = (k: string, v: string) => (el.querySelector(`[data-y="${k}"]`)!.textContent = v);
    set('first', money(f.first));
    set('monthly', money(f.monthly));
    set('grand', money(f.grand));
    el.querySelector('[data-year-heading]')!.textContent = fill(dict['charts.year.heading'], { months: state.months });
    el.querySelector('[data-y-grand-label]')!.textContent = fill(dict['charts.year.grand'], { months: state.months });
    el.querySelector<HTMLElement>('[data-legend-estimate]')!.hidden = !(state.includeEstimate && state.estimate > 0);
    canvas.setAttribute(
      'aria-label',
      fill(dict['charts.year.alt'], { months: state.months, upfront: money(state.once + (state.includeEstimate ? state.estimate : 0)), monthly: money(f.monthly), grand: money(f.grand) }),
    );
  }

  const series = () => {
    const c = cumulative(state);
    return { labels: c.labels, once: c.once, estimate: c.estimate, recurring: c.recurring, total: c.total };
  };

  async function create() {
    const { Chart } = await loadLib();
    const s = series();
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: s.labels,
        datasets: [
          { label: dict['charts.year.once'], data: s.once, fill: 'origin', backgroundColor: pal.onceFill, borderColor: pal.muted, borderWidth: 1.5, pointRadius: 0, pointHoverRadius: 4, tension: 0 },
          { label: dict['charts.year.estimate'], data: s.estimate, hidden: !(state.includeEstimate && state.estimate > 0), fill: '-1', backgroundColor: pal.estimateFill, borderColor: pal.muted, borderDash: [4, 3], borderWidth: 1.5, pointRadius: 0, pointHoverRadius: 4, tension: 0 },
          { label: dict['charts.year.recurring'], data: s.recurring, fill: '-1', backgroundColor: pal.recurringFill, borderColor: pal.accent, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: pal.accent, pointBorderColor: pal.bg, tension: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: motion(550),
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { display: false },
            border: { color: pal.border },
            title: { display: true, text: dict['charts.year.axisMonth'], color: pal.muted },
            ticks: { autoSkip: true, maxRotation: 0, maxTicksLimit: 13 },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            border: { display: false },
            grid: { color: pal.border },
            ticks: { callback: (v) => compact.format(Number(v)), maxTicksLimit: 5 },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipBase(pal),
            filter: (item) => !item.dataset.hidden,
            callbacks: {
              title: (items) => {
                const k = Number(items[0].label);
                return k === 0 ? dict['charts.year.tooltipTitleStart'] : fill(dict['charts.year.tooltipTitle'], { month: k });
              },
              label: (c) => `${c.dataset.label}: ${money(c.raw as number)}`,
              footer: (items) => {
                const k = Number(items[0].label);
                return fill(dict['charts.year.tooltipTotal'], { amount: money(series().total[k]) });
              },
            },
          },
        },
      },
    });
  }

  function update() {
    state = stateOf(el);
    renderText();
    if (!chart) return;
    const s = series();
    const [once, est, rec] = chart.data.datasets;
    chart.data.labels = s.labels;
    once.data = s.once;
    est.data = s.estimate;
    est.hidden = !(state.includeEstimate && state.estimate > 0);
    rec.data = s.recurring;
    chart.update();
  }

  panel?.addEventListener('ledger:state', update);
  update();
  whenNear(el, create);
}

/** 接近视口时才执行(并且只执行一次)。账页隐藏时 display:none 不会触发,切换显示后才触发。 */
function whenNear(el: Element, create: () => Promise<void>) {
  // 加载失败(离线、脚本被拦)时,标记失败让预留的图表位置收起;图例和数字仍是完整答案。
  const run = () => create().catch(() => el.setAttribute('data-failed', ''));
  if (!('IntersectionObserver' in window)) return void run();
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        run();
      }
    },
    { rootMargin: '240px 0px' },
  );
  io.observe(el);
}

document.querySelectorAll<HTMLElement>('[data-share]').forEach(mountShare);
document.querySelectorAll<HTMLElement>('[data-year]').forEach(mountYear);
