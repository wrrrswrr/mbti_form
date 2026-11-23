// 測試面板（網址加 ?test 才出現）
// ===== 結尾情勒話術測試面板：網址後面加 ?test 才會出現（例如 https://你的網址/?test），測試時不會存紀錄 =====
function testPanel(){
  const S=[['預設（什麼都沒做）',{}],['勾「已追蹤」但沒點連結',{ig:[0]}],['點進 IG 只待 2 秒',{ig:[0],went:{ig:1},away:{ig:2}}],
    ['點進 IG 待 30 秒',{ig:[0],went:{ig:1},away:{ig:30}}],['選「下次一定」',{ig:[2]}],
    ['選「下次一定」但點進 IG 待 2 秒',{ig:[2],went:{ig:1},away:{ig:2}}],['選「下次一定」但點進 IG 待 30 秒',{ig:[2],went:{ig:1},away:{ig:30}}],
    ['說看完影片但沒點連結',{ig:[0,1],went:{ig:1},away:{ig:30}}],['說看完影片只待 8 秒',{ig:[1],went:{video:1},away:{video:8}}],
    ['說看完影片待了 45 秒',{ig:[1],went:{video:1},away:{video:45}}],
    ['（即時）剛從 IG 回來，待 2 秒',{ig:[0],went:{ig:1},away:{ig:2},back:['ig',2]}],
    ['（即時）剛從 IG 回來，待 10 秒',{ig:[0],went:{ig:1},away:{ig:10},back:['ig',10]}],
    ['（即時）剛從 YouTube 回來，待 2 秒',{went:{yt:1},away:{yt:2},back:['yt',2]}],
    ['（即時）剛從影片回來，待 8 秒',{ig:[1],went:{video:1},away:{video:8},back:['video',8]}],
    ['（即時）剛從影片回來，待 45 秒',{ig:[1],went:{video:1},away:{video:45},back:['video',45]}],
    ['領過神聖讚美',{oldFan:true}],
    ['【隱藏】BOTS 機器人型',{hid:'BOTS',to:'.sum'}],['【隱藏】SPED 已讀亂回型',{hid:'SPED',to:'.sum'}],['【隱藏】PUZZ 本人型（上傳＋驗證只選 Puzz）',{hid:'PUZZ',cap:['puzz'],open:{up:3,e5:7,tw:'大天才',jdt:0,j4:0,jt:'23:30',tg:{0:0,1:1,2:2,3:1,4:0},pa:'因為 Puzz 在這裡'},to:'.sum'}],['【深夜】凌晨 3:12 完成',{late:true,to:'.sum'}],
    ['【驗證】2/2 全對',{cap:['frog1','frog2'],to:'#capc'}],['【驗證】選到奶雞、奶龍',{cap:['frog1','chicken','dragon'],to:'#capc'}],['【驗證】選到 Puzz',{cap:['puzz','frog2'],to:'#capc'}],
    ['【限時題】連點 3 次都被刪，系統代答',{cd:{del:[1,0,3]},to:'#obsc'}],['【限時題】一個都沒點，系統代答',{cd:{del:[]},to:'#obsc'}],
    ['【限時題】被刪 1 次後自己選自肥選項',{cd:{del:[2],self:true},to:'#obsc'}],
    ['【聽力】沒播放就說聽完了',{au:{sec:0,ans:3},to:'#obsc'}],['【聽力】只播 6 秒',{au:{sec:6,ans:2},to:'#obsc'}],['【聽力】播 15 秒',{au:{sec:15,ans:3},to:'#obsc'}],
    ['【聽力】播 25 秒',{au:{sec:25,ans:0},to:'#obsc'}],['【聽力】整首聽完',{au:{sec:80,ends:1,ans:4},to:'#obsc'}],['【聽力】聽了 3 遍',{au:{sec:240,ends:3,ans:1},to:'#obsc'}],
    ['【非選擇題】上傳奶龍＋各種奇怪回答',{open:{up:2,e5:10,tw:'大天才',jdt:3,j4:7,jt:'04:30',tg:{0:0,1:0,2:2,3:1,4:0},pa:'因為報告寫不完所以跑來填問卷，結果越填越好笑'},to:'#obsc'}],
    ['【非選擇題】上傳 Puzz＋媽媽選「誰？」',{open:{up:3,e5:11,tw:'有夠怪',jdt:400,j4:8,jt:'14:00',tg:{0:2,1:0,2:0,3:0,4:2},pa:'哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈'},to:'#obsc'}],
    ['【非選擇題】重要程度全部選「誰？」',{open:{up:0,e5:2,tw:'普通人',jdt:1,j4:4,jt:'01:00',tg:{0:2,1:2,2:2,3:2,4:2},pa:'不知道為什麼'},to:'#obsc'}]];
  const d=document.createElement('div');d.id='testp';
  d.innerHTML=`<b>測試面板 ▾</b><div>
    <small style="margin:0 0 4px">直接跳頁：<a href="?test&p=2">聽力題</a>・<a href="?test&p=4">限時心算題</a>・<a href="?test&p=6">人機驗證</a></small>
    <select id="tpType" style="width:100%;margin:4px 0;padding:6px;font:inherit"><option value="">預覽結果類型（推薦清單、稀有度）…</option>${Object.keys(TYPES).map(t=>`<option value="${t}">${t}｜${TYPES[t].n}</option>`).join('')}</select>
    ${S.map((x,i)=>`<button data-i="${i}">${x[0]}</button>`).join('')}<small>「即時」= 模擬在結果頁點按鈕出去又回來。也可以真的點按鈕出去再回來測。</small></div>`;
  document.body.appendChild(d);
  const show=to=>{reveal(true);setTimeout(()=>{const x=$(to||'#cta');if(x)x.scrollIntoView({behavior:'smooth',block:'center'})},100)};
  d.querySelector('#tpType').onchange=e=>{stats.testType=e.target.value||null;stats.testHid=null;if(!ans.nick)ans.nick='測試人';show('.sum')};
  d.onclick=e=>{
    if(e.target.tagName==='B'){d.classList.toggle('min');return}
    const b=e.target.closest('button');if(!b)return;const c=S[b.dataset.i][1];
    if(c.ig)ans.ig=c.ig;else delete ans.ig;
    stats.went={...(c.went||{})};stats.away={...(c.away||{})};stats.goOut=null;stats.oldFan=!!c.oldFan;stats.thanked=false;
    if(!ans.nick)ans.nick='測試人';
    stats.testHid=c.hid||null;stats.testLate=c.late?new Date(2026,0,1,3,12).getTime():null;
    if(c.cap){if(!stats.capOrder)stats.capOrder=CAP.map(x=>x.k);stats.cap={sel:c.cap}}
    if(c.cd){stats.cdDel=[...c.cd.del];cdMark(Q.cd,!!c.cd.self)}
    if(c.au){stats.auSec=c.au.sec;stats.auEnds=c.au.ends||0;ans.au=c.au.ans;delete marks.au2;auMark();
      const fake=document.createElement('div');picks.au(c.au.ans,fake);toast(stats.auSec?auComment():'（沒播放，不會有評語）')}
    if(c.open){const o=c.open,d=new Date();d.setDate(d.getDate()+o.jdt);
      Object.assign(ans,o,{jdt:`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`});
      const u=UP[o.up];mark('up',u.type,u.pts,u.ana);picks.e5(o.e5);picks.j4(o.j4)}
    if(c.back){reveal(true);setTimeout(()=>{ctaBack(...c.back);$('#cta').scrollIntoView({behavior:'smooth',block:'center'})},100)}
    else show(c.to);
  };
}
