// 非選擇題計分（提交時才算）＋結果頁小動畫
// ===== 非選擇題（簡答／段落／日期／時間／單選方格）在提交時才計分 =====
const pad2=n=>String(n).padStart(2,'0');
// 年份可能是 0001 或超過 9999（瀏覽器允許到 275760 年），所以年份抓 4～6 位數；
// 0～99 年不能直接 new Date(y,…)，會被當成 1900～1999 年，要用 setFullYear
function jdtDate(v){
  const m=(v||'').match(/^(\d{4,6})-(\d{2})-(\d{2})$/);if(!m)return null;
  const d=new Date(0);d.setHours(0,0,0,0);d.setFullYear(+m[1],m[2]-1,+m[3]);return d;
}
function jdtDiff(v=ans.jdt){
  const d=jdtDate(v);if(!d)return null;
  const t=new Date(stats.t1||Date.now()),t0=new Date(t.getFullYear(),t.getMonth(),t.getDate());
  return Math.round((d-t0)/864e5);
}
// 不合理的年份：作答時跳紅字（live），提交後寫進分析（ana）。沒有命中回傳 null，走一般的天數判斷
function jdtOdd(v=ans.jdt){
  const dt=jdtDate(v);if(!dt)return null;
  const y=dt.getFullYear(),cy=new Date(stats.t1||Date.now()).getFullYear(),d=jdtDiff(v);
  if(y<=1)return{type:'BRUH',pts:5,
    live:'西元元年？那時候耶穌剛出生，你的報告題目大概是〈論馬槽的通風問題〉。',
    ana:'連時間軸都可以拉到西元元年，拖延的反方向也能做到極致，研究小組不知道該稱讚還是報警。'};
  if(y<1000)return{type:'BRUH',pts:5,
    live:`西元 ${y} 年？那時候連紙都還很貴。請問你打算把報告刻在竹簡上嗎？`,
    ana:`宣稱早在西元 ${y} 年就開始寫報告，研究小組已將此事轉交考古學系處理。`};
  if(y<1900)return{type:'LIAR',pts:5,
    live:`${y} 年還沒有電燈、沒有網路、也還沒有你。請問你是用毛筆寫報告嗎？`,
    ana:`說自己 ${y} 年就開始寫報告，那時候連電燈都還沒普及，說謊的時候完全不查資料。`};
  if(y<cy-30)return{type:'LIAR',pts:4,
    live:`${y} 年你應該還沒出生。出生前就開始寫報告，這已經不是卷王，是胎教。`,
    ana:'自稱出生前就開始準備報告，研究小組判斷其不是卷王，就是對「開始」的定義非常寬鬆。'};
  if(d<-365)return{type:'LAZY',pts:4,
    live:`你 ${cy-y} 年前就開始寫了，到現在還沒寫完？這份報告陪你的時間比大部分的感情還長。`,
    ana:`報告已經開始寫了 ${cy-y} 年還沒寫完，「有在進行」跟「有在完成」是兩件完全不同的事。`};
  if(y>99999)return{type:'BRUH',pts:5,
    live:`西元 ${y} 年？瀏覽器願意讓你選到這裡已經是奇蹟了。那時候太陽大概也不想上班了。`,
    ana:'把報告排到瀏覽器日期的極限才開始寫，拖延已經不是習慣，是一種宇宙尺度的信仰。'};
  if(y>=3000)return{type:'BRUH',pts:5,
    live:`${y} 年？屆時人類可能已經移居火星，報告請以全像投影方式繳交。`,
    ana:`把報告排到 ${y} 年才開始寫，研究小組建議直接把報告列為傳家之寶。`};
  if(y>cy+100)return{type:'BRUH',pts:4,
    live:`${y} 年你大概已經不在了。這份報告預計將由你的曾孫代為完成。`,
    ana:'把報告排到自己的壽命之外，打算讓下一代繼承這份死線，非常有遠見。'};
  return null;
}
// 日期欄位打字時，瀏覽器會先吐出 0002-… 這種半成品年份，所以停手 0.7 秒才判斷，避免一路亂叫
let jdtTm=0;
function jdtLive(card,v,silent){
  clearTimeout(jdtTm);
  const go=()=>{if(!document.body.contains(card))return;const o=jdtOdd(v);
    if(!o){stats.jdtLive=null;return warn(card,'jdt','')}
    if(card.querySelector('.w-jdt')&&stats.jdtLive===o.live)return;stats.jdtLive=o.live;
    warn(card,'jdt',o.live);if(!silent){play('error');shake(card)}};
  if(silent)go();else jdtTm=setTimeout(go,700);
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
  const d=jdtDiff(),jo=jdtOdd();
  if(d==null)mark('jdt');
  else if(jo)mark('jdt',jo.type,jo.pts,jo.ana,5);
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
  // 級分可以重複給，所以ㄅ、ㄦ可能各有好幾個，也可能一個都沒有
  const tops=Object.keys(r5).filter(i=>r5[i]===0),bots=Object.keys(r5).filter(i=>r5[i]===4);
  const nm=ids=>ids.map(i=>`「${S3[i][0]}」`).join('、');
  const sk=gridKind(r5);
  // 五項全同分：逐項評論沒有意義，直接給一句總評
  if(sk&&sk.k==='same')mark('s3',...[
    ['SIMP',4,'受試者在ㄅ～ㄦ級分評分中，把五個項目全部給了ㄅ級分，包括期末考跟曾國城在古蹟抽菸。研究小組肯定其博愛精神，但也想問：你對任何東西有過意見嗎？',4],
    ['OKAY',2,'受試者在ㄅ～ㄦ級分評分中，五個項目全部給了ㄆ級分。不是最好，但每個都還不錯——這是一種很安全的人生態度。',3],
    ['OKAY',3,'受試者在ㄅ～ㄦ級分評分中，五個項目全部給了正中間的ㄇ級分。研究小組判斷其人生信條為「都還好」，並懷疑其根本沒看題目。',3],
    ['SALT',3,'受試者在ㄅ～ㄦ級分評分中，五個項目全部給了ㄈ級分。沒有一個值得更好，也沒有一個值得最差，冷淡得很一致。',3],
    ['SALT',5,'受試者在ㄅ～ㄦ級分評分中，五個項目全部給了ㄦ級分，連奶蛙都沒放過。研究小組判斷其今天心情不太好，建議先吃點東西。',5]][sk.v]);
  // 四項同分、只有一項不同：只評論那個被特別對待的項目
  else if(sk&&sk.k==='odd'){const G=Q.s3.cols,it=`「${S3[sk.i][0]}」`,up=sk.v<sk.w;
    const LOVE=['全場只有這份問卷拿到ㄅ級分，其他四項——包括出題者——全部ㄦ級分。愛作品，不愛作者。',
      '眼裡只有出題者：出題者拿ㄅ級分，其他四項全部ㄦ級分，連奶蛙都沒例外。出題者已將此結果截圖並設為手機桌布。',
      '全場唯一拿到ㄅ級分的是「曾國城在古蹟抽菸」，其他四項全部拉完了。研究小組開了一場會，仍然無法理解。',
      '全場唯一拿到ㄅ級分的是期末考，其他四項全部ㄦ級分。研究小組懷疑其若非卷王，就是已經被考傻了。',
      '全場唯一拿到ㄅ級分的是奶蛙，其他四項全部ㄦ級分。奶蛙已經開心到從螢幕角落多探頭一次了。'];
    const HATE=['其他四項全部ㄅ級分，唯獨這份問卷拿ㄦ級分。什麼都好，就是這份問卷不行——但還是填到這裡了。',
      '其他四項全部ㄅ級分，唯獨出題者拿ㄦ級分，連曾國城在古蹟抽菸都贏過出題者。針對性非常強，出題者表示：沒關係，我會記住你的暱稱。',
      '其他四項全部ㄅ級分，唯一拉完了的是「曾國城在古蹟抽菸」。文化資產保護意識值得肯定，但連期末考都給ㄅ這件事，研究小組有點擔心。',
      '其他四項全部ㄅ級分，唯獨期末考拿ㄦ級分。這是研究小組唯一完全認同的一次作答。',
      '其他四項全部ㄅ級分，唯獨奶蛙拿ㄦ級分。奶蛙表示受傷，從現在起牠會更常在螢幕角落偷看你。'];
    const s=sk.v===0&&sk.w===4?LOVE[sk.i]:sk.v===4&&sk.w===0?HATE[sk.i]
      :up?`其他四項都給${G[sk.w]}級分，只有${it}被拉高到${G[sk.v]}級分，偏心得很明顯。${S3[sk.i][2]}`
      :`其他四項都給${G[sk.w]}級分，只有${it}被壓到${G[sk.v]}級分，針對性很強。${S3[sk.i][3]}`;
    mark('s3',up?S3[sk.i][1]:'SALT',Math.abs(sk.v-sk.w)>=3?4:3,'受試者在ㄅ～ㄦ級分評分中，'+s,Math.abs(sk.v-sk.w)>=3?4:3)}
  else if(!tops.length&&!bots.length)mark('s3',Object.keys(r5).length?'OKAY':0,2,'受試者在ㄅ～ㄦ級分排名中，沒有給任何項目ㄅ級分，也沒有給任何項目ㄦ級分，全部落在中間。這顯示其不喜歡把話說死，研究小組判斷其人生信條為「都還好」。');
  else{let s='受試者在ㄅ～ㄦ級分排名中，';
    if(tops.length===1)s+=`把ㄅ級分給了${nm(tops)}，${S3[tops[0]][2]}`;
    else if(tops.length>1)s+=`一口氣把ㄅ級分給了${nm(tops)}共 ${tops.length} 項。`;
    else s+='沒有給任何項目ㄅ級分。';
    if(bots.length===1)s+=`而ㄦ級分則給了${nm(bots)}，${S3[bots[0]][3]}`;
    else if(bots.length>1)s+=`而ㄦ級分則同時發給了${nm(bots)}，看來拉完了的東西不只一個。`;
    if(tops.includes('2'))s+='值得一提的是，受試者給了曾國城在古蹟抽菸ㄅ級分，研究小組正在反省自己為什麼輸給了它。';
    mark('s3',tops.length?S3[tops[0]][1]:'SALT',3,s)}
  // 作答型態另外給一句（全同分已在上面總評，這裡不重複）
  if(!sk||sk.k==='same'||sk.k==='odd')mark('s3dup');
  else if(sk.k==='rank')mark('s3dup','NERD',3,'題目從頭到尾沒說級分不能重複，受試者卻自動把ㄅ到ㄦ各用一次，排出完整名次。沒人規定還自己定規矩，組員最喜歡這種人。',3);
  else if(sk.k==='split')mark('s3dup','SALT',4,'評分時只用了ㄅ級分跟ㄦ級分，中間三個級分完全沒碰。對其而言世界只有兩種東西：最好的，跟拉完了的。',4);
  else if(sk.k==='two')mark('s3dup','OKAY',2,'五個項目只用了兩種級分，懶得細分，能分成兩堆就好。',2);
  else mark('s3dup','OKAY',2,`評分時讓 ${sk.n+1} 個以上的項目並列同一級分。研究小組判斷其不喜歡比較，或者只是懶得比較。`,2);
  // 單選方格：重要程度
  const g=ans.tg||{};['tgM','tgW','tgX','tgA','tgS'].forEach(k=>mark(k));
  // 五列全選同一欄：只給一句總體吐槽，不再逐列評論
  const gv=Q.tg.rows.map((_,i)=>g[i]),tgk=gridKind(g,2);
  if(gv.every(x=>x!==undefined&&x===gv[0]))mark('tgS',...[
    ['SIMP',4,'在重要程度評估中，受試者把媽媽、Wi-Fi、期末報告的組員、手機電量和本問卷出題者全部評為「非常重要」，一個都沒有放下。研究小組感受到滿滿的愛，但也必須提醒：什麼都重要，就等於什麼都不重要。（組員聽到應該會很感動，畢竟很少有人覺得他們重要。）'],
    ['OKAY',3,'在重要程度評估中，受試者對媽媽、Wi-Fi、期末報告的組員、手機電量和本問卷出題者一律給予「普通」。在受試者的世界裡人人平等，媽媽跟 Wi-Fi 也平等。研究小組判斷其人生信條為「都還好」，並建議其不要讓媽媽看到這一題。'],
    ['DAMN',5,'在重要程度評估中，受試者對所有對象——包括媽媽——一律回答「誰？」。研究小組判斷其目前處於全面斷線狀態：沒有 Wi-Fi、沒有電、沒有組員、不認識出題者，也沒有媽媽。建議先把手機充電，然後打一通電話回家，自我介紹一下。']][gv[0]]);
  else if(tgk&&tgk.k==='odd')mark('tgS',tgk.v<tgk.w?['SIMP','MEME','NERD','MEME','SIMP'][tgk.i]:tgk.i===0?'DAMN':'SALT',
    tgk.v+tgk.w===2&&tgk.v!==1?4:3,'受試者在重要程度評估中，'+tgOdd(tgk),tgk.v+tgk.w===2&&tgk.v!==1?4:3);
  else if(g[0]===2)mark('tgM','DAMN',4,'受試者在「媽媽」一列選擇了「誰？」。這顯示其要不是手滑，就是跟家裡的關係需要一點關心。研究小組建議其今天打一通電話回家。');
  else if(g[1]===0&&g[0]!==0)mark('tgW','MEME',3,'受試者認為 Wi-Fi「非常重要」，但媽媽沒有。這顯示其對網路的依賴程度已經超越家庭。研究小組不會告訴你媽媽，但會記下來。');
  if(g[2]===0)mark('tgX','NERD',2,'受試者將期末報告的組員評為「非常重要」。這顯示其要不是遇到了好組員，就是自己本身就是那個好組員——這在大學分組報告中極為罕見。');
  else if(g[2]===2)mark('tgX','SALT',3,'受試者對期末報告組員的評價為「誰？」。這顯示其在分組報告中吃過不少苦，對「組員」兩個字已經沒有任何期待。研究小組完全理解，畢竟有些組員從開學到現在都沒出現過。（研究小組本身也是從六人縮減到 2.5 人。）');
  if(g[4]===0)mark('tgA','SIMP',3,`受試者將本問卷出題者評為「非常重要」${g[0]===0?'，與媽媽同一個等級':''}。這顯示其很容易對花了心思的人產生感情，出題者受寵若驚。`);
  else if(g[4]===2)mark('tgA','SALT',3,`受試者對本問卷出題者的評價為「誰？」。這顯示其對眼前的人完全不在意，即使已經相處了 ${Object.keys(Q).length} 題。出題者表示：我是做這份問卷的人。`);
  if(marks.tgS)['tgM','tgW','tgX','tgA'].forEach(k=>mark(k));
}
// 重要程度：四列同一欄、只有一列不同時的吐槽（分析頁、結果頁共用）
// 組員那一列最後落在「誰？」的話，補上 2.5 人的梗（原本逐列評論裡有，這裡不能弄丟）
function tgOdd(k){const s=tgOddText(k);return (k.i===2?k.v:k.w)===2?s+'（研究小組本身也是從六人縮減到 2.5 人。）':s}
function tgOddText(k){const C=Q.tg.cols,R=['媽媽','Wi-Fi','期末報告的組員','手機電量','本問卷出題者'],it=R[k.i];
  if(k.v===0&&k.w===2)return['全世界只認得媽媽，Wi-Fi、組員、電量、出題者全部是「誰？」。很孝順，但大概撐不過一個沒有網路的下午。',
    '只有 Wi-Fi「非常重要」，其他全部「誰？」，包括媽媽。訊號滿格，人際關係零格。',
    '唯一「非常重要」的是期末報告的組員，其他包括媽媽全部「誰？」。研究小組懷疑組員現在就坐在旁邊盯著你填。',
    '只在乎手機電量，連 Wi-Fi 跟媽媽都不認識。研究小組推測這份問卷是在等充電的時候填的。',
    '只認得本問卷出題者，連媽媽都是「誰？」。出題者受寵若驚，但請先打一通電話回家。'][k.i];
  if(k.v===2&&k.w===0)return['什麼都「非常重要」，唯獨媽媽是「誰？」。Wi-Fi、電量、組員都比媽媽重要，研究小組建議今天打一通電話回家。',
    '什麼都「非常重要」，唯獨不認識 Wi-Fi。研究小組懷疑其是用行動網路在填，或者住在山上。',
    '什麼都「非常重要」，唯獨期末報告的組員是「誰？」。研究小組完全理解，畢竟有些組員從開學到現在都沒出現過。',
    '什麼都「非常重要」，唯獨手機電量是「誰？」。這種人的手機永遠只剩 3%。',
    '什麼都「非常重要」，唯獨本問卷出題者是「誰？」，即使已經相處了這麼多題。出題者表示：我是做這份問卷的人。'][k.i];
  return k.v<k.w
    ?`其他四項都是「${C[k.w]}」，只有${it}被拉高到「${C[k.v]}」。`+['媽媽聽到會很欣慰。','網路就是生命。','組員看到應該會哭。','電量焦慮已經寫在臉上。','出題者受寵若驚。'][k.i]
    :`其他四項都是「${C[k.w]}」，只有${it}被降到「${C[k.v]}」。`+['研究小組建議今天打一通電話回家。','網路可以斷，其他不行。','研究小組完全理解。','活得很隨性。','出題者表示：沒關係，我習慣了。'][k.i]}
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

