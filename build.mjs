// 部署用打包：把 js/*.js 依 index.html 的順序串成一個帶 hash 的檔、CSS 直接塞進 HTML、
// 音效檔名加上 hash，輸出到 dist/。目的是降低 Vercel 的請求次數（一次訪問 ~30 個 → 2~3 個），
// 檔名帶 hash 才能放心設長快取（內容一改檔名就變，使用者不會卡在舊版）。
// 本機開發照舊用 npm run dev 直接開原始檔，不需要先 build。
import {readFileSync,writeFileSync,mkdirSync,rmSync,readdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const OUT='dist';
const hash=buf=>createHash('sha256').update(buf).digest('hex').slice(0,10);

rmSync(OUT,{recursive:true,force:true});
mkdirSync(`${OUT}/sounds`,{recursive:true});

// 音效：sounds/x.mp3 → sounds/x.<hash>.mp3
const soundMap={};
for(const f of readdirSync('sounds')){
  const buf=readFileSync(`sounds/${f}`),dot=f.lastIndexOf('.');
  const name=`${f.slice(0,dot)}.${hash(buf)}${f.slice(dot)}`;
  copyFileSync(`sounds/${f}`,`${OUT}/sounds/${name}`);
  soundMap[`sounds/${f}`]=`sounds/${name}`;
}

let html=readFileSync('index.html','utf8');

// JS：照 index.html 裡 <script src="js/..."> 的順序串接
const srcs=[...html.matchAll(/<script src="(js\/[^"]+)"><\/script>\n?/g)];
if(!srcs.length)throw new Error('index.html 裡找不到 js/*.js');
let js=srcs.map(m=>`// ---- ${m[1]} ----\n${readFileSync(m[1],'utf8')}`).join(';\n');
for(const [from,to] of Object.entries(soundMap)){
  const n=js.split(`'${from}'`).length-1;
  js=js.split(`'${from}'`).join(`'${to}'`);
  if(!n)console.warn(`(沒有程式引用 ${from})`);
}
const jsName=`app.${hash(js)}.js`;
writeFileSync(`${OUT}/${jsName}`,js);

// 第一個 <script src="js/..."> 換成打包檔，其餘移除
html=html.replace(srcs[0][0],`<script src="${jsName}"></script>\n`);
for(const m of srcs.slice(1))html=html.replace(m[0],'');

// CSS 直接內嵌
const css=readFileSync('css/style.css','utf8');
html=html.replace('<link rel="stylesheet" href="css/style.css">',()=>`<style>\n${css}\n</style>`);
if(html.includes('css/style.css'))throw new Error('CSS 沒有成功內嵌');

writeFileSync(`${OUT}/index.html`,html);
copyFileSync('report.html',`${OUT}/report.html`);
console.log(`built ${OUT}/: index.html, report.html, ${jsName} (${srcs.length} 個 js), ${Object.keys(soundMap).length} 個音效`);
