/**
 * Chart.js 的按需注册:只带环形图和面积图用到的控制器、元素与刻度,其余不打包。
 * 本文件只被 charts.ts 动态 import,所以首屏不会下载它。
 */
import { ArcElement, CategoryScale, Chart, DoughnutController, Filler, LinearScale, LineController, LineElement, PointElement, Tooltip } from 'chart.js';

Chart.register(DoughnutController, ArcElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);

export { Chart };
