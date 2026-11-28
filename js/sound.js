// 音效：Web Audio 播放、合成備用音效、聲道管理
let ac;
// 總音量（1 = 原本的大小）：所有音效、音樂、聽力題音檔、YouTube 影片都乘上這個值，想整體調大調小改這裡就好
const VOL=.8;
let master=null;
function dest(){const a=A();if(!master){master=a.createGain();master.gain.value=VOL;master.connect(a.destination)}return master}
try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
function A(){if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();
  if(ac.state==='suspended'||ac.state==='interrupted'){const p=ac.resume();if(p&&p.catch)p.catch(()=>{})}return ac}
// 等 AudioContext 真的在跑再播。iOS 切 App / 來電後會變 interrupted，不是點擊觸發的播放解不開，
// 這時就不硬播（不然會在下次點擊時突然冒出來），改提示使用者點一下
function ready(){
  const a=A();if(a.state==='running')return Promise.resolve(true);
  const p=a.resume();
  return Promise.race([p&&p.then?p.catch(()=>{}):Promise.resolve(),new Promise(r=>setTimeout(r,400))]).then(()=>a.state==='running');
}
let lastHint=0;
function hint(){const n=Date.now();if(n-lastHint<8000)return;lastHint=n;try{toast('🔊 點一下畫面就能開啟音效')}catch(e){}}
let unlocked=false;
['pointerdown','touchend','keydown'].forEach(ev=>document.addEventListener(ev,()=>{try{
  const a=A();if(unlocked)return;unlocked=true;
  const s=a.createBufferSource();s.buffer=a.createBuffer(1,1,22050);s.connect(a.destination);s.start(0);
  // 不再一次預載全部音效（省請求次數）；play() 用到時才 loadBuf。奶蛙隨時會出現，先載這個
  loadBuf('frog');
}catch(e){}},true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ac)try{ac.resume()}catch(e){}});
function tone(f,dur,type='sine',vol=.3,fEnd,delay=0){
  const a=A(),t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(fEnd)o.frequency.exponentialRampToValueAtTime(fEnd,t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g).connect(out());o.start(t);o.stop(t+dur);
}
function noise(dur,freq,q,vol,lfoF=0,lfoAmt=0){
  const a=A(),n=a.sampleRate*dur,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;f.Q.value=q;
  if(lfoF){const l=a.createOscillator();l.frequency.value=lfoF;const lg=a.createGain();lg.gain.value=lfoAmt;l.connect(lg).connect(f.frequency);l.start();l.stop(a.currentTime+dur)}
  const g=a.createGain(),t=a.currentTime;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.01,t+dur);
  s.connect(f).connect(g).connect(out());s.start();s.stop(t+dur);
}
let bus=null;const live=new Set();
const FREE={frog:1};
let freeNow=false;
function out(){if(freeNow)return dest();if(!bus){bus=A().createGain();bus.connect(dest())}return bus}
function stopAll(){
  live.forEach(h=>h.stop());live.clear();
  Object.keys(chan).forEach(k=>chan[k]=[]);
  if(bus){const b=bus;bus=null;try{b.gain.setTargetAtTime(0,ac.currentTime,.01);setTimeout(()=>b.disconnect(),120)}catch(e){}}
}
const SYN={
  vineboom(){tone(160,1.3,'sine',.9,35);tone(90,1.3,'triangle',.6,30)},
  bruh(){tone(140,.5,'sawtooth',.25,95);tone(70,.5,'square',.12,50)},
  error(){tone(320,.15,'square',.18);tone(210,.35,'square',.18,null,.16)},
  fart(){noise(.8,180,18,1.6,22,110)},
  airhorn(){[0,.17,.34,.62].forEach((d,i)=>[466,587,698].forEach(f=>tone(f,i===3?1:.14,'sawtooth',.11,f*.97,d)))},
  boing(){tone(180,.35,'sine',.4,900);tone(900,.3,'sine',.25,250,.12)},
  ding(){tone(1320,.7,'sine',.22);tone(1980,.5,'sine',.08)},
  sadviolin(){[[659,0],[622,.35],[587,.7],[554,1.05]].forEach(([f,d])=>tone(f,.5,'sawtooth',.06,f*.99,d))},
  car(){tone(420,.25,'square',.15);tone(420,.45,'square',.15,null,.32)},
  tungtung(){[0,.18,.36,.7].forEach(d=>tone(700,.09,'square',.18,300,d))},
  ven(){tone(300,.25,'sawtooth',.15,180)},
  congcong(){tone(523,.2,'triangle',.2);tone(659,.2,'triangle',.2,null,.2);tone(784,.4,'triangle',.2,null,.4)},
  qin(){tone(110,.9,'sawtooth',.18,100);tone(165,.9,'sawtooth',.1,150)},
  duck(){tone(500,.12,'square',.12,300);tone(500,.12,'square',.12,300,.18)},
  tick(){tone(1100,.04,'square',.07)},
  sixseven(){tone(523,.22,'square',.15);tone(587,.4,'square',.15,null,.28)},
  frog(){tone(600,.12,'sine',.35,1200);tone(1200,.18,'sine',.25,500,.12)}
};
const chan={};
const BUF={};
const useEl={};  // 這台裝置的 Web Audio 解不了這個檔（或在 file:// 下），直接改用 <audio> 播
function decode(b){return new Promise((res,rej)=>{
  const p=A().decodeAudioData(b,res,()=>rej('dec'));if(p&&p.catch)p.catch(()=>{})})}
function loadBuf(k){
  if(BUF[k])return BUF[k];
  if(!SOUND_FILES[k])return Promise.resolve(null);
  if(location.protocol==='file:'){useEl[k]=true;return Promise.resolve(null)}
  const get=()=>fetch(SOUND_FILES[k]).then(r=>{if(!r.ok)throw 'net';return r.arrayBuffer()}).then(decode);
  // 失敗先等一下重試一次；還是失敗就不快取結果，下次播放會再抓（不再永久判死）
  return BUF[k]=get().catch(()=>new Promise(r=>setTimeout(r,600)).then(get)).catch(e=>{
    delete BUF[k];if(e==='dec')useEl[k]=true;return null});
}
function elPlay(k,h){
  const el=h.el=new Audio(SOUND_FILES[k]);el.volume=.9*VOL;
  el.onended=()=>live.delete(h);
  const p=el.play();
  return p&&p.then?p.then(()=>true,()=>false):Promise.resolve(true);
}
// 播放順序：解碼好的檔案（Web Audio）→ <audio> 元素 → 合成音
// 音效絕對不能讓呼叫它的程式中斷：有些 App 內建瀏覽器連 AudioContext 都建不起來，
// 這時 play 會直接丟錯，後面的「換畫面」就不會執行（例如驗證按鈕按了沒反應）。出錯一律當作沒聲音
const MUTE={dead:true,src:null,el:null,stop(){}};
function play(k,ch){try{return playRaw(k,ch)}catch(e){return MUTE}}
function playRaw(k,ch){
  const free=!!FREE[k],file=SOUND_FILES[k];
  if(k!=='tick'&&!free)stopAll();
  const h={dead:false,src:null,el:null,stop(){h.dead=true;
    if(h.src)try{h.src.stop()}catch(e){}if(h.el)try{h.el.pause()}catch(e){}}};
  if(!free)live.add(h);if(ch&&!free)(chan[ch]=chan[ch]||[]).push(h);
  const done=()=>live.delete(h);
  const syn=()=>{done();if(h.dead||!SYN[k])return;freeNow=free;try{SYN[k]()}finally{freeNow=false}};
  Promise.all([ready(),file&&!useEl[k]?loadBuf(k):null]).then(([ok,buf])=>{
    if(h.dead)return;
    if(!ok){done();return hint()}
    if(buf){
      const a=A(),s=a.createBufferSource(),g=a.createGain();s.buffer=buf;g.gain.value=.9;
      s.connect(g).connect(free?dest():out());s.onended=done;s.start();h.src=s;return}
    if(file)return elPlay(k,h).then(played=>{if(!played&&!h.dead)syn()});
    syn();
  }).catch(done);
  return h;
}
function stopCh(ch){if(chan[ch]){chan[ch].forEach(h=>h.stop());chan[ch]=[]}}
