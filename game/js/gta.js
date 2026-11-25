/* ============ GTA7:NANKING —— 开放世界玩法层 ============
   启动画面 · 金钱/通缉 HUD · 小地图 · 任务信标系统
   依赖 scene3d.js 的 window.__NJ3D 调试句柄，由其主循环调用 GTA.tick */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};

/* ============ 任务定义（按开放世界动线排布） ============ */
var MISSIONS=[
 {t:"打卡新街口",d:"步行或驾车前往新街口环岛，靠近孙中山铜像",x:44,z:33,r:14,pay:500,
  note:"城市之心。铜像注视着每一次通行。"},
 {t:"专车接驾",d:"驾驶/骑行前往德基广场北门（中山东路侧）",x:98,z:38,r:14,pay:800,
  note:"德基的车位比爱马仕难抢。"},
 {t:"玄武湖泛舟",d:"切到游船视角，把船开进北湖水域（湖心以北）",x:118,z:-520,r:24,pay:1200,
  note:"桨声灯影，金陵别号。"},
 {t:"索道登顶",d:"乘索道缆车上紫金山，抵达山腰站点附近",x:505,z:-40,r:30,pay:1500,
  note:"到了山顶，整座城市都是你的后视镜。"},
 {t:"鸡鸣寺祈福",d:"步行或骑行前往鸡鸣寺药师塔下",x:385,z:80,r:16,pay:800,
  note:"南朝四百八十寺，多少楼台烟雨中。"},
 {t:"回城·自由之路",d:"返回新街口十字路口，享受都市黄昏",x:44,z:12,r:16,pay:2000,
  note:"自由模式解锁。想干嘛干嘛。"}
];

/* ============ 状态 ============ */
var money=0,wanted=0,heat=0,mi=0,started=false,completeAll=false;
var MKEY="gta7_nanking_save";
try{
  var sv=JSON.parse(localStorage.getItem(MKEY)||"{}");
  money=sv.money||0;mi=sv.mi||0;completeAll=!!sv.done;
}catch(e){}
function save(){
  try{localStorage.setItem(MKEY,JSON.stringify({money:money,mi:completeAll?MISSIONS.length:mi,done:completeAll}));}catch(e){}
}
save();

/* ============ 信标（光柱 + 地面光环） ============ */
var beacon=null,beamMat=null,ringMat=null;
function buildBeacon(){
  var N=window.__NJ3D;if(!N)return;
  var grp=new THREE.Group();
  beamMat=new THREE.MeshBasicMaterial({color:0xe8c476,transparent:true,opacity:0.28,
    blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  var beam=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.2,160,18,1,true),beamMat);
  beam.position.y=80;grp.add(beam);
  ringMat=new THREE.MeshBasicMaterial({color:0xffd23e,transparent:true,opacity:0.85,
    blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  var ring=new THREE.Mesh(new THREE.RingGeometry(9,11.5,40),ringMat);
  ring.rotation.x=-Math.PI/2;ring.position.y=0.25;grp.add(ring);
  var halo=new THREE.Mesh(new THREE.RingGeometry(13,16,40),
    new THREE.MeshBasicMaterial({color:0xffd23e,transparent:true,opacity:0.28,
      blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  halo.rotation.x=-Math.PI/2;halo.position.y=0.22;grp.add(halo);
  grp.visible=false;
  N.scene.add(grp);
  beacon=grp;
}
function placeBeacon(m){
  if(!beacon)buildBeacon();
  if(!beacon)return;
  beacon.position.set(m.x,0,m.z);
  beacon.visible=true;
}
function hideBeacon(){if(beacon)beacon.visible=false;}

/* ============ 小地图 ============ */
var MM_R=[
  // [x1,z1,x2,z2,width] 城区路网
  [-250,12,340,12,22],[44,-250,44,166,20],
  [-176,95,244,95,12],[-176,-62,244,-62,12],[-140,170,200,170,12],
  [-90,-40,-90,140,10],[150,-40,150,140,10],[-170,-40,-170,140,10],
  // 郊区延伸
  [44,166,44,260,14],[-250,12,-430,12,12],[340,12,470,12,12]
];
var MM_WATER=[[120,-480,215,150]];   // 玄武湖椭圆
var MM_GREEN=[[505,-45,150,105]];    // 紫金山
var MM_LAND=[[388,72,20,14]];        // 鸡鸣寺地块
var MM_PTS=[
  {x:155,z:66,c:"#9fd4ff",s:5},   // 紫峰
  {x:44,z:12,c:"#ffd23e",s:5},    // 新街口
  {x:520,z:-56,c:"#8fe6a8",s:4},  // 观景台
  {x:120,z:-480,c:"#6ec3ff",s:4}  // 玄武湖
];
function drawMap(px,pz,heading){
  var cv=$("minimap");if(!cv)return;
  var g=cv.getContext("2d");
  var W=cv.width,H=cv.height,cx=W/2,cy=H/2;
  var k=0.40; // px per meter（地图放大后同步提高比例尺）
  g.clearRect(0,0,W,H);
  // 背景
  g.fillStyle="#16211a";g.fillRect(0,0,W,H);
  function wx(x){return cx+(x-px)*k;}
  function wz(z){return cy+(z-pz)*k;}
  // 水
  g.fillStyle="#1b3a5e";
  MM_WATER.forEach(function(e){
    g.save();g.translate(wx(e[0]),wz(e[1]));
    g.beginPath();g.ellipse(0,0,e[2]*k,e[3]*k,0,0,7);g.fill();g.restore();
  });
  // 山体/绿地块
  g.fillStyle="#2a4028";
  MM_GREEN.forEach(function(e){
    g.save();g.translate(wx(e[0]),wz(e[1]));
    g.beginPath();g.ellipse(0,0,e[2]*k,e[3]*k,0,0,7);g.fill();g.restore();
  });
  g.fillStyle="#3a4630";
  MM_LAND.forEach(function(e){
    g.save();g.translate(wx(e[0]),wz(e[1]));
    g.beginPath();g.ellipse(0,0,e[2]*k,e[3]*k,0,0,7);g.fill();g.restore();
  });
  // 道路
  g.strokeStyle="#5a6478";g.lineCap="round";
  MM_R.forEach(function(r){
    g.lineWidth=Math.max(2,r[4]*k);
    g.beginPath();g.moveTo(wx(r[0]),wz(r[1]));g.lineTo(wx(r[2]),wz(r[3]));g.stroke();
  });
  // 地标点（放大小地图后同步增大标记）
  MM_PTS.forEach(function(p){
    g.fillStyle=p.c;
    g.beginPath();g.arc(wx(p.x),wz(p.z),p.s*1.6,0,7);g.fill();
  });
  // 任务信标
  if(started&&!completeAll&&MISSIONS[mi]){
    var m=MISSIONS[mi];
    var blink=0.6+0.4*Math.sin(performance.now()*0.005);
    g.fillStyle="rgba(255,210,62,"+blink.toFixed(2)+")";
    g.beginPath();g.arc(wx(m.x),wz(m.z),8,0,7);g.fill();
    g.strokeStyle="rgba(255,210,62,.5)";g.lineWidth=2;
    g.beginPath();g.arc(wx(m.x),wz(m.z),13,0,7);g.stroke();
  }
  // 玩家箭头
  var f={x:Math.sin(heading),z:Math.cos(heading)};
  g.save();g.translate(cx,cy);
  g.rotate(Math.atan2(f.x,-f.z));
  g.fillStyle="#ff5566";
  g.beginPath();g.moveTo(0,-9);g.lineTo(6.5,7.5);g.lineTo(0,4);g.lineTo(-6.5,7.5);g.closePath();g.fill();
  g.restore();
  // 北向标
  g.fillStyle="#e8d9b0";g.font="bold 13px sans-serif";g.fillText("N",cx-4,15);
}

/* ============ HUD ============ */
function fmtMoney(v){
  return "¥"+String(Math.floor(v)).replace(/\B(?=(\d{3})+(?!\d))/g,",");
}
function refreshMoney(){
  var el=$("gta-money-n");if(el)el.textContent=fmtMoney(money).slice(1);
  var wrap=$("gta-money");
  if(wrap){wrap.classList.remove("bump");void wrap.offsetWidth;wrap.classList.add("bump");}
}
function refreshStars(){
  var el=$("gta-stars");if(!el)return;
  var s="";
  for(var i=0;i<5;i++)s+='<span class="'+(i<wanted?"st-on":"")+'">★</span>';
  el.innerHTML=s;
  el.classList.toggle("hot",wanted>0);
}
var toastT=null;
function toast(msg,ms){
  var el=$("gta-toast");if(!el)return;
  el.textContent=msg;el.classList.add("on");
  clearTimeout(toastT);
  toastT=setTimeout(function(){el.classList.remove("on");},ms||3000);
}
function refreshMission(){
  var tt=$("gta-m-title"),dd=$("gta-m-desc");
  if(!tt||!dd)return;
  if(completeAll){tt.textContent="自由模式";dd.textContent="全部任务完成 · 到处逛逛，或者掏出手机玩点什么";return;}
  var m=MISSIONS[mi];
  tt.textContent="任务 "+(mi+1)+"/"+MISSIONS.length+" · "+m.t;
  dd.textContent=m.d;
}

/* ============ 通缉（撞车积累，随时间消退） ============ */
function bump(){
  if(!started)return;
  heat=Math.min(5,heat+0.5);
  var w=Math.floor(heat);
  if(w!==wanted){wanted=w;refreshStars();
    if(wanted>0)toast("通缉等级 "+wanted+" · 安分点，别撞车",2000);}
}

/* ============ 任务到达检测 ============ */
function checkMission(mode,px,pz){
  if(!started||completeAll)return;
  var m=MISSIONS[mi];
  var ok=(mode!=="drone"&&mode!=="cable")||mi===3;
  // 索道任务允许 cable 模式；其余任务需地面/水面载具或步行
  if(!ok)return;
  if(mode==="drone")return;
  var d=Math.hypot(px-m.x,pz-m.z);
  if(d<m.r){
    money+=m.pay;
    toast("任务完成 · "+m.t+"  +"+fmtMoney(m.pay),3600);
    refreshMoney();save();
    hideBeacon();
    mi++;
    if(mi>=MISSIONS.length){
      completeAll=true;mi=MISSIONS.length;
      setTimeout(function(){
        toast("全任务通关 · 《GTA7:NANKING》自由模式已解锁",5000);
      },3800);
    }else{
      setTimeout(function(){
        placeBeacon(MISSIONS[mi]);
        toast("新任务 · "+MISSIONS[mi].t,3000);
      },2600);
    }
    refreshMission();save();
  }
}

/* ============ 主循环钩子（scene3d 每帧调用） ============ */
var frame=0;
function tick(dt,s){
  frame++;
  if(!window.__NJ3D)return;
  if(!beacon&&started)buildBeacon();
  // 通缉衰减
  if(heat>0){
    heat=Math.max(0,heat-dt*0.06);
    var w=Math.floor(heat);
    if(w!==wanted){wanted=w;refreshStars();
      if(wanted===0)toast("通缉解除 · 乖宝宝",1800);}
  }
  // 信标动画
  if(beacon&&beacon.visible){
    var t=performance.now()*0.001;
    beamMat.opacity=0.2+0.12*Math.sin(t*2.2);
    ringMat.opacity=0.6+0.3*Math.sin(t*2.2);
  }
  // 位置解析
  var px=0,pz=0,heading=0;
  if(s.mode==="drive"){px=s.carPos.x;pz=s.carPos.z;heading=s.carHeading;}
  else if(s.mode==="drone"){px=s.droneTgt.x;pz=s.droneTgt.z;}
  else{px=s.mePos.x;pz=s.mePos.z;heading=s.meHeading;}
  checkMission(s.mode,px,pz);
  if(frame%2===0)drawMap(px,pz,heading);
}

/* ============ 启动画面 ============ */
function startGame(){
  started=true;
  $("boot").classList.add("off");
  if(completeAll){
    refreshMission();
    toast("欢迎回到南京 · 自由模式",3200);
  }else{
    refreshMission();
    placeBeacon(MISSIONS[mi]);
    setTimeout(function(){toast("跟随金色信标完成任务 · 按 TAB 打开手机",4200);},800);
  }
}

/* ============ 初始化 ============ */
function init(){
  refreshMoney();
  refreshStars();
  refreshMission();
  $("boot-go").onclick=startGame;
  // 手机按钮
  var pb=$("phone-toggle");
  if(pb)pb.onclick=function(){window.PHONE.toggle();};
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",init);
}else{init();}

/* ============ 对外 API ============ */
window.GTA={
  tick:tick,
  bump:bump,
  toast:toast,
  pay:function(v,label){
    money+=v;refreshMoney();save();
    toast((label||"收入")+"  +"+fmtMoney(v),2800);
  },
  isStarted:function(){return started;},
  mission:function(){return completeAll?null:MISSIONS[mi];}
};
})();
