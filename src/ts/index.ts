
//案例一：three.js + 外部模型
/*
import GeoWorld3 from './GeoWorld/GeoWorld3';
const dom: HTMLElement = document.querySelector('#earth-canvas');
new GeoWorld3({
  dom
});
*/

//案例二：高德地图+three.js 最基本的demo
/*
import GaoDeWorld0 from './Geode/GaoDeWorld0';
const world = new GaoDeWorld0('earth-canvas');
world.init();
*/


//案例三：高德地图+three.js 最基本的demo
/*
import GaoDeWorld1 from './Geode/GaoDeWorld1';
const world = new GaoDeWorld1('earth-canvas');
world.init();
*/

//案例四：高德地图+three.js 最基本的demo
/*
import GaoDeWorld2 from './Geode/GaoDeWorld2';
const world = new GaoDeWorld2('earth-canvas');
world.init();
*/

//案例五：高德地图+three.js 中国区上百个站点的标注
/*
import GaoDeWorld3 from './Geode/GaoDeWorld3';
const world = new GaoDeWorld3('earth-canvas');
world.init();
*/

//案例五：高德地图+three.js 中国区上百个站点的标注 + hover功能
/*
import GaoDeWorld4 from './Geode/GaoDeWorld4';
const world = new GaoDeWorld4('earth-canvas');
world.init();
*/

//案例六：高德地图+three.js 中国区上百个站点的标注 + hover功能 + 高亮旋转动画 + click 这个是最终版的demo
/*
import GaoDeWorld5 from './Geode/GaoDeWorld5';
const world = new GaoDeWorld5('earth-canvas');
world.init();
*/

import FactoryWorld2 from './GeoWorld/FactoryWorld2';
const world = new FactoryWorld2({
  dom: document.getElementById('earth-canvas')
});