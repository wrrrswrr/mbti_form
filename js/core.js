// 共用小工具：$、esc、toast、shake、SVG 圖示、紅字警告、作答狀態（ans / stats / marks）
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}
function flash(txt){const f=$('#flash');f.textContent=txt;f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
function shake(el){el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')}
// ===== 圖示：全部用內嵌 SVG 線條圖示（2px 圓角線條），不用 emoji／特殊符號，避免手機自動變成 emoji =====
// 每個圖示是一組 path；只有播放／暫停和實心星星是填滿的
const ICO={
  play:["M6 3l14 9-14 9V3z"],
  pause:["M6 4h4v16H6z","M14 4h4v16h-4z"],
  download:["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  timer:["M20 13a8 8 0 1 1-16 0 8 8 0 0 1 16 0z","M12 9v4l2 2","M10 2h4"],
  headset:["M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"],
  call:["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"],
  unlock:["M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z","M7 11V7a5 5 0 0 1 9.9-1"],
  moon:["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"],
  heart:["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"],
  sparkle:["M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z","M20 3v4","M22 5h-4"],
  info:["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z","M12 16v-4","M12 8h.01"],
  refresh:["M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8","M21 3v5h-5"],
  check:["M20 6L9 17l-5-5"],
  close:["M18 6L6 18","M6 6l12 12"],
  star:["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  chat:["M7.9 20A9 9 0 1 0 4 16.1L2 22z"],
  tv:["M4 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z","M17 2l-5 5-5-5"],
  gift:["M4 8h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z","M12 8v13","M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7","M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"],
  edit:["M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z","M15 5l4 4"],
  mute:["M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5","M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7","M10.3 21a1.94 1.94 0 0 0 3.4 0","M2 2l20 20"],
  bed:["M2 4v16","M2 8h18a2 2 0 0 1 2 2v10","M2 17h20","M6 8v9"],
  clock:["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z","M12 6v6l4 2"],
  phone:["M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z","M12 18h.01"],
  bulb:["M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5","M9 18h6","M10 22h4"],
  music:["M9 18V5l12-2v13","M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z","M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"],
  link:["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71","M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"],
  mega:["M3 11l18-5v12L3 14v-3z","M11.6 16.8a3 3 0 1 1-5.8-1.6"],
  mic:["M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z","M19 10v2a7 7 0 0 1-14 0v-2","M12 19v3"],
  users:["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2","M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z","M22 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  follow:["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2","M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z","M19 8v6","M22 11h-6"],
  food:["M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2","M7 2v20","M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"],
  fridge:["M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z","M5 10h14","M9 5v2","M9 13v3"],
  robot:["M12 8V4H8","M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z","M2 14h2","M20 14h2","M15 13v2","M9 13v2"],
  ff:["M13 19l9-7-9-7v14z","M2 19l9-7-9-7v14z"],
  help:["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z","M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3","M12 17h.01"],
  search:["M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z","M21 21l-4.3-4.3"],
  upload:["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
  image:["M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z","M11 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0z","M21 15l-5-5L5 21"]};
const ICO_FILL={play:1,pause:1};
const ic=(n,sz=18,c='currentColor',fill)=>`<svg class="ico" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="${fill||ICO_FILL[n]?c:'none'}" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[n].map(d=>`<path d="${d}"/>`).join('')}</svg>`;
const starsHTML=n=>[0,1,2,3,4].map(i=>ic('star',14,'currentColor',i<n)).join('');
function warn(card,key,text){
  if(!card)return;const o=card.querySelector('.w-'+key);if(o)o.remove();
  if(text)card.insertAdjacentHTML('beforeend',`<div class="wmsg w-${key}">${ic('info',14)} ${text}</div>`);
  card.classList.toggle('warn',!!card.querySelector('.wmsg'));
}

const ans={};let page=0;
const stats={dodge:0,igDodge:0,spawn:0,submitDodge:0,badMbti:0,lastBad:null,rolled:false};
const marks={};
function mark(key,type,pts,ana){if(!type)delete marks[key];else marks[key]={type,pts,ana}}
