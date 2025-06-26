
//案例一：three.js + 外部模型
/*
import GeoWorld3 from './GeoWorld/GeoWorld3';
const dom: HTMLElement = document.querySelector('#earth-canvas');
new GeoWorld3({
  dom
});
*/


//案例二：高德地图+three.js
import GaoDeWorld from './Geode/GaoDeWorld';
const world = new GaoDeWorld('earth-canvas');
world.init();