// 表單本體：畫面產生、必填與回應驗證、換頁、下拉選單、作答事件、基本資料檢查、逐字稿、各題 hooks
function header(full){
  return `<div class="card head"><h1>MBTI 人格傾向與日常行為調查</h1>${full?`<div class="desc">您好！我們是人格心理學專題研究小組，本問卷旨在探討 MBTI 十六型人格與日常行為模式之間的關聯。<br><br>・填答時間約 5 分鐘<br>・本問卷採匿名方式，所有資料僅作學術統計用途，不會對外公開<br>・請依照您「最直覺」的反應作答，沒有對錯之分<br><br>填答完成後，系統將依據您的作答產生個人化的人格分析報告。感謝您撥空協助！</div>`:''}<div class="gl"><a href="#" data-gl="login">登入 Gooogle</a> 即可儲存進度。<a href="#" data-gl="help">瞭解詳情</a></div><div class="meta">* 表示必填問題</div></div>`;
}
const lateOf=q=>q.late===undefined?[]:[].concat(q.late);
function optHTML(q,o,k,extra=''){
  const ty=q.type==='checkbox'?'checkbox':'radio',v=ans[q.id];
  const on=ty==='radio'?v===k:(v||[]).includes(k);
  const hid=(lateOf(q).includes(k)&&!q.lateShown&&!on)?' hid':'';  // 已經選了的不藏
  const dis=q.timed&&stats.cdAuto;
  return `<label class="opt${hid}${extra}${dis?' dis':''}" data-k="${k}"><input type="${ty}" name="${q.id}" value="${k}"${on?' checked':''}${dis?' disabled':''}><span>${nk(o)}</span></label>`;
}
const RC_LOGO=`<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 1 12.2 8.5" fill="none" stroke="#1c3aa9" stroke-width="4"/><path d="M29 16a13 13 0 0 1-8.5 12.2" fill="none" stroke="#4285f4" stroke-width="4"/><path d="M16 29A13 13 0 0 1 3.8 20.5" fill="none" stroke="#ababab" stroke-width="4"/><path d="M3 16A13 13 0 0 1 11.5 3.8" fill="none" stroke="#1c3aa9" stroke-width="4"/><path d="M28 5v8h-8z" fill="#1c3aa9"/><path d="M4 27v-8h8z" fill="#ababab"/></svg>`;
function qHTML(q){
  let h=`<div class="card q" id="q_${q.id}"><div class="qt">${nk(q.q)}${q.req?'<span class="req"> *</span>':''}</div>${q.d?`<div class="qd">${nk(q.d)}</div>`:''}`;
  if(q.type==='captcha'){if(stats.cap)ans.cap=1;
    h+=`<div class="rc"><div class="l" id="rcl"><div class="cb${stats.cap?' ok':''}"></div><span>${stats.cap?'驗證完成':'我不是機器人'}</span></div><div class="logo">${RC_LOGO}<span>reCAPTCHAA</span><small>隱私權 - 條款</small></div></div>`}
  else if(q.timed){
    const del=stats.cdDel||[];
    const opts=`<div class="opts">${q.opts.map((o,k)=>del.includes(k)&&k!==q.weird?'':optHTML(q,o,k)).join('')}</div>`;
    h+=(stats.cdDone?'':`<div class="cdw"><div class="cdn">${ic('timer',18)} 請在 <b>${q.timed}</b> 秒內作答，時間到系統將代為作答</div><div class="cdb"><i></i></div></div>`)+opts;
    if(stats.cdAuto)h+=`<div class="wmsg w-cd">${ic('info',14)} ${stats.cdSelf?'感謝您的支持。此選項一經選擇，無法取消。':'時間到，系統已代為作答。本題已鎖定，無法取消。'}</div>`;
  }
  else if(q.type==='text')h+=`<input class="ti" data-id="${q.id}" placeholder="你的回答" value="${esc(ans[q.id]||'')}">`;
  else if(q.type==='para'){const v=ans[q.id]||'';h+=`<textarea class="ta" data-id="${q.id}" rows="1" placeholder="你的回答">${esc(v)}</textarea><div class="tac">已輸入 ${[...v.trim()].length} 字</div>`}
  else if(q.type==='date')h+=`<div class="tinl">日期</div><input class="tin" type="date" data-id="${q.id}" value="${esc(ans[q.id]||'')}">`;
  else if(q.type==='time')h+=`<div class="tinl">時間</div><input class="tin" type="time" data-id="${q.id}" value="${esc(ans[q.id]||'')}">`;
  // 下拉式選單：外觀照 Google 表單（方框＋三角形，點開是浮動白色清單），背後藏一個真的 select 共用計分邏輯
  else if(q.type==='select')h+=`<div class="ddw"><button type="button" class="ddb" aria-haspopup="listbox"><span>${ans[q.id]!==undefined?q.opts[ans[q.id]]:'選擇'}</span><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z" fill="#5f6368"/></svg></button><select class="ddh" name="${q.id}" tabindex="-1" aria-hidden="true"><option value="">選擇</option>${q.opts.map((o,k)=>`<option value="${k}"${ans[q.id]===k?' selected':''}>${o}</option>`).join('')}</select></div>`;
  else if(q.type==='grid'){const v=ans[q.id]||{};
    h+=`<div class="grid"><table><thead><tr><th></th>${q.cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${q.rows.map((r,i)=>`<tr><td>${r}</td>${q.cols.map((c,k)=>`<td><input type="radio" name="${q.id}__${i}" value="${k}" aria-label="${r}：${c.replace(/<br>/g,'')}"${v[i]===k?' checked':''}></td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
  else if(q.type==='upload'){const u=UP[ans[q.id]];
    h+=`<div class="upi">上傳 1 個支援的檔案：圖片。大小上限為 10 MB。</div>`+(u
      ?`<div class="upc"><img src="${CAP_IMG[u.k]}" alt=""><div class="nm">${u.f}</div><button class="upx" type="button" aria-label="移除檔案">${ic('close',18,'#5f6368')}</button></div><div class="upn">${ic('image',14)} ${u.msg}</div>`
      :`<button class="upb" type="button">${ic('upload',18,'#1a73e8')}新增檔案</button>`)}
  else if(q.type==='audio')h+=`<div class="aup"><button class="pp" aria-label="播放">${ic('play',24,'#fff')}</button><div class="bar"><i></i></div><span class="tm">0:00 / --:--</span></div><div class="auc">${ic('headset',14)} 建議配戴耳機・listening_test_final_v3.mp3</div><div class="qt" style="font-size:15px;margin:18px 0 6px">${nk(q.qq)}</div><div class="opts">${q.opts.map((o,k)=>optHTML(q,o,k)).join('')}</div>`;
  else if(q.type==='video')h+=`<div class="thumb" id="thumb"><div class="cap">填答說明｜人格心理學研究小組</div><div class="play"></div><div class="dur">0:28</div></div><div class="qt" style="font-size:15px;margin:18px 0 6px">${nk(q.qq)}</div><div class="opts">${q.opts.map((o,k)=>optHTML(q,o,k)).join('')}</div>`;
  else if(q.type==='scale')h+=`<div class="scale"><span class="lb">${q.l||'非常不同意'}</span>${[1,2,3,4,5].map(n=>`<label><span>${n}</span><input type="radio" name="${q.id}" value="${n}"${ans[q.id]===n?' checked':''}></label>`).join('')}<span class="lb">${q.r||'非常同意'}</span></div>`;
  else{
    if(q.cta)h+=`<div class="qd">本研究由《${CONFIG.showName}》製作團隊執行。若本問卷對您有任何幫助（或傷害），請以實際行動支持我們。</div><div class="ctab"><a class="btn" data-go="ig">追蹤 IG ${esc(CONFIG.igHandle)}</a><a class="btn w" data-go="video">觀看最新影片</a></div>`;
    if(q.listen)h+=`<div class="tr" id="tr"></div><div class="qt" style="font-size:15px">${nk(q.qq)}</div>`;
    h+=`<div class="opts">${q.opts.map((o,k)=>optHTML(q,o,k)).join('')}</div>`;
  }
  return h+`<div class="err">${ic('info',14)} 這是必填問題</div></div>`;
}
function render(){
  if(AU.el&&!AU.el.paused)AU.el.pause();  // 換頁時停掉聽力題音檔
  const p=pages[page];let h=header(page===0);
  if(p.title)h+=`<div class="card sec"><div class="tab">第 ${page+1} 部分，共 ${N} 部分</div><div class="st">${nk(p.title)}</div>${p.desc?`<div class="sd">${nk(p.desc)}</div>`:''}</div>`;
  h+=p.qs.map(qHTML).join('');
  h+=`<div class="nav">${page>0?'<button class="btn w" id="back">返回</button>':''}<button class="btn" id="next">${page===N-1?'提交':'下一頁'}</button><div class="prog"><span class="pb"><i style="width:${(page+1)/N*100}%"></i></span>第 ${page+1} 頁，共 ${N} 頁</div><a class="clear" id="clear">清除表單內容</a></div>`;
  h+=`<div class="foot"><div class="pw">請勿利用 Gooogle 表單送出密碼。</div><div style="margin-top:14px">這份表單是在 ${esc(CONFIG.showName)} 中建立。<br>這份表單很可疑嗎？<a href="report.html">報告</a></div><a class="gmark" href="${CONFIG.igUrl}" target="_blank" rel="noopener">Gooogle 表單</a></div>`;
  $('#form').innerHTML=h;window.scrollTo(0,0);bindNav();frogPeek();
  p.qs.forEach(q=>{
    const card=$('#q_'+q.id);
    lateArm(card,q);
    hooks[q.id]&&hooks[q.id](card,q);
  });
}
// ===== 晚出現的選項 =====
// 一般題（late）：等選項區「完整」出現在畫面中間、停 0.8 秒才開始（滑過去不算），一個一個跳出來（間隔 1.6 秒）。
// burst 題：不看時間，選了一開始那幾個選項之後才爆發（見 burstOpts）。
function lateArm(card,q){
  const L=lateOf(q);if(!L.length||q.lateShown)return;
  if(q.burst){
    // 之前已經選過、但爆發還沒演完就離開這頁：回來時直接全部顯示，不再演一次
    if(ans[q.id]!==undefined){q.lateShown=true;L.forEach(k=>{const o=card.querySelector(`.opt[data-k="${k}"]`);if(o)o.classList.remove('hid')})}
    return}
  const box=card.querySelector('.opts');if(!box)return;
  let tm,go=false;
  const run=()=>{if(go)return;go=true;io.disconnect();
    L.forEach((k,i)=>setTimeout(()=>{if(!document.body.contains(card))return;if(i===L.length-1)q.lateShown=true;
      const o=card.querySelector(`.opt[data-k="${k}"]`);if(!o)return;o.classList.remove('hid');o.classList.add('pop');play('vineboom');shake(card)},1000+i*1600))};
  const io=new IntersectionObserver(es=>{const e=es[0];clearTimeout(tm);if(!document.body.contains(card))return io.disconnect();
    const full=e.intersectionRatio>=.98||(e.rootBounds&&e.intersectionRect.height>=e.rootBounds.height*.95);
    if(e.isIntersecting&&full)tm=setTimeout(run,800)},{rootMargin:'-10% 0px -15% 0px',threshold:[0,.25,.5,.75,.98,1]});
  io.observe(box);
}
// 「憋不住」爆發：選了冷靜的選項 → 怒氣值慢慢集滿、卡片越來越紅越抖 → 集滿那一刻，
// 藏起來的選項從「剛剛選的那個選項」裡一個一個噴出來（內心真正想說的話）→ 卡片慢慢冷卻
function burstOpts(card,q,from){
  if(q.lateShown||q.bursting)return;q.bursting=true;
  const src=card.querySelector(`.opt[data-k="${from}"]`),L=lateOf(q);
  warn(card,'burst','系統偵測到你在壓抑情緒。');
  card.querySelector('.opts').insertAdjacentHTML('beforebegin','<div class="ang"><span>怒氣值</span><div class="angb"><i></i></div><b>0%</b></div>');
  const ang=card.querySelector('.ang'),fill=ang.querySelector('i'),pct=ang.querySelector('b');
  card.classList.add('boil');reflow(fill);fill.style.width='100%';
  let p=0;const iv=setInterval(()=>{if(!document.body.contains(card))return clearInterval(iv);
    p=Math.min(100,p+10);pct.textContent=p+'%';play('tick');if(p>=50)shake(card);
    if(p<100)return;clearInterval(iv);
    // 集滿：憋不住了
    warn(card,'burst','憋不住了。');play('vineboom');shake(card);card.classList.add('blow');
    const s=src&&src.getBoundingClientRect();
    L.forEach((k,i)=>setTimeout(()=>{if(!document.body.contains(card))return;
      const o=card.querySelector(`.opt[data-k="${k}"]`);if(!o)return;o.classList.remove('hid');
      const r=o.getBoundingClientRect(),dx=s?s.left-r.left:0,dy=s?s.top-r.top:0;play('boing');
      o.animate([{transform:`translate(${dx}px,${dy}px) scale(.2) rotate(-25deg)`,opacity:0,background:'#ff8a80'},
        {transform:'translate(0,-8px) scale(1.12) rotate(4deg)',opacity:1,background:'#ffcdd2',offset:.7},
        {transform:'none',opacity:1,background:'transparent'}],{duration:560,easing:'cubic-bezier(.2,1.3,.4,1)'});
      if(i===L.length-1)setTimeout(()=>{if(!document.body.contains(card))return;
        q.lateShown=true;q.bursting=false;card.classList.remove('blow');card.classList.replace('boil','cool');
        ang.remove();warn(card,'burst','你內心真正想說的話，都在這裡了。');save()},700)},350+i*260));
  },120);
}
const reflow=el=>void el.offsetWidth;
const STR_T={text:1,para:1,date:1,time:1};
function answered(q){const v=ans[q.id];
  if(q.type==='grid')return !!v&&q.rows.every((_,i)=>v[i]!==undefined);
  return q.type==='checkbox'?v&&v.length:STR_T[q.type]?v&&v.trim():v!==undefined}
// 回應驗證（Google 表單的「回應驗證」功能）：回傳錯誤訊息，空字串代表通過
const TW_MSG=['回應長度必須剛好為 3 個字。','是三個字。不是兩個，也不是四個。','研究小組相信你數得到三。','一、二、三。三個字。你可以的。'];
const CHECK={
  tw(v){const n=[...v].length;if(n===3)return '';stats.twBad=(stats.twBad||0)+1;
    mark('twBad','SALT',Math.min(6,stats.twBad*2),'');
    return TW_MSG[Math.min(stats.twBad,TW_MSG.length)-1]+`（目前 ${n} 個字）`},
  pa(v){const n=[...v].length;return n>=5?'':`回應長度必須至少為 5 個字。目前 ${n} 個字，研究小組覺得你可以再多說一點。`}
};
// 「三個字形容出題者」的關鍵字分類：作答時即時跳紅字，提交後分析也用同一套
function twKind(v){
  if(/幹|靠|操|肏|屁|雞掰|機掰|雞巴|G8|三小|殺小|洨|他媽|他馬|媽的|馬的|北七|白目|白痴|低能|智障|87|王八|去死|靠北|靠腰|垃圾|廢物|腦殘|ㄍㄋㄇ|ㄎㄅ|fuck|shit|wtf/i.test(v))return 'swear';
  if(/天才|帥|美|讚|神|強|酷|優秀|可愛|奇才|棒|厲害|好人|男神|女神|大佬|偶像/.test(v))return 'praise';
  if(/爛|醜|廢|笨|瘋|病|無聊|白癡|腦|神經|怪|煩|吵|欠|扯/.test(v))return 'diss';
  if(/哈|呵|笑|ㄏ|w|草|XD|ww/i.test(v))return 'lol';
  return '';
}
const TW_LIVE={
  swear:['系統偵測到不雅字眼。出題者看到了，現在正躲在廁所裡哭。','偵測到罵人。請注意您的用詞，出題者的玻璃心非常昂貴，碎了要賠。','這三個字已被系統記錄，並將以掛號信寄給您的國小班導。','系統偵測到攻擊性言論。出題者決定原諒你，但會把你的暱稱寫在小本本第一頁。'],
  diss:['系統偵測到疑似罵人。出題者假裝沒看到，但手在發抖。','偵測到負面評價。出題者已讀，並開始懷疑人生。'],
  praise:['系統偵測到稱讚。出題者看到這三個字，臉紅到螢幕都變暖了。你摸摸看。','這三個字，出題者會記一輩子。下輩子投胎也會帶著。','謝謝你。出題者決定把你寫進畢業典禮致詞的感謝名單，排在爸媽前面。','出題者剛剛偷偷截圖了，已設為手機桌布、鎖定畫面、LINE 大頭貼，還印出來護貝。','你怎麼可以這麼會說話。出題者已經哭了三包衛生紙，現在正在去買第四包的路上。','偵測到真心。出題者原本已經累到不想做期末了，看到這三個字，又可以再熬三個晚上。']
};
function twLive(card,v){
  const t=(v||'').trim();if([...t].length!==3)return warn(card,'tw2','');
  const kd=twKind(t),L=TW_LIVE[kd];if(!L)return warn(card,'tw2','');
  if(card.querySelector('.w-tw2')&&stats.twLive===t)return;stats.twLive=t;  // 同一組字不重複叫
  const h=[...t].reduce((s,c)=>s+c.charCodeAt(0),0);  // 同一組字固定同一句
  if(kd==='praise')play('ding');else play('error');
  warn(card,'tw2',L[h%L.length]);if(kd!=='praise')shake(card);
}
// 「為什麼會填到這裡」段落題：寫到愛你之類的，跳肉麻紅字（同一個關鍵字只叫一次，不會每打一個字就叫）
const PA_LOVE=/愛你|愛妳|愛死|好愛|超愛|最愛|喜歡你|喜歡妳|想你|想妳|嫁給我|娶我|在一起|告白|親親|抱抱|啾|💕|❤|♥|love you|ily/i;
const PA_LIVE=['偵測到告白。出題者讀到這裡，已經開始挑婚紗了。','系統偵測到愛意。研究小組三位成員同時臉紅，其中一位把便當打翻了。','你怎麼可以這樣撩出題者。這段話已被印出來貼在床頭，每天睡前讀三遍。','偵測到真愛。這段文字已被設為研究小組群組的公告，永久置頂。','出題者讀完這段話心跳 180，已經叫了救護車，但不後悔。','我們也愛你。真的。比期末報告還愛。'];
function paLive(card,v){
  const m=(v||'').match(PA_LOVE);if(!m)return warn(card,'pa2','');
  if(card.querySelector('.w-pa2')&&stats.paLive===m[0])return;stats.paLive=m[0];
  const h=[...m[0]].reduce((s,c)=>s+c.charCodeAt(0),0);
  play('ding');warn(card,'pa2',PA_LIVE[h%PA_LIVE.length]);
}
function validate(){
  let first=null;
  pages[page].qs.forEach(q=>{
    const need=q.req||(q.id==='mytype'&&ans.know===0);if(!need)return;
    const ok=answered(q),c=$('#q_'+q.id);c.classList.toggle('bad',!ok);if(!ok&&!first)first=c;
    if(ok&&CHECK[q.id]){const m=CHECK[q.id](ans[q.id].trim());warn(c,'vd',m);if(m){shake(c);play('error');if(!first)first=c}}});
  if(page===0&&!checkMbti()&&!first)first=$('#q_mytype');
  if($('#q_nick2')&&ans.nick2&&!checkNick()&&!first)first=$('#q_nick2');
  if(first){first.scrollIntoView({behavior:'smooth',block:'center'});return false}return true;
}
function bindNav(){
  const b=$('#back');if(b)b.onclick=()=>{page--;render()};
  $('#clear').onclick=()=>{pages[page].qs.forEach(q=>{if(q.id==='cap'||(q.timed&&stats.cdAuto))return;delete ans[q.id];if(q.type==='upload'&&ans.up===undefined&&HIST.up&&HIST.up.length)stats.upCleared=true;if(q.type==='upload'||q.type==='select')mark(q.id)});render();toast('已清除此頁的回答')};
  const nx=$('#next');
  if(page<N-1){nx.onclick=()=>{if(validate()){page++;render()}};return}
  const dodge=()=>{if(stats.submitDodge>=3)return;stats.submitDodge++;
    nx.style.transform=`translate(${(Math.random()*2-1)*Math.min(160,innerWidth/3)}px,${-20-Math.random()*60}px) rotate(${(Math.random()*2-1)*20}deg)`;play('boing');
    if(stats.submitDodge>=3)setTimeout(()=>{nx.style.transform='';nx.textContent='好啦，給你按';play('vineboom')},450)};
  nx.addEventListener('mouseenter',()=>{if(pages[page].qs.every(q=>!q.req||answered(q)))dodge()});
  nx.onclick=()=>{if(!validate())return;if(stats.submitDodge<3){dodge();return}submit()};
}

const MB_OK=/^[EI][NS][TF][JP]$/i;
// ===== 仿 Google 表單下拉選單 =====
function ddClose(){const m=$('.ddm');if(m)m.remove()}
document.addEventListener('click',e=>{
  const it=e.target.closest('.ddm [data-v]');
  if(it){const w=it.closest('.ddw'),s=w.querySelector('select'),v=it.dataset.v;ddClose();
    w.querySelector('.ddb span').textContent=v===''?'選擇':Q[s.name].opts[+v];
    if(s.value!==v){s.value=v;s.dispatchEvent(new Event('change',{bubbles:true}))}return}
  const b=e.target.closest('.ddb');
  if(b){const w=b.closest('.ddw'),had=w.querySelector('.ddm');ddClose();if(had)return;
    const s=w.querySelector('select'),q=Q[s.name],vals=['',...q.opts.map((_,k)=>String(k))];
    w.insertAdjacentHTML('beforeend',`<div class="ddm" role="listbox">${vals.map(v=>`<div role="option" data-v="${v}" class="${s.value===v?'sel':''}${v===''?' ph':''}">${v===''?'選擇':q.opts[+v]}</div>`).join('')}</div>`);
    // 跟 Google 一樣：清單蓋在欄位上，目前選的那一項對齊欄位的位置
    const m=w.querySelector('.ddm'),cur=m.querySelector('.sel')||m.firstElementChild;
    const off=Math.min(cur.offsetTop,Math.max(0,w.getBoundingClientRect().top-8));m.style.top=-off+'px';
    if(cur.offsetTop>off)m.scrollTop=cur.offsetTop-off;
    return}
  if(!e.target.closest('.ddm'))ddClose();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')ddClose()});
const hasDup=v=>{const c=Object.values(v||{});return new Set(c).size<c.length};
function gridDup(card,q){warn(card,'dup',hasDup(ans[q.id])?'每欄只能選擇一個回應':'')}
function onTextIn(t){const id=t.dataset&&t.dataset.id;if(!id)return;ans[id]=t.value;const c=$('#q_'+id);if(!c)return;c.classList.remove('bad');
  if(id==='mytype')warn(c,'mb','');
  if(c.querySelector('.w-vd'))warn(c,'vd','');
  if(id==='tw')twLive(c,t.value);
  if(id==='pa')paLive(c,t.value);
  if(t.tagName==='TEXTAREA'){t.style.height='auto';t.style.height=t.scrollHeight+'px';const n=c.querySelector('.tac');if(n)n.textContent=`已輸入 ${[...t.value.trim()].length} 字`}}
document.addEventListener('input',e=>onTextIn(e.target));
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.id){onTextIn(t);return}  // 日期、時間欄位有些瀏覽器只觸發 change
  // 單選方格：每一列是一組 radio，name 是「題號__列」
  const gm=t.name&&t.name.match(/^(\w+)__(\d+)$/);
  if(gm&&Q[gm[1]]){const q=Q[gm[1]],r=+gm[2],k=+t.value,v={...(ans[q.id]||{})},card=$('#q_'+q.id);
    v[r]=k;ans[q.id]=v;
    // 每欄只能選一個：重複時跳紅字警告，但不擋人（分析時再吐槽）
    if(q.oneCol){gridDup(card,q);if(hasDup(v))play('error')}
    (HIST[q.id]=HIST[q.id]||[]).push(`${q.rows[r]}：${q.cols[k].replace(/<br>/g,'')}`);
    if(answered(q))card.classList.remove('bad');
    if(q.id==='tg'&&r===0&&k===2){play('bruh');toast('你在「媽媽」那一列選了「誰？」。我們不會說什麼，但媽媽會。')}
    return}
  const id=t.name;if(!id||!Q[id])return;const q=Q[id],card=$('#q_'+id);
  if(q.type==='select'&&t.value===''){delete ans[id];mark(id);return}
  if(q.type==='checkbox')ans[id]=[...card.querySelectorAll('input:checked')].map(i=>+i.value);else ans[id]=+t.value;
  // 記下「使用者自己點的」答案（系統之後自動改的不算），用來判斷 BOTS 隱藏人格
  (stats.usr=stats.usr||{})[id]=q.type==='checkbox'?[...ans[id]]:ans[id];
  const lab=q.type==='scale'?`${t.value} 分`:(q.opts&&q.opts[+t.value])||t.value;
  (HIST[id]=HIST[id]||[]).push(q.type==='checkbox'?(t.checked?'勾選':'取消')+lab:lab);
  const gv=+t.value;if(GAG[id]&&GAG[id].includes(gv)&&(q.type!=='checkbox'||t.checked))
    GAGC.push({id,name:id==='jd'?(gv<=2?'匆匆忙忙、連滾帶爬':'從從容容、遊刃有餘'):q.opts[gv]});
  card.classList.remove('bad');picks[id]&&picks[id](+t.value,card,t,q);
});
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');
  if(g){
    window.open(CONFIG[g.dataset.go+'Url'],'_blank','noopener');noteGo(g.dataset.go);
    const k=g.dataset.go==='ig'?0:1;ans.ig=[...new Set([...(ans.ig||[]),k])];(stats.usr=stats.usr||{}).ig=[...ans.ig];
    const c=$('#q_ig');c.querySelector(`input[value="${k}"]`).checked=true;c.classList.remove('bad');picks.ig(k,c);return;
  }
  const th=e.target.closest('#thumb');
  if(th){stopAll();
    if(CONFIG.hotpotFile){th.outerHTML=hotpotHTML();hotpotFallback()}
    else{ytShow('hot',CONFIG.hotpotId,h=>th.insertAdjacentHTML('afterend',h));th.remove()}
    hotDone()}
});

const AR={
  '0-1':'未滿 18 歲的大學生 / 研究生？請問你的指導教授知道你還不能考駕照嗎？',
  '0-2':'未滿 18 歲的上班族？勞動部想跟你聊聊。',
  '2-0':'23 歲以上的高中生？這已經不是重考可以解釋的範圍了。',
  '3-0':'31 歲以上的高中生？請問是在教書，還是在讀第 N 次高三？'
};
function checkAR(silent){
  const card=$('#q_role');if(!card)return;const t=AR[ans.age+'-'+ans.role];
  warn(card,'ar',t||'');
  if(!t){mark('ar');return}
  mark('ar','LIAR',6,AR_OBS[ans.age+'-'+ans.role]);
}
const AR_OBS={
  '0-1':'未滿 18 歲就讀大學，對「事實」的定義比一般人寬鬆約四成。',
  '0-2':'未滿 18 歲就當上班族，勞動部想跟其聊聊。',
  '2-0':'23 歲以上還在讀高中，對高中生活的執念連彼得潘都說太誇張。',
  '3-0':'31 歲以上的高中生，人生走了一條非常獨特的路線（或是勾錯了）。'
};
const MB_MSG=['請填寫有效的 MBTI 類型（例如：INFP、ESTJ）。','本問卷為正式學術問卷，請勿隨意填寫。','我們是很正經的問卷，請你也正經一點。','研究小組已經注意到你了。','好，你贏了。但這格還是要填對才能繼續。'];
const FORGOT=/忘|不記得|不知道|不曉得|記不得|idk|不清楚/i;
function checkMbti(){
  const card=$('#q_mytype');if(!card)return true;const v=(ans.mytype||'').trim();
  warn(card,'mb','');
  if(!v){mark('mb2');return true}
  if(MB_OK.test(v)){
    stats.lastBad=null;
    if(ans.know===1||ans.know===2){
      warn(card,'mb',ans.know===2?'您剛剛選的是「沒有做過」。':'您剛剛選的是「有，但忘記了」。');shake(card);
      mark('mb2','LIAR',3,ans.know===2?'說沒做過 MBTI 卻填得出類型，記憶有選擇性，跟欠錢的朋友一樣。':'說忘了自己的 MBTI，下一題馬上想起來，「忘記了」通常只是懶得想。',3);
      const key=ans.know+v.toUpperCase();if(stats.knowWarned===key)return true;stats.knowWarned=key;return false}
    mark('mb2');return true;
  }
  if(FORGOT.test(v)){
    const msg=ans.know===0?'您上一題選的是「有，且<b>記得</b>自己的類型」。':ans.know===1?'我們知道你忘了，上一題就說過了。不記得的話這格可以空白。':'沒做過的話，這格可以空白就好。';
    warn(card,'mb',msg);shake(card);
    mark('mbti','LIAR',5,'剛說記得自己的 MBTI，下一秒就填「忘記」，前後矛盾不到十秒。',4);
    return false;
  }
  if(v!==stats.lastBad){stats.badMbti++;stats.lastBad=v}
  shake(card);
  warn(card,'mb',MB_MSG[Math.min(stats.badMbti,MB_MSG.length)-1]);
  mark('mbti','LIAR',Math.min(10,stats.badMbti*3),`MBTI 欄位亂填${stats.badMbti>1?`，被擋了 ${stats.badMbti} 次還在試`:''}，看到規則的第一反應是測試它的底線在哪。`,3);
  return false;
}
function checkNick(){
  const card=$('#q_nick2'),a=(ans.nick||'').trim(),b=(ans.nick2||'').trim();
  if(a.toLowerCase()===b.toLowerCase()){warn(card,'nk','');mark('nick2');stats.nickWarned=null;return true}
  mark('nick2','LIAR',4,'前後兩次填的暱稱不一樣，自我認同每隔幾頁就更新一次，比手機系統還勤。',3);
  if(stats.nickWarned===b)return true;
  stats.nickWarned=b;warn(card,'nk','與第一頁填寫的不同。我們不會說什麼，但會記下來。');shake(card);return false;
}
const LINES=['你從','你從新竹','你從桃園','你從','你從','你從桃園新竹','你從桃園新竹','你從桃園新竹','好','你從桃園新竹','你從桃園新竹','你從桃園新竹','你從桃園新竹','你從桃園新竹','你從桃園新竹','到台北吃麻油雞','你從','好','你從桃園新竹','要開車吃麻油雞到台北','然後你吃完麻油雞跟朋友唱歌','然後你說你會','搭計程車回桃園新竹','好啦隨便啦我沒有辦法跟你溝通'];
function listen(card){
  const box=card.querySelector('#tr');
  if(stats.listened){box.innerHTML=LINES.map(l=>`<div>${l}</div>`).join('');return}
  const go=()=>{stats.listened=true;let i=0;(function nx(){if(i>=LINES.length||!document.body.contains(box))return;
    box.insertAdjacentHTML('beforeend',`<div>${LINES[i]}</div>`);i++;setTimeout(nx,i<6?550:i<15?320:600)})()};
  box.innerHTML=`<div style="color:#9aa0a6">${ic('call',16)} 通話接通中…</div>`;let tm,cap;
  // 觸發條件：對話框「完整」出現在畫面上方 10% ～ 下方 20% 之間（一般閱讀時放它的位置），而且停住 1 秒才開始。
  // 滑過去不算，一離開就重新計時，所以不會在使用者還沒看到時就先跑完。
  const start=()=>{if(stats.listened)return;clearTimeout(tm);io.disconnect();
    if(!document.body.contains(box))return;box.innerHTML='';go()};
  const io=new IntersectionObserver(es=>{
    clearTimeout(tm);
    if(es[0].isIntersecting&&es[0].intersectionRatio>=.99)tm=setTimeout(start,1000);
  },{rootMargin:'-10% 0px -20% 0px',threshold:[0,1]});
  io.observe(box);
}

const hooks={
  role(){checkAR(true)},
  m2(card){listen(card)},
  j3(card){preloadRick(card)},
  vid(card){if(CONFIG.hotpotFile)return;
    ytPreload('hot',CONFIG.hotpotId,h=>card.querySelector('#thumb').insertAdjacentHTML('afterend',h),hotStarted);
    ytArm('hot',card,()=>card.querySelector('#thumb'),'cover')},
  q2(card,q){
    const t=(ans.mytype||'').trim().toUpperCase();if(!MB_OK.test(t))return;
    q.opts[3]=`「你是不是 ${t}」`;card.querySelector('.opt[data-k="3"] span').textContent=q.opts[3];
  },
  t4(card,q){
    dodger(card,q,2,'dodge','好啦，有一點點',n=>mark('dodge','CHAD',n*2,''));
  },
  ig(card,q){
    dodger(card,q,2,'igDodge','好啦，等一下就去追',n=>{});
  },
  cd(card,q){countdown(card,q)},
  au(card){auBind(card)},
  cap(card){const l=card.querySelector('#rcl');if(l)l.onclick=()=>capOpen(card)},
  up(card,q){upBind(card,q)},
  s3(card,q){gridDup(card,q)},
  pa(card){const t=card.querySelector('.ta');if(t.value)t.style.height=t.scrollHeight+'px'}
};

