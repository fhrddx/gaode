
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

//案例五：高德地图+three.js 最基本的demo
import GaoDeWorld3 from './Geode/GaoDeWorld3';
const world = new GaoDeWorld3('earth-canvas');
world.init();