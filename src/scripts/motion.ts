/**
 * 进入视口时的动效开关。只负责「何时播放」,动画本身全在 global.css。
 *
 *  - [data-reveal]  滚动进入视口时播放一次入场,每种 data-reveal 值是一种不同的入场(见 global.css)。页面一加载就在视口内的
 *                   不做入场,只给还没看到的内容「上膛」(data-armed),
 *                   所以没有 JS、或 reduced-motion 时,一切都是直接可见的终态。
 *  - [data-route]   通勤路线:第一次进入视口时开始走(data-play),之后只在可见时让环境动效(轮渡摇晃)继续(data-visible)。
 *
 * 隐藏的面板(display:none)不会触发观察;切换提供者让它显示出来时才会触发,所以不用特殊处理。
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced && 'IntersectionObserver' in window && !(window as any).__nslcMotion) {
  (window as any).__nslcMotion = true;

  const onScreen = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.top < innerHeight * 0.92 && r.bottom > 0;
  };

  const reveal = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.setAttribute('data-in', '');
        reveal.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  const route = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        el.toggleAttribute('data-visible', e.isIntersecting);
        if (e.isIntersecting) el.setAttribute('data-play', '');
      }
    },
    { threshold: 0.6 },
  );

  const ALWAYS_PLAY = new Set(['lights', 'verdict', 'advice']);

  const arm = () => {
    document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-seen])').forEach((el) => {
      el.setAttribute('data-seen', '');
      // lights(住房图标窗灯)、verdict / advice(评价区)在首屏也要播,所以一律上膛;其余只给还没看到的内容上膛
      if (ALWAYS_PLAY.has(el.dataset.reveal!) || !onScreen(el)) el.setAttribute('data-armed', '');
      reveal.observe(el);
    });
    document.querySelectorAll<HTMLElement>('[data-route]:not([data-seen])').forEach((el) => {
      el.setAttribute('data-seen', '');
      el.setAttribute('data-motion', '');
      route.observe(el);
    });
  };
  arm();
}
