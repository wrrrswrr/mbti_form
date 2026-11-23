// 音效：Web Audio 播放、合成備用音效、聲道管理
let ac;
try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
function A(){if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended'||ac.state==='interrupted')ac.resume();return ac}
let unlocked=false;
['pointerdown','touchend','keydown'].forEach(ev=>document.addEventListener(ev,()=>{try{
  const a=A();if(unlocked)return;unlocked=true;
  const s=a.createBufferSource();s.buffer=a.createBuffer(1,1,22050);s.connect(a.destination);s.start(0);
  Object.keys(SOUND_FILES).forEach(loadBuf);
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
function out(){const a=A();if(freeNow)return a.destination;if(!bus){bus=a.createGain();bus.connect(a.destination)}return bus}
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
const fileBad={};
const chan={};
const BUF={};
function loadBuf(k){
  if(BUF[k])return BUF[k];
  if(fileBad[k]||!SOUND_FILES[k]||location.protocol==='file:'){fileBad[k]=true;return BUF[k]=Promise.resolve(null)}
  return BUF[k]=fetch(SOUND_FILES[k]).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()})
    .then(b=>new Promise((res,rej)=>A().decodeAudioData(b,res,rej)))
    .catch(()=>{fileBad[k]=true;return null});
}
function play(k,ch){
  const free=!!FREE[k];
  if(k!=='tick'&&!free)stopAll();
  const syn=()=>{if(!SYN[k])return;freeNow=free;try{SYN[k]()}finally{freeNow=false}};
  if(!SOUND_FILES[k]||fileBad[k])return syn();
  const h={dead:false,src:null,stop(){h.dead=true;if(h.src)try{h.src.stop()}catch(e){}}};
  if(!free)live.add(h);if(ch&&!free)(chan[ch]=chan[ch]||[]).push(h);
  loadBuf(k).then(buf=>{
    if(h.dead)return;if(!buf){live.delete(h);return syn()}
    const a=A(),s=a.createBufferSource(),g=a.createGain();s.buffer=buf;g.gain.value=.9;
    s.connect(g).connect(free?a.destination:out());s.onended=()=>live.delete(h);s.start();h.src=s;
  });
  return h;
}
function stopCh(ch){if(chan[ch]){chan[ch].forEach(h=>h.stop());chan[ch]=[]}}
