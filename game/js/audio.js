/* ============ GTA7:NANKING —— 音频引擎 ============
   纯 WebAudio 程序化生成：BGM · 车载电台 · 电话铃/拨号音 · 消费音效
   无任何外部音频资源，离线可用。NJAUDIO.unlock() 需用户手势后调用 */
(function(){
"use strict";
var ctx=null, master=null, bgmGain=null, radioGain=null, sfxGain=null;
var started=false, bgmOn=true, radioOn=false, stationIdx=0;
var seqTimer=null, nextNote=0, beat=0;

/* ---------- 合成基础 ---------- */
function now(){return ctx?ctx.currentTime:0;}
function envOsc(dest,wave,freq,t0,dur,vol,filterFreq){
  var o=ctx.createOscillator(),g=ctx.createGain();
  o.type=wave;o.frequency.setValueAtTime(freq,t0);
  g.gain.setValueAtTime(0,t0);
  g.gain.linearRampToValueAtTime(vol,t0+0.012);
  g.gain.exponentialRampToValueAtTime(0.001,t0+dur);
  if(filterFreq){
    var f=ctx.createBiquadFilter();f.type="lowpass";f.frequency.value=filterFreq;
    o.connect(g);g.connect(f);f.connect(dest);
  }else{o.connect(g);g.connect(dest);}
  o.start(t0);o.stop(t0+dur+0.05);
}
function noise(dest,t0,dur,vol,hp){
  var n=ctx.createBufferSource();
  var buf=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate);
  var d=buf.getChannelData(0);
  for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
  n.buffer=buf;
  var g=ctx.createGain();g.gain.value=vol;
  if(hp){var f=ctx.createBiquadFilter();f.type="highpass";f.frequency.value=hp;n.connect(f);f.connect(g);}
  else n.connect(g);
  g.connect(dest);n.start(t0);
}

/* ---------- 音阶与站点配置 ---------- */
var PENTA=[0,2,4,7,9,12,14,16];          // 五声音阶（宫调，金陵味）
var pentFreq=function(root,deg){return root*Math.pow(2,deg/12);};

var STATIONS=[
  {name:"金陵之声 FM101.9 · 城市流行",tempo:0.26,root:220,wave:"triangle",padWave:"sawtooth",
   chords:[[0,4,7],[5,9,12],[-3,0,4],[2,5,9]],vol:0.16,drum:true},
  {name:"秦淮夜话 FM89.7 · 慢 jazz",tempo:0.42,root:196,wave:"sine",padWave:"triangle",
   chords:[[0,3,7,10],[-2,2,5,9],[-4,0,3,7],[0,5,9,12]],vol:0.13,drum:false},
  {name:"交通广播 FM105.6 · 路况直播",tts:true}
];
var NEWS=[
  "各位听众中午好，欢迎收听南京交通广播。目前中山路车流量正常，玄武湖隧道通行顺畅。",
  "紫金山索道今日运营正常，山顶观景台风力三级，适宜登高望远。",
  "新街口环岛周边施工已结束，请司机朋友按信号灯有序通行，注意礼让行人。",
  "天气提醒：傍晚有阵雨，驾车请开启雾灯，减速慢行。",
  "玄武湖游船码头今日客流量较大，请错峰出游，祝您游玩愉快。"
];

/* ---------- BGM 序列器 ---------- */
var BGM_CHORDS=[[0,4,7,11],[-3,2,5,9],[-5,0,4,7],[-1,2,7,11]];  // 舒缓进行
var bgmRoot=165;
function schedBGM(t){
  var bar=Math.floor(beat/8)%BGM_CHORDS.length;
  var ch=BGM_CHORDS[bar];
  if(beat%8===0){
    ch.forEach(function(deg){
      envOsc(bgmGain,"triangle",pentFreq(bgmRoot,deg),t,3.6,0.045,1400);
    });
    envOsc(bgmGain,"sine",pentFreq(bgmRoot,ch[0]-12),t,3.8,0.06,900);   // 低音铺底
  }
  // 琶音 pluck（五声）
  var deg=PENTA[(beat*3+bar)%PENTA.length];
  envOsc(bgmGain,"triangle",pentFreq(bgmRoot*2,deg),t,0.9,0.05,2600);
  if(beat%4===2)envOsc(bgmGain,"sine",pentFreq(bgmRoot*4,deg+12),t,0.5,0.02,3000);
}
function schedStation(t,st){
  if(st.tts)return;
  var bar=Math.floor(beat/8)%st.chords.length;
  var ch=st.chords[bar];
  if(beat%8===0){
    ch.forEach(function(deg){
      envOsc(radioGain,st.padWave,pentFreq(st.root,deg),t,st.tempo*8,0.022,1100);
    });
    envOsc(radioGain,"sine",pentFreq(st.root,ch[0]-12),t,st.tempo*7,0.05,700);
  }
  var deg=PENTA[(beat*2+bar*2)%PENTA.length];
  envOsc(radioGain,st.wave,pentFreq(st.root*2,deg),t,st.tempo*2.2,0.07,2800);
  if(st.drum){
    if(beat%4===0)noise(radioGain,t,0.09,0.10,2000);        // 军鼓质感
    if(beat%2===0)envOsc(radioGain,"sine",55,t,0.10,0.12);   // 底鼓
  }
}
function tickSeq(){
  if(!ctx)return;
  var horizon=now()+0.35;
  while(nextNote<horizon){
    var st=STATIONS[stationIdx];
    if(bgmOn) schedBGM(nextNote);
    if(radioOn&&st) schedStation(nextNote,st);
    nextNote+=(radioOn&&st&&!st.tts)?STATIONS[stationIdx].tempo:0.25;
    beat++;
  }
}

/* ---------- 电台 TTS（交通广播） ---------- */
var ttsTimer=null;
function speak(text,opt){
  try{
    if(!window.speechSynthesis)return;
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    u.lang="zh-CN";u.rate=opt&&opt.rate||1;u.pitch=opt&&opt.pitch||1;u.volume=opt&&opt.volume||1;
    var vs=window.speechSynthesis.getVoices()||[];
    for(var i=0;i<vs.length;i++){
      if(vs[i].lang&&vs[i].lang.indexOf("zh")===0){u.voice=vs[i];break;}
    }
    window.speechSynthesis.speak(u);
  }catch(e){}
}
function stopSpeak(){
  try{window.speechSynthesis&&window.speechSynthesis.cancel();}catch(e){}
}
function startNews(){
  stopNews();
  var i=Math.floor(Math.random()*NEWS.length);
  var say=function(){
    if(!radioOn)return;
    speak(NEWS[i%NEWS.length],{rate:1.02});
    noise(radioGain,now(),1.2,0.03,4000);       // 换台白噪
    i++;
  };
  say();
  ttsTimer=setInterval(say,13000);
}
function stopNews(){if(ttsTimer){clearInterval(ttsTimer);ttsTimer=null;}stopSpeak();}

/* ---------- 电台控制 ---------- */
function setRadio(on,silent){
  if(on===radioOn)return;
  radioOn=on;
  if(radioOn){
    var st=STATIONS[stationIdx];
    if(st.tts)startNews();
    if(!silent&&window.GTA)window.GTA.toast("📻 "+st.name,2600);
  }else{
    stopNews();
    if(!silent&&window.GTA)window.GTA.toast("📻 电台已关闭",1800);
  }
}
function nextStation(){
  stationIdx=(stationIdx+1)%STATIONS.length;
  stopNews();
  if(radioOn&&STATIONS[stationIdx].tts)startNews();
  if(window.GTA)window.GTA.toast("📻 "+STATIONS[stationIdx].name,2600);
  return STATIONS[stationIdx].name;
}

/* ---------- SFX ---------- */
function sfx(kind){
  if(!ctx)return;
  var t=now();
  if(kind==="cash"){                                   // 收钱
    envOsc(sfxGain,"triangle",1318,t,0.09,0.12);
    envOsc(sfxGain,"triangle",1760,t+0.07,0.14,0.12);
  }else if(kind==="pay"){                              // 消费
    envOsc(sfxGain,"triangle",880,t,0.08,0.10);
    envOsc(sfxGain,"triangle",659,t+0.06,0.12,0.10);
  }else if(kind==="deny"){
    envOsc(sfxGain,"square",196,t,0.16,0.08,800);
  }else if(kind==="blip"){
    envOsc(sfxGain,"sine",1200,t,0.05,0.06);
  }else if(kind==="dial"){                             // 拨号音
    envOsc(sfxGain,"sine",440,t,0.12,0.07);
    envOsc(sfxGain,"sine",350,t,0.12,0.07);
  }else if(kind==="ringback"){                         // 回铃音
    envOsc(sfxGain,"sine",445,t,0.9,0.05);
    envOsc(sfxGain,"sine",445,t+1.2,0.9,0.05);
  }else if(kind==="busy"){                             // 忙音
    envOsc(sfxGain,"sine",487,t,0.4,0.06);
    envOsc(sfxGain,"sine",487,t+0.5,0.4,0.06);
  }else if(kind==="door"){                             // 上下车
    noise(sfxGain,t,0.15,0.14,300);
    envOsc(sfxGain,"triangle",98,t,0.2,0.1,400);
  }else if(kind==="eat"){
    noise(sfxGain,t,0.25,0.08,900);
    envOsc(sfxGain,"triangle",523,t+0.2,0.18,0.09);
  }
}

/* ---------- 对外 API ---------- */
window.NJAUDIO={
  unlock:function(){                       // 需在用户点击后调用
    if(started)return;
    try{
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain();master.gain.value=0.9;master.connect(ctx.destination);
      bgmGain=ctx.createGain();bgmGain.gain.value=0.9;bgmGain.connect(master);
      radioGain=ctx.createGain();radioGain.gain.value=1.0;radioGain.connect(master);
      sfxGain=ctx.createGain();sfxGain.gain.value=1.0;sfxGain.connect(master);
      started=true;
      nextNote=now()+0.1;beat=0;
      seqTimer=setInterval(tickSeq,120);
      // 预热 TTS 声音列表
      try{window.speechSynthesis&&window.speechSynthesis.getVoices();}catch(e){}
    }catch(e){ctx=null;}
  },
  bgmToggle:function(){
    bgmOn=!bgmOn;
    if(window.GTA)window.GTA.toast(bgmOn?"🎵 背景音乐 开":"🎵 背景音乐 关",1800);
    return bgmOn;
  },
  isBgm:function(){return bgmOn;},
  radioForMode:function(mode){             // 进出载具自动开关电台
    var inVeh=(mode==="drive"||mode==="bike"||mode==="ebike"||mode==="boat"||mode==="cable");
    if(inVeh&&!radioOn)setRadio(true,true);
    if(!inVeh&&radioOn)setRadio(false,true);
  },
  radioNext:nextStation,
  radioOff:function(){setRadio(false,true);},
  radioName:function(){return STATIONS[stationIdx].name;},
  sfx:sfx,
  speak:speak,
  stopSpeak:stopSpeak
};
})();
