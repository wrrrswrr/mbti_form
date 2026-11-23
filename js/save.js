// 作答紀錄保存／還原（localStorage）
// ===== 作答紀錄保存：存在使用者自己的手機（localStorage），按返回、重新整理、從 IG 跳回來都能接著填；按「再填一次」才清掉 =====
// v2：題目改版（新增上傳／下拉／簡答等題型），舊存檔的選項不相容
const SAVE_KEY='mbti_form_save_v9',TEST=/[?&]test\b/.test(location.search);
let cleared=false;
function save(){
  if(TEST||cleared)return;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({page,ans,stats,marks,HIST,GAGC,extras,
    frog:{shown:FROG.shown,caught:FROG.caught,seen:FROG.seen},
    qs:Object.fromEntries(Object.values(Q).map(q=>[q.id,{opts:q.opts,lateShown:q.lateShown}]))}))}catch(e){}
}
function clearSave(){cleared=true;try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem('mbti_form_reported')}catch(e){}}
function restore(){
  if(TEST)return false;
  let s=null;try{s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch(e){}
  if(!s||!s.ans)return false;
  try{
    Object.assign(ans,s.ans);Object.assign(stats,s.stats);Object.assign(marks,s.marks);Object.assign(HIST,s.HIST);
    GAGC.push(...(s.GAGC||[]));extras.splice(0,extras.length,...(s.extras||[]));
    Object.assign(FROG,s.frog||{});
    Object.entries(s.qs||{}).forEach(([id,v])=>{const q=Q[id];if(!q)return;if(v.opts)q.opts=v.opts;if(v.lateShown)q.lateShown=true});
    page=Math.min(Math.max(0,s.page|0),N-1);
    return true;
  }catch(e){return false}
}
['change','input','click'].forEach(ev=>document.addEventListener(ev,()=>setTimeout(save,0)));
addEventListener('pagehide',save);setInterval(save,3000);

