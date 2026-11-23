// 影片與彩蛋：YouTube 隱形播放器、Rick roll、研究說明影片、奶蛙探頭
function embed(id){
  const yt=`https://www.youtube.com/watch?v=${id}`;
  if(location.protocol==='file:')return `<div class="vbox" style="display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;text-align:center;padding:20px;line-height:1.8">影片無法在此播放。<br><a href="${yt}" target="_blank" rel="noopener" style="color:#b39ddb">先在 YouTube 看這支影片</a></div>`;
  return embedBox(id)+vfb(yt);
}
function embedBox(id){return `<div class="vbox"><iframe src="https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&origin=${encodeURIComponent(location.origin)}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`}
function vfb(yt){return `<div class="vfb" style="font-size:12px;color:#5f6368;margin-top:6px">影片沒出現或顯示錯誤？<a href="${yt}" target="_blank" rel="noopener" style="color:#1a73e8">點這裡用 YouTube 開啟</a></div>`}
function hotpotHTML(){
  if(!CONFIG.hotpotFile)return embed(CONFIG.hotpotId);
  return `<div class="vbox" id="hpBox"><video src="${CONFIG.hotpotFile}" playsinline webkit-playsinline controls autoplay preload="auto" style="position:absolute;inset:0;width:100%;height:100%;background:#000"></video></div>`;
}
function hotpotFallback(){const b=$('#hpBox');if(!b)return;const v=b.querySelector('video');
  v.addEventListener('error',()=>{b.outerHTML=embed(CONFIG.hotpotId)});
  const p=v.play();if(p&&p.catch)p.catch(()=>{});}

// 手機（尤其 IG / Threads 內建瀏覽器）只允許「手指直接點在 YouTube 播放器上」才有聲播放，
// 從外面呼叫 playVideo() 會被擋成靜音。所以做法是：影片先在背景載好，
// 再用幾乎透明的方式疊在「其他」選項 / 影片封面上（ytArm），使用者以為點的是選項，其實點到 YouTube 播放器，
// 偵測到開始播放（onStateChange）後再把播放器現形（ytReveal）。
let ytReady=false;const ytQ=[];const YTP={},YTW={},YTS={},YTCB={},YTA={},YTID={};
function loadYT(){
  if(window.YT&&YT.Player){ytReady=true;return}if(loadYT.started)return;loadYT.started=true;
  window.onYouTubeIframeAPIReady=()=>{ytReady=true;ytQ.splice(0).forEach(f=>f())};
  const t=document.createElement('script');t.src='https://www.youtube.com/iframe_api';document.head.appendChild(t);
}
function ytPreload(key,id,place,onPlay){
  YTCB[key]=onPlay;
  if(location.protocol==='file:'||document.getElementById(key+'Wrap'))return;
  place(`<div class="vbox vhide" id="${key}Wrap"><div id="${key}Player"></div></div>`);
  YTP[key]=null;YTW[key]=false;YTS[key]=false;YTID[key]=id;loadYT();
  const go=()=>{if(!document.getElementById(key+'Player'))return;
    new YT.Player(key+'Player',{videoId:id,playerVars:{playsinline:1,rel:0,origin:location.origin},
      // YouTube 會把「靜音」狀態記在手機裡（之前的靜音備案呼叫過 mute() 就會一直被記住），所以載好時先強制解除靜音
      events:{onReady:e=>{YTP[key]=e.target;try{e.target.unMute();e.target.setVolume(100)}catch(x){}
          if(YTW[key])ytStart(key);else ytPlace(key)},
        onStateChange:e=>{
          if(e.data===1){try{if(e.target.isMuted()){e.target.unMute();e.target.setVolume(100)}}catch(x){}}
          if((e.data===1||e.data===3)&&!YTS[key]){YTS[key]=true;YTCB[key]&&YTCB[key]()}}}})};
  ytReady?go():ytQ.push(go);
}
// 把隱形播放器疊到 target 上。mode 'cover'：播放器放大 1.6 倍蓋住封面（把 YouTube 標題列、logo 等會跳轉的地方裁掉）；
// mode 'small'：480x270 的播放器中心對準小小的選項列。
function ytArm(key,card,getTarget,mode){
  const old=YTA[key];if(old&&old.ro)old.ro.disconnect();
  const a=YTA[key]={card,getTarget,mode};
  if(window.ResizeObserver){a.ro=new ResizeObserver(()=>ytPlace(key));a.ro.observe(card)}
  ytPlace(key);
}
function ytPlace(key){
  const a=YTA[key],w=document.getElementById(key+'Wrap');if(!a||!w||YTS[key])return;
  const t=a.getTarget(),f=w.querySelector('iframe');
  if(!t||!f||!YTP[key]||!document.body.contains(t)){w.className='vbox vhide';w.removeAttribute('style');return}
  const c=a.card,cr=c.getBoundingClientRect(),r=t.getBoundingClientRect();
  w.className='yarm';
  Object.assign(w.style,{left:r.left-cr.left-c.clientLeft+'px',top:r.top-cr.top-c.clientTop+'px',width:r.width+'px',height:r.height+'px'});
  const fw=a.mode==='cover'?r.width*1.6:480,fh=a.mode==='cover'?r.height*1.6:270;
  Object.assign(f.style,{width:fw+'px',height:fh+'px',left:(r.width-fw)/2+'px',top:(r.height-fh)/2+'px'});
}
addEventListener('resize',()=>Object.keys(YTA).forEach(ytPlace));
function ytReveal(key){
  const w=document.getElementById(key+'Wrap');const a=YTA[key];if(a&&a.ro)a.ro.disconnect();delete YTA[key];
  if(!w)return;w.className='vbox';w.removeAttribute('style');const f=w.querySelector('iframe');if(f)f.removeAttribute('style');
  const n=w.nextElementSibling;if(!(n&&n.classList.contains('vfb')))w.insertAdjacentHTML('afterend',vfb(`https://www.youtube.com/watch?v=${YTID[key]}`));
}
function ytStart(key){
  const p=YTP[key];YTW[key]=false;
  try{p.unMute();p.playVideo()}catch(e){return}
  // 瀏覽器擋住播放的話不改成靜音（mute 會被 YouTube 記住、害之後都沒聲音），改提示使用者自己點影片
  setTimeout(()=>{try{const s=p.getPlayerState();if(s===-1||s===5)toast('▶ 點一下影片播放')}catch(e){}},1500);
}
// 備用路線：播放器還沒載好、點擊落在底下的選項/封面時才會走這裡（可能被擋成靜音）
function ytShow(key,id,fallback){
  YTS[key]=true;
  const w=document.getElementById(key+'Wrap');
  if(!w){fallback(embed(id));return}
  ytReveal(key);
  if(YTP[key])return ytStart(key);
  YTW[key]=true;
  setTimeout(()=>{if(YTP[key]||!document.body.contains(w))return;YTW[key]=false;w.outerHTML=embedBox(id)},5000);
}
function rickTarget(card){return card.querySelector(`.opt[data-k="${Q.j3.opts.length-1}"]`)}
function preloadRick(card){
  if(stats.rolled)return;
  ytPreload('rick',CONFIG.rickId,h=>card.querySelector('.opts').insertAdjacentHTML('afterend',h),()=>{ytReveal('rick');rickRolled(card)});
  if(!extras.length)ytArm('rick',card,()=>rickTarget(card),'small');
}
function rickRolled(card){
  const q=Q.j3,other=q.opts.length-1;stats.rolled=true;
  q.opts[other]='其他（你已經知道會發生什麼了）';const s=card.querySelector(`.opt[data-k="${other}"] span`);if(s)s.textContent=q.opts[other];
  mark('spawn','RICK',7,`受試者連續點擊「其他」共 ${stats.spawn+1} 次，這顯示其好奇心強過警覺心，明知道可能有詐還是要點開，最終被導向一段 1987 年的音樂錄影帶。`);
}
function playRick(card){
  ytShow('rick',CONFIG.rickId,h=>card.querySelector('.opts').insertAdjacentHTML('afterend',h));
}
function hotStarted(){const th=$('#thumb');stopAll();ytReveal('hot');if(th)th.remove();hotDone()}
function hotDone(){
  stats.vidPlayed=true;
  const vc=$('#q_vid');if(vc){warn(vc,'vid','');if(ans.vid!==undefined)picks.vid(ans.vid,vc,null,null,true)}
  mark('vid','RICK',1,'受試者主動點擊來路不明的「研究說明影片」，並觀看了一名男子端著一大鍋食物的過程。這顯示其對來路不明的內容幾乎不設防，看了也不問為什麼。');
}

const FROG={shown:0,caught:0,seen:{},off:false,t:[]};
function frogPeek(){
  FROG.t.forEach(clearTimeout);FROG.t=[];frogHide();
  // 人機驗證那頁：驗證完成前奶蛙不出現（驗證完才探頭）
  if(page<2||FROG.seen[page]||FROG.off||(page===CAP_PG&&!stats.cap))return;const my=page;
  FROG.t.push(setTimeout(()=>{if(page!==my||FROG.off||FROG.seen[page])return;
    FROG.seen[page]=true;
    const edges=['bottom','top','left','right'].filter(e=>e!==FROG.last),edge=edges[Math.random()*edges.length|0];FROG.last=edge;
    const w=Math.max(34,Math.round(120*Math.pow(.78,FROG.shown))),h=w*2;
    const vw=innerWidth,vh=innerHeight;let pos,rot,flip;
    if(edge==='bottom'||edge==='top'){const x=12+Math.random()*(vw-w-24);pos=`${edge}:0;left:${x}px`;rot=edge==='top'?180:0;flip=edge==='bottom'?x<vw/2:x>vw/2}
    else{const y=60+Math.random()*Math.max(0,vh-h-120);pos=`${edge}:${w/2}px;top:${y}px`;rot=edge==='left'?90:-90;flip=Math.random()<.5}
    const base=`rotate(${rot}deg) ${flip?'scaleX(-1) ':''}`;
    const f=$('#frog');f.src=FROG_IMG.peek;
    f.style.cssText=`display:block;width:${w}px;height:${h}px;${pos};transition:none;transform:${base}translateY(110%)`;
    f.dataset.base=base;FROG.shown++;FROG.live=true;void f.offsetWidth;
    f.style.transition='';f.style.transform=`${base}translateY(58%)`;
    FROG.t.push(setTimeout(frogHide,3200));
  },700+Math.random()*1500));
}
function frogHide(){const f=$('#frog');if(!FROG.live)return;FROG.live=false;f.style.transform=`${f.dataset.base}translateY(110%)`}
$('#frog').addEventListener('pointerdown',e=>{e.preventDefault();if(!FROG.live)return;FROG.live=false;FROG.caught++;play('frog');
  const f=$('#frog');f.style.transition='transform .25s ease-in';f.style.transform=`${f.dataset.base}translateY(58%) scale(0)`;});
