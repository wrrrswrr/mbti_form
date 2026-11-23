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
function mbti(){
  const g=k=>{const v=ans[k];if(v===undefined)return 3;return Q[k].sv?Q[k].sv[v]:v};
  const up=UP[ans.up]?UP[ans.up].e:3;  // 原本的 e3 改成照片上傳題：奶龍 5、Puzz 3、奶蛙 2、奶蛋 1
  // e1、e2 的 sv 直接是外向分數（越高越 E）
  const E=(g('e1')+g('e2')+up)/3+(ans.e4===0||ans.e5===0||ans.e5===10?1:ans.e4===1||ans.e5===2||ans.e5===11?-1:0)>=3?'E':'I';
  const S=g('s1')-g('s2')>0?'S':'N',T=g('t1')>=3?'T':'F',J=ans.j1===0||ans.j1===1?'J':'P';
  return E+S+T+J;
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
  const s=durSec();if(s!=null&&s<120)return 'SPED';
  return null;
}
// PUZZ：照片上傳從頭到尾只上傳過 Puzz 一次（沒有移除、沒有換過），而且人機驗證「只」選了 Puzz 一張
const upLoyal=()=>{const h=HIST.up||[];return ans.up===3&&h.length===1&&h[0]==='Puzz'&&!stats.upCleared};
const isPuzz=()=>upLoyal()&&!!stats.cap&&stats.cap.sel.length===1&&stats.cap.sel[0]==='puzz';
function hiddenObs(h){
  if(h==='PUZZ')return '受試者在照片上傳題中選擇了 Puzz；在要求選出所有奶蛙的人機驗證中，九張圖也只選了 Puzz 一張，兩隻真正的奶蛙一隻都沒點。研究小組判斷受試者並不是看錯，而是眼裡本來就只有 Puzz。';
  if(h==='BOTS')return `受試者在本問卷全部 ${botCount()||'所有'} 題選擇題中，一律選擇第一個選項，無一例外。此作答模式與自動化程式高度一致。值得注意的是，受試者稍早${stats.cap?'已通過':'曾被要求進行'}「我不是機器人」驗證，研究小組正在重新檢討驗證機制。`;
  const s=durSec(),n=Object.keys(Q).length;
  return `受試者僅花 ${s==null?'不到兩分鐘':durTxt(s)}即完成全部 ${n} 題，平均每題約 ${s==null?'1':(s/n).toFixed(1)} 秒。此速度已低於人類閱讀題目所需之最短時間，研究小組判斷其並未閱讀題目，而是憑感覺在點。`;
}
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
// ===== 完整分析：把各題評語挑幾則，串成「性格分析」「行為分析」兩段文章 =====
// 人機驗證、奶蛙有自己的卡片，不寫進文章
const OWN_CARD=new Set(['cap','frog']);
// 「怎麼作答」的小動作寫進行為分析；「選了什麼」寫進性格分析
const BEHAV=new Set(['ar','mbti','mb2','nick2','dodge','t3','twBad','s3dup','cd','spawn','au','vid','login','report','upBack','gagM','t4b']);
const isBehav=(k,m)=>BEHAV.has(k)||((k==='au2'||k==='vid2')&&m.type==='LIAR');
// 研究小組特別想拉出來講的，排序時加分（組員 2.5 人那句一定要上）
const BOOST={up:2,upBack:3,tgS:3,cd:2,spawn:2,dodge:2,tw:2,e1:1,t2:1,t6:1,pa:1,s3:1,j4:1,e4:1,s2:1};
function narrPick(type,isHid){
  // 「越來越奇怪」那題的分析已經講過追「有」的次數，dodge 就不重複講
  const t4d=(ans.t4===0||ans.t4===1)&&stats.dodge;
  const all=Object.entries(marks).filter(([k,m])=>m.ana&&!OWN_CARD.has(k)&&!(t4d&&k==='dodge'));
  const sc=([k,m])=>m.pts+(k==='tgX'&&m.type==='SALT'?99:BOOST[k]||0)+(m.type===type?3:0);
  const top=(list,n)=>list.sort((a,b)=>sc(b)-sc(a)).slice(0,n).map(([,m])=>m.ana.replace(/（本判定由研究小組[^）]*）/,''));
  const pre=[...(isHid?[hiddenObs(type)]:[]),...t4Obs(),...vidObs()];
  return {per:top(all.filter(x=>!isBehav(...x)),5),beh:pre.concat(top(all.filter(x=>isBehav(...x)),Math.max(2,4-pre.length)))};
}
// 句子前面接上轉折詞，讓它讀起來像一篇文章而不是清單
const joinS=(list,cons)=>list.map((s,i)=>(cons[i]||'')+s).join('');
function narrHTML(r,T,nick,late){
  const P=t=>`<p class="rp np">${t}</p>`,per=r.narr.per,beh=r.narr.beh.concat(late?[late]:[]);
  let a;
  if(!per.length)a=P(`${nick}在情境題中的作答四平八穩，研究小組找不到任何可以吐槽的地方。研究小組認為這反而是最可疑的。`);
  else{
    // 最精彩的一則（分數最高）留到最後當收尾
    const o=per.length>1?[...per.slice(1),per[0]]:per,last=o.length-1;
    const cons=o.map((_,i)=>i===last&&last>0?'而最讓研究小組印象深刻的是，':['舉例來說，','不只如此，','另一方面，','此外，'][i]);
    const intro=r.hid?`撇開隱藏人格不談，單看情境題的作答，${nick}其實也很有自己的個性。`:`從情境題的作答來看，${nick}的「${T.n}」傾向相當明顯。`;
    const cut=o.length>3?2:o.length;
    a=P(intro+joinS(o.slice(0,cut),cons))+(cut<o.length?P(joinS(o.slice(cut),cons.slice(cut))):'');
    a+=P(`總結來說，「${T.tag}」——這句話放在${nick}身上，研究小組認為一個字都不用改。`);
  }
  let b;
  if(!beh.length)b=P(`至於作答過程，${nick}表現得異常正常，系統沒有抓到任何小動作。研究小組看著空白的紀錄，陷入了長長的沉默。`);
  else{
    const last=beh.length-1,cons=last?beh.map((_,i)=>i===last?'最後，':['首先，','接著，','更可疑的是，','另外，'][i]):[''];
    const cut=beh.length>3?2:beh.length;
    b=P(`除了「選了什麼」，系統也在背景默默記錄了${nick}「怎麼選」。`+joinS(beh.slice(0,cut),cons))+(cut<beh.length?P(joinS(beh.slice(cut),cons.slice(cut))):'');
  }
  return `<div class="card" id="obsc"><div class="rt">完整分析報告</div><div class="rs">研究小組根據您的作答逐字寫成（真的有人在寫）</div>
    <div class="nh">一、性格分析</div>${a}<div class="nh">二、行為分析</div>${b}</div>`;
}
// fast=true：直接顯示最終結果，不跑動畫（用於重新整理後還原、測試面板）
function reveal(fast){
  stats.done=true;FROG.off=true;save();
  if(!fast){document.body.classList.add('glitch');play('vineboom')}
  setTimeout(()=>{
    document.body.classList.remove('glitch');window.scrollTo(0,0);
    const self=(ans.mytype||'').trim().toUpperCase(),selfOk=MB_OK.test(self),base=selfOk?self:mbti();
    // 奶蛙總共探頭 N-2 = 6 次（第 3～8 頁各一次），翻太快沒看到的也算漏看
    const fs=N-2,fc=Math.min(FROG.caught,fs),allFrog=fc===fs;
    if(fs){if(allFrog)mark('frog','CHAD',7,`作答期間，一隻奶蛙曾 ${fs} 次從螢幕角落探頭偷看，受試者全數捕獲。忽有龐然大物，拔山倒樹而來，蓋一奶蛙也——而受試者每一次都看到了。其周邊視覺與反應速度遠超常模，研究小組懷疑其平常就很在意別人在看他。`);
      else if(fc)mark('frog','RICK',1,`作答期間，一隻奶蛙曾 ${fs} 次從螢幕角落探頭偷看，受試者捕獲 ${fc} 次、漏看 ${fs-fc} 次。注意力尚可，但顯然有在分心。`);
      else mark('frog','BRUH',3,`作答期間，一隻奶蛙曾 ${fs} 次從螢幕角落探頭偷看，受試者完全沒有察覺。忽有龐然大物，拔山倒樹而來，蓋一奶蛙也，受試者連頭都沒抬。研究小組建議其平時多留意身後。`)}
    gagMark();openMarks();
    // report.html（檢舉頁）會留下檢舉理由
    let rep=null;try{rep=localStorage.getItem('mbti_form_reported')}catch(e){}
    if(rep)mark('report','SALT',4,`受試者在作答期間曾嘗試檢舉本表單，理由為「${esc(rep)}」。研究小組已讀，哭完之後決定繼續做下去。`);
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
    spin(base,()=>{
      $('#sn').textContent=`初步結果：${base}`;
      setTimeout(()=>{play('error');$('#sn').textContent=r.hid?'偵測到隱藏作答模式，正在解鎖隱藏人格…':'偵測到大量異常作答，改以《網路人格資料庫》重新判定…';
        setTimeout(()=>spin(r.type,()=>{
          $('#slots').classList.add('flip','final');play('vineboom');setTimeout(()=>play('airhorn'),500);
          $('#sl').textContent='重新判定後，您的人格類型為';
          $('#sn').innerHTML=`<b>${r.type}｜${T.n}</b>${T.tag}`;
          const b=$('#rbody');b.style.display='block';const fw=$('#frogwin');if(fw)frogWin(fw);
          setTimeout(()=>{b.classList.add('on');b.querySelectorAll('i[data-w]').forEach(i=>i.style.width=i.dataset.w+'%')},300);
        },180),1400);
      },1300);
    },380);
  },fast?0:900);
}
