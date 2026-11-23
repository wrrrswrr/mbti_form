// 結果頁卡片：推薦清單、下載結果圖、爛梗依賴、追蹤情勒、作答軌跡
// ===== 結果頁：推薦 + 下載結果圖 =====
let RES=null;
if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.roundRect)
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r,w/2,h/2);this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath()};
// 「和你同類型的人也喜歡」前兩項依類型不同，第三項固定是追蹤 IG（把追蹤藏在笑點裡）
const REC={
  BRUH:[['tv','面無表情看完整部喜劇'],['chat','在心裡發彈幕']],
  SIMP:[['heart','幫喜歡的人按每一則限動愛心'],['gift','偷偷記住別人說過想要的東西']],
  SALT:[['chat','在留言區跟陌生人吵架'],['edit','說「我只是陳述事實」']],
  DAMN:[['chat','在別人問「唱得怎樣」時說實話'],['mute','講完才發現全場安靜']],
  CHAD:[['star','夾娃娃夾到保夾'],['refresh','輸了說「再一場」']],
  LIAR:[['edit','每天換一個自我介紹'],['link','在平行時空裡過得很好']],
  LAZY:[['bed','鬧鐘響了按五次貪睡'],['clock','把待辦清單延到明天']],
  SHIT:[['phone','在廁所滑手機半小時'],['bulb','坐在馬桶上想通人生']],
  SOLO:[['chat','已讀不回'],['mute','把所有群組設成靜音']],
  MEME:[['phone','一句話回三張梗圖'],['music','腦中無限循環洗腦神曲']],
  RICK:[['link','點開來路不明的連結'],['music','被騙之後轉傳給朋友']],
  LOUD:[['mega','凌晨在群組問「有人醒著嗎」'],['mic','在 KTV 霸佔麥克風']],
  NERD:[['edit','把筆記分成五種顏色'],['clock','死線前三天就交作業']],
  OKAY:[['check','說「都可以」然後真的都可以'],['chat','吵架最後說「好啦是我的錯」']],
  OOPS:[['moon','半夜想起三年前的尷尬事'],['users','合照站在最邊邊']],
  FOOD:[['food','凌晨三點吃泡麵'],['fridge','每小時打開一次冰箱']],
  BOTS:[['robot','每一題都選 A'],['check','回訊息只回「好的，收到」']],
  SPED:[['ff','影片開兩倍速看'],['help','回別人「蛤？剛剛說什麼？」']],
  PUZZ:[['heart','在九張圖裡一眼找到 Puzz'],['star','把 Puzz 設成手機桌布']]
};
function recHTML(type){
  const h=[...type].reduce((s,c)=>s*31+c.charCodeAt(0),7),pct=i=>60+((h>>(i*3))&31);
  const [[ia,a],[ib,b]]=REC[type]||REC.BRUH;
  const items=[[ia,a,`${pct(0)}% 的 ${type} 型每週至少做一次`,null],
    [ib,b,`${type} 型受試者收藏次數最高`,null],
    ['follow','追蹤我們的 IG',`${esc(CONFIG.igHandle)}・救救可憐的大學生，期末報告就靠你了`,CONFIG.igUrl]];
  return items.map(([icn,nm,ds,url],i)=>{
    const inner=`<div class="ic">${ic(icn,22)}</div><div><div class="nm">${nm}</div><div class="ds">${ds}</div></div><div class="lk">${pct(i+1)}% 好評</div>`;
    return url?`<a class="rec" href="${url}" target="_blank" rel="noopener">${inner}</a>`:`<div class="rec">${inner}</div>`}).join('');
}
// 結果摘要跟下載圖共用的文字，兩邊才不會對不起來
function doneAt(){const d=new Date(stats.testLate||stats.t1||Date.now());return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`}
// 奶蛙從第 3 頁開始每頁探頭一次，總共 N-2 = 6 次；翻太快沒看到的也算漏抓
function frogTxt(){const ft=N-2,fc=Math.min(FROG.caught,ft);return `${fc} / ${ft} 次${fc===ft?'（全數捕獲）':!fc?'（一次都沒抓到）':''}`}
// 用 canvas 畫一張「Google 表單風格」的結果圖
function drawResult(){
  const {r,T,nick,rare,late}=RES,W=1080,P=60,CW=W-P*2,IN=56,F='"Noto Sans TC","PingFang TC","Microsoft JhengHei",Roboto,Arial,sans-serif';
  const raw=s=>String(s).replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  const A=document.createElement('canvas');A.width=W;A.height=2600;const x=A.getContext('2d');
  const font=(s,w=400)=>x.font=`${w} ${s}px ${F}`;
  const wrap=(t,max)=>{const out=[];let l='';for(const ch of t){if(x.measureText(l+ch).width>max&&l){out.push(l);l=ch}else l+=ch}if(l)out.push(l);return out};
  const text=(t,X,Y,c='#202124',al='left')=>{x.fillStyle=c;x.textAlign=al;x.fillText(t,X,Y)};
  const L=P+IN,R=W-P-IN,TW=R-L;let y=P+18+86;
  font(46);text('MBTI 人格傾向與日常行為調查',L,y);y+=56;
  font(28);text('已記錄您的回覆。以下為您的人格分析結果。',L,y,'#5f6368');y+=40;
  x.fillStyle='#dadce0';x.fillRect(P,y,CW,2);y+=66;
  font(30);text(`受試者：${raw(nick)}`,L,y);
  text(doneAt(),R,y,'#5f6368','right');y+=80;
  font(28);text('您的人格類型',W/2,y,'#5f6368','center');y+=30;
  const bw=140,bh=170,gap=22,bx=(W-(bw*4+gap*3))/2;
  [...r.type].forEach((ch,i)=>{x.fillStyle='#673ab7';x.beginPath();x.roundRect(bx+i*(bw+gap),y,bw,bh,16);x.fill();font(110,700);text(ch,bx+i*(bw+gap)+bw/2,y+bh/2+40,'#fff','center')});
  y+=bh+76;font(52,700);text(`${r.type}｜${T.n}`,W/2,y,'#202124','center');y+=52;
  font(30);wrap(T.tag,TW).forEach(l=>{text(l,W/2,y,'#5f6368','center');y+=44});y+=24;
  // 圖示一律用 SVG 路徑畫（Path2D），不用文字符號
  const icon=(n,X,Y,sz,c,fill)=>{x.save();x.translate(X,Y);x.scale(sz/24,sz/24);x.strokeStyle=x.fillStyle=c;x.lineWidth=2;x.lineCap=x.lineJoin='round';ICO[n].forEach(d=>{const p=new Path2D(d);if(fill)x.fill(p);x.stroke(p)});x.restore()};
  const [tn,tc,ts]=tierOf(rare),pill=`稀有度 ${rare}%・${tn}`;font(30,700);
  const tw=x.measureText(pill).width,SZ=28,pw=tw+16+SZ*5+64,px=(W-pw)/2;
  x.fillStyle=tc;x.beginPath();x.roundRect(px,y-42,pw,62,31);x.fill();text(pill,px+32,y,'#fff');
  for(let i=0;i<5;i++)icon('star',px+32+tw+16+i*SZ,y-SZ+3,SZ,'#fff',i<ts);y+=60;
  if(r.hid){font(28,700);const t=`隱藏人格解鎖（${T.hidden}）`,w=x.measureText(t).width+40;icon('unlock',(W-w)/2,y-27,30,'#4527a0');text(t,(W-w)/2+40,y,'#4527a0');y+=50}
  y+=20;x.fillStyle='#dadce0';x.fillRect(P,y,CW,2);y+=64;
  font(32,700);text('人格成分',L,y);y+=28;
  r.ranks.forEach(([t,p])=>{font(28,700);text(t,L,y+32);x.fillStyle='#f1f3f4';x.fillRect(L+110,y+6,TW-220,34);x.fillStyle='#673ab7';x.fillRect(L+110,y+6,(TW-220)*p/100,34);font(28);text(p+'%',R,y+32,'#5f6368','right');y+=54});
  y+=24;x.fillStyle='#dadce0';x.fillRect(P,y,CW,2);y+=64;font(28);
  const row=(k,v,c='#202124')=>{text(k,L,y,'#5f6368');wrap(v,TW-170).forEach(l=>{text(l,L+170,y,c);y+=42});y+=10};
  row('抓到奶蛙',frogTxt());
  row('最佳拍檔',raw(T.m));row('天敵',raw(T.e));row('作答時間',durTxt(durSec()));
  if(late){icon('moon',L,y-24,28,'#283593');text('深夜',L+36,y,'#5f6368');wrap(late,TW-170).forEach(l=>{text(l,L+170,y,'#283593');y+=42});y+=10}
  y+=36;
  const H=y+P+120,B=document.createElement('canvas');B.width=W;B.height=H;const b=B.getContext('2d');
  b.fillStyle='#f0ebf8';b.fillRect(0,0,W,H);
  b.fillStyle='#fff';b.strokeStyle='#dadce0';b.lineWidth=2;b.beginPath();b.roundRect(P,P,CW,y-P,16);b.fill();b.stroke();
  b.save();b.beginPath();b.roundRect(P,P,CW,y-P,16);b.clip();b.fillStyle='#673ab7';b.fillRect(P,P,CW,18);b.restore();
  b.drawImage(A,0,0);
  b.font=`400 34px "Product Sans",Roboto,Arial,sans-serif`;b.fillStyle='#5f6368';b.textAlign='center';b.fillText('Gooogle 表單',W/2,y+70);
  b.font=`400 24px ${F}`;b.fillText(`${CONFIG.showName}・${CONFIG.igHandle}`,W/2,y+108);
  return B;
}
function dlResult(){
  if(!RES)return;let cv;
  try{cv=drawResult()}catch(e){toast('圖片產生失敗，請直接截圖');return}
  const url=cv.toDataURL('image/png'),fn=`MBTI結果_${RES.r.type}.png`;
  const ov=document.createElement('div');ov.id='dlov';
  ov.innerHTML=`<div class="card"><div class="rt" style="margin-bottom:12px">您的人格分析結果</div><img src="${url}" alt="結果圖片">
    <div class="ctab"><a class="btn" href="${url}" download="${fn}" id="dlA">下載圖片</a><button class="btn w" id="dlS" style="display:none">分享</button><button class="btn w" id="dlX">關閉</button></div>
    <div class="qd" style="margin:6px 0 0">按了沒反應（例如在 IG 裡開啟）？請長按上方圖片儲存。</div></div>`;
  document.body.appendChild(ov);play('ding');
  ov.onclick=e=>{if(e.target===ov||e.target.id==='dlX')ov.remove()};
  $('#dlA').addEventListener('click',()=>toast('已開始下載'));
  cv.toBlob(bl=>{if(!bl)return;const f=new File([bl],fn,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){const s=$('#dlS');s.style.display='';
      s.onclick=()=>navigator.share({files:[f],title:'我的 MBTI 結果'}).catch(()=>{})}});
}
const HIST={};
const GAG={cd:[4],t5:[2],t6:[2],jd:[1,2,4,5],j2:[3],vid:[1],m2:[3],m4:[0,1,2],q1:[3],q2:[2],q67:[1]};
const GAGC=[];
// 爛梗依賴加分：只算「重複點」（同一題來回切換、為了重聽音效），第一次選不算——
// 第一次選有梗的選項，那題本身就已經給過 MEME 分數了，不重複計分。最多 5 分。
function gagMark(){
  const byId={},cnt={};GAGC.forEach(g=>{byId[g.id]=(byId[g.id]||0)+1;cnt[g.name]=(cnt[g.name]||0)+1});
  const extra=Object.values(byId).reduce((s,n)=>s+Math.max(0,n-1),0);
  if(extra<3)return mark('gagM');
  const [topName,topN]=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
  mark('gagM','MEME',Math.min(5,extra),`作答期間，受試者為了重聽音效，在同一題裡反覆切換有梗的選項，額外多點了 ${extra} 次，其中「${esc(topName)}」被點了 ${topN} 次。研究小組判斷其點選項並非為了作答，而是為了聽音效，屬於重度爛梗依賴者。`);
}
// 追蹤「有沒有點進我們的連結」以及「點出去之後在外面待了幾秒」（回到這頁時用 visibilitychange 計算）。
// 注意：網頁看不到對方在 IG / YouTube 上有沒有真的按追蹤，只能看離開多久來推測。
stats.went={};stats.away={};stats.goOut=null;
// 待超過這個秒數就算「有誠意」：之後再點同一個連結就不再重新計時（也不會再跳即時吐槽）
const passSec=k=>k==='video'?CONFIG.videoThankSec:4;
const passed=k=>(stats.away[k]||0)>=passSec(k);
// 任何一個連結曾經待夠久（問卷中或結果頁都算）＝已經有誠意，之後點任何連結都不再計時
function noteGo(k){stats.went[k]=true;if(!stats.thanked&&!Object.keys(stats.away).some(passed))stats.goOut={k,t:Date.now()};save()}
// 回到這頁：算出在外面待了幾秒（頁面被重新載入的情況，在還原紀錄時也會呼叫）
function backFromOut(){
  const g=stats.goOut;if(!g)return null;stats.goOut=null;
  const s=Math.round((Date.now()-g.t)/1000);stats.away[g.k]=Math.max(stats.away[g.k]||0,s);save();return [g.k,s];
}
// 只算最後一題與結果頁的按鈕；頂部/頁尾的 Gooogle 連結是彩蛋，不算
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.closest('.gl,.foot'))return;
  const h=a.getAttribute('href');const k=h===CONFIG.igUrl?'ig':h===CONFIG.ytChannelUrl?'yt':h===CONFIG.videoUrl?'video':null;
  if(k)noteGo(k)},true);
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible')return save();
  const r=backFromOut();if(r&&$('#cta'))ctaBack(...r);
});
const awayTxt=s=>s<1?'不到 1 秒':`${s} 秒`;
// 結果頁上點出去又回來時，即時吐槽
function ctaBack(k,s){
  // 已經被感謝過（任何一個連結待夠久）就不再吐槽，讓感謝的台詞留著
  const t=$('#ctaT'),b=$('#ctaB');if(!t||!b||stats.oldFan||stats.thanked)return;
  const where={ig:'IG',yt:'YouTube',video:'影片'}[k];
  const p=txt=>`<p class="rp" style="margin:6px 0 0">${txt}</p>`;
  if(s<passSec(k)){t.textContent='……回來得好快喔';play('bruh');
    b.innerHTML=p(k==='video'?`你在影片那邊只待了 ${awayTxt(s)}。研究小組實測，這個時間連片頭都看不完。`:`你在 ${where} 只待了 ${awayTxt(s)}。研究小組實測，這個時間不太夠按追蹤。`);return}
  stats.thanked=true;save();t.innerHTML=ic('heart',20,'#d93025')+' 謝謝你，你是好人';
  b.innerHTML=p(k==='video'?`你在影片那邊待了 ${awayTxt(s)}。影片有 10 分鐘，我們不強求，有點進來看就是愛。`:`你在 ${where} 待了 ${awayTxt(s)}，研究小組選擇相信你有按下去。`);
}
// 結果頁的情勒追蹤卡：依第六部分「支持我們」那題的回答 + 有沒有真的點過按鈕，給不同的台詞
function ctaCard(nick){
  const c=ans.ig||[],saidIg=c.includes(0),saidVid=c.includes(1),later=c.includes(2),went=stats.went,aw=stats.away;
  let lines;
  const igQuick=aw.ig!==undefined&&aw.ig<passSec('ig');
  if(later&&!saidIg&&went.ig&&igQuick)lines=[`${nick}，你前面選了「下次一定」，然後真的點進我們的 IG，待了 ${awayTxt(aw.ig)} 就回來了。`,'研究小組不確定這算不算「下次」。','但我們確定這不夠按追蹤。'];
  else if(later&&!saidIg&&went.ig)lines=[`${nick}，你前面選了「下次一定」。`,`但系統顯示，你其實點進我們的 IG 待了${aw.ig?` ${awayTxt(aw.ig)}`:'一陣子'}。`,'嘴巴說下次，身體很誠實。研究小組決定把你的「下次一定」改判為「這次一定」。'];
  else if(saidIg&&!went.ig)lines=[`${nick}，你在前面勾了「我已追蹤 IG」。`,'但系統顯示，你從頭到尾都沒有點過我們的 IG 連結。','沒關係，我們不會說什麼。我們只是會有點難過。'];
  else if(went.ig&&aw.ig!==undefined&&aw.ig<4)lines=[`${nick}，你剛剛點進我們的 IG，只待了 ${awayTxt(aw.ig)} 就回來了。`,'研究小組實測，這個時間不太夠按追蹤。','可以再去一次，我們等你。'];
  else if(later&&!saidIg)lines=['你前面說「下次一定」。','研究小組想通知你：現在就是下次。'];
  else if(went.ig)lines=[`謝謝你點進我們的 IG，${nick}${aw.ig?`，還待了 ${awayTxt(aw.ig)}`:''}。`,'如果你沒有按追蹤就跑回來了……','我們看不到，但你自己知道。'];
  else lines=['這份表單我們熬了好幾個晚上做出來，你只花了五分鐘填完。','追蹤只需要一秒。','我們算過了，這很划算。'];
  if(saidVid&&!went.video)lines.push('另外，你也說你看完新影片了，但你沒點過影片連結。我們也很想相信你。');
  else if(saidVid&&aw.video!==undefined&&aw.video<CONFIG.videoThankSec)lines.push(`另外，你說你看完新影片了。你在影片那邊待了 ${awayTxt(aw.video)}。我們的影片有 10 分鐘。`);
  return `<div class="card cta" id="cta"><div class="rt" id="ctaT">在你離開之前……</div>
    <div id="ctaB">${lines.map(l=>`<p class="rp" style="margin:6px 0 0">${l}</p>`).join('')}</div>
    <div class="ctab" id="ctaBtns"><a class="btn" data-r="ig" href="${CONFIG.igUrl}" target="_blank" rel="noopener">追蹤 IG ${esc(CONFIG.igHandle)}</a><a class="btn" data-r="yt" href="${CONFIG.ytChannelUrl}" target="_blank" rel="noopener">訂閱 YouTube</a><a class="btn w" data-r="video" href="${CONFIG.videoUrl}" target="_blank" rel="noopener">看最新影片</a></div>
    <p class="rp" style="margin:14px 0 0;font-size:13px;color:#5f6368">如果你早就追蹤了，<button class="link" id="ctaOld" style="font-size:13px">請點這裡領取你的神聖讚美</button></p>
    <div style="margin-top:10px"><button class="link" id="ctaNo" style="color:#9aa0a6;font-size:12px">殘忍拒絕</button></div></div>`;
}
function bindCta(nick){
  const t=$('#ctaT'),b=$('#ctaB'),no=$('#ctaNo');let refused=0;
  $('#ctaBtns').addEventListener('click',e=>{const a=e.target.closest('[data-r]');if(!a||stats.oldFan)return;
    play('ding');
    t.innerHTML=ic('heart',20,'#d93025')+' 謝謝你，你是好人';
    b.innerHTML=`<p class="rp" style="margin:6px 0 0">${refused?'我們就知道你剛剛只是嘴硬。':'研究小組已將您的人格類型額外標註為「善良」。'}</p>`;
    no.style.display='none'});
  const old=$('#ctaOld');
  // 領過讚美之後就是老粉：之後點連結、跳出去再回來都不再觸發任何吐槽/感謝，讚美也會被保存
  const praise=()=>{
    t.innerHTML=ic('sparkle',20,'#e37400')+' 神聖讚美已降臨 '+ic('sparkle',20,'#e37400');
    b.innerHTML=[`${nick}，你早就追蹤了。`,'研究小組全體起立，向你致上最崇高的敬意。','你是本研究的天選之人、節目的守護神、演算法的光。','從今天起，你的 MBTI 後面可以多加一個字母：S（Supporter）。'].map(l=>`<p class="rp" style="margin:6px 0 0">${l}</p>`).join('');
    old.parentElement.style.display='none';no.style.display='none'};
  old.onclick=()=>{stats.oldFan=true;save();play('congcong');setTimeout(()=>play('airhorn'),350);praise()};
  if(stats.oldFan)praise();
  const msgs=['你確定嗎？做這份表單的人現在眼睛還是紅的。',`研究小組已把「${nick}」寫進小本本。`,'好吧。我們會假裝沒事。','（研究小組正在哭）'];
  no.onclick=()=>{play('sadviolin');shake($('#cta'));
    b.innerHTML=`<p class="rp" style="margin:6px 0 0">${msgs[Math.min(refused,msgs.length-1)]}</p>`;
    refused++;if(refused===1)t.textContent='……';
    if(refused>=msgs.length){no.textContent='好啦我追';no.onclick=()=>{$('#ctaBtns [data-r="ig"]').click()}}
    else no.textContent=['真的不要','真的真的不要','不要'][refused-1]||'不要'};
}
function trackCard(){
  const all=Object.entries(HIST),total=all.reduce((s,[,h])=>s+h.length,0);if(!total)return '';
  const changed=all.filter(([id,h])=>h.length>1),c=changed.length,most=Math.max(0,...changed.map(([,h])=>h.length));
  const verdict=!c?'您每一題都只點一次就決定了。研究小組懷疑您根本沒有在看題目。'
    :c<=3?'偶爾會改答案，屬於正常人類的猶豫範圍。'
    :c<=7?'您的答案經常在最後一刻改變心意，研究小組建議您點餐時讓別人先點。'
    :'您幾乎每一題都改過答案。研究小組不確定最後提交的，到底是不是您真正的想法（您可能也不確定）。';
  return `<div class="card"><div class="rt">作答軌跡紀錄</div><div class="rs">系統於背景記錄之實際點擊行為（您以為我們沒在看）</div>
    <div class="rel"><span>點擊總數</span><div>${total} 次</div></div>
    <div class="rel"><span>改過答案</span><div>${c} 題</div></div>
    ${most>2?`<div class="rel"><span>單題最多</span><div>${most} 次</div></div>`:''}
    <p class="rp" style="margin-top:12px">${verdict}${most>=6?`其中有一題您來回點了 ${most} 次，研究小組看著紀錄都替您累了。`:''}</p></div>`;
}
