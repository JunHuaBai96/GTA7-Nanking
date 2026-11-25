/* ============ GTA7:NANKING —— 主人公手机 ============
   应用：云游金陵(2D游戏) · 电话 · 短信 · 相机+相册 · 关于
   依赖 window.__NJ3D（相机/切模式/照片）与 scene3d.js 的按键守卫 */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};

/* ============ 联系人 ============ */
var CONTACTS=[
 {id:"laowang",name:"老王修车行",av:"🔧",bg:"#3a4658",num:"138-0515-0027",
  hello:"王记修车，撞哪儿了？发个定位，拖车马上到。",
  lines:["这单修完记得给五星好评哈。","二十分钟到，先别挪车。","这车我给你查过了，油门比刹车灵敏，悠着开。"]},
 {id:"xiaomei",name:"小美（导游）",av:"🌸",bg:"#9a5a7e",num:"139-1595-8866",
  hello:"哥，到了南京不知道去哪玩就问我！",
  lines:["紫金山索道排队人少，早上七点去最好。","玄武湖游船码头在东南岸，画舫红色的那排。","鸡鸣寺药师塔背后拍紫峰最出片！"]},
 {id:"deji",name:"德基广场客服",av:"🛍️",bg:"#5a7ec9",num:"400-888-6666",
  hello:"德基广场竭诚为您服务。",
  lines:["八楼美术馆本周新展：金陵幻梦。","会员停车券可在一楼服务台领取。","顶楼观景台对全体市民免费开放。"]},
 {id:"boat",name:"秦淮画舫调度",av:"🛶",bg:"#2e6e5e",num:"025-8321-7766",
  hello:"画舫调度室，要订船吗？",
  lines:["玄武湖巡游画舫整点发船，包船另计。","今天风小，湖面稳，放心开。","船只能开湖里，撞岸了算你的哦。"]},
 {id:"cable",name:"紫金山索道站",av:"🚡",bg:"#8a6a3e",num:"025-8443-1188",
  hello:"紫金山索道，山顶风光等你。",
  lines:["缆车整点双向对开，单程约十五分钟。","山顶观景台能望到紫峰和长江大桥。","中山陵台阶有392级，量力而行。"]}
];

/* ============ 短信状态（localStorage 持久化） ============ */
var SMSKEY="gta7_nanking_sms";
var sms={};                 // {contactId:[{who:"them"/"me",txt}]}
var unread=0;
try{
  sms=JSON.parse(localStorage.getItem(SMSKEY)||"{}");
}catch(e){}
function saveSms(){
  try{localStorage.setItem(SMSKEY,JSON.stringify(sms));}catch(e){}
}
CONTACTS.forEach(function(c){if(!sms[c.id])sms[c.id]=[];});

/* ============ 手机开关与页面栈 ============ */
var open=false;
var curView="home";         // home / map / call / sms / cam / about
var curApp=null;            // 电话/短信当前联系人
var fullMap=false;          // 云游金陵全屏
var dialNum="";
var callTimer=null,callSec=0,curCall=null;
var camTab="shoot";

function isOpen(){return open;}
function toggle(){
  if(fullMap){exitFullMap();return;}
  open=!open;
  $("phone").classList.toggle("open",open);
  document.body.classList.toggle("phone-open",open);
  if(!open){
    stopCall(false);
    closeView();            // 回桌面，暂停 iframe
  }
}
var VIEW_ID={home:"ph-home",map:"ph-app-map",call:"ph-app-call",sms:"ph-app-sms",cam:"ph-app-cam",about:"ph-app-about"};
function showView(v){
  for(var k in VIEW_ID)$(VIEW_ID[k]).classList.add("off");
  $(VIEW_ID[v]).classList.remove("off");
  curView=v;
}
function closeView(){
  showView("home");
  // 暂停 iframe 游戏（节省性能）
  var f=$("ph-map-frame");
  if(f){var src=f.getAttribute("data-src");f.removeAttribute("src");}
  if(fullMap)exitFullMap();
}

/* ============ 桌面 ============ */
function openApp(id){
  if(id==="map"){
    showView("map");
    var f=$("ph-map-frame");
    if(!f.getAttribute("src"))f.setAttribute("src",f.getAttribute("data-src"));
  }else if(id==="call"){
    showView("call");renderContacts();
  }else if(id==="sms"){
    showView("sms");renderSmsList();
  }else if(id==="cam"){
    showView("cam");renderCam();
  }else if(id==="about"){
    showView("about");
  }else if(id==="gta"){
    // 伪 app：打开任务简报
    var m=window.GTA&&window.GTA.mission();
    if(m){
      window.GTA.toast("当前任务 · "+m.t+" —— "+m.d,4200);
    }else{
      window.GTA.toast("自由模式 · 南京欢迎你",2600);
    }
    toggle();
  }
}
function renderHome(){
  unread=smsUnreadCount();
  var apps=[
    {id:"map",ic:"🗺️",cls:"ic-map",label:"云游金陵",badge:false},
    {id:"call",ic:"📞",cls:"ic-call",label:"电话",badge:false},
    {id:"sms",ic:"💬",cls:"ic-sms",label:"短信",badge:unread>0?unread:false},
    {id:"cam",ic:"📷",cls:"ic-cam",label:"相机",badge:false},
    {id:"gta",ic:"🌆",cls:"ic-gta",label:"任务简报",badge:false},
    {id:"about",ic:"ℹ️",cls:"ic-about",label:"关于手机",badge:false}
  ];
  var g=$("ph-appgrid");
  g.innerHTML=apps.map(function(a){
    return '<div class="ph-app" data-app="'+a.id+'">'+
      '<div class="ph-icon '+a.cls+'">'+a.ic+'</div>'+
      (a.badge?'<div class="ph-badge">'+a.badge+'</div>':'')+
      '<span>'+a.label+'</span></div>';
  }).join("");
  g.querySelectorAll(".ph-app").forEach(function(el){
    el.onclick=function(){openApp(el.getAttribute("data-app"));};
  });
  // 时钟
  tickClock();
}
function tickClock(){
  var N=window.__NJ3D;
  var h=12;
  if(N&&N.env)h=N.env.hour;
  var hh=Math.floor(h)%24,mm=Math.floor((h-Math.floor(h))*60);
  var el=$("ph-clock");
  if(el)el.textContent=(hh<10?"0":"")+hh+":"+(mm<10?"0":"")+mm;
}

/* ============ 电话 ============ */
function renderContacts(){
  var list=$("ph-contactlist");
  list.innerHTML=CONTACTS.map(function(c){
    return '<div class="ph-row" data-c="'+c.id+'">'+
      '<div class="ph-avatar" style="background:'+c.bg+'">'+c.av+'</div>'+
      '<div class="ph-row-info"><b>'+c.name+'</b><span>'+c.num+'</span></div>'+
      '<div class="ph-row-side">呼叫</div></div>';
  }).join("")+
  '<div style="padding:10px 18px"><button id="dial-show" style="width:100%;padding:9px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#aeb8c9;font-size:12px;cursor:pointer">拨号键盘</button></div>'+
  '<div id="dial-box" class="off" style="padding:0 0 8px"><div id="dial-num"></div><div class="dialpad">'+
  [1,2,3,4,5,6,7,8,9,"*",0,"#"].map(function(n){return '<button data-n="'+n+'">'+n+'</button>';}).join("")+
  '</div><button id="dial-out">呼叫</button></div>';
  list.querySelectorAll(".ph-row").forEach(function(el){
    el.onclick=function(){startCall(el.getAttribute("data-c"));};
  });
  var ds=$("dial-show");
  ds.onclick=function(){$("dial-box").classList.toggle("off");};
  list.querySelectorAll(".dialpad button").forEach(function(b){
    b.onclick=function(){dialNum+=b.getAttribute("data-n");$("dial-num").textContent=dialNum;};
  });
  $("dial-out").onclick=function(){
    if(dialNum.length<3){window.GTA.toast("号码位数不够",1600);return;}
    // 空号一律接通「查号台」
    startCall("laowang",true);
  };
}
function startCall(cid,generic){
  var c=CONTACTS.filter(function(x){return x.id===cid;})[0];
  curCall=c;callSec=0;
  $("call-list").classList.add("off");
  $("call-face").classList.remove("off");
  var av=$("call-avatar");av.textContent=c.av;av.style.background=c.bg;
  $("call-name").textContent=generic?"查号台 "+dialNum:c.name;
  $("call-state").textContent="正在呼叫…";
  $("call-sub").textContent="";
  showView("call");
  var waited=false;
  setTimeout(function(){
    if(curCall!==c)return;
    $("call-state").textContent="通话中 00:00";
    $("call-sub").textContent=c.hello;
    waited=true;
    callTimer=setInterval(function(){
      callSec++;
      var m=Math.floor(callSec/60),s2=callSec%60;
      $("call-state").textContent="通话中 "+(m<10?"0":"")+m+":"+(s2<10?"0":"")+s2;
      // 每 6 秒播一句台词
      var li=Math.floor(callSec/6)-1;
      if(li>=0&&li<c.lines.length&&callSec%6===0){
        $("call-sub").textContent=c.lines[li];
      }
    },1000);
  },1800);
}
function stopCall(back){
  clearInterval(callTimer);callTimer=null;curCall=null;
  $("call-face").classList.add("off");
  $("call-list").classList.remove("off");
  if(back!==false)showView("call");
}

/* ============ 短信 ============ */
function smsUnreadCount(){
  return CONTACTS.reduce(function(n,c){
    return n+(sms[c.id].filter(function(m){return m.who==="them"&&!m.read;}).length);
  },0);
}
function renderSmsList(){
  unread=smsUnreadCount();
  var list=$("ph-smslist-inner");
  list.innerHTML=CONTACTS.map(function(c){
    var arr=sms[c.id],last=arr.length?arr[arr.length-1]:null;
    var badge=arr.filter(function(m){return m.who==="them"&&!m.read;}).length;
    return '<div class="ph-row" data-c="'+c.id+'">'+
      '<div class="ph-avatar" style="background:'+c.bg+'">'+c.av+'</div>'+
      '<div class="ph-row-info"><b>'+c.name+'</b><span>'+(last?(last.who==="me"?"我：":"")+last.txt.replace(/\n/g," "):"（无消息）")+'</span></div>'+
      (badge?'<div class="ph-badge">'+badge+'</div>':'')+'</div>';
  }).join("");
  list.querySelectorAll(".ph-row").forEach(function(el){
    el.onclick=function(){openChat(el.getAttribute("data-c"));};
  });
  renderHome();
}
function openChat(cid){
  curApp=cid;
  showView("sms");
  $("ph-smslist").classList.add("off");
  $("sms-chat").classList.remove("off");
  var c=CONTACTS.filter(function(x){return x.id===cid;})[0];
  $("sms-chat-name").textContent=c.name;
  $("sms-chat-back").onclick=function(){
    $("sms-chat").classList.add("off");
    $("ph-smslist").classList.remove("off");
    renderSmsList();
  };
  var box=$("sms-chat-box");
  box.innerHTML=sms[cid].map(function(m){
    return '<div class="sms-msg '+(m.who==="me"?"me":"them")+'">'+m.txt+'</div>';
  }).join("")+'<div class="sms-time">—— 短信 · 未付费 ——</div>';
  // 标记已读
  sms[cid].forEach(function(m){m.read=true;});
  saveSms();unread=smsUnreadCount();
  box.scrollTop=box.scrollHeight;
  var inp=$("sms-in"),btn=$("sms-send");
  inp.value="";
  btn.onclick=function(){
    var t=(inp.value||"").trim();
    if(!t)return;
    sms[cid].push({who:"me",txt:t});
    renderMsg(box,cid);
    inp.value="";
    saveSms();
    // 自动回复
    setTimeout(function(){
      var c2=CONTACTS.filter(function(x){return x.id===cid;})[0];
      var pool=c2.lines.concat(["收到。","哈哈哈，行。","有空一起吃鸭血粉丝汤。"]);
      var rep=pool[Math.floor(Math.random()*pool.length)];
      sms[cid].push({who:"them",txt:rep,read:false});
      if(curApp===cid)renderMsg(box,cid);
      saveSms();
      unread=smsUnreadCount();
      if(!open)renderHome();      // 关机状态也要刷新角标
      else renderSmsList();
    },1400+Math.random()*1200);
  };
}
function renderMsg(box,cid){
  box.innerHTML=sms[cid].map(function(m){
    return '<div class="sms-msg '+(m.who==="me"?"me":"them")+'">'+m.txt+'</div>';
  }).join("");
  box.scrollTop=box.scrollHeight;
}

/* 预置开场短信（首次开机注入一条） */
function seedSms(){
  if(sms._seeded)return;
  sms._seeded=true;
  sms.xiaomei=[{who:"them",txt:"哥！听说你到了南京？玄武湖、紫金山、新街口都值得去，金色信标指哪儿去哪儿，奖励拿到手软！",read:false}];
  sms.laowang=[{who:"them",txt:"王记修车开业酬宾，开车别撞楼，撞了记得打给我。",read:false}];
  saveSms();
}

/* ============ 相机 ============ */
function renderCam(){
  ["cam-shoot","cam-gal"].forEach(function(t){$(t).classList.toggle("active",camTab===t);});
  $("cam-shootview").classList.toggle("off",camTab!=="shoot");
  $("cam-galview").classList.toggle("off",camTab!=="gal");
  var N=window.__NJ3D;
  var n=(N&&N.photos)?N.photos.length:0;
  $("cam-count").textContent="已存 "+n+" 张";
  if(camTab==="gal")renderGallery();
}
function renderGallery(){
  var N=window.__NJ3D;
  var ph=(N&&N.photos)||[];
  var gal=$("ph-gallery");
  if(!ph.length){
    gal.innerHTML='<div class="ph-empty">相册空空如也<br>切到步行模式按快门，或按 P 拍一张</div>';
    return;
  }
  gal.innerHTML=ph.map(function(src,i){
    return '<img src="'+src+'" data-i="'+i+'" alt="photo'+i+'">';
  }).join("");
  gal.querySelectorAll("img").forEach(function(img){
    img.onclick=function(){
      $("viewer-img").src=img.src;
      $("ph-viewer").classList.remove("off");
    };
  });
}
function shoot(){
  var N=window.__NJ3D;
  if(!N)return;
  if(open){open=false;$("phone").classList.remove("open");} // 合上手机，让取景框全屏
  if(N.mode()!=="walk"){
    N.switchMode("walk");
    window.GTA.toast("已切换到步行模式，准备拍照…",1800);
    setTimeout(shoot,2100);
    return;
  }
  N.takePhoto();
  setTimeout(renderCam,1400);
}

/* ============ 云游金陵 iframe ============ */
function enterFullMap(){
  var f=$("ph-map-frame");
  if(!f.getAttribute("src"))f.setAttribute("src",f.getAttribute("data-src"));
  fullMap=true;
  $("ph-full-frame").setAttribute("src",f.getAttribute("data-src"));
  $("ph-fullmask").classList.remove("off");
}
function exitFullMap(){
  fullMap=false;
  $("ph-full-frame").removeAttribute("src");
  $("ph-fullmask").classList.add("off");
}

/* ============ 构建 DOM ============ */
function build(){
  seedSms();
  renderHome();
  // app 顶栏返回按钮
  document.querySelectorAll(".ph-back").forEach(function(b){
    b.onclick=function(){closeView();};
  });
  // 云游金陵 全屏
  $("ph-map-expand").onclick=enterFullMap;
  $("ph-full-back").onclick=exitFullMap;
  // 相机页签与快门
  $("cam-shoot").onclick=function(){camTab="shoot";renderCam();};
  $("cam-gal").onclick=function(){camTab="gal";renderCam();};
  $("cam-ring").onclick=shoot;
  $("viewer-close").onclick=function(){$("ph-viewer").classList.add("off");};
  // 通话挂断
  $("call-end").onclick=function(){stopCall(true);};
  // home 顶栏时钟持续刷新
  setInterval(tickClock,1000);
  // homebar
  $("ph-homebar").onclick=function(){closeView();};
}

/* ============ 对外 API ============ */
window.PHONE={
  toggle:toggle,
  isOpen:isOpen,
  refresh:renderHome,
  notify:function(cid,txt){
    // 外部注入短信（如任务完成提醒）
    if(!sms[cid])sms[cid]=[];
    sms[cid].push({who:"them",txt:txt,read:false});
    saveSms();unread=smsUnreadCount();
    if(curApp===cid&&curView==="sms-chat"){renderMsg($("sms-chat-box"),cid);}
    else if(curView==="sms")renderSmsList();
    else renderHome();
  }
};

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",build);
}else{build();}
})();
