// 頁首彩蛋：假「登入 Gooogle」彈窗、假說明中心
// ===== 頁首「登入 Gooogle」「瞭解詳情」：假登入彈窗 + 假說明中心 =====
// 登入彈窗只是幹話：欄位問的是心情跟出題者的優點，絕不問密碼或電子郵件，輸入的東西也不會存
const GLOGO=sz=>`<div class="glogo"${sz?` style="font-size:${sz}px"`:''}>${[['G','#4285f4'],['o','#ea4335'],['o','#fbbc05'],['o','#ea4335'],['g','#4285f4'],['l','#34a853'],['e','#ea4335']].map(([c,k])=>`<span style="color:${k}">${c}</span>`).join('')}</div>`;
document.addEventListener('click',e=>{const g=e.target.closest('[data-gl]');if(!g)return;e.preventDefault();g.dataset.gl==='login'?glLogin():glHelp()});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const o=document.querySelector('.glov,.hcov');if(o){o.remove();document.body.style.overflow=''}});
function glLogin(){
  const ov=document.createElement('div');ov.className='glov';document.body.appendChild(ov);document.body.style.overflow='hidden';
  const close=()=>{ov.remove();document.body.style.overflow=''};
  let mood='',merit='',cur=1;
  const field=label=>`<div class="gfld"><input id="glIn" placeholder=" " autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="40"><label for="glIn">${label}</label></div><div class="gerr" id="glErr"></div>`;
  const foot=`<div class="gfoot"><span>繁體中文</span><span style="display:flex;gap:24px"><span data-a="f-help">說明</span><span data-a="f-priv">隱私權</span><span data-a="f-term">條款</span></span></div>`;
  const step=n=>{cur=n;let h;
    if(n===1)h=`<h2>登入</h2><p class="gs">使用你的 Gooogle 帳戶，繼續填寫這份非常正經的問卷。</p>
      ${field('你現在的心情（不是電子郵件）')}<button class="glk" data-a="forgot">忘記心情了嗎？</button>
      <p class="gnote">不是你的手機嗎？那你正在別人的手機上做人格測驗。研究小組建議你先還給他。<button class="glk" data-a="f-help">瞭解詳情</button></p>
      <div class="gbtns"><button class="gbtn t" data-a="create">建立帳戶</button><button class="gbtn" data-a="next">繼續</button></div>`;
    else if(n===2)h=`<h2>歡迎</h2><div class="gchip"><b>${esc([...mood][0]||'?')}</b><span>${esc(mood)}</span></div>
      <p class="gs">為了確認是你本人，請完成以下驗證。</p>
      ${field('輸入出題者的一個優點')}<button class="glk" data-a="other">試試其他方式</button>
      <div class="gbtns"><button class="gbtn" data-a="next">繼續</button></div>`;
    else h=`<h2>登入成功（騙你的）</h2>
      <p class="gs">其實這份表單本來就會自動把進度存在這台手機裡，從頭到尾都不需要登入。</p>
      <p class="gs">你剛剛說你現在的心情是「${esc(mood)}」，出題者的優點是「${esc(merit)}」。這兩句話我們都沒有存。<br>但第二句，出題者已經截圖了。</p>
      <p class="gs" style="color:#444746;font-size:13px;margin-bottom:0">另外提醒：真正的登入頁不會問你出題者的優點。以後看到奇怪的登入畫面，記得先看一下網址。</p>
      <div class="gbtns"><button class="gbtn" data-a="close">返回表單</button></div>`;
    // 外框跟 logo 固定不動，只換內容（從右邊滑進來），跟真的登入頁一樣
    if(!ov.querySelector('.gw'))ov.innerHTML=`<div class="gw"><div class="lbar"><i></i></div><div class="gmask"></div>${GLOGO()}<div class="gst"></div></div>${foot}`;
    const st=ov.querySelector('.gst');st.outerHTML=`<div class="gst"${n===1?' style="animation:none"':''}>${h}</div>`;
    const inp=ov.querySelector('#glIn');if(inp){setTimeout(()=>inp.focus(),60);inp.oninput=()=>{inp.parentElement.classList.remove('bad');ov.querySelector('#glErr').innerHTML=''}}
  };
  const err=t=>{ov.querySelector('.gfld').classList.add('bad');ov.querySelector('#glErr').innerHTML=ic('info',16,'#b3261e')+`<span>${t}</span>`;play('error')};
  // 讀取中：卡片頂端藍色進度條 + 內容蓋一層半透明白，期間不能操作
  let busyNow=false;
  const busy=(ms,fn)=>{busyNow=true;ov.querySelector('.lbar').classList.add('on');ov.querySelector('.gmask').classList.add('on');
    setTimeout(()=>{if(!document.body.contains(ov))return;busyNow=false;ov.querySelector('.lbar').classList.remove('on');ov.querySelector('.gmask').classList.remove('on');fn&&fn()},ms)};
  ov.onclick=e=>{const a=e.target.closest('[data-a]');if(!a||busyNow)return;const k=a.dataset.a;
    if(k==='next'){
      const v=(ov.querySelector('#glIn').value||'').trim();
      if(cur===1){if(!v)return err('請輸入一點東西。什麼都可以，我們不會看。');mood=v;busy(700,()=>step(2));return}
      if(!v)return err('出題者沒有優點嗎？請再想一下。');merit=v;
      busy(1600,()=>{step(3);play('ding');
        mark('login','RICK',2,`受試者在一份完全不需要登入的問卷中，主動點擊「登入 Gooogle」並走完整個登入流程，過程中還寫下出題者的優點「${esc(merit.slice(0,20))}」。研究小組判定其容易被長得很像的登入畫面騙到，建議以後先看網址。`);save()});
    }
    else if(k==='forgot')toast('忘記心情很正常。大部分的人都是這樣活下來的。');
    else if(k==='create')toast('建立帳戶功能已被研究小組拿去吃了。');
    else if(k==='other')toast('沒有其他方式。出題者的優點是唯一的驗證方式。');
    else if(k==='f-priv')toast('隱私權政策：我們什麼都沒存。全文完。');
    else if(k==='f-term')toast('服務條款：填完要追蹤。全文完。');
    else if(k==='f-help'){close();glHelp()}
    else if(k==='close')close();
  };
  ov.onkeydown=e=>{if(e.key==='Enter'&&!busyNow){const b=ov.querySelector('[data-a="next"]');if(b)b.click()}};
  step(1);busy(600);  // 一打開先跑一下讀取條，像真的在載入登入頁
}
function glHelp(){
  const ov=document.createElement('div');ov.className='hcov';document.body.appendChild(ov);document.body.style.overflow='hidden';
  const close=()=>{ov.remove();document.body.style.overflow=''};
  ov.innerHTML=`<div class="hctop">${GLOGO(20)}<span style="color:#5f6368;font-size:18px">說明</span><button class="hcx" data-h="back" aria-label="關閉">${ic('close',22,'#5f6368')}</button></div>
  <div class="hcb">
    <div class="hcs">${ic('search',20,'#5f6368')}<input id="hcQ" placeholder="描述你遇到的問題"></div>
    <div class="hcbc"><a data-h="rel">Gooogle 表單說明</a> / <a data-h="rel">填寫表單</a> / 儲存進度</div>
    <h1>如何儲存表單的填答進度</h1>
    <p>你的填答進度會<b>自動儲存在這台裝置上</b>。重新整理、關掉分頁、跑去 IG 滑一圈再回來，都會從上次的地方繼續。</p>
    <div class="hcn">${ic('info',20,'#1a73e8')}<div><b>注意：</b>你不需要登入。頁面上方的「登入 Gooogle」純粹是為了讓這份問卷看起來比較專業。</div></div>
    <h3>為什麼不需要登入，還要放登入按鈕？</h3><p>因為真的表單都有。研究小組非常在乎形式。</p>
    <h3>我的資料安全嗎？</h3><p>非常安全。研究小組沒有伺服器、沒有資料庫，連你的答案都沒有存。想外洩都沒有東西可以外洩。</p>
    <h3>填到一半手機沒電怎麼辦？</h3><p>充電。</p>
    <h3>為什麼題目越來越奇怪？</h3><p>這是正常現象。根據研究小組內部統計，覺得題目很奇怪的受試者，結果通常也最準。</p>
    <h3>結果不準怎麼辦？</h3><ul><li>再填一次。</li><li>如果還是不準，那可能是你對自己不夠了解。</li><li>如果你很了解自己，請到 IG 私訊我們，我們會很認真地已讀。</li></ul>
    <h3>這份問卷到底是誰做的？</h3>
    <p>《${esc(CONFIG.showName)}》製作團隊。一檔專門探討「MBTI 測出來的你」跟「現實生活中的你」到底差多少的網路節目。測出來是 E 人卻不敢打電話訂餐、測出來是 J 人房間卻像被炸過，這種落差我們都很有興趣（也都很有經驗）。</p>
    <p>PS：這其實是政大廣電系的一門群修。組員因為不可抗力因素，從六人縮減到 2.5 人。那 0.5 是誰，研究小組不方便透露。</p>
    <p>如果你能動動手指點一下追蹤，對我們這個可憐小組的期末數據呈現會有莫大的幫助。剩下的 2.5 人會非常感激你，那 0.5 人也會盡量感激。</p>
    <div class="ctab" style="margin-top:14px"><a class="btn" href="${CONFIG.igUrl}" target="_blank" rel="noopener">追蹤 IG ${esc(CONFIG.igHandle)}</a><a class="btn w" href="${CONFIG.ytChannelUrl}" target="_blank" rel="noopener">訂閱 YouTube 頻道</a></div>
    <div class="hcfb"><div style="font-size:15px;margin-bottom:12px">這篇文章是否有幫助？</div><button class="gbtn" data-h="yes">是</button><button class="gbtn t" data-h="no" style="border:1px solid #747775">否</button><p id="hcM" style="margin:12px 0 0;color:#5f6368;font-size:14px"></p></div>
    <div class="hcrel"><div style="font-size:16px;font-weight:500;margin-bottom:4px">相關文章</div>
      <a data-h="rel">如何說服朋友也來填這份問卷</a><a data-h="rel">為什麼我的結果是 SHIT 型</a><a data-h="rel">如何取消追蹤 ${esc(CONFIG.igHandle)}（無法）</a><a data-h="rel">為什麼一直有東西從螢幕邊邊偷看我</a></div>
    <button class="btn" data-h="back" style="margin-top:28px">返回表單</button>
  </div>`;
  ov.onclick=e=>{const a=e.target.closest('[data-h]');if(!a)return;const k=a.dataset.h,m=ov.querySelector('#hcM');
    if(k==='back')close();
    else if(k==='rel')toast('這篇文章還在寫。負責寫的人目前在拖延，是 LAZY 型。');
    else if(k==='yes'){m.textContent='謝謝你的回饋。表達感謝最好的方式，是追蹤我們的 IG。';play('ding')}
    else if(k==='no'){m.textContent='收到。我們會假裝有在改進。';play('bruh')}
  };
  ov.querySelector('#hcQ').onkeydown=e=>{if(e.key!=='Enter')return;const v=e.target.value.trim();if(!v)return;
    toast(`找不到與「${v.slice(0,20)}」相關的說明。建議直接去 IG 問我們。`)};
}

