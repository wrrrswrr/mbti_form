// 設定：節目名稱、IG / YouTube 連結、音效檔路徑、洗腦神曲選項
const CONFIG={
  showName:'MBTI生存指南',
  igHandle:'@mbti_survivalguide',
  igUrl:'https://www.instagram.com/mbti_survivalguide/',
  videoThankSec:30, // 點進最新影片後待超過幾秒就感謝他（影片 10 分鐘，不強求看完）
  ytChannelUrl:'https://youtube.com/channel/UCPcDNWfqmAapUuud4d6ahCg',
  videoUrl:'https://www.youtube.com/watch?v=xCZVvScZX70',
  hotpotId:'dMTy6C4UiQ4',
  hotpotFile:'',
  rickId:'dQw4w9WgXcQ'
};

const BRAINWASH=['高峰期的街上堆滿車子長長的一隊堵塞max','夢的翅膀已經受了傷','她很壞嘟嘟嘟','以上皆是'];

// 只列 sounds/ 裡真的有的檔案；vineboom、bruh、error、fart、airhorn、boing、ding、sadviolin 用 sound.js 的合成音
// （之後補上 mp3 檔，再把那行加回來就會改播檔案）
const SOUND_FILES={
  sixseven:'sounds/67.mp3',
  frog:'sounds/frog.mp3',
  muaji:'sounds/muaji.mp3',
  car:'sounds/car.mp3',
  rush:'sounds/rush.mp3',
  calm:'sounds/calm.mp3',
  traffic:'sounds/traffic.mp3',
  dream:'sounds/dream.mp3',
  bad:'sounds/bad.mp3'
};
