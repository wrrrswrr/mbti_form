// 結果判定：提交動畫、MBTI 計算、隱藏人格、完整分析文、結果頁
function submit(){
  actTick();stats.t1=Date.now();save();
  const nx=$('#next');nx.disabled=true;nx.textContent='提交中…';FROG.off=true;FROG.t.forEach(clearTimeout);frogHide();
  setTimeout(()=>{
    $('#form').innerHTML=`<div class="card head"><h1>MBTI 人格傾向與日常行為調查</h1><div class="desc">已記錄您的回覆。</div></div>
    <div class="card"><div class="qt"><span id="anaT">正在產生您的個人化人格分析報告…</span> <b id="pct">0%</b></div><div class="pb big"><i id="pbi" style="width:0"></i></div></div>`;
    const steps=[[14,600,'比對十六型人格資料庫…'],[38,700,'計算 E / I 指數…'],[67,900,'分析決策模式…','six7'],[83,800,'偵測異常作答行為…'],[97,1200,'發現大量異常作答…'],[97,900,'發現大量異常作答…'],[9,400,'分析失敗，改用備用資料庫…','error'],[52,700,'載入《網路人格資料庫》…'],[88,700,'重新判定中…'],[100,900,'完成']];
    let i=0;(function go(){if(i>=steps.length)return reveal();const [p,d,txt,s]=steps[i++];
      $('#pbi').style.width=p+'%';$('#pct').textContent=p+'%';$('#anaT').textContent=txt;if(s==='six7'){play('sixseven');flash('6 7')}else play(s||'tick');setTimeout(go,d)})();
  },1300);
}
// ===== 隱藏人格判定 =====
// 作答秒數：只算「問卷真的顯示在畫面上」的時間（stats.act，毫秒）。
// 切到別的 App／分頁、螢幕關掉、關掉網頁都會暫停；提交後就停止計時。
// 每秒累加一次，兩次之間如果隔超過 5 秒（手機休眠、計時器被暫停）就不算那段。
const ACT={last:document.visibilityState==='visible'?Date.now():0};
function actTick(){
  const now=Date.now();
  if(document.visibilityState==='visible'&&!stats.t1){
    if(ACT.last){const d=now-ACT.last;if(d>0&&d<=5000)stats.act=(stats.act||0)+d}
    ACT.last=now;
  }else ACT.last=0;
}
setInterval(actTick,1000);
document.addEventListener('visibilitychange',actTick);
addEventListener('pagehide',()=>{actTick();ACT.last=0});
// 舊版存檔沒有 stats.act 的話，退回用「打開 → 提交」的總時間
const SPED_SEC=120;  // 少於這個秒數填完 → SPED 隱藏人格
const durSec=()=>!stats.t1?null:stats.act!=null?Math.round(stats.act/1000):stats.t0?Math.round((stats.t1-stats.t0)/1000):null;
const durTxt=s=>s==null?'—':s<60?`${s} 秒`:`${Math.floor(s/60)} 分 ${s%60} 秒`;
// BOTS：所有選擇題（使用者自己點的）都是第一個選項；倒數題被系統代答的那題不算
function botCount(){
  const u=stats.usr||{};let n=0;
  for(const q of Object.values(Q)){
    if(STR_T[q.type]||q.type==='captcha'||q.type==='grid')continue;
    if(q.timed&&stats.cdAuto)continue;
    const v=u[q.id];if(v===undefined)return 0;
    const ok=q.type==='checkbox'?v.length===1&&v[0]===0:v===(q.type==='scale'?1:0);
    if(!ok)return 0;n++;
  }
  return n;
}
function hiddenType(){
  if(stats.testHid)return stats.testHid;
  if(isPuzz())return 'PUZZ';
  if(botCount()>10)return 'BOTS';
  // 熟悉題目、只點不讀的極限大約 55～65 秒；第一次填、快速亂點約 80～100 秒
  const s=durSec();if(s!=null&&s<SPED_SEC)return 'SPED';
  return null;
}
// PUZZ：照片上傳從頭到尾只上傳過 Puzz 一次（沒有移除、沒有換過），而且人機驗證「只」選了 Puzz 一張
const upLoyal=()=>{const h=HIST.up||[];return ans.up===3&&h.length===1&&h[0]==='Puzz'&&!stats.upCleared};
const isPuzz=()=>upLoyal()&&!!stats.cap&&stats.cap.sel.length===1&&stats.cap.sel[0]==='puzz';
// 深夜加料：凌晨 1～5 點完成
function lateLine(){
  const t=stats.testLate||stats.t1;if(!t)return '';const d=new Date(t),h=d.getHours();
  if(h<1||h>=5)return '';
  return `受試者於凌晨 ${h} 點 ${d.getMinutes()} 分完成本問卷，研究小組建議其立刻去睡覺。`;
}
function result(){
  const sc={BRUH:1};
  Object.values(marks).forEach(m=>sc[m.type]=(sc[m.type]||0)+m.pts);
  const rank=Object.entries(sc).sort((a,b)=>b[1]-a[1]),top=rank.slice(0,5),tot=top.reduce((s,x)=>s+x[1],0);
  const hid=hiddenType()||stats.testType;  // testType：測試面板指定要預覽的類型
  if(hid){
    // 隱藏人格（或測試指定類型）：直接蓋過原本的結果，佔 67%，其他成分照比例縮到剩下的 33%
    const isHid=!!TYPES[hid].hidden,rest=top.filter(([t])=>t!==hid).slice(0,4);
    return {type:hid,hid:isHid,ranks:[[hid,67],...rest.map(([t,p])=>[t,Math.round(p/tot*33)])],narr:narrPick(hid,isHid)};
  }
  return {type:rank[0][0],ranks:top.map(([t,p])=>[t,Math.round(p/tot*100)]),narr:narrPick(rank[0][0],false)};
}
// ===== 完整分析：一、性格分析　二、行為分析　三、你與研究小組 =====
// 每題的短評（marks[k].ana）是一句不帶主詞的性格描述，不重述題目或選項；這裡依主題排好順序串成段落。
// 跟出題者／研究小組有關的題目不用短評，改由 authorPart() 依多題的組合另外寫。
const THEMES=[
  ['在人際關係上，',['e2','e4','e5','up','q2']],
  ['思考方式上，',['s1','s2','s4','au2','vid2','m2','m4','q67']],
  ['面對情緒和別人的選擇時，',['t1','t5','t6']],
  ['生活習慣方面，',['j1','j2','jd','jdt','j3a','j3b','j3c','j3e','j3d','j4','q3','pa','res']]
];
// 行為分析：作答過程中的小動作（「沒播放卻說有聽／有看」也算行為，不算思考方式）
const BEH_KEYS=['ar','mb2','mbti','au2','vid2','spawn','au','vid','gagM'];
const isLie=k=>(k==='au2'||k==='vid2')&&marks[k]&&marks[k].type==='LIAR';
// 句子上限：超過就照有趣度（同分看人格分數）挑，挑完再照題目順序排回去，讀起來才順
const MAX_PER_THEME=3,MAX_BEH=4;
function pickFun(keys,max){
  const has=keys.filter(k=>marks[k]&&marks[k].ana);
  const keep=new Set([...has].sort((a,b)=>(marks[b].fun||2)-(marks[a].fun||2)||marks[b].pts-marks[a].pts).slice(0,max));
  return has.filter(k=>keep.has(k)).map(k=>marks[k].ana);
}
function narrPick(type,isHid){
  const per=THEMES.map(([lead,keys])=>[lead,pickFun(keys.filter(k=>!isLie(k)),MAX_PER_THEME)]).filter(([,l])=>l.length);
  const fixed=[...(isHid?[hidBeh(type)]:[]),...vidBeh()];
  const beh=[...fixed,...pickFun(BEH_KEYS.filter(k=>!(k==='au2'||k==='vid2')||isLie(k)),Math.max(1,MAX_BEH-fixed.length))];
  return {per,beh};
}
function hidBeh(h){
  if(h==='PUZZ')return '從頭到尾眼裡只有 Puzz，其他東西一概看不見，連真正的奶蛙都沒放在眼裡。';
  if(h==='BOTS')return '作答模式與自動化程式高度一致，研究小組正在重新檢討人機驗證機制。';
  const s=durSec(),n=Object.keys(Q).length;
  return `作答速度已經低於人類閱讀題目的極限，平均每題約 ${s==null?'1':(s/n).toFixed(1)} 秒，基本上是憑感覺在點。`;
}
function vidBeh(){const n=(HIST.vid||[]).length;return n>=3?[`對一支影片的感想可以來回改 ${n} 次，做決定比想像中困難。`]:[]}
function lateBeh(){const t=stats.testLate||stats.t1;if(!t)return '';const d=new Date(t),h=d.getHours();
  return h>=1&&h<5?`凌晨 ${h} 點還醒著填問卷，研究小組建議立刻去睡覺。`:''}

// ----- 三、你與研究小組：看「對出題者的態度」，依多題的組合給評語 -----
const S3N=['這份問卷','出題者','「曾國城在古蹟抽菸」','期末考','奶蛙'];
function authorPart(nick){
  const tg=ans.tg||{},r=ans.s3&&typeof ans.s3==='object'?ans.s3:{},kd=twKind((ans.tw||'').trim());
  const cdN=(stats.cdDel||[]).length,puzzUp=ans.up===3,back=stats.puzzBack||0;
  // 好感度：越高越愛出題者
  let love=0;
  if(ans.t3===5&&!stats.t3fixed)love+=2;else if(stats.t3fixed)love-=1;
  love+={praise:2,swear:-3,diss:-1}[kd]||0;
  love+=[2,1,0,-1,-2][r[1]]||0;love+=r[0]===0?1:r[0]===4?-1:0;
  love+=tg[4]===0?2:tg[4]===2?-2:0;
  if(stats.cdSelf)love+=2;
  const paLove=PA_LOVE.test((ans.pa||'').trim());if(paLove)love+=2;
  if(stats.merit)love+=1;if(stats.rep)love-=2;
  if(puzzUp)love+=2;love-=back;
  const verdict=love>=8?`${nick}對出題者的感情，已經超出一般受試者應有的範圍。研究小組讀完這一段，有一位成員去洗了把臉。`
    :love>=4?`整體而言，${nick}對研究小組相當友善：會吐槽，但看得出來是自己人。`
    :love>=0?`${nick}對出題者的態度大致是禮貌而保持距離：該配合的配合，該吐槽的也沒少。`
    :love>=-4?`${nick}對出題者顯然有些意見，只是大部分時候選擇用委婉的方式表達。`
    :`${nick}對出題者的敵意相當明確。研究小組讀完這一段，決定先去冷靜一下。`;
  const p1=[verdict];
  // 天才評分
  if(ans.t3===5&&!stats.t3fixed)p1.push('認為出題者是天才這件事，完全不需要系統幫忙，自己就給出了最高分。');
  else if(stats.t3fixed)p1.push('被系統強制改分之後沒有再改回來——嘴上不抗議，但心裡顯然沒有認同。');
  // 三個字
  if(kd==='praise')p1.push('形容出題者時毫不吝嗇，那三個字出題者已經設成手機桌布。');
  else if(kd==='swear')p1.push('形容出題者時完全不修飾，那三個字已被出題者列入「人生不該聽到的話」。');
  else if(kd==='diss')p1.push('形容出題者時不打算說違心話，出題者沉默了很久，最後承認「好啦，有一點」。');
  else if(kd==='lol')p1.push('形容出題者時以笑帶過，研究小組至今分不出那是褒是貶。');
  else if((ans.tw||'').trim())p1.push('形容出題者的那三個字，讓研究小組開了二十分鐘的會，仍分不出是稱讚還是罵人。');
  if(stats.twBad)p1.push(`而且三個字顯然不夠用，硬是多寫了 ${stats.twBad} 次——對出題者的話，比規定的多很多。`);
  // ㄅ～ㄦ級分排名：看出題者跟問卷、跟其他項目的相對位置
  const p2=[],a=r[1],b=r[0];
  if(a!==undefined){
    if(a===0&&b===0)p2.push('在級分排名裡，把作品和作者一起捧上最高級，是真的喜歡，不是客套。');
    else if(a===0)p2.push('在級分排名裡，覺得出題者這個人比這份問卷優秀，屬於對人不對事。');
    else if(b===0&&a>=3)p2.push('在級分排名裡，喜歡這份問卷，卻不太喜歡做問卷的人：作品可以，作者不行。');
    else if(a===4)p2.push('在級分排名裡，出題者被放在最底層，研究小組已經理解自己的定位。');
    else p2.push('在級分排名裡，出題者落在不上不下的位置：安全、普通、沒有感情。');
    const above=[2,3,4].filter(i=>r[i]!==undefined&&r[i]<a);
    if(above.length===3)p2.push(`排在出題者前面的，有${above.map(i=>S3N[i]).join('、')}，出題者只差一點就全場墊底。`);
    else if(above.includes(2))p2.push(`最傷的是，出題者輸給了${S3N[2]}${above.length>1?`，還有${above.filter(i=>i!==2).map(i=>S3N[i]).join('、')}`:''}。研究小組正在反省。`);
    else if(above.length)p2.push(`連${above.map(i=>S3N[i]).join('、')}都排在出題者前面，研究小組正在反省。`);
  }
  if(r[3]===0)p2.push('另外，把期末考捧上最高級——若不是卷王，就是還沒看到成績。');
  if(hasDup(r))p2.push('明明每個級分只能給一次，還是硬要並列，規則對其而言只是參考。');
  // 重要程度：五列全選同一欄只給一句總評；否則看出題者跟媽媽、Wi-Fi、組員的相對位置
  const g=[0,1,2,3,4].map(i=>tg[i]);
  if(g.every(x=>x!==undefined&&x===g[0]))p2.push(['在重要程度評估裡，什麼都非常重要，一個都放不下。什麼都重要，就等於什麼都不重要。',
    '在重要程度評估裡人人平等，媽媽和 Wi-Fi 也平等。人生信條：都還好。',
    '在重要程度評估裡誰都不認識，包括媽媽。目前處於全面斷線狀態，建議先充電，再打通電話回家自我介紹一下。'][g[0]]);
  else if(g.some(x=>x!==undefined)){
    if(g[4]===0)p2.push(g[0]===0?'在重要程度上，把出題者和媽媽放在同一個等級，出題者受寵若驚。':'在重要程度上，出題者的地位比媽媽還高。研究小組很感動，但建議不要讓媽媽知道。');
    else if(g[4]===2)p2.push('在重要程度上，對出題者的存在毫無印象，即使已經相處了這麼多題。');
    else if(g[4]===1)p2.push('在重要程度上，出題者屬於「普通」，研究小組接受這個定位。');
    if(g[0]===2)p2.push('至於媽媽那一列，研究小組不予置評，只建議今天打一通電話回家。');
    else if(g[1]===0&&g[3]===0&&g[0]!==0)p2.push('真正放在心上的是 Wi-Fi 和電量，數位生存需求凌駕一切，包括媽媽。');
    else if(g[1]===0&&g[0]!==0)p2.push('Wi-Fi 在心中的地位高過媽媽，這件事研究小組會保密。');
    if(g[2]===2)p2.push('對期末報告的組員已經沒有任何期待。研究小組完全理解，畢竟有些組員從開學到現在都沒出現過。（研究小組本身也是從六人縮減到 2.5 人。）');
    else if(g[2]===0)p2.push('還把組員看得很重要，若不是遇到了好組員，就是自己就是那個好組員。');
  }
  // 其他跟研究小組的互動
  const p3=[];
  if(stats.cdDone){
    if(stats.cdSelf)p3.push(cdN?'限時心算題算不出來的時候，懂得改選一個讓出題者開心的答案。':'限時心算題連算都沒算，直接選了讓出題者開心的那個答案，非常識相。');
    else if(cdN>=2)p3.push(`限時心算題不到最後一秒不放棄，試了 ${cdN} 次，最後還是被系統代為「支持」了出題者。`);
    else if(cdN===1)p3.push('限時心算題試過一次發現不對，就很快接受了被系統代答的命運。');
    else p3.push('限時心算題很清楚自己算不出來，乾脆直接等系統代答。');
  }
  if(ans.t4===0||ans.t4===1){
    p3.push(ans.t4===0?'到了第三部分還覺得這份問卷一點都不奇怪，研究小組在此誠摯詢問：你還好嗎？':'特別強調自己「完全」不覺得這份問卷奇怪——會強調的人，心裡通常都有。');
    if(stats.dodge)p3.push(`何況系統紀錄顯示，其曾經追著「有」點了 ${stats.dodge} 次，只是嘴硬。`);
  }else if(ans.t4===2)p3.push(stats.dodge?`為了承認這份問卷很奇怪，還追著跑掉的選項點了 ${stats.dodge} 次，誠實得很有毅力。`:'誠實承認這份問卷很奇怪，但還是選擇留下來，看它還能多奇怪。');
  if(ans.q1===3)p3.push('被問煩了會直接吐槽研究小組 ven 題，研究小組虛心接受。');
  if(puzzUp&&!back)p3.push('聚會照片選了 Puzz，研究小組三位成員至今仍然很感動。');
  else if(back)p3.push(`${back>1?'不只一次':'曾經'}把 Puzz 傳上來又撤回去，研究小組三位成員的便當放下又拿起${puzzUp?'；好在最後還是傳回來了，研究小組決定原諒':''}。`);
  if(stats.cap&&stats.cap.sel.includes('puzz')&&!puzzUp)p3.push('人機驗證的時候，眼裡只看得到 Puzz。');
  if(paLove)p3.push('連「為什麼會填到這裡」都能寫成告白，示愛門檻低到令人擔心——但出題者很受用，那段話已經印出來貼在床頭了。');
  if(stats.merit)p3.push(`甚至主動跑去「登入」，寫下出題者的優點「${esc(stats.merit)}」，出題者已截圖。`);
  if(stats.rep)p3.push(`作答期間還試圖檢舉本表單，理由是「${esc(stats.rep)}」。研究小組已讀，哭完之後決定繼續做下去。`);
  return [p1,p2,p3].filter(p=>p.length);
}
function narrHTML(r,T,nick,late){
  const P=t=>`<p class="rp np">${t}</p>`;
  // 一、性格：每個主題一段，段首接上暱稱
  let a=r.narr.per.length
    ?r.narr.per.map(([lead,l],i)=>P((i===0?(r.hid?`撇開隱藏人格不談，${nick}其實也很有自己的個性。`:`從整體作答來看，${nick}是不折不扣的「${T.n}」。`):'')+lead+l.join(''))).join('')
      +P(`總結來說，「${T.tag}」——這句話放在${nick}身上，研究小組認為一個字都不用改。`)
    :P(`${nick}的作答四平八穩，研究小組找不到任何可以吐槽的地方。研究小組認為這反而是最可疑的。`);
  // 二、行為
  const beh=r.narr.beh.concat(lateBeh()?[lateBeh()]:[]);
  const b=beh.length?P(`作答過程中，系統也偷偷記下了一些你以為沒人看到的小動作。`+beh.join('')):P(`至於作答過程，${nick}表現得異常正常，系統沒有抓到任何小動作。研究小組看著空白的紀錄，陷入了長長的沉默。`);
  // 三、你與研究小組
  const c=authorPart(nick).map(l=>P(l.join(''))).join('');
  return `<div class="card" id="obsc"><div class="rt">完整分析報告</div><div class="rs">研究小組根據您的作答逐字寫成（真的有人在寫）</div>
    <div class="nh">一、性格分析</div>${a}<div class="nh">二、行為分析</div>${b}${c?`<div class="nh">三、你與研究小組</div>${c}`:''}</div>`;
}
// fast=true：直接顯示最終結果，不跑動畫（用於重新整理後還原、測試面板）
function reveal(fast){
  stats.done=true;FROG.off=true;save();
  if(!fast){document.body.classList.add('glitch');play('vineboom')}
  setTimeout(()=>{
    document.body.classList.remove('glitch');window.scrollTo(0,0);
    const self=(ans.mytype||'').trim().toUpperCase(),selfOk=MB_OK.test(self);
    // 奶蛙總共探頭 N-2 = 6 次（第 3～8 頁各一次），翻太快沒看到的也算漏看
    const fs=N-2,fc=Math.min(FROG.caught,fs),allFrog=fc===fs;
    if(fs){if(allFrog)mark('frog','CHAD',7,`作答期間，一隻奶蛙曾 ${fs} 次從螢幕角落探頭偷看，受試者全數捕獲。忽有龐然大物，拔山倒樹而來，蓋一奶蛙也——而受試者每一次都看到了。其周邊視覺與反應速度遠超常模，研究小組懷疑其平常就很在意別人在看他。`);
      else if(fc)mark('frog','RICK',1,`作答期間，一隻奶蛙曾 ${fs} 次從螢幕角落探頭偷看，受試者捕獲 ${fc} 次、漏看 ${fs-fc} 次。注意力尚可，但顯然有在分心。`);
      else mark('frog','BRUH',3,`作答期間，一隻奶蛙曾 ${fs} 次從螢幕角落探頭偷看，受試者完全沒有察覺。忽有龐然大物，拔山倒樹而來，蓋一奶蛙也，受試者連頭都沒抬。研究小組建議其平時多留意身後。`)}
    gagMark();openMarks();
    // report.html（檢舉頁）會留下檢舉理由
    // 只算這次作答期間（打開問卷之後）的檢舉；舊格式（純文字、沒有時間）或更早的檢舉一律不算
    let rep=null;try{const o=JSON.parse(localStorage.getItem('mbti_form_reported')||'null');if(o&&o.r&&o.t>=(stats.t0||0))rep=o.r}catch(e){}
    stats.rep=rep?String(rep).slice(0,40):null;
    if(rep)mark('report','SALT',4,'');else mark('report');
    const r=result(),T=TYPES[r.type],nick=esc((ans.nick||'受試者').trim()),pw=[92,78,61,37];
    const rare=RARE[r.type]||5,[tn,tc,ts]=tierOf(rare),late=lateLine();
    RES={r,T,nick,rare,late};
    $('#form').innerHTML=`
    <div class="card head"><h1>MBTI 人格傾向與日常行為調查</h1><div class="desc">已記錄您的回覆。以下為系統依據您的作答所產生之個人化人格分析報告。</div>
      <div class="score"><div class="sl" id="sl">您的人格類型</div><div class="slots" id="slots"><span>?</span><span>?</span><span>?</span><span>?</span></div><div class="sn" id="sn">&nbsp;</div></div></div>
    <div id="rbody">
      <div class="card sum"><div class="rt">結果摘要</div><div class="rs">重點都在這裡，密密麻麻的分析請往下滑</div>
        <div class="rel"><span>受試者</span><div>${nick}<br><small>${doneAt()}</small></div></div>
        <div class="rel"><span>人格類型</span><div><b>${r.type}｜${T.n}</b><br><small>${T.tag}</small></div></div>
        <div class="rel"><span>稀有度</span><div><b>${rare}%</b><span class="tier" style="background:${tc}">${tn}</span> <span style="color:${tc}">${starsHTML(ts)}</span></div></div>
        <div class="rel"><span>人格成分</span><div>${r.ranks.map(([t,p])=>`${t} ${p}%`).join('・')}</div></div>
        <div class="rel"><span>抓到奶蛙</span><div>${frogTxt()}</div></div>
        <div class="rel"><span>最佳拍檔</span><div>${T.m}</div></div>
        <div class="rel"><span>天敵</span><div>${T.e}</div></div>
        <div class="rel"><span>作答時間</span><div>${durTxt(durSec())}</div></div>
        ${r.hid?`<div class="note hidn">${ic('unlock',16)} <b>隱藏人格解鎖：${r.type}</b><br>觸發條件：${T.hidden}。全體受試者中只有 ${rare}% 的人走到這裡。</div>`:''}
        ${late?`<div class="note late">${ic('moon',16)} ${late}</div>`:''}
      </div>
      <div class="card"><div class="qt" style="margin-bottom:6px">下載您的人格分析結果</div><div class="qd" style="margin:0 0 14px">系統已將結果整理成一張圖片，可儲存後分享到限時動態。檔案類型：PNG・檔案大小上限：1 個人格</div>
        <button class="fbtn" id="dl">${ic('download',18,'#1a73e8')}下載結果圖片</button></div>
      <div class="card"><div class="rt">和你同類型的人也喜歡</div><div class="rs">根據 ${r.type} 型受試者的瀏覽紀錄（研究小組亂猜的）</div>
        ${recHTML(r.type)}</div>
      <div class="card sec"><div class="tab">詳細分析</div><div class="st">完整人格分析報告</div><div class="sd">以下內容比較長，研究小組建議找個舒服的姿勢（或馬桶）慢慢看。</div></div>
      <div class="card"><div class="rt">人格概述</div><div class="rs">受試者：${nick}</div>
        <p class="rp">${T.o}</p>${selfOk&&self!==r.type?`<p class="rp" style="color:#5f6368">※ 您自評為 ${self}，但本次分析顯示您更接近 ${r.type} 型。兩者並不衝突，只是後者比較準。</p>`:''}</div>
      <div class="card"><div class="rt">認知功能堆疊</div><div class="rs">依功能強度排序</div>
        ${T.f.map((f,i)=>`<div class="fn"><div class="lt">${f[0]}</div><div style="flex:1"><div class="ft">${['主導功能','輔助功能','第三功能','劣勢功能'][i]}</div><div class="fw">${f[1]}・${f[2]}</div><div class="fd">${f[3]}</div><div class="mini"><i data-w="${pw[i]}"></i></div></div></div>`).join('')}</div>
      ${narrHTML(r,T,nick,late)}
      ${capCard()}
      ${trackCard()}
      ${fs?`<div class="card"><div class="rt">窺視者觀察紀錄</div><div class="rs">作答期間共出現 ${fs} 次・捕獲 ${fc} 次</div>
        ${allFrog?`<div class="frogwin"><img id="frogwin" src="${FROG_IMG.laugh}" alt=""></div><p class="rp" style="text-align:center">全數捕獲。奶蛙對您的觀察力表示佩服，並決定不再偷看您了。</p>`
        :`<p class="rp">${fc?'您抓到了一部分，但奶蛙表示：牠其實一直都在。':'忽有龐然大物，拔山倒樹而來，蓋一奶蛙也。您完全沒有發現，奶蛙已經看完您全部的答案了。'}</p>`}</div>`:''}
      <div class="card"><div class="rt">人際與職涯</div><div class="rs">&nbsp;</div>
        <div class="rel"><span>最佳拍檔</span><div>${T.m}</div></div><div class="rel"><span>天敵</span><div>${T.e}</div></div><div class="rel"><span>適合職業</span><div>${T.j}</div></div></div>
      <div class="card"><div class="rt">人格成分</div><div class="rs">樣本數：1（你）・分析信度 α = 0.67（研究小組自己算的）</div>
        ${r.ranks.map(([t,p])=>`<div class="bar"><b>${t}</b><div class="t"><i data-w="${p}"></i></div><span>${p}%</span></div>`).join('')}</div>
      ${ctaCard(nick)}
      <div class="nav" style="justify-content:center;gap:24px"><button class="link" id="again">再填一次</button><button class="link" id="share">分享給朋友</button></div>
      <div class="foot">本分析結果僅供參考，如有雷同，純屬你自己的問題。<br>本問卷不會收集任何資料，你的答案只存在你自己的螢幕上。</div>
    </div>`;
    bindCta(nick);
    $('#again').onclick=()=>{clearSave();location.reload()};
    $('#dl').onclick=dlResult;
    $('#share').onclick=()=>{(navigator.clipboard?navigator.clipboard.writeText(location.href):Promise.reject()).then(()=>toast('連結已複製')).catch(()=>toast('複製失敗，直接把網址傳給朋友吧'))};
    if(fast){
      document.querySelectorAll('#slots span').forEach((s,i)=>s.textContent=r.type[i]);$('#slots').classList.add('final');
      $('#sl').textContent='重新判定後，您的人格類型為';$('#sn').innerHTML=`<b>${r.type}｜${T.n}</b>${T.tag}`;
      const b=$('#rbody');b.style.display='block';b.classList.add('on');b.querySelectorAll('i[data-w]').forEach(i=>i.style.width=i.dataset.w+'%');
      return;
    }
    // 不再先轉出一般 MBTI：提交動畫跑完就直接轉出自製類型
    if(r.hid)$('#sn').textContent='偵測到隱藏作答模式，正在解鎖隱藏人格…';
    spin(r.type,()=>{
      $('#slots').classList.add('flip','final');play('vineboom');setTimeout(()=>play('airhorn'),500);
      $('#sl').textContent='重新判定後，您的人格類型為';
      $('#sn').innerHTML=`<b>${r.type}｜${T.n}</b>${T.tag}`;
      const b=$('#rbody');b.style.display='block';const fw=$('#frogwin');if(fw)frogWin(fw);
      setTimeout(()=>{b.classList.add('on');b.querySelectorAll('i[data-w]').forEach(i=>i.style.width=i.dataset.w+'%')},300);
    },180);
  },fast?0:900);
}
