// 非選擇題計分（提交時才算）＋結果頁小動畫
// ===== 非選擇題（簡答／段落／日期／時間／單選方格）在提交時才計分 =====
const pad2=n=>String(n).padStart(2,'0');
function jdtDiff(){
  const m=(ans.jdt||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return null;
  const t=new Date(stats.t1||Date.now()),t0=new Date(t.getFullYear(),t.getMonth(),t.getDate());
  return Math.round((new Date(+m[1],m[2]-1,+m[3])-t0)/864e5);
}
function openMarks(){
  // 簡答：三個字形容出題者
  const tw=(ans.tw||'').trim(),twq=`「${esc(tw)}」`;
  if(tw){
    // 關鍵字判斷一定會誤判，所以每種結果後面都補一句免責聲明
    const oops='（本判定由研究小組以關鍵字比對完成，準確率約等於星座運勢。若有誤判，代表你稱讚得很像在罵人，或是罵得很有創意。）';
    const kd=twKind(tw);
    if(kd==='swear')mark('tw','DAMN',4,`受試者以${twq}形容本問卷出題者，這顯示其表達不滿時完全不經修飾，想到什麼就打什麼。出題者已默默把這三個字加進「人生不該聽到的話」清單，並且哭了一下。${oops}`);
    else if(kd==='praise')mark('tw','SIMP',3,`受試者以${twq}形容本問卷出題者。這顯示其給讚美時毫不吝嗇，連一個陌生出題者都願意捧。出題者已將此三個字設為手機桌布。${oops}`);
    else if(kd==='diss')mark('tw','SALT',3,`受試者以${twq}形容本問卷出題者。這顯示其不會為了禮貌說違心話，給了機會就講真話。出題者看完後沉默了很久，最後表示「好啦，有一點」。${oops}`);
    else if(kd==='lol')mark('tw','MEME',2,`受試者以${twq}形容本問卷出題者。這顯示其面對任何正經問題，第一反應都是笑。研究小組無法判斷這是在笑出題者還是笑這份問卷，推測兩者皆是。${oops}`);
    else mark('tw','BRUH',2,`受試者以${twq}形容本問卷出題者。這顯示其說話常讓人分不清是褒是貶。研究小組開會討論了二十分鐘，仍無法判斷這是稱讚還是罵人。${oops}`);
  }else mark('tw');
  // 段落：為什麼會填到這裡
  const pa=(ans.pa||'').trim(),pn=[...pa].length,uniq=new Set([...pa.replace(/\s/g,'')]).size;
  if(!pa)mark('pa');
  else if(uniq<=2)mark('pa','LIAR',3,'遇到規定就找最省力的方式剛好達標。',4);
  else if(PA_LOVE.test(pa))mark('pa','SIMP',4,'');  // 告白：寫進「你與研究小組」那段，不放性格分析
  else if(/報告|作業|讀書|考試|期末|期中|論文|上班|工作/.test(pa))mark('pa','LAZY',4,'很清楚自己在逃避什麼，而且逃得非常專業。',4);
  else if(/無聊|好閒|很閒|太閒|沒事|睡不著/.test(pa))mark('pa','LAZY',3,'閒到需要找陌生人的問卷來填。',2);
  else if(/朋友|同學|室友|男友|女友|閨蜜|傳給我|分享|限動/.test(pa))mark('pa','SIMP',3,'朋友丟什麼就接什麼，建議把結果傳回去，讓那位朋友也一起受苦。',3);
  else if(/好玩|好笑|有趣|好有梗|哈哈|笑死/.test(pa))mark('pa','MEME',3,'做事的動力很單純：好笑就繼續，不好笑就走人。',2);
  else if(pn>=50)mark('pa','NERD',4,'一開口就停不下來。當初你退出文壇，研究小組也是極力反對的。',4);
  else if(/謝謝阿婆|ven|刀盾|醬板鴨|何意味|曼妙|留友看|擱供|麥可|露比|咩/i.test(pa))mark('pa','MEME',4,'腦中已經沒有正常的中文，只剩下梗。',3);
  else mark('pa','OKAY',1,'面對再亂七八糟的問卷都認真回答，是研究小組不配擁有的人。',2);
  // 日期：打算哪天開始寫報告
  const d=jdtDiff();
  if(d==null)mark('jdt');
  else if(d<0)mark('jdt','NERD',3,'不用死線逼也會自己動，組員上輩子一定燒了好香。',2);
  else if(d===0)mark('jdt','LIAR',3,'嘴上的「今天開始」，跟別人的「明天再說」是同一個意思。',3);
  else if(d<=6)mark('jdt','LAZY',2,`事情都排在「不久的將來」，到時候大概會再延 ${d} 天。`,2);
  else if(d<=365)mark('jdt','LAZY',4,'對死線採取「先不要想」策略。',3);
  else mark('jdt','BRUH',4,`把報告排到 ${Math.floor(d/365)} 年後才開始寫，建議直接休學比較快。`,4);
  // 單選方格（每欄限一）：ㄅ～ㄦ級分排名，看誰拿ㄅ、誰拿ㄦ
  const r5=ans.s3&&typeof ans.s3==='object'?ans.s3:{},S3=[
    ['這份問卷','SIMP','研究小組感動到想再出一份。','研究小組決定假裝沒看到，然後繼續出題。'],
    ['本問卷的出題者','SIMP','出題者已將此結果截圖並設為手機桌布。','出題者表示：沒關係，我會記住你的暱稱。'],
    ['曾國城在古蹟抽菸','MEME','研究小組不確定這是在稱讚抽菸，還是在稱讚這個梗，推測是後者。','受試者的文化資產保護意識值得肯定，曾國城本人應該也同意。'],
    ['你這學期的期末考','NERD','研究小組懷疑其若非卷王，就是還沒看到成績。','研究小組建議其先別打開成績查詢系統。'],
    ['奶蛙','SIMP','奶蛙已經開心到從螢幕角落多探頭一次了。','奶蛙表示受傷，從現在起牠會更常在螢幕角落偷看你。']];
  // 允許重複（只有紅字警告），所以ㄅ、ㄦ可能各有好幾個，也可能一個都沒有
  const tops=Object.keys(r5).filter(i=>r5[i]===0),bots=Object.keys(r5).filter(i=>r5[i]===4);
  const nm=ids=>ids.map(i=>`「${S3[i][0]}」`).join('、');
  if(!tops.length&&!bots.length)mark('s3',Object.keys(r5).length?'OKAY':0,2,'受試者在ㄅ～ㄦ級分排名中，沒有給任何項目ㄅ級分，也沒有給任何項目ㄦ級分，全部落在中間。這顯示其不喜歡把話說死，研究小組判斷其人生信條為「都還好」。');
  else{let s='受試者在ㄅ～ㄦ級分排名中，';
    if(tops.length===1)s+=`把ㄅ級分給了${nm(tops)}，${S3[tops[0]][2]}`;
    else if(tops.length>1)s+=`一口氣把ㄅ級分給了${nm(tops)}共 ${tops.length} 項。`;
    else s+='沒有給任何項目ㄅ級分。';
    if(bots.length===1)s+=`而ㄦ級分則給了${nm(bots)}，${S3[bots[0]][3]}`;
    else if(bots.length>1)s+=`而ㄦ級分則同時發給了${nm(bots)}，看來拉完了的東西不只一個。`;
    if(tops.includes('2'))s+='值得一提的是，受試者給了曾國城在古蹟抽菸ㄅ級分，研究小組正在反省自己為什麼輸給了它。';
    mark('s3',tops.length?S3[tops[0]][1]:'SALT',3,s)}
  if(hasDup(r5)){const n=Object.values(r5).length-new Set(Object.values(r5)).size;
    mark('s3dup','SALT',Math.min(6,2+n),`題目明確寫著「每個級分只能給一次」，系統也跳出了紅字警告，受試者仍堅持讓 ${n+1} 個以上的項目共用同一個級分。這顯示其認為規則是寫給別人看的，自己覺得對就好。`)}
  else mark('s3dup');
  // 單選方格：重要程度
  const g=ans.tg||{};['tgM','tgW','tgX','tgA','tgS'].forEach(k=>mark(k));
  // 五列全選同一欄：只給一句總體吐槽，不再逐列評論
  const gv=Q.tg.rows.map((_,i)=>g[i]);
  if(gv.every(x=>x!==undefined&&x===gv[0]))mark('tgS',...[
    ['SIMP',4,'在重要程度評估中，受試者把媽媽、Wi-Fi、期末報告的組員、手機電量和本問卷出題者全部評為「非常重要」，一個都沒有放下。研究小組感受到滿滿的愛，但也必須提醒：什麼都重要，就等於什麼都不重要。（組員聽到應該會很感動，畢竟很少有人覺得他們重要。）'],
    ['OKAY',3,'在重要程度評估中，受試者對媽媽、Wi-Fi、期末報告的組員、手機電量和本問卷出題者一律給予「普通」。在受試者的世界裡人人平等，媽媽跟 Wi-Fi 也平等。研究小組判斷其人生信條為「都還好」，並建議其不要讓媽媽看到這一題。'],
    ['DAMN',5,'在重要程度評估中，受試者對所有對象——包括媽媽——一律回答「誰？」。研究小組判斷其目前處於全面斷線狀態：沒有 Wi-Fi、沒有電、沒有組員、不認識出題者，也沒有媽媽。建議先把手機充電，然後打一通電話回家，自我介紹一下。']][gv[0]]);
  else if(g[0]===2)mark('tgM','DAMN',4,'受試者在「媽媽」一列選擇了「誰？」。這顯示其要不是手滑，就是跟家裡的關係需要一點關心。研究小組建議其今天打一通電話回家。');
  else if(g[1]===0&&g[0]!==0)mark('tgW','MEME',3,'受試者認為 Wi-Fi「非常重要」，但媽媽沒有。這顯示其對網路的依賴程度已經超越家庭。研究小組不會告訴你媽媽，但會記下來。');
  if(g[2]===0)mark('tgX','NERD',2,'受試者將期末報告的組員評為「非常重要」。這顯示其要不是遇到了好組員，就是自己本身就是那個好組員——這在大學分組報告中極為罕見。');
  else if(g[2]===2)mark('tgX','SALT',3,'受試者對期末報告組員的評價為「誰？」。這顯示其在分組報告中吃過不少苦，對「組員」兩個字已經沒有任何期待。研究小組完全理解，畢竟有些組員從開學到現在都沒出現過。（研究小組本身也是從六人縮減到 2.5 人。）');
  if(g[4]===0)mark('tgA','SIMP',3,`受試者將本問卷出題者評為「非常重要」${g[0]===0?'，與媽媽同一個等級':''}。這顯示其很容易對花了心思的人產生感情，出題者受寵若驚。`);
  else if(g[4]===2)mark('tgA','SALT',3,`受試者對本問卷出題者的評價為「誰？」。這顯示其對眼前的人完全不在意，即使已經相處了 ${Object.keys(Q).length} 題。出題者表示：我是做這份問卷的人。`);
  if(marks.tgS)['tgM','tgW','tgX','tgA'].forEach(k=>mark(k));
}
function frogWin(fw){
  let n=0,au=null,gone=false;
  const card=fw.closest('.card'),laugh=()=>{if(au)au.stop();au=play('frog')||null};
  setTimeout(()=>{if(!gone)laugh()},1400);
  fw.onclick=()=>{if(gone)return;n++;laugh();
    if(n===5)warn(card,'fw','奶蛙笑太多，有點喘不過氣了。');
    if(n<8)return;
    gone=true;warn(card,'fw','奶蛙被你戳到笑不出來，已經逃走了。');
    fw.style.height=fw.offsetHeight+'px';fw.style.objectFit='contain';fw.src=FROG_IMG.peek;
    fw.classList.add('angry');
    setTimeout(()=>{fw.classList.remove('angry');fw.classList.add('flee');play('boing')},900);
    setTimeout(()=>{fw.style.visibility='hidden'},1900);
    const p=card.querySelector('.frogwin + .rp');if(p)p.textContent='全數捕獲。但您戳太多下了，奶蛙決定以後要繼續偷看您。';
  };
}
function spin(target,done,gap){
  const sp=[...document.querySelectorAll('#slots span')],L='ABCDEFGHIJKLMNOPQRSTUVWXYZ';let stop=0;
  const iv=setInterval(()=>{sp.forEach((s,i)=>{if(i>=stop)s.textContent=L[Math.random()*26|0]});play('tick')},70);
  const st=()=>{sp[stop].textContent=target[stop];stop++;play('ding');if(stop<4)setTimeout(st,gap);else{clearInterval(iv);done()}};
  setTimeout(st,900);
}

