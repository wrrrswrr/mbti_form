// 特殊題型：聽力題、限時心算題、人機驗證、檔案上傳、會跑的選項
// ===== 聽力題（奇諾比奧唱歌）=====
// 只算「真的在播」的秒數（拖進度條跳過的不算），暫停或播完才出評語，播放中不爆雷
const AU={el:null,last:0,src:'sounds/chinopio.mp3'};
const mmss=s=>isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'--:--';
function auEl(){
  if(AU.el)return AU.el;
  const el=AU.el=new Audio(AU.src);el.preload='metadata';
  const ui=()=>{const c=$('#q_au');if(!c)return;
    const pp=c.querySelector('.pp'),on=!el.paused;
    if(pp.classList.contains('on')!==on){pp.classList.toggle('on',on);pp.innerHTML=ic(on?'pause':'play',24,'#fff');pp.setAttribute('aria-label',on?'暫停':'播放')}
    c.querySelector('.bar i').style.width=(el.duration?el.currentTime/el.duration*100:0)+'%';
    c.querySelector('.tm').textContent=`${mmss(el.currentTime)} / ${mmss(el.duration)}`};
  el.addEventListener('loadedmetadata',ui);
  el.addEventListener('timeupdate',()=>{
    const t=el.currentTime,d=t-AU.last;AU.last=t;
    if(!el.paused&&d>0&&d<1.5){const b=stats.auSec||0;stats.auSec=b+d;
      if(b<20&&stats.auSec>=20)toast('你已經撐過 20 秒了')}
    ui()});
  el.addEventListener('seeked',()=>{AU.last=el.currentTime});
  el.addEventListener('play',()=>{stopAll();stats.auPlays=(stats.auPlays||0)+1;AU.last=el.currentTime;const n=$('#q_au .aun');if(n)n.remove();const c=$('#q_au');if(c)warn(c,'au','');ui()});
  el.addEventListener('pause',()=>{ui();auAfter()});
  el.addEventListener('ended',()=>{stats.auEnds=(stats.auEnds||0)+1;ui()});  // ended 之後瀏覽器也會觸發 pause
  return el;
}
function auBind(card){
  const el=auEl();
  card.querySelector('.pp').onclick=()=>{el.paused?el.play().catch(()=>toast('音檔播放失敗，請再點一次')):el.pause()};
  card.querySelector('.bar').onclick=e=>{if(!el.duration)return;const r=e.currentTarget.getBoundingClientRect();el.currentTime=(e.clientX-r.left)/r.width*el.duration};
  card.querySelector('.tm').textContent=`${mmss(el.currentTime)} / ${mmss(el.duration)}`;
  card.querySelector('.bar i').style.width=(el.duration?el.currentTime/el.duration*100:0)+'%';
  auNote(card);
}
function auComment(){
  const s=Math.round(stats.auSec||0),e=stats.auEnds||0,st=s<1?'不到 1':s;
  if(e>=2)return `你已經把整首聽了 ${e} 遍。奇諾比奧非常感動，但研究小組有點擔心你。`;
  if(e===1)return `你把整首聽完了（共 ${st} 秒）。奇諾比奧想邀請你參加他的巡迴演唱會，擔任唯一的觀眾。`;
  if(s>=20)return `你聽了 ${st} 秒。你的耳朵很強，研究小組建議你去當歌唱選秀評審。`;
  if(s>=10)return `你聽了 ${st} 秒。撐過了前奏，但沒撐過接下來的部分。你的耳朵正在考慮要不要原諒你。`;
  return `你只聽了 ${st} 秒就按下暫停。看來你不太喜歡奇諾比奧的歌聲。`;
}
function auNote(card){
  if(!card||!stats.auSec)return;let n=card.querySelector('.aun');
  if(!n){card.querySelector('.auc').insertAdjacentHTML('afterend','<div class="aun"></div>');n=card.querySelector('.aun')}
  n.innerHTML=ic('headset',16)+' '+esc(auComment());
}
// 暫停/播完：出評語、記結果、清掉「沒播放」的警告
function auAfter(){
  const c=$('#q_au');auMark();
  if(c){auNote(c);if(ans.au!==undefined)picks.au(ans.au,c)}
}
function auMark(){
  const s=Math.round(stats.auSec||0),e=stats.auEnds||0,st=s<1?'不到 1':s;if(!stats.auSec)return mark('au');
  if(e>=2)return mark('au','MEME',4,`受試者將聽力測驗音檔重複播放 ${e} 遍。經研究小組確認，該音檔內容為奇諾比奧的歌聲。研究小組無法理解，但選擇尊重。`);
  if(e===1)return mark('au','SIMP',4,`受試者完整聆聽了奇諾比奧的演唱，全程未按下暫停。研究小組判定其具備超越常人的包容力，或是忘記手機還開著。`);
  if(s>=20)return mark('au','CHAD',3,`受試者在奇諾比奧的歌聲中撐過 ${st} 秒，耳朵強度顯著高於常模。研究小組成員實測平均僅撐 6 秒。`);
  if(s>=10)return mark('au','OKAY',2,`受試者聆聽奇諾比奧的歌聲 ${st} 秒後選擇停止，屬於「我有給過機會了」的成熟反應。`);
  mark('au','SALT',2,`受試者僅聆聽 ${st} 秒即按下暫停，對奇諾比奧的歌聲表達了明確而迅速的拒絕。`);
}

// ===== 倒數題 =====
// 卡片完整出現在畫面上（或使用者先點了選項）才開始倒數；
// 使用者選什麼就刪什麼，時間到系統代選出題者自肥選項並鎖住（取消不了）
const CD={iv:null,start:null};
function countdown(card,q){
  CD.start=null;if(stats.cdDone)return;
  const num=card.querySelector('.cdn b'),bar=card.querySelector('.cdb i');let started=false;
  const start=()=>{if(started||stats.cdDone)return;started=true;io.disconnect();let left=q.timed;
    bar.style.transition=`width ${q.timed}s linear`;void bar.offsetWidth;bar.style.width='0';play('tick');
    clearInterval(CD.iv);CD.iv=setInterval(()=>{
      if(!document.body.contains(card)||stats.cdDone){clearInterval(CD.iv);return}
      left--;num.textContent=left;play('tick');if(left<=2)shake(card);
      if(left<=0){clearInterval(CD.iv);cdLock(card,q,false)}
    },1000)};
  CD.start=start;
  // 跟「桃園新竹」逐字稿那題一樣：卡片要完整出現在畫面上方 10%～下方 20% 之間（正常閱讀的位置），而且停住 1 秒才開始。
  // 一路滑到底、滑過去都不算；一離開就重新計時。卡片比那個範圍還高（小手機）的話，佔滿範圍也算。
  let tm;
  const io=new IntersectionObserver(es=>{
    const e=es[0];clearTimeout(tm);if(stats.cdDone||!document.body.contains(card))return io.disconnect();
    const full=e.intersectionRatio>=.99||(e.rootBounds&&e.intersectionRect.height>=e.rootBounds.height*.98);
    if(e.isIntersecting&&full)tm=setTimeout(start,1000);
  },{rootMargin:'-10% 0px -20% 0px',threshold:[...Array(51).keys()].map(i=>i/50).concat(.99)});
  io.observe(card);
}
const CD_DEL=['答錯了。系統已刪除此選項。','這個也不對，已刪除。','你還在算嗎？已刪除。','已刪除。研究小組開始擔心你了。'];
function cdPick(card,q,v){
  if(stats.cdAuto)return;
  if(CD.start)CD.start();
  if(v===q.weird)return cdLock(card,q,true);
  const del=stats.cdDel=stats.cdDel||[];del.push(v);delete ans.cd;
  const lab=card.querySelector(`.opt[data-k="${v}"]`);
  if(lab){lab.querySelector('input').checked=false;lab.style.pointerEvents='none';lab.classList.add('gone');setTimeout(()=>lab.remove(),350)}
  play('error');shake(card);
  warn(card,'cd',v===q.right?'這個是正確答案，但系統不想接受。已刪除。':CD_DEL[Math.min(del.length-1,CD_DEL.length-1)]);
}
function cdMark(q,self){
  const del=stats.cdDel||[],n=del.length,list=del.map(k=>`「${q.opts[k]}」`).join('、'),pick=`「${q.opts[q.weird]}」`;
  if(self)return mark('cd','SIMP',6,`在一題超難的心算題中，受試者${n?`先嘗試作答 ${n} 次（${list}）全部被刪除後，`:''}主動選擇了${pick}。研究小組認為這是本題唯一的正確答案，並已將其列入感謝名單。`);
  if(n>=2)return mark('cd','CHAD',4,`受試者在 5 秒內嘗試作答 ${n} 次（${list}），所有答案均被系統刪除${del.includes(q.right)?'，包括正確答案 7207':''}。最終由系統代為選擇${pick}，且無法取消。研究小組敬佩其毅力，也感謝其（被迫的）支持。`);
  if(n===1)return mark('cd','BRUH',3,`受試者在心算題中選了${list}，隨即被系統刪除，之後便放棄掙扎。系統已代為選擇${pick}，研究小組感謝其支持。`);
  mark('cd','LAZY',3,`受試者看到心算題後，連一個選項都沒有點，直接等待時間結束。系統已代為選擇${pick}。研究小組判斷其很清楚自己算不出來。`);
}
function cdLock(card,q,self){
  stats.cdDone=stats.cdAuto=true;stats.cdSelf=self;clearInterval(CD.iv);const w=q.weird;
  ans.cd=w;card.querySelectorAll('input').forEach(i=>{i.checked=+i.value===w;i.disabled=true});
  card.querySelectorAll('.opt').forEach(o=>o.classList.add('dis'));card.classList.remove('bad');
  const cw=card.querySelector('.cdw');if(cw)cw.remove();
  if(self){warn(card,'cd','感謝您的支持。此選項一經選擇，無法取消。');play('ding');toast('研究小組感謝你。')}
  else{warn(card,'cd','時間到，系統已代為作答。本題已鎖定，無法取消。');play('error');setTimeout(()=>play('vineboom'),300);shake(card);toast('系統已代為作答')}
  cdMark(q,self);save();
}

// ===== 假人機驗證（第六部分） =====
const CAP=[
  {k:'frog1',src:CAP_IMG.frog1,t:'frog'},
  {k:'frog2',src:CAP_IMG.frog2,t:'frog'},
  {k:'egg',src:CAP_IMG.egg,n:'奶蛋',m:'那是奶蛋。奶蛙沒有那麼圓，至少沒有圓成一顆蛋。'},
  {k:'dog',src:CAP_IMG.dog,n:'奶狗',m:'那是奶狗。四隻腳、有尾巴，而且牠正在笑你。'},
  {k:'bunny',src:CAP_IMG.bunny,n:'奶兔',m:'那是奶兔。耳朵那麼長，你也看得成奶蛙？'},
  {k:'chicken',src:CAP_IMG.chicken,n:'奶雞',m:'那是奶雞，頭上有雞冠。奶蛙沒有雞冠，奶蛙只有尊嚴。'},
  {k:'mouse',src:CAP_IMG.mouse,n:'奶鼠',m:'那是奶鼠。牠在跟你揮手，因為牠知道你選錯了。'},
  {k:'dragon',src:CAP_IMG.dragon,n:'奶龍',m:'那是奶龍。牠很紅，但牠不是奶蛙。'},
  {k:'puzz',src:CAP_IMG.puzz,t:'puzz',n:'Puzz'}
];
const CAPM=Object.fromEntries(CAP.map(c=>[c.k,c]));
function capOpen(card){
  const cb=card.querySelector('.cb');if(stats.cap||cb.classList.contains('spin')||$('#rcov'))return;
  cb.classList.add('spin');setTimeout(()=>{cb.classList.remove('spin');capChallenge(card)},900);
}
function capChallenge(card){
  if(!stats.capOrder){const o=CAP.map(c=>c.k);for(let i=o.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[o[i],o[j]]=[o[j],o[i]]}stats.capOrder=o}
  const sel=new Set(),ov=document.createElement('div');ov.id='rcov';
  ov.innerHTML=`<div class="rcw"><div class="rch">選出所有有<b>奶蛙</b>的圖片<br><span style="font-size:13px;opacity:.9">全部選好後，請按一下「驗證」。</span></div>
    <div class="rcg">${stats.capOrder.map(k=>`<div data-k="${k}"><img src="${CAPM[k].src}" alt="" draggable="false"></div>`).join('')}</div>
    <div class="rcm"></div>
    <div class="rcf"><span data-a="re" title="重新整理">${ic('refresh',24,'#757575')}</span><span data-a="au" title="音訊驗證">${ic('headset',24,'#757575')}</span><span data-a="in" title="說明">${ic('info',24,'#757575')}</span><button class="rcb" data-a="ok">驗證</button></div></div>`;
  document.body.appendChild(ov);
  const w=ov.querySelector('.rcw'),msg=ov.querySelector('.rcm');
  ov.onclick=e=>{
    const tile=e.target.closest('.rcg div');
    if(tile){const k=tile.dataset.k;sel.has(k)?sel.delete(k):sel.add(k);tile.classList.toggle('on');msg.textContent='';play('tick');return}
    const a=e.target.closest('[data-a]');if(!a)return;
    if(a.dataset.a==='re'){shake(w);toast('圖片不會換的。奶蛙就在裡面，你只是不想面對。')}
    else if(a.dataset.a==='au')play('frog');
    else if(a.dataset.a==='in')toast('提示：奶蛙是黃色的，眼睛是綠色的。（好像沒什麼幫助）');
    else if(a.dataset.a==='ok'){
      if(!sel.size){msg.textContent='請選取所有符合的圖片。';shake(w);play('error');return}
      capResult(card,ov,[...sel]);
    }
  };
}
// 判定：選對放行；選到奶蛙家族嘲諷後放行；選到 Puzz 說一段肉麻台詞後放行
function capJudge(sel){
  const frogs=sel.filter(k=>CAPM[k].t==='frog').length,wrong=sel.filter(k=>!CAPM[k].t),puzz=sel.includes('puzz');
  return {sel,frogs,wrong,puzz};
}
function capSum(c){
  if(!c)return '未進行';const j=capJudge(c.sel),names=j.wrong.map(k=>CAPM[k].n).join('、');
  if(j.puzz)return `通過（選了 Puzz，與本節目緣分深厚，直接放行）${names?`，另誤認${names}`:''}`;
  if(j.wrong.length)return `通過（將${names}誤認為奶蛙，嘲諷後放行）`;
  return j.frogs===2?'通過（2 / 2 全對）':`通過（只找到 ${j.frogs} / 2 隻奶蛙）`;
}
function capResult(card,ov,sel){
  const j=capJudge(sel),names=j.wrong.map(k=>CAPM[k].n).join('、');
  let img,title,lines;
  if(j.puzz){img=CAPM.puzz.src;title='……原來是你。';play('congcong');
    lines=['Puzz 不是奶蛙。','但在九張圖裡，你的手指自己找到了牠。',`這不是眼花，這是緣分。你和《${CONFIG.showName}》之間，有一條看不見、但非常粗的線。`,'系統不需要再確認你是不是人類了。你是自己人。','驗證通過。歡迎回家。'].concat(j.wrong.length?[`（至於${names}……今天就當作沒看到。）`]:[]);
    mark('cap','SIMP',5,`受試者在人機驗證中被要求選出所有奶蛙，卻選了本節目吉祥物 Puzz${names?`（以及${names}）`:''}。研究小組判定其與本節目之間存在深厚的羈絆，予以放行，並在會議上為此沉默了十秒。`)}
  else if(j.wrong.length){img=CAPM[j.wrong[0]].src;title='……好啦，驗證通過';play('bruh');
    lines=j.wrong.slice(0,3).map(k=>CAPM[k].m).concat(['研究小組判定你分不清奶蛙家族。但機器人不會錯得這麼有創意，所以你是人類，放行。']);
    mark('cap','BRUH',3,`受試者在人機驗證中將${names}誤認為奶蛙。研究小組確認其為人類，因為機器人不會錯得這麼有創意。`)}
  else if(j.frogs===2){img=CAPM.frog2.src;title='驗證成功';play('ding');
    lines=['你正確找出了全部的奶蛙。','研究小組確認你是人類，而且是很閒的那種。'];
    mark('cap','NERD',3,'受試者在人機驗證中精準辨識出全部 2 隻奶蛙，且未誤選任何奶蛙家族成員。研究小組懷疑其私下研究過奶蛙族譜。')}
  else{img=CAPM.frog1.src;title='驗證通過';play('ding');
    lines=['你只找到 1 隻奶蛙。','另一隻奶蛙表示很受傷，但還是讓你過了。'];
    mark('cap','LAZY',2,'受試者在人機驗證中只選了 1 隻奶蛙就按下驗證，另一隻被晾在一旁。研究小組判斷其屬於「差不多就好」派。')}
  ov.querySelector('.rcw').innerHTML=`<div class="rcr"><img src="${img}" alt=""><div class="rt">${title}</div>${lines.map(l=>`<p>${l}</p>`).join('')}<button class="rcb" data-a="done">繼續作答</button></div>`;
  ov.onclick=e=>{if(!e.target.closest('[data-a="done"]'))return;
    ov.remove();stats.cap={sel};ans.cap=1;
    const cb=card.querySelector('.cb');cb.classList.add('ok');card.querySelector('#rcl span').textContent='驗證完成';card.classList.remove('bad');
    save();frogPeek();  // 驗證結束，奶蛙才出來
  };
}
function capCard(){
  const c=stats.cap;if(!c||!stats.capOrder)return '';
  const tile=k=>{const on=c.sel.includes(k),t=CAPM[k].t;
    const [cls,b]=on?(t==='frog'?['g',ic('check',14,'#188038')]:t==='puzz'?['p',ic('heart',14,'#9334e6')]:['x',ic('close',14,'#d93025')]):(t==='frog'?['m','漏']:['','']);
    return `<div class="${cls}"><img src="${CAPM[k].src}" alt="">${b?`<b>${b}</b>`:''}</div>`};
  return `<div class="card" id="capc"><div class="rt">人機驗證紀錄</div><div class="rs">題目：選出所有有奶蛙的圖片・您的作答如下</div>
    <div class="capr">${stats.capOrder.map(tile).join('')}</div>
    <div class="rs" style="margin:0">綠框＝選對・紅框＝選錯・紫框＝Puzz・黃虛線＝漏選</div>
    <p class="rp" style="margin-top:10px">判定結果：${capSum(c)}</p></div>`;
}
// ===== 檔案上傳題（第二部分）=====
// 外觀照抄 Google 表單的「新增檔案」＋檔案挑選視窗。真的檔案一律拒收（不讀取內容、不會上傳到任何地方），
// 只能從「我的雲端硬碟」挑研究小組準備好的四張圖。e：換算成 E/I 計分用的 1～5 分
const UP=[
  {k:'frog1',f:'IMG_聚會_你看那個人.jpg',n:'奶蛙',type:'SALT',pts:3,e:3,snd:'frog',
    msg:'鑑定結果：照片中的人物沒有在參與聚會，而是一臉得意地指著畫面外的某個人。研究小組推測他正在說「欸你看那個人穿那樣」。',
    ana:'受試者上傳的聚會照片中，人物正一臉得意地指著畫面外的某人。研究小組判斷其在聚會中的主要功能為「負責講別人八卦」，次要功能為「負責笑」。'},
  {k:'egg',f:'IMG_聚會_我在這.png',n:'奶蛋',type:'SOLO',pts:4,e:1,snd:'boing',
    msg:'鑑定結果：照片中的人物已將自己縮成一顆蛋，眼神放空，沒有手、沒有腳，也沒有參與任何對話。研究小組推測他正在腦中規劃回家的路線。',
    ana:'受試者以一顆眼神放空的奶蛋作為自己在聚會上的照片。研究小組確認其在多人場合會自動進入「蛋形態」，直到回家才孵化。'},
  {k:'dragon',f:'IMG_聚會_大家都到了嗎.jpg',n:'奶龍',type:'LOUD',pts:4,e:5,snd:'vineboom',
    msg:'鑑定結果：照片中的人物笑得非常燦爛，正熱情地對鏡頭揮手。但研究小組仔細檢查後發現，背景是一片空白——這場聚會只有他一個人。',
    ana:'受試者上傳的聚會照片為一隻熱情揮手的奶龍，但畫面中沒有任何其他人。研究小組判斷其社交熱情極高，只是其他人還沒到（或不會來）。'},
  {k:'puzz',f:'puzz_官方授權照.jpg',n:'Puzz',type:'SIMP',pts:6,e:3,snd:'congcong',
    msg:'鑑定結果：研究小組三位成員看到這張照片後，同時放下了手上的便當。<br>四張照片，你選了 Puzz。不是奶蛙，不是奶蛋，是 Puzz。<br>我們熬夜做這份問卷的每一個晚上，在這一秒突然都有了意義。<br>謝謝你，我的超人。',
    ana:'受試者被要求上傳自己在聚會上的照片，卻選了本節目吉祥物 Puzz。研究小組三位成員當場放下便當，其中一位哭到隱形眼鏡掉出來。該照片（Puzz 的）已被列印出來，貼在剪輯電腦的螢幕旁邊。'}
];
const PUZZ_BACK=['……你把 Puzz 撤回了。研究小組三位成員默默把便當拿了回來。我們以為你是自己人。','又撤回？Puzz 本人看到了，現在正一個人坐在角落拼一塊永遠拼不上的拼圖。','好，我們懂了。你只是想看我們難過。你成功了。'];
function upRefresh(card,q){
  if(!document.body.contains(card))return;
  const d=document.createElement('div');d.innerHTML=qHTML(q);const n=d.firstElementChild;card.replaceWith(n);upBind(n,q);return n;
}
function upBind(card,q){
  const b=card.querySelector('.upb');if(b)b.onclick=()=>upOpen(card,q);
  const x=card.querySelector('.upx');if(x)x.onclick=()=>{
    const u=UP[ans.up];delete ans.up;mark('up');(HIST.up=HIST.up||[]).push('移除'+(u?u.n:''));
    if(stats.usr)delete stats.usr.up;
    if(u&&u.k==='puzz'){
      // 撤回 Puzz：研究小組很受傷
      stats.puzzBack=(stats.puzzBack||0)+1;play('sadviolin');
      const n=upRefresh(card,q);if(n){warn(n,'upb',PUZZ_BACK[Math.min(stats.puzzBack,PUZZ_BACK.length)-1]);shake(n)}
      mark('upBack','SALT',3+stats.puzzBack,stats.puzzBack>1
        ?`受試者上傳了 Puzz，又親手撤回，而且這樣做了 ${stats.puzzBack} 次。研究小組三位成員的便當放下又拿起、拿起又放下，最後誰都沒吃。`
        :'受試者上傳了 Puzz，又親手把 Puzz 撤了回去。研究小組三位成員默默把便當拿了回來，吃得非常安靜。');
      save();return}
    play('tick');upRefresh(card,q);save()};
}
function upOpen(card,q){
  if($('#upov'))return;
  let tab='up',sel=null;
  const ov=document.createElement('div');ov.id='upov';document.body.appendChild(ov);document.body.style.overflow='hidden';
  ov.innerHTML=`<div class="upw" role="dialog" aria-label="插入檔案"><div class="uph"><span>插入檔案</span><button class="upx" data-u="x" aria-label="關閉">${ic('close',22,'#5f6368')}</button></div>
    <div class="uptabs"><span data-t="up" class="on">上傳</span><span data-t="drive">我的雲端硬碟</span><span data-t="recent">最近使用</span></div>
    <div class="upbody"></div>
    <div class="upf"><span class="upsel"></span><button class="gbtn t" data-u="x">取消</button><button class="gbtn" data-u="ins" disabled>插入</button></div></div>`;
  const body=ov.querySelector('.upbody'),ins=ov.querySelector('[data-u="ins"]'),info=ov.querySelector('.upsel');
  const close=()=>{ov.remove();document.body.style.overflow=''};
  const pick=i=>{sel=i;ins.disabled=false;info.textContent='已選取：'+UP[i].f;play('tick')};
  const grid=()=>`<div class="upg">${UP.map((u,i)=>`<div data-i="${i}" class="${sel===i?'on':''}"><img src="${CAP_IMG[u.k]}" alt="" draggable="false"><small>${u.f}</small></div>`).join('')}</div>`;
  const show=t=>{tab=t;ov.querySelectorAll('.uptabs span').forEach(s=>s.classList.toggle('on',s.dataset.t===t));
    if(t==='up'){
      // 「瀏覽」打開的是假的相簿（fakeLib），不是手機真正的檔案選擇器；拖曳進來的檔案也只是擋掉，完全不讀取
      body.innerHTML=sel!==null&&tab==='up'&&body.dataset.dev==='1'
        ?`<div class="upbc">已從裝置選取 1 個檔案</div><div class="upc"><img src="${CAP_IMG[UP[sel].k]}" alt=""><div class="nm">${UP[sel].f}</div><button class="upbr" data-u="browse" style="padding:6px 14px">重選</button></div>`
        :`<div class="updz">${ic('image',56,'#bdc1c6')}<div>將檔案拖曳到這裡</div><div class="or">或</div><button class="upbr" data-u="browse">瀏覽</button></div>`;
      const dz=body.querySelector('.updz');
      if(dz){dz.ondragover=e=>{e.preventDefault();dz.classList.add('over')};dz.ondragleave=()=>dz.classList.remove('over');
        dz.ondrop=e=>{e.preventDefault();dz.classList.remove('over');play('error');shake(dz);toast('拖曳功能目前僅開放給研究小組成員。請按「瀏覽」。')}}}
    else body.innerHTML=(t==='drive'?`<div class="upbc">我的雲端硬碟 › <b>研究小組核可的照片</b></div>`:`<div class="upbc">最近使用（你最近用的都是這幾張，對吧？）</div>`)+grid()};
  ov.onclick=e=>{
    if(e.target===ov)return close();
    const tb=e.target.closest('[data-t]');if(tb)return show(tb.dataset.t);
    const tile=e.target.closest('.upg div');
    if(tile){pick(+tile.dataset.i);body.dataset.dev='';body.querySelectorAll('.upg div').forEach(d=>d.classList.toggle('on',+d.dataset.i===sel));return}
    const a=e.target.closest('[data-u]');if(!a)return;
    if(a.dataset.u==='x')close();
    else if(a.dataset.u==='browse')fakeLib(i=>{pick(i);body.dataset.dev='1';show('up')});
    else if(a.dataset.u==='ins'&&sel!==null){close();upSend(card,q,sel)}
  };
  // 跟真的檔案挑選器一樣，先轉一下載入中再出現內容
  body.innerHTML='<div class="upld"><i></i>載入中…</div>';
  setTimeout(()=>{if(document.body.contains(ov)&&body.querySelector('.upld'))show('up')},650);
}
// 假的手機相簿：從畫面底部滑上來，只有四張照片，其他照片「已被研究小組隱藏」
function fakeLib(done){
  let s=null,view='ph';
  const ov=document.createElement('div');ov.id='fsov';document.body.appendChild(ov);
  ov.innerHTML=`<div class="fs" role="dialog" aria-label="選擇照片"><div class="fsh"><button data-f="x">取消</button><b>選擇照片</b><button data-f="ok" disabled>完成</button></div>
    <div class="fsseg"><span data-s="ph">照片</span><span data-s="al">相簿</span></div><div class="fsb"></div></div>`;
  const b=ov.querySelector('.fsb'),ok=ov.querySelector('[data-f="ok"]');
  const AL=[['最近項目',4],['研究小組精選',4],['自拍',0,'已隱藏'],['截圖',0,'已隱藏'],['聚會',0,'你沒有去過聚會'],['美食',0,'研究小組肚子餓，先吃掉了'],['黑歷史',0,'研究小組已備份','「黑歷史」相簿是空的，因為研究小組已經全部備份帶走了。需要贖回請私訊我們的 IG。']];
  const draw=()=>{ov.querySelectorAll('.fsseg span').forEach(x=>x.classList.toggle('on',x.dataset.s===view));
    b.innerHTML=view==='ph'
      ?`<div class="fsg">${UP.map((u,i)=>`<div data-i="${i}" class="${s===i?'on':''}"><img src="${CAP_IMG[u.k]}" alt="" draggable="false"></div>`).join('')}</div>
        <p class="fsn">共 4 張照片<br>其餘 2,847 張照片已被研究小組判定為「不適合出現在聚會照片中」，並自動隱藏。</p>`
      :AL.map(([n,c,t],i)=>`<div class="fsa" data-a="${i}"><img src="${c?CAP_IMG[UP[i%4].k]:''}" alt=""${c?'':' style="visibility:hidden"'}><div><b>${n}</b><small>${c}${t?`・${t}`:''}</small></div></div>`).join('')};
  ov.onclick=e=>{
    if(e.target===ov){ov.remove();return}
    const f=e.target.closest('[data-f]');
    if(f){if(f.dataset.f==='x')ov.remove();else if(s!==null){ov.remove();done(s)}return}
    const sg=e.target.closest('[data-s]');if(sg){view=sg.dataset.s;draw();return}
    const al=e.target.closest('[data-a]');
    if(al){const [n,c,,msg]=AL[+al.dataset.a];if(c){view='ph';draw()}else{play('bruh');toast(msg||`「${n}」相簿是空的。研究小組已經幫你處理掉了。`)}return}
    const t=e.target.closest('.fsg div');if(t){s=+t.dataset.i;ok.disabled=false;play('tick');draw()}
  };
  draw();
}
// 假上傳：進度條 → 研究小組鑑定中 → 完成
function upSend(card,q,i){
  const u=UP[i],box=card.querySelector('.upb');if(!box)return;
  box.outerHTML=`<div class="upc"><img src="${CAP_IMG[u.k]}" alt=""><div style="flex:1;min-width:0"><div class="nm">${u.f}</div><div class="upbar"><i></i></div><small class="ups">上傳中…</small></div></div>`;
  const bar=card.querySelector('.upbar i'),st=card.querySelector('.ups');
  requestAnimationFrame(()=>requestAnimationFrame(()=>bar.style.width='100%'));
  setTimeout(()=>{if(st)st.textContent='研究小組鑑定中…（三個人正在輪流看）'},1300);
  setTimeout(()=>{
    ans.up=i;(stats.usr=stats.usr||{}).up=i;(HIST.up=HIST.up||[]).push(u.n);
    mark('up',u.type,u.pts,u.ana);play(u.snd);
    const n=upRefresh(card,q);if(n)n.classList.remove('bad');save();
  },2300);
}
function dodger(card,q,k,stat,finalText,onMove){
  const lab=card.querySelector(`.opt[data-k="${k}"]`);if(stats[stat]>=5)return;
  let last=0;
  const move=e=>{if(stats[stat]>=5)return;if(e)e.preventDefault();if(Date.now()-last<400)return;last=Date.now();stats[stat]++;
    const w=Math.min(220,card.clientWidth/2-40);
    lab.style.transform=`translate(${Math.random()*w}px,${(Math.random()*2-1)*45}px)`;play('boing');onMove(stats[stat]);
    if(stats[stat]>=5)setTimeout(()=>{lab.style.transform='';q.opts[k]=finalText;lab.querySelector('span').textContent=finalText;play('vineboom');shake(card)},450)};
  lab.addEventListener('mouseenter',()=>move());
  lab.addEventListener('click',e=>{if(stats[stat]<5)move(e)});
}

