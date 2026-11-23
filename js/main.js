// 啟動：還原紀錄、畫出第一頁

const restored=restore();
if(!stats.t0)stats.t0=Date.now();  // 第一次打開問卷的時間（SPED 隱藏人格用）
if(restored){
  const back=backFromOut();
  if(stats.done){reveal(true);if(back)setTimeout(()=>ctaBack(...back),50)}
  else{render();toast('已幫你接回上次填到的地方')}
}else render();
if(TEST)testPanel();
// 測試用：網址加 ?test 之後，可以用 ?test&p=6 直接跳到第 7 頁（人機驗證那頁）
if(TEST){const m=location.search.match(/[?&]p=(\d+)/);if(m){page=Math.min(N-1,+m[1]);if(!ans.nick)ans.nick='測試人';render()}}
