/* ============ 新街口 · 云游金陵 3D 实景 v3 ============
   无人机 / 驾驶 / 步行 / 自行车 / 电动车 / 索道缆车
   第一·第三视角切换 · 天气系统 · 昼夜变化 · 景深成像
   纯本地运行，Three.js r159 UMD */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};

/* ============ 渲染器 ============ */
var canvas=$("gl");
var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:false,powerPreference:"high-performance"});
var PR=Math.min(window.devicePixelRatio||1,2);
var SS=PR<1.5?1.35:1.0;
renderer.setPixelRatio(PR);
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;

var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(58,window.innerWidth/window.innerHeight,0.4,3000);
camera.position.set(26,178,192);

/* ============ 后期：景深 + 暗角 + 颗粒 ============ */
var rt=new THREE.WebGLRenderTarget(2,2,{
  minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,
  format:THREE.RGBAFormat,type:THREE.UnsignedByteType,
  depthBuffer:true,stencilBuffer:false
});
rt.texture.colorSpace=THREE.NoColorSpace;
rt.depthTexture=new THREE.DepthTexture(2,2);
rt.depthTexture.format=THREE.DepthFormat;
rt.depthTexture.type=THREE.UnsignedIntType;

var postUni={
  tColor:{value:rt.texture},tDepth:{value:rt.depthTexture},
  texel:{value:new THREE.Vector2(1,1)},
  near:{value:camera.near},far:{value:camera.far},
  focus:{value:120},range:{value:70},maxBlur:{value:2.4},
  dofOn:{value:1},vig:{value:0.84},grainAmt:{value:0.055},time:{value:0}
};
var postMat=new THREE.ShaderMaterial({
  uniforms:postUni,depthTest:false,depthWrite:false,
  vertexShader:[
    "varying vec2 vUv;",
    "void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }"
  ].join("\n"),
  fragmentShader:[
    "uniform sampler2D tColor;uniform sampler2D tDepth;",
    "uniform vec2 texel;uniform float near,far,focus,range,maxBlur,dofOn,vig,grainAmt,time;",
    "varying vec2 vUv;",
    "float linZ(float d){ float z=d*2.0-1.0; return (2.0*near*far)/(far+near-z*(far-near)); }",
    "float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }",
    "void main(){",
    "  vec3 col=texture2D(tColor,vUv).rgb;",
    "  float d=texture2D(tDepth,vUv).x;",
    "  float coc=0.0;",
    "  if(dofOn>0.5 && d<0.9999){",
    "    float z=linZ(d);",
    "    coc=clamp((abs(z-focus)-range*0.55)/(range*1.15),0.0,1.0);",
    "  }",
    "  if(coc>0.004){",
    "    float r=maxBlur*coc*coc;",
    "    vec3 sum=col; float cnt=1.0;",
    "    for(int i=0;i<12;i++){",
    "      float a=float(i)*2.3999632;",
    "      float rad=sqrt((float(i)+0.5)/12.0);",
    "      vec2 o=vec2(cos(a),sin(a))*rad*r;",
    "      sum+=texture2D(tColor,vUv+o*texel).rgb; cnt+=1.0;",
    "    }",
    "    col=sum/cnt;",
    "  }",
    "  vec2 q=vUv-0.5;",
    "  float v=1.0-smoothstep(0.30,0.95,length(q)*1.38)*(1.0-vig);",
    "  col*=v;",
    "  float g=hash(vUv*vec2(1280.0,720.0)+time*0.7)-0.5;",
    "  col+=g*grainAmt*0.5;",
    "  gl_FragColor=vec4(pow(max(col,0.0),vec3(0.4545)),1.0);",
    "}"
  ].join("\n")
});
var postScene=new THREE.Scene();
var postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMat));

function resizeTargets(){
  var w=window.innerWidth,h=window.innerHeight;
  var rw=Math.max(2,Math.round(w*PR*SS)),rh=Math.max(2,Math.round(h*PR*SS));
  rt.setSize(rw,rh);
  postUni.texel.value.set(1/rw,1/rh);
}

/* ============ 天空穹顶 ============ */
var skyUni={
  topColor:{value:new THREE.Color(0x5aa8e6)},
  bottomColor:{value:new THREE.Color(0xd8eef8)},
  hazeColor:{value:new THREE.Color(0xffffff)},
  offset:{value:60},exponent:{value:0.72},haze:{value:0.25}
};
var sky=new THREE.Mesh(new THREE.SphereGeometry(1600,32,16),
  new THREE.ShaderMaterial({
    uniforms:skyUni,side:THREE.BackSide,depthWrite:false,fog:false,
    vertexShader:"varying vec3 vP; void main(){ vP=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader:[
      "uniform vec3 topColor;uniform vec3 bottomColor;uniform vec3 hazeColor;",
      "uniform float offset;uniform float exponent;uniform float haze;",
      "varying vec3 vP;",
      "void main(){",
      "  float h=normalize(vP+vec3(0.0,offset,0.0)).y;",
      "  vec3 c=mix(bottomColor,topColor,pow(max(h,0.0),exponent));",
      "  float band=exp(-abs(h)*7.0);",
      "  c=mix(c,hazeColor,band*haze);",
      "  gl_FragColor=vec4(c,1.0);",
      "}"
    ].join("\n")
  }));
scene.add(sky);

/* ============ 星空 ============ */
var starGeo=new THREE.BufferGeometry();
(function(){
  var n=1100,pos=new Float32Array(n*3);
  for(var i=0;i<n;i++){
    var th=Math.random()*Math.PI*2, ph=Math.random()*Math.PI*0.44, r=1400;
    pos[i*3]=r*Math.sin(ph)*Math.cos(th);
    pos[i*3+1]=r*Math.cos(ph)+40;
    pos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
  }
  starGeo.setAttribute("position",new THREE.BufferAttribute(pos,3));
})();
var starMat=new THREE.PointsMaterial({color:0xcfd8ff,size:1.9,sizeAttenuation:false,transparent:true,opacity:0,fog:false});
var stars=new THREE.Points(starGeo,starMat);
scene.add(stars);

/* ============ 日月 ============ */
function glowTex(inner,outer){
  var c=document.createElement("canvas");c.width=c.height=128;
  var g=c.getContext("2d");
  var gr=g.createRadialGradient(64,64,4,64,64,64);
  gr.addColorStop(0,inner);gr.addColorStop(0.22,inner);gr.addColorStop(1,outer);
  g.fillStyle=gr;g.fillRect(0,0,128,128);
  var t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
var sunSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex("rgba(255,240,200,1)","rgba(255,214,150,0)"),transparent:true,depthWrite:false,fog:false}));
sunSpr.scale.set(210,210,1);
var moonSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex("rgba(228,234,252,0.95)","rgba(200,214,255,0)"),transparent:true,depthWrite:false,fog:false}));
moonSpr.scale.set(90,90,1);
scene.add(sunSpr);scene.add(moonSpr);

/* ============ 光照 ============ */
var hemi=new THREE.HemisphereLight(0xbfd8f0,0x40503f,0.85);
scene.add(hemi);
var sun=new THREE.DirectionalLight(0xfff2d9,1.2);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-150;sun.shadow.camera.right=150;
sun.shadow.camera.top=150;sun.shadow.camera.bottom=-150;
sun.shadow.camera.near=1;sun.shadow.camera.far=700;
sun.shadow.bias=-0.0005;
sun.shadow.normalBias=0.035;
sun.shadow.radius=1.6;
scene.add(sun);scene.add(sun.target);
var moon=new THREE.DirectionalLight(0x8ea2ff,0);
scene.add(moon);scene.add(moon.target);
var amb=new THREE.AmbientLight(0x2a3848,0.3);
scene.add(amb);

/* ============ 场景内容 ============ */
var CITY=window.CITY.create(scene,renderer);
CITY.mats.snow.forEach(function(o){o.base=o.m.color.clone();});

/* ============ 玩家车辆 ============ */
var carRef=CITY._makeCar(0xc0392b,false);
var car=carRef.g,wheels=carRef.wheels;
car.position.set(-150,0.06,18);
car.rotation.y=Math.PI/2;
scene.add(car);
var headL=new THREE.SpotLight(0xfff2c4,0,70,0.55,0.55,1.1);
headL.position.set(0.6,0.9,2.2);headL.target.position.set(0.6,0,20);car.add(headL);car.add(headL.target);
var headR=new THREE.SpotLight(0xfff2c4,0,70,0.55,0.55,1.1);
headR.position.set(-0.6,0.9,2.2);headR.target.position.set(-0.6,0,20);car.add(headR);car.add(headR.target);

/* ============ 玩家角色：步行 / 自行车 / 电动车 / 游船 ============ */
var walkAv=CITY._person(-120,27,{noReg:true,still:true});
walkAv.g.visible=false;
var bikeAv=CITY._makeRide("bike");bikeAv.g.visible=false;scene.add(bikeAv.g);
var ebikeAv=CITY._makeRide("ebike");ebikeAv.g.visible=false;scene.add(ebikeAv.g);
var boatAv=CITY._makeBoat();boatAv.g.visible=false;scene.add(boatAv.g);

var ME_CFG={
  walk:  {acc:10,max:5.2,turn:2.6,r:0.45,eye:1.62,back:5.2,up:3.0},
  bike:  {acc:7, max:7.5,turn:2.1,r:0.6, eye:1.58,back:6.8,up:3.4},
  ebike: {acc:11,max:14, turn:1.9,r:0.7, eye:1.58,back:7.6,up:3.6},
  boat:  {acc:4.5,max:6.5,turn:1.25,r:1.4,eye:2.05,back:12,up:5.2}
};
var me={pos:new THREE.Vector3(-120,0,27),heading:Math.PI/2,speed:0,ph:0};
var pov="third";           // 第三/第一人称
var autoOrbit=false;       // 无人机自动环绕

/* ============ 昼夜关键帧 ============ */
var KF=[
  [0,   0x080e26,0x121a33,0x8ea2ff,0.0, 0.16,0x0c1426,0.30],
  [4.8, 0x0a1130,0x1a2440,0x8ea2ff,0.0, 0.18,0x101a2e,0.32],
  [5.8, 0x2b4270,0x8a6a80,0xffb98a,0.18,0.30,0x5a6480,0.42],
  [6.6, 0x4f7bb0,0xf0b48a,0xffbe7a,0.55,0.55,0x9aa8b8,0.50],
  [8,   0x5f9fd8,0xcfdfe8,0xfff0d2,1.25,0.92,0xc2d6e2,0.34],
  [12,  0x4f97dc,0xcfe6f4,0xffffff,1.55,1.05,0xcde3ef,0.24],
  [15.5,0x5397d6,0xd8e0dc,0xfff2dc,1.35,0.95,0xc9dae2,0.26],
  [17.4,0x51719f,0xe8b082,0xffc27a,1.05,0.72,0xcabca6,0.40],
  [18.6,0x2e3f72,0xc2705a,0xff9a5e,0.45,0.44,0x8a7a7e,0.50],
  [19.8,0x141d44,0x4a3a52,0xff7d4a,0.10,0.24,0x2e3048,0.40],
  [21,  0x0a1130,0x1a2440,0x8ea2ff,0.0, 0.18,0x101a2e,0.32],
  [24,  0x080e26,0x121a33,0x8ea2ff,0.0, 0.16,0x0c1426,0.30]
];
function lerp(a,b,t){return a+(b-a)*t;}
function lerpColor(c1,c2,t){return new THREE.Color(c1).lerp(new THREE.Color(c2),t);}
function sampleKF(hour){
  var i=0;
  while(i<KF.length-2&&hour>=KF[i+1][0])i++;
  var a=KF[i],b=KF[i+1];
  var t=Math.max(0,Math.min(1,(hour-a[0])/(b[0]-a[0])));
  return {
    top:lerpColor(a[1],b[1],t),bottom:lerpColor(a[2],b[2],t),
    sunC:lerpColor(a[3],b[3],t),sunI:lerp(a[4],b[4],t),
    hemiI:lerp(a[5],b[5],t),fogC:lerpColor(a[6],b[6],t),
    haze:lerp(a[7],b[7],t)
  };
}

/* ============ 天气预设 ============ */
var WX={
  clear:{cloud:0.14,dark:0.06,rain:0,snow:0,fogN:520,fogF:1600,sunMul:1,grey:0},
  cloudy:{cloud:0.82,dark:0.42,rain:0,snow:0,fogN:380,fogF:1000,sunMul:0.55,grey:0.36},
  rain:{cloud:0.96,dark:0.72,rain:1,snow:0,fogN:150,fogF:520,sunMul:0.22,grey:0.58},
  snow:{cloud:0.85,dark:0.24,rain:0,snow:1,fogN:180,fogF:620,sunMul:0.45,grey:0.46},
  fog:{cloud:0.4,dark:0.15,rain:0,snow:0,fogN:70,fogF:480,sunMul:0.42,grey:0.55}
};
var WX_NAME={clear:"晴",cloudy:"多云",rain:"雨",snow:"雪",fog:"雾"};

var env={
  weather:"clear",hour:12,flow:false,flowSpeed:0.5,
  cloud:0.14,dark:0.06,rain:0,snow:0,fogN:520,fogF:1600,sunMul:1,grey:0
};
scene.fog=new THREE.Fog(0xcde3ef,520,1600);

/* ============ 相机控制 ============ */
var mode="drone";   // drone / drive / walk / bike / ebike / cable / boat
var MODE_LABEL={drone:"无人机视角",drive:"驾驶视角",walk:"步行视角",bike:"自行车视角",ebike:"电动车视角",cable:"索道缆车",boat:"游船视角"};
var drone={target:new THREE.Vector3(44,0,12),tY:0,theta:0.16,phi:0.78,radius:255,
           tTheta:0.16,tPhi:0.78,tRadius:255};
var drive={speed:0,heading:Math.PI/2};
var camTrans={active:false,t:0,dur:1.6,fromP:new THREE.Vector3(),fromQ:new THREE.Quaternion()};
var keys={};
var dragging=false,lastX=0,lastY=0;

canvas.addEventListener("pointerdown",function(e){
  if(mode!=="drone")return;
  dragging=true;lastX=e.clientX;lastY=e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove",function(e){
  if(!dragging||mode!=="drone")return;
  drone.tTheta-=(e.clientX-lastX)*0.006;
  drone.tPhi=Math.max(0.14,Math.min(1.45,drone.tPhi+(e.clientY-lastY)*0.004));
  lastX=e.clientX;lastY=e.clientY;
});
canvas.addEventListener("pointerup",function(){dragging=false;});
canvas.addEventListener("wheel",function(e){
  if(mode!=="drone")return;
  drone.tRadius=Math.max(12,Math.min(900,drone.tRadius*(e.deltaY>0?1.12:0.9)));
},{passive:true});
window.addEventListener("keydown",function(e){
  // 手机打开时：只响应 TAB/Esc 合上手机，其余按键不进场景
  if(window.PHONE&&window.PHONE.isOpen()){
    if(e.code==="Tab"||e.code==="Escape"){e.preventDefault();window.PHONE.toggle();}
    keys["KeyW"]=keys["KeyA"]=keys["KeyS"]=keys["KeyD"]=false;
    return;
  }
  if(e.code==="Tab"){e.preventDefault();window.PHONE.toggle();return;}
  keys[e.code]=true;
  if(e.code==="Space")e.preventDefault();
  if(e.code==="KeyV"&&mode!=="drone"&&mode!=="cable")togglePov();
  if(e.code==="KeyC"&&mode==="drone")toggleAutoOrbit();
  if(e.code==="KeyP")takePhoto();
  if(mode==="cable"&&["KeyW","KeyA","KeyS","KeyD"].indexOf(e.code)>=0)exitCable();
});
window.addEventListener("keyup",function(e){keys[e.code]=false;});

/* 碰撞：AABB 精确推挤 + 圆形碰撞体兜底，杜绝穿楼 */
function resolveCollide(px,pz,r){
  var i,b,cx,cz,dx,dz,d;
  for(i=0;i<CITY.boxes.length;i++){
    b=CITY.boxes[i];
    if(px<b.x0-r||px>b.x1+r||pz<b.z0-r||pz>b.z1+r)continue;
    cx=Math.max(b.x0,Math.min(px,b.x1));
    cz=Math.max(b.z0,Math.min(pz,b.z1));
    dx=px-cx;dz=pz-cz;
    d=Math.hypot(dx,dz);
    if(d<r){
      if(d<1e-4){
        // 质点在盒内：沿最薄方向弹出
        var l=px-b.x0,rr2=b.x1-px,t2=pz-b.z0,bt=b.z1-pz;
        var m=Math.min(l,rr2,t2,bt);
        if(m===l)px=b.x0-r-0.05;else if(m===rr2)px=b.x1+r+0.05;
        else if(m===t2)pz=b.z0-r-0.05;else pz=b.z1+r+0.05;
      }else{
        px=cx+dx/d*(r+0.05);pz=cz+dz/d*(r+0.05);
      }
    }
  }
  for(i=0;i<CITY.colliders.length;i++){
    var cd=CITY.colliders[i];
    dx=px-cd.x;dz=pz-cd.z;
    d=Math.hypot(dx,dz);
    if(d<cd.r+r){
      var pu=cd.r+r-d+0.05;
      px+=dx/(d||1)*pu;pz+=dz/(d||1)*pu;
    }
  }
  return [px,pz];
}

function carForward(){return new THREE.Vector3(Math.sin(drive.heading),0,Math.cos(drive.heading));}
function meForward(){return new THREE.Vector3(Math.sin(me.heading),0,Math.cos(me.heading));}

function updateCar(dt){
  var acc=0;
  if(mode==="drive"){
    if(keys["KeyW"]||keys["ArrowUp"])acc=17;
    if(keys["KeyS"]||keys["ArrowDown"])acc=-12;
    if(keys["Space"])drive.speed*=Math.max(0,1-dt*4);
  }else{
    drive.speed*=Math.max(0,1-dt*2.2);
  }
  drive.speed+=acc*dt;
  drive.speed=Math.max(-9,Math.min(32,drive.speed));
  drive.speed*=Math.max(0,1-dt*0.55);
  var steer=0;
  if(keys["KeyA"]||keys["ArrowLeft"])steer=1;
  if(keys["KeyD"]||keys["ArrowRight"])steer=-1;
  drive.heading+=steer*dt*1.85*Math.min(1,Math.abs(drive.speed)/10)*(drive.speed<0?-1:1);
  var f=carForward();
  var nx=car.position.x+f.x*drive.speed*dt;
  var nz=car.position.z+f.z*drive.speed*dt;
  var hit=false;
  var res=resolveCollide(nx,nz,1.4);
  if(res[0]!==nx||res[1]!==nz){hit=true;nx=res[0];nz=res[1];}
  if(hit){
    drive.speed*=-0.35;
    if(window.GTA&&Math.abs(drive.speed)>4)window.GTA.bump(); // 撞车积累通缉
  }
  var dist=Math.hypot(nx,nz);
  if(dist>720){nx*=720/dist;nz*=720/dist;drive.speed*=0.5;}
  car.position.x=nx;car.position.z=nz;
  car.rotation.y=drive.heading;
  wheels.forEach(function(w){w.rotation.x+=drive.speed*dt*2.2;});
}

/* 步行 / 自行车 / 电动车 / 游船 */
var ME_AV={walk:walkAv,bike:bikeAv,ebike:ebikeAv,boat:boatAv};
function updateMe(dt){
  var cfg=ME_CFG[mode];
  var acc=0;
  if(keys["KeyW"]||keys["ArrowUp"])acc=cfg.acc;
  if(keys["KeyS"]||keys["ArrowDown"])acc=-cfg.acc*0.7;
  if(keys["Space"])me.speed*=Math.max(0,1-dt*5);
  if(keys["ShiftLeft"]||keys["ShiftRight"])acc*=1.3;
  me.speed+=acc*dt;
  me.speed=Math.max(-cfg.max*0.4,Math.min(cfg.max,me.speed));
  me.speed*=Math.max(0,1-dt*0.9);
  var steer=0;
  if(keys["KeyA"]||keys["ArrowLeft"])steer=1;
  if(keys["KeyD"]||keys["ArrowRight"])steer=-1;
  me.heading+=steer*dt*cfg.turn*Math.min(1,me.speed*0.5)*(me.speed<0?-1:1);
  var f=meForward();
  var nx=me.pos.x+f.x*me.speed*dt;
  var nz=me.pos.z+f.z*me.speed*dt;
  var bobY=0.17;
  if(mode==="boat"){
    // 游船：仅限玄武湖水域，不上岸不撞楼
    if(!CITY.lakeWater(nx,nz)){
      nx=me.pos.x;nz=me.pos.z;me.speed*=-0.3;
    }
    var dist2=Math.hypot(nx,nz);
    if(dist2>720){nx*=720/dist2;nz*=720/dist2;me.speed=0;}
    me.pos.x=nx;me.pos.z=nz;
    bobY=0.24+Math.sin(performance.now()*0.0016)*0.03;
  }else{
    var res=resolveCollide(nx,nz,cfg.r);
    nx=res[0];nz=res[1];
    var dist=Math.hypot(nx,nz);
    if(dist>720){nx*=720/dist;nz*=720/dist;me.speed=0;}
    me.pos.x=nx;me.pos.z=nz;
  }
  // 角色外观同步
  var av=ME_AV[mode];
  av.g.position.set(nx,bobY,nz);
  av.g.rotation.y=me.heading;
  me.ph+=me.speed*dt*2.4;
  if(mode==="walk"){
    var sw=Math.sin(me.ph)*0.55*Math.min(1,Math.abs(me.speed));
    av.legL.rotation.x=sw;av.legR.rotation.x=-sw;
    if(photoLock){                       // 拍照中：举手机姿势
      av.armL.rotation.x=0.25;
      av.armR.rotation.x=-2.25;av.armR.rotation.z=-0.35;
    }else{
      av.armL.rotation.x=-sw*0.7;av.armR.rotation.x=sw*0.7;
    }
    av.g.position.y=bobY+Math.abs(Math.sin(me.ph))*0.035*Math.min(1,Math.abs(me.speed));
  }else if(mode==="boat"){
    av.g.rotation.z=Math.sin(performance.now()*0.0013)*0.02;
    av.g.userData.rider.visible=(pov==="third");
  }else{
    var kick=Math.sin(me.ph)*0.5*Math.min(1,Math.abs(me.speed));
    av.legL.rotation.x=0.5+kick;av.legR.rotation.x=-0.3-kick;
    av.wheels.forEach(function(w){w.rotation.x+=me.speed*dt*3;});
  }
}

function droneCamPose(out){
  var p=drone.target;
  out.position.set(
    p.x+drone.radius*Math.sin(drone.phi)*Math.sin(drone.theta),
    p.y+drone.radius*Math.cos(drone.phi),
    p.z+drone.radius*Math.sin(drone.phi)*Math.cos(drone.theta));
  var m=new THREE.Matrix4();
  out.quaternion.setFromRotationMatrix(m.lookAt(out.position,new THREE.Vector3(p.x,p.y+3,p.z),new THREE.Vector3(0,1,0)));
  return out;
}
function driveCamPose(out){
  var f=carForward();
  if(pov==="first"){
    out.position.copy(car.position).addScaledVector(f,0.3).add(new THREE.Vector3(0,1.42,0));
    var m0=new THREE.Matrix4();
    out.quaternion.setFromRotationMatrix(m0.lookAt(out.position,
      car.position.clone().addScaledVector(f,12).add(new THREE.Vector3(0,1.4,0)),new THREE.Vector3(0,1,0)));
    return out;
  }
  out.position.copy(car.position).addScaledVector(f,-10.5).add(new THREE.Vector3(0,4.3,0));
  var m=new THREE.Matrix4();
  out.quaternion.setFromRotationMatrix(m.lookAt(out.position,
    car.position.clone().addScaledVector(f,8).add(new THREE.Vector3(0,1.7,0)),new THREE.Vector3(0,1,0)));
  return out;
}
function meCamPose(out){
  var cfg=ME_CFG[mode];
  var f=meForward();
  if(pov==="first"){
    var fwdOff=(mode==="boat")?0.9:0.4;
    out.position.copy(me.pos).add(new THREE.Vector3(0,cfg.eye,0)).addScaledVector(f,fwdOff);
    var m0=new THREE.Matrix4();
    out.quaternion.setFromRotationMatrix(m0.lookAt(out.position,
      me.pos.clone().addScaledVector(f,12).add(new THREE.Vector3(0,cfg.eye-0.2,0)),new THREE.Vector3(0,1,0)));
    return out;
  }
  out.position.copy(me.pos).addScaledVector(f,-cfg.back).add(new THREE.Vector3(0,cfg.up,0));
  var m=new THREE.Matrix4();
  out.quaternion.setFromRotationMatrix(m.lookAt(out.position,
    me.pos.clone().addScaledVector(f,4).add(new THREE.Vector3(0,mode==="boat"?0.8:1.5,0)),new THREE.Vector3(0,1,0)));
  return out;
}
function cableCamPose(out){
  var cb=CITY._cable;
  var cab=cb.up[0];
  var dir=cb.B.clone().sub(cb.A).normalize();
  var side=new THREE.Vector3().crossVectors(dir,new THREE.Vector3(0,1,0)).normalize();
  var p=cab.g.position.clone().add(new THREE.Vector3(0,4.5,0)).addScaledVector(side,9);
  out.position.copy(p);
  var m=new THREE.Matrix4();
  out.quaternion.setFromRotationMatrix(m.lookAt(p,
    cab.g.position.clone().addScaledVector(dir,6).add(new THREE.Vector3(0,1,0)),new THREE.Vector3(0,1,0)));
  return out;
}
var _pose={position:new THREE.Vector3(),quaternion:new THREE.Quaternion()};

function exitCable(){
  if(mode!=="cable")return;
  var cab=CITY._cable.up[0].g.position;
  drone.target.set(cab.x,cab.y,cab.z);
  drone.tY=cab.y;
  drone.tRadius=90;drone.tPhi=0.9;
  switchMode("drone");
}
function togglePov(){
  pov=pov==="first"?"third":"first";
  var b=$("pov-toggle");
  if(b){b.classList.toggle("active",pov==="first");b.textContent=pov==="first"?"第一人称":"第三人称";}
  setTips();
}
function toggleAutoOrbit(){
  autoOrbit=!autoOrbit;
  var b=$("d-auto");
  if(b)b.classList.toggle("active",autoOrbit);
  setTips();
}

/* ============ 手机拍照（步行模式） ============ */
var photoLock=false,photoBusy=false;
var photoCount=0;
function takePhoto(){
  if(photoBusy)return;
  if(mode!=="walk"){
    var tips=$("tips"),old=setTips;
    tips.textContent="掏出手机前请先切到步行视角";
    setTimeout(function(){if(mode!=="walk")setTips();},1600);
    return;
  }
  photoBusy=true;photoLock=true;
  $("vf").classList.add("on");
  setTimeout(function(){
    // 快门：同步重绘后抓帧（避免 buffer 被清除）
    renderer.setRenderTarget(rt);
    renderer.render(scene,camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene,postCam);
    var data;
    try{data=renderer.domElement.toDataURL("image/jpeg",0.86);}catch(e){data=null;}
    $("vf").classList.remove("on");
    $("flash").classList.add("on");
    setTimeout(function(){$("flash").classList.remove("on");},140);
    if(data){
      photoCount++;
      $("photo-img").src=data;
      $("photo-n").textContent=photoCount;
      $("photo-card").classList.add("on");
      window.__NJ3D.photos=window.__NJ3D.photos||[];
      window.__NJ3D.photos.push(data);
      setTimeout(function(){$("photo-card").classList.remove("on");},2600);
    }
    photoBusy=false;photoLock=false;
  },900);
}
$("photo-btn").onclick=takePhoto;

function setBtn(m2){
  ["m-drone","m-drive","m-walk","m-bike","m-ebike","m-cable","m-boat"].forEach(function(id){
    var el=$(id);if(el)el.classList.remove("active");
  });
  var map={drone:"m-drone",drive:"m-drive",walk:"m-walk",bike:"m-bike",ebike:"m-ebike",cable:"m-cable",boat:"m-boat"};
  var el=$(map[m2]);if(el)el.classList.add("active");
  $("hud-mode").textContent=MODE_LABEL[m2];
}
function setTips(){
  var t={
    drone:"拖动旋转 · 滚轮缩放 · WASD 平移 · R/F 升降 · Q/E 环绕 · C 自动环绕",
    drive:"W/S 油门刹车 · A/D 转向 · 空格急停 · V 切换第一/第三视角",
    walk:"W/S 前进后退 · A/D 转向 · Shift 加速 · V 切换视角 · P 手机拍照",
    bike:"W/S 踩踏/刹车 · A/D 转向 · V 切换第一/第三视角",
    ebike:"W/S 电门/刹车 · A/D 转向 · V 切换第一/第三视角",
    cable:"索道缆车乘坐中 · 按 WASD 或点击其他视角按钮下车",
    boat:"游船：W/S 前进后退 · A/D 转向 · 仅限玄武湖水域 · V 切换视角"
  };
  $("tips").textContent=t[mode]||"";
}

function switchMode(m2){
  if(mode===m2||camTrans.active)return;
  camTrans.active=true;camTrans.t=0;
  camTrans.fromP.copy(camera.position);
  camTrans.fromQ.copy(camera.quaternion);
  var prev=mode;
  mode=m2;
  car.visible=true; // 车辆常驻（未驾驶时视为路边停车）
  if(m2==="drive"){
    drive.heading=car.rotation.y;drive.speed=0;
  }else if(m2==="boat"){
    // 登船：码头泊位（东南岸码头旁）
    me.pos.set(153,0,-379);me.heading=Math.PI;me.speed=0;
    boatAv.g.visible=(pov==="third");
  }else if(m2==="walk"||m2==="bike"||m2==="ebike"){
    if(prev==="drone"||prev==="cable"){
      me.pos.set(20,0,27);me.heading=Math.PI/2;
    }else if(prev==="drive"){
      me.pos.set(car.position.x,0,car.position.z);
      me.heading=drive.heading;
    }else if(prev==="boat"){
      // 下船：回到东南岸码头平台
      me.pos.set(150,0,-366);me.heading=Math.PI;me.speed=0;
    }
    me.speed=0;
    walkAv.g.visible=(m2==="walk"&&pov==="third");
    bikeAv.g.visible=(m2==="bike"&&pov==="third");
    ebikeAv.g.visible=(m2==="ebike"&&pov==="third");
  }else if(m2==="drone"){
    var ref=(prev==="drive")?car.position:(prev==="walk"||prev==="bike"||prev==="ebike"||prev==="boat")?me.pos:car.position;
    var f2=carForward();
    drone.target.set(ref.x,0,ref.z);
    drone.tY=0;
    drone.tRadius=135;drone.tPhi=0.86;
    drone.theta=Math.atan2(f2.x,f2.z);drone.tTheta=drone.theta;
  }
  if(prev==="boat"&&m2!=="boat")boatAv.g.visible=false;
  setBtn(m2);
  setTips();
}
$("m-drone").onclick=function(){switchMode("drone");};
$("m-drive").onclick=function(){switchMode("drive");};
$("m-walk").onclick=function(){switchMode("walk");};
$("m-bike").onclick=function(){switchMode("bike");};
$("m-ebike").onclick=function(){switchMode("ebike");};
$("m-cable").onclick=function(){switchMode("cable");};
$("m-boat").onclick=function(){switchMode("boat");};
var povBtn=$("pov-toggle");
if(povBtn)povBtn.onclick=togglePov;
/* 无人机操作按钮 */
var dUp=$("d-up"),dDown=$("d-down"),dOL=$("d-orbitL"),dOR=$("d-orbitR"),
    dIn=$("d-in"),dOut=$("d-out"),dAuto=$("d-auto");
if(dUp)dUp.onclick=function(){drone.tY=Math.min(320,drone.tY+20);};
if(dDown)dDown.onclick=function(){drone.tY=Math.max(2,drone.tY-20);};
if(dOL)dOL.onclick=function(){drone.tTheta+=0.6;};
if(dOR)dOR.onclick=function(){drone.tTheta-=0.6;};
if(dIn)dIn.onclick=function(){drone.tRadius=Math.max(12,drone.tRadius*0.78);};
if(dOut)dOut.onclick=function(){drone.tRadius=Math.min(900,drone.tRadius*1.28);};
if(dAuto)dAuto.onclick=toggleAutoOrbit;

function updateCamera(dt){
  drone.theta+=(drone.tTheta-drone.theta)*Math.min(1,dt*7);
  drone.phi+=(drone.tPhi-drone.phi)*Math.min(1,dt*7);
  drone.radius+=(drone.tRadius-drone.radius)*Math.min(1,dt*7);
  if(mode==="drone"){
    if(keys["KeyQ"])drone.tTheta+=dt*1.1;
    if(keys["KeyE"])drone.tTheta-=dt*1.1;
    if(keys["KeyR"]||keys["PageUp"])drone.tY+=60*dt;
    if(keys["KeyF"]||keys["PageDown"])drone.tY-=60*dt;
    if(keys["Equal"])drone.tRadius=Math.max(12,drone.tRadius*(1-0.6*dt));
    if(keys["Minus"])drone.tRadius=Math.min(900,drone.tRadius*(1+0.6*dt));
    if(autoOrbit)drone.tTheta+=dt*0.32;
    drone.tY=Math.max(2,Math.min(320,drone.tY));
    drone.target.y+=(drone.tY-drone.target.y)*Math.min(1,dt*5);
    var sp=70*(keys["ShiftLeft"]||keys["ShiftRight"]?2.4:1)*dt;
    var dx=0,dz=0;
    if(keys["KeyW"])dz-=1;if(keys["KeyS"])dz+=1;
    if(keys["KeyA"])dx-=1;if(keys["KeyD"])dx+=1;
    if(dx||dz){
      var ang=drone.theta;
      drone.target.x+=(dx*Math.cos(ang)+dz*Math.sin(ang))*sp;
      drone.target.z+=(-dx*Math.sin(ang)+dz*Math.cos(ang))*sp;
      drone.target.x=Math.max(-720,Math.min(720,drone.target.x));
      drone.target.z=Math.max(-720,Math.min(720,drone.target.z));
    }
  }
  if(camTrans.active){
    camTrans.t+=dt/camTrans.dur;
    var t=camTrans.t;
    if(t>=1){camTrans.active=false;return;}
    var e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    var pose=(mode==="drive"?driveCamPose:mode==="drone"?droneCamPose:
              mode==="cable"?cableCamPose:meCamPose)(_pose);
    camera.position.lerpVectors(camTrans.fromP,pose.position,e);
    camera.quaternion.slerpQuaternions(camTrans.fromQ,pose.quaternion,e);
    return;
  }
  if(mode==="drive"){
    driveCamPose(_pose);
    camera.position.lerp(_pose.position,Math.min(1,dt*5.5));
    camera.quaternion.slerp(_pose.quaternion,Math.min(1,dt*6));
    camera.fov=lerp(camera.fov,58+Math.abs(drive.speed)*0.45,dt*3);
    camera.updateProjectionMatrix();
  }else if(mode==="drone"){
    droneCamPose(_pose);
    camera.position.lerp(_pose.position,Math.min(1,dt*8));
    camera.quaternion.slerp(_pose.quaternion,Math.min(1,dt*8));
    camera.fov=lerp(camera.fov,58,dt*3);
    camera.updateProjectionMatrix();
  }else if(mode==="cable"){
    cableCamPose(_pose);
    camera.position.lerp(_pose.position,Math.min(1,dt*6));
    camera.quaternion.slerp(_pose.quaternion,Math.min(1,dt*6));
    camera.fov=lerp(camera.fov,55,dt*3);
    camera.updateProjectionMatrix();
    // 到达山顶自动下缆车
    if(CITY._cable.up[0].p>0.965)exitCable();
  }else{
    meCamPose(_pose);
    camera.position.lerp(_pose.position,Math.min(1,dt*8));
    camera.quaternion.slerp(_pose.quaternion,Math.min(1,dt*9));
    camera.fov=lerp(camera.fov,58+Math.abs(me.speed)*0.6,dt*3);
    camera.updateProjectionMatrix();
  }
}

/* ============ UI ============ */
document.querySelectorAll(".w").forEach(function(b){
  b.onclick=function(){
    env.weather=b.getAttribute("data-w");
    document.querySelectorAll(".w").forEach(function(x){x.classList.remove("active");});
    b.classList.add("active");
    $("hud-wx").textContent=WX_NAME[env.weather];
  };
});
document.querySelectorAll(".t").forEach(function(b){
  b.onclick=function(){
    env.hour=parseFloat(b.getAttribute("data-t"));
    $("time-slider").value=env.hour;
  };
});
$("time-slider").addEventListener("input",function(){
  env.hour=parseFloat(this.value);env.flow=false;
  $("time-flow").textContent="时间流动 ▶";$("time-flow").classList.remove("active");
});
$("time-flow").onclick=function(){
  env.flow=!env.flow;
  this.textContent=env.flow?"时间流动 ❚❚":"时间流动 ▶";
  this.classList.toggle("active",env.flow);
};
function fmtTime(h){
  var hh=Math.floor(h)%24,mm=Math.floor((h-Math.floor(h))*60);
  return (hh<10?"0":"")+hh+":"+(mm<10?"0":"")+mm;
}
var dofOn=true;
var bDof=$("dof-toggle");
if(bDof)bDof.onclick=function(){
  dofOn=!dofOn;postUni.dofOn.value=dofOn?1:0;
  bDof.classList.toggle("active",dofOn);
  bDof.textContent=dofOn?"景深 开":"景深 关";
};

/* ============ 环境更新 ============ */
var greyDay=new THREE.Color(0x9aa3ac);
var WHITE=new THREE.Color(0xffffff);
function updateEnv(dt){
  if(env.flow){
    env.hour=(env.hour+dt*env.flowSpeed*1.8)%24;
    $("time-slider").value=env.hour;
  }
  $("time-label").textContent=fmtTime(env.hour);
  $("hud-time").textContent=fmtTime(env.hour);

  var w=WX[env.weather];
  var k=Math.min(1,dt*1.6);
  env.cloud+=(w.cloud-env.cloud)*k;
  env.dark+=(w.dark-env.dark)*k;
  env.rain+=(w.rain-env.rain)*k;
  env.snow+=(w.snow-env.snow)*k;
  env.fogN+=(w.fogN-env.fogN)*k;
  env.fogF+=(w.fogF-env.fogF)*k;
  env.sunMul+=(w.sunMul-env.sunMul)*k;
  env.grey+=(w.grey-env.grey)*k;

  var kf=sampleKF(env.hour);
  var sunA=((env.hour-6)/12)*Math.PI;
  var elev=Math.sin(sunA);
  var dayF=Math.max(0,Math.min(1,elev*1.7));
  var nightF=Math.max(0,1-dayF*1.3);

  var top=kf.top.clone().lerp(greyDay,env.grey*0.7);
  var bot=kf.bottom.clone().lerp(greyDay,env.grey*0.55);
  if(env.dark>0){
    top.lerp(new THREE.Color(0x3d4653),env.dark*0.5);
    bot.lerp(new THREE.Color(0x5b6470),env.dark*0.45);
  }
  skyUni.topColor.value.copy(top);
  skyUni.bottomColor.value.copy(bot);
  skyUni.hazeColor.value.copy(bot).lerp(WHITE,0.18);
  skyUni.haze.value=kf.haze*(1+env.grey*0.5);

  var R=760;
  var sx=Math.cos(sunA)*R,sy=elev*R,sz=-R*0.34;
  sunSpr.position.set(sx,Math.max(sy,-60),sz);
  sunSpr.material.opacity=Math.max(0,Math.min(1,elev*2.6))*(1-env.grey*0.95)*(1-env.dark*0.7);
  moonSpr.position.set(-sx,Math.max(-sy,-60)*0.9+50,-sz*0.8);
  moonSpr.material.opacity=nightF*0.95*(1-env.grey*0.75);

  var focus=(mode==="drive")?car.position:(mode==="walk"||mode==="bike"||mode==="ebike"||mode==="boat")?me.pos:drone.target;
  sun.position.set(focus.x+sx*0.34,Math.max(sy,40)*0.42+70,focus.z+sz*0.34);
  sun.target.position.copy(focus);
  sun.color.copy(kf.sunC);
  sun.intensity=kf.sunI*env.sunMul;
  sun.castShadow=sun.intensity>0.2;
  moon.position.set(-sx*0.4,Math.max(-sy,70)*0.45+90,-sz*0.4);
  moon.target.position.copy(focus);
  moon.intensity=nightF*0.3*(1-env.grey*0.6);
  hemi.intensity=kf.hemiI*(1-env.grey*0.3)+0.1;
  amb.intensity=0.2+nightF*0.14;

  starMat.opacity=nightF*(1-env.grey*0.85)*(1-env.dark*0.45)*0.95;

  scene.fog.color.copy(kf.fogC.clone().lerp(greyDay,env.grey*0.5));
  scene.fog.near=env.fogN;
  scene.fog.far=env.fogF;

  var lit=nightF*1.35+Math.max(0,env.grey-0.55)*0.35;
  CITY.mats.lit.forEach(function(m){m.emissiveIntensity=lit;});
  CITY.mats.lamp.forEach(function(m){m.emissiveIntensity=nightF*1.7;});
  var wet=env.rain;
  CITY.mats.wet.forEach(function(m){
    m.roughness=0.88-0.52*wet;
    m.metalness=0.03+0.3*wet;
  });
  var sn=env.snow;
  CITY.mats.snow.forEach(function(o){
    o.m.color.copy(o.base).lerp(WHITE,sn*0.85);
  });
  CITY._snowVeil[0].material.opacity=sn*0.82;
  CITY._snowVeil[1].material.opacity=sn*0.66;

  var needLight=nightF>0.35||env.rain>0.4||env.snow>0.4||env.grey>0.6;
  var li=needLight?2.6:0;
  headL.intensity+=(li-headL.intensity)*k;
  headR.intensity=headL.intensity;

  clouds.forEach(function(c){
    var op=Math.max(0,Math.min(1,(env.cloud-c.userData.thresh)*3));
    c.material.opacity=op*0.9;
    c.material.color.setScalar(1-env.dark*0.5);
    c.position.x+=c.userData.drift*dt;
    if(c.position.x>700)c.position.x=-700;
  });

  if(env.rain>0.02){
    rain.visible=true;
    rainMat.opacity=env.rain*0.5;
    var arr=rainGeo.attributes.position.array;
    var cx=camera.position.x,cz=camera.position.z;
    for(var i2=0;i2<RAIN_N;i2++){
      var i6=i2*6;
      var fall=rainV[i2]*dt;
      arr[i6+1]-=fall;arr[i6+4]-=fall;
      if(arr[i6+1]<0){
        arr[i6]=cx+(Math.random()-0.5)*300;arr[i6+2]=cz+(Math.random()-0.5)*300;
        arr[i6+1]=90+Math.random()*24;
        arr[i6+3]=arr[i6];arr[i6+4]=arr[i6+1]-2.6;arr[i6+5]=arr[i6+2];
      }
      arr[i6]+=(cx-arr[i6])*0.0008;arr[i6+3]+=(cx-arr[i6+3])*0.0008;
    }
    rainGeo.attributes.position.needsUpdate=true;
  }else{rain.visible=false;}

  if(env.snow>0.02){
    snow.visible=true;
    snowMat.opacity=env.snow*0.95;
    var sa=snowGeo.attributes.position.array;
    var cx2=camera.position.x,cz2=camera.position.z;
    for(var j=0;j<SNOW_N;j++){
      var j3=j*3;
      sa[j3+1]-=dt*(3.2+snowPhase[j]*0.1);
      sa[j3]+=Math.sin(snowPhase[j]+env.hour*5)*dt*1.8;
      snowPhase[j]+=dt;
      if(sa[j3+1]<0.2){
        sa[j3]=cx2+(Math.random()-0.5)*300;
        sa[j3+2]=cz2+(Math.random()-0.5)*300;
        sa[j3+1]=70+Math.random()*30;
      }
    }
    snowGeo.attributes.position.needsUpdate=true;
  }else{snow.visible=false;}

  if(mode==="drive"||mode==="bike"||mode==="ebike"){
    postUni.focus.value=24;
    postUni.range.value=90;
    postUni.maxBlur.value=1.1;
  }else if(mode==="walk"){
    postUni.focus.value=12;
    postUni.range.value=60;
    postUni.maxBlur.value=1.4;
  }else if(mode==="boat"){
    postUni.focus.value=30;
    postUni.range.value=110;
    postUni.maxBlur.value=1.3;
  }else if(mode==="cable"){
    postUni.focus.value=60;
    postUni.range.value=120;
    postUni.maxBlur.value=1.6;
  }else{
    postUni.focus.value=drone.radius*1.02;
    postUni.range.value=drone.radius*0.75;
    postUni.maxBlur.value=2.6;
  }
}

/* ============ 云层 ============ */
function cloudTex(){
  var c=document.createElement("canvas");c.width=256;c.height=128;
  var g=c.getContext("2d");
  for(var i=0;i<26;i++){
    var x=30+Math.random()*196,y=38+Math.random()*54,r=14+Math.random()*30;
    var gr=g.createRadialGradient(x,y,2,x,y,r);
    gr.addColorStop(0,"rgba(255,255,255,0.9)");gr.addColorStop(1,"rgba(255,255,255,0)");
    g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  }
  var t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
var cloudTexture=cloudTex();
var clouds=[];
for(var ci=0;ci<34;ci++){
  var spr=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTexture,transparent:true,opacity:0,depthWrite:false,fog:false}));
  var s=70+Math.random()*120;
  spr.scale.set(s,s*0.4,1);
  spr.position.set((Math.random()-0.5)*1400,120+Math.random()*150,(Math.random()-0.5)*1400);
  spr.userData={thresh:Math.random()*0.9,drift:2+Math.random()*4};
  scene.add(spr);clouds.push(spr);
}

/* ============ 雨 / 雪 ============ */
var RAIN_N=1300;
var rainGeo=new THREE.BufferGeometry();
var rainPos=new Float32Array(RAIN_N*6);
var rainV=new Float32Array(RAIN_N);
for(var ri=0;ri<RAIN_N;ri++){
  rainPos[ri*6]=(Math.random()-0.5)*300;rainPos[ri*6+1]=Math.random()*100;rainPos[ri*6+2]=(Math.random()-0.5)*300;
  rainPos[ri*6+3]=rainPos[ri*6];rainPos[ri*6+4]=rainPos[ri*6+1]-2.6;rainPos[ri*6+5]=rainPos[ri*6+2];
  rainV[ri]=54+Math.random()*26;
}
rainGeo.setAttribute("position",new THREE.BufferAttribute(rainPos,3));
var rainMat=new THREE.LineBasicMaterial({color:0xa8c0d8,transparent:true,opacity:0});
var rain=new THREE.LineSegments(rainGeo,rainMat);
rain.visible=false;rain.frustumCulled=false;scene.add(rain);

var SNOW_N=1100;
var snowGeo=new THREE.BufferGeometry();
var snowPos=new Float32Array(SNOW_N*3);
var snowPhase=new Float32Array(SNOW_N);
for(var si=0;si<SNOW_N;si++){
  snowPos[si*3]=(Math.random()-0.5)*300;snowPos[si*3+1]=Math.random()*90;snowPos[si*3+2]=(Math.random()-0.5)*300;
  snowPhase[si]=Math.random()*6.28;
}
snowGeo.setAttribute("position",new THREE.BufferAttribute(snowPos,3));
var snowMat=new THREE.PointsMaterial({color:0xffffff,size:0.34,transparent:true,opacity:0,depthWrite:false});
var snow=new THREE.Points(snowGeo,snowMat);
snow.visible=false;snow.frustumCulled=false;scene.add(snow);

/* ============ 主循环 ============ */
var clock=new THREE.Clock();
function loop(){
  requestAnimationFrame(loop);
  var dt=Math.min(0.05,clock.getDelta());
  updateCar(dt);
  if(mode==="walk"||mode==="bike"||mode==="ebike"||mode==="boat")updateMe(dt);
  updateEnv(dt);
  updateCamera(dt);
  if(window.GTA)window.GTA.tick(dt,{
    mode:mode,mePos:me.pos,meHeading:me.heading,
    carPos:car.position,carHeading:drive.heading,droneTgt:drone.target,hour:env.hour});
  CITY.update(dt,{env:env,nightF:Math.max(0,1-Math.max(0,Math.min(1,Math.sin(((env.hour-6)/12)*Math.PI)*1.7))*1.3),hour:env.hour,mode:mode});
  postUni.time.value+=dt;
  renderer.setRenderTarget(rt);
  renderer.render(scene,camera);
  renderer.setRenderTarget(null);
  renderer.render(postScene,postCam);
}

window.addEventListener("resize",function(){
  var w=window.innerWidth,h=window.innerHeight;
  camera.aspect=w/h;camera.updateProjectionMatrix();
  renderer.setSize(w,h);
  resizeTargets();
});

/* 启动 */
resizeTargets();
$("hud-time").textContent=fmtTime(env.hour);
setTips();
window.__NJ3D={env:env,renderer:renderer,scene:scene,camera:camera,city:CITY,post:postUni,drone:drone,me:me,mode:function(){return mode;},
  setDof:function(v){dofOn=v;postUni.dofOn.value=v?1:0;},
  setPov:togglePov,
  switchMode:function(m2){switchMode(m2);},
  takePhoto:takePhoto,
  photos:window.__NJ3D&&window.__NJ3D.photos||[],
  teleport:function(x,z,h){
    car.position.set(x,0.06,z);drive.heading=h;car.rotation.y=h;
    me.pos.set(x,0,z);me.heading=h;
  }};
loop();
setTimeout(function(){$("loading").classList.add("off");},500);
})();
