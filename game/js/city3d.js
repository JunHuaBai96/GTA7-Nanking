/* ============ 新街口 · 现代都市十字路口 ============
   以新街口商业区为原型：路口核心 + 密集商场裙楼/写字楼/塔楼
   全部主体建筑落地（裙楼与地面连接），高密度商业街区氛围
   全部纹理用 Canvas 现场生成，零外部素材 */
(function(){
"use strict";

var MAXA=4;
var R=mulberry32(19870415);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function rr(a,b){return a+R()*(b-a);}
function ri(a,b){return Math.floor(rr(a,b+1));}
function pick(a){return a[Math.floor(R()*a.length)];}
function cv(w,h){var c=document.createElement("canvas");c.width=w;c.height=h;return c;}
function mkTex(c,rx,ry){
  var t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(rx||1,ry||1);
  t.anisotropy=MAXA;
  t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
function noiseOver(g,w,h,count,alpha,cols){
  for(var i=0;i<count;i++){
    g.globalAlpha=rr(alpha*0.5,alpha);
    g.fillStyle=pick(cols);
    g.fillRect(rr(0,w),rr(0,h),rr(0.7,2.4),rr(0.7,2.4));
  }
  g.globalAlpha=1;
}

/* ================= 程序化纹理 ================= */

/* 沥青路面：骨料颗粒 + 补丁 + 细裂纹 + 车道磨损 */
function texAsphalt(){
  var S=512,c=cv(S,S),g=c.getContext("2d");
  g.fillStyle="#33363c";g.fillRect(0,0,S,S);
  for(var i=0;i<34;i++){
    g.globalAlpha=rr(0.04,0.1);
    g.fillStyle=R()<0.5?"#3d4149":"#292c31";
    g.beginPath();g.ellipse(rr(0,S),rr(0,S),rr(40,150),rr(25,90),rr(0,3.14),0,7);g.fill();
  }
  g.globalAlpha=1;
  noiseOver(g,S,S,16000,0.5,["#5c626c","#202329","#43474f","#2a2d33"]);
  g.strokeStyle="rgba(24,26,30,.34)";g.lineWidth=1;
  for(var k=0;k<16;k++){
    var x=rr(0,S),y=rr(0,S);
    g.beginPath();g.moveTo(x,y);
    for(var s=0;s<7;s++){x+=rr(-34,34);y+=rr(8,44);g.lineTo(x,y);}
    g.stroke();
  }
  // 车轮磨亮的两道带
  var lg=g.createLinearGradient(0,0,S,0);
  lg.addColorStop(0,"rgba(255,255,255,0)");lg.addColorStop(0.28,"rgba(190,196,205,.05)");
  lg.addColorStop(0.4,"rgba(190,196,205,.09)");lg.addColorStop(0.6,"rgba(190,196,205,.09)");
  lg.addColorStop(0.72,"rgba(190,196,205,.05)");lg.addColorStop(1,"rgba(255,255,255,0)");
  g.fillStyle=lg;g.fillRect(0,0,S,S);
  return c;
}

/* 花岗岩人行道铺装 */
function texPaving(){
  var S=256,c=cv(S,S),g=c.getContext("2d");
  g.fillStyle="#8f9498";g.fillRect(0,0,S,S);
  var t=32;
  for(var y=0;y<S;y+=t)for(var x=0;x<S;x+=t){
    var v=ri(-10,10);
    g.fillStyle="rgb("+(168+v)+","+(172+v)+","+(174+v)+")";
    g.fillRect(x+1,y+1,t-2,t-2);
    g.globalAlpha=rr(0.03,0.1);g.fillStyle=R()<0.5?"#ffffff":"#5d6266";
    g.fillRect(x+2,y+2,rr(4,t-6),rr(3,t-8));g.globalAlpha=1;
  }
  noiseOver(g,S,S,5000,0.28,["#b9bdc0","#7c8184","#a5aaad"]);
  return c;
}

/* 盲道（黄色提示砖） */
function texTactile(){
  var S=128,c=cv(S,S),g=c.getContext("2d");
  g.fillStyle="#c8a03c";g.fillRect(0,0,S,S);
  g.fillStyle="#b8902f";
  for(var y=10;y<S;y+=26)for(var x=10;x<S;x+=26){
    g.beginPath();g.arc(x,y,7,0,7);g.fill();
  }
  noiseOver(g,S,S,900,0.2,["#d8b45a","#a8842c"]);
  return c;
}

/* 玻璃幕墙 */
function texGlass(){
  var S=256,c=cv(S,S),g=c.getContext("2d");
  var lg=g.createLinearGradient(0,0,S,S);
  lg.addColorStop(0,"#8fa9bd");lg.addColorStop(0.45,"#5c7c96");lg.addColorStop(0.7,"#7e97ad");lg.addColorStop(1,"#4a6478");
  g.fillStyle=lg;g.fillRect(0,0,S,S);
  g.strokeStyle="rgba(30,42,54,.7)";g.lineWidth=2;
  for(var x=0;x<=S;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,S);g.stroke();}
  for(var y=0;y<=S;y+=48){g.beginPath();g.moveTo(0,y);g.lineTo(S,y);g.stroke();}
  for(var i=0;i<5;i++){
    g.globalAlpha=rr(0.05,0.16);g.fillStyle="#e8f2fa";
    g.save();g.translate(rr(0,S),0);g.rotate(0.25);
    g.fillRect(0,0,rr(6,26),S*1.6);g.restore();
  }
  g.globalAlpha=1;
  return c;
}

/* 法桐树皮：斑驳脱落感 */
function texBark(){
  var S=128,c=cv(S,S),g=c.getContext("2d");
  g.fillStyle="#6f6a5e";g.fillRect(0,0,S,S);
  for(var i=0;i<90;i++){
    g.fillStyle=pick(["#8f8a78","#a8a28c","#5a564c","#7d7565","#b6b0a0"]);
    g.globalAlpha=rr(0.4,0.9);
    g.beginPath();g.ellipse(rr(0,S),rr(0,S),rr(4,16),rr(6,20),rr(0,3),0,7);g.fill();
  }
  g.globalAlpha=1;noiseOver(g,S,S,1200,0.2,["#3f3c34","#c9c3ae"]);
  return c;
}

/* 接触阴影贴片（伪 AO） */
function texAO(){
  var S=128,c=cv(S,S),g=c.getContext("2d");
  var gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,"rgba(0,0,0,.55)");gr.addColorStop(0.55,"rgba(0,0,0,.28)");gr.addColorStop(1,"rgba(0,0,0,0)");
  g.fillStyle=gr;g.fillRect(0,0,S,S);
  var t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

/* 文字牌面 */
function texSign(o){
  var W=o.w||512,H=o.h||128,c=cv(W,H),g=c.getContext("2d");
  g.fillStyle=o.bg||"#18427a";g.fillRect(0,0,W,H);
  if(o.border){g.strokeStyle=o.border;g.lineWidth=Math.max(2,H*0.05);g.strokeRect(H*0.06,H*0.06,W-H*0.12,H-H*0.12);}
  g.textAlign="center";g.textBaseline="middle";
  if(o.t1){
    g.fillStyle=o.fg||"#ffffff";
    g.font="bold "+(o.s1||Math.round(H*0.44))+"px 'Microsoft YaHei','PingFang SC',sans-serif";
    g.fillText(o.t1,W/2,o.t2?H*0.38:H*0.5);
  }
  if(o.t2){
    g.fillStyle=o.fg2||"#ffffff";
    g.font=(o.s2||Math.round(H*0.2))+"px 'Microsoft YaHei','PingFang SC',sans-serif";
    g.fillText(o.t2,W/2,o.t3?H*0.74:H*0.7);
  }
  var t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=MAXA;
  return t;
}

/* LED 广告大屏（商场转角） */
function texLED(seed){
  var W=256,H=144,c=cv(W,H),g=c.getContext("2d");
  var pal=[
    ["#101b3a","#2a5bd7","#7fd0ff"],
    ["#3a0f2e","#d73a7a","#ffb1d0"],
    ["#0e2c26","#1fa97a","#a8f0c8"],
    ["#2c1204","#e07a2a","#ffd39a"]
  ][seed%4];
  var lg=g.createLinearGradient(0,0,W,H);
  lg.addColorStop(0,pal[0]);lg.addColorStop(0.55,pal[1]);lg.addColorStop(1,pal[2]);
  g.fillStyle=lg;g.fillRect(0,0,W,H);
  for(var i=0;i<3;i++){
    g.globalAlpha=0.18;g.fillStyle="#ffffff";
    g.save();g.translate(rr(0,W),0);g.rotate(0.5);
    g.fillRect(0,-H,rr(8,22),H*3);g.restore();
  }
  g.globalAlpha=1;
  var texts=[
    ["璀璨新街口","XINJIEKOU CBD"],
    ["城市之光","CITY LIGHTS"],
    ["金陵新姿","NANJING STYLE"],
    ["乐享生活","LIFESTYLE MALL"]
  ][seed%4];
  g.textAlign="center";g.textBaseline="middle";
  g.fillStyle="#ffffff";
  g.font="bold 42px 'Microsoft YaHei','PingFang SC',sans-serif";
  g.fillText(texts[0],W/2,H*0.4);
  g.font="18px sans-serif";g.fillStyle="rgba(255,255,255,.85)";
  g.fillText(texts[1],W/2,H*0.72);
  noiseOver(g,W,H,240,0.12,["#ffffff","#000000"]);
  var t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=MAXA;
  return t;
}

/* ================= 主构建 ================= */
var CITY={};

CITY.create=function(scene,renderer){
  MAXA=Math.min(8,renderer.capabilities.getMaxAnisotropy());

  var litMats=[],lampMats=[],signMats=[],snowables=[],wetMats=[];
  var COLLIDERS=[]; // 碰撞体（圆）
  var BOXES=[];    // 碰撞体（矩形 AABB，精确防穿楼）
  var PEND=[];
  var group=new THREE.Group();scene.add(group);

  /* ---------- 公共材质 ---------- */
  var texA=texAsphalt(),texP=texPaving(),texT=texTactile(),texG=texGlass();
  var texB=texBark(),texAOMap=texAO();

  function std(o){return new THREE.MeshStandardMaterial(o);}
  function add(m,parent){ (parent||group).add(m); return m; }

  /* 地面：城区混凝土大平面 */
  var groundMat=new THREE.MeshStandardMaterial({map:mkTex(texA,42,42),color:0x9aa0a6,roughness:0.94,metalness:0.02});
  var ground=new THREE.Mesh(new THREE.CircleGeometry(460,72),groundMat);
  ground.rotation.x=-Math.PI/2;ground.position.y=0.05;ground.receiveShadow=true;add(ground);
  snowables.push({m:groundMat,c:new THREE.Color(0x8f9a86)});
  wetMats.push(groundMat);

  /* 城郊草皮垫层（CBD 之外过渡为郊野绿地） */
  var grassMat=new THREE.MeshStandardMaterial({color:0x8aa06e,roughness:1});
  snowables.push({m:grassMat,c:new THREE.Color(0x8aa06e)});
  var grassRing=new THREE.Mesh(new THREE.CircleGeometry(950,72),grassMat);
  grassRing.rotation.x=-Math.PI/2;grassRing.position.y=0.04;add(grassRing);

  var snowVeilGrass=new THREE.Mesh(new THREE.CircleGeometry(950,48),
    new THREE.MeshBasicMaterial({color:0xf2f6f8,transparent:true,opacity:0,depthWrite:false}));
  var snowVeilCity=new THREE.Mesh(new THREE.PlaneGeometry(540,480),
    new THREE.MeshBasicMaterial({color:0xf4f8fa,transparent:true,opacity:0,depthWrite:false}));
  CITY._snowVeil=[snowVeilGrass,snowVeilCity];
  snowVeilGrass.rotation.x=-Math.PI/2;snowVeilGrass.position.set(0,0.055,0);add(snowVeilGrass);
  snowVeilCity.rotation.x=-Math.PI/2;snowVeilCity.position.set(10,0.105,55);add(snowVeilCity);

  /* ---------- 道路路网 ----------
     主轴：中山东路 z=12（东西）；中山路 x=44（南北），交点即新街口
     次干道：淮海路 z=95 / 石鼓路 z=-62 / 户部街 z=170
     支路：太平南路 x=-90 / 洪武北路 x=150 / 王府大街 x=-170 */
  var ROAD={z:12,half:12,x0:-250,x1:340};
  function roadPlane(w,d,x,z,rot){
    var m=new THREE.MeshStandardMaterial({map:mkTex(texA,w/18,d/18),color:0xcfd3d8,roughness:0.88,metalness:0.03});
    var p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);
    p.rotation.x=-Math.PI/2;p.rotation.z=rot||0;p.position.set(x,0.06,z);
    p.receiveShadow=true;add(p);wetMats.push(m);snowables.push({m:m,c:new THREE.Color(0x9fa5ab)});
    return m;
  }
  roadPlane(ROAD.x1-ROAD.x0,ROAD.half*2,(ROAD.x0+ROAD.x1)/2,ROAD.z,0); // 中山东路
  roadPlane(500,22,44,0,Math.PI/2);            // 中山路（南北干道，穿新街口）
  roadPlane(430,16,35,95,0);                   // 淮海路
  roadPlane(430,16,35,-62,0);                  // 石鼓路
  roadPlane(430,14,35,170,0);                  // 户部街
  roadPlane(340,16,-90,40,Math.PI/2);          // 太平南路
  roadPlane(340,16,150,40,Math.PI/2);          // 洪武北路
  roadPlane(260,14,-170,10,Math.PI/2);         // 王府大街

  /* 车道线 */
  var lineMatW=new THREE.MeshStandardMaterial({color:0xe8e6dc,roughness:0.7});
  var lineMatY=new THREE.MeshStandardMaterial({color:0xd8b03a,roughness:0.7});
  function dashLine(len,wid,x,z,rot,gap,dash,mat,y){
    var geo=new THREE.PlaneGeometry(dash,wid);
    var n=Math.ceil(len/(gap+dash));
    var im=new THREE.InstancedMesh(geo,mat,n);
    var q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,rot));
    var m4=new THREE.Matrix4(),one=new THREE.Vector3(1,1,1);
    var i=0;
    for(var d=-len/2;d<len/2&&i<n;d+=gap+dash,i++){
      m4.compose(new THREE.Vector3(x+Math.cos(rot)*d,y||0.085,z-Math.sin(rot)*d),q,one);
      im.setMatrixAt(i,m4);
    }
    im.count=i;im.instanceMatrix.needsUpdate=true;add(im);
  }
  // 中山东路双黄线（新街口环岛区断开）
  [[11.55],[12.45]].forEach(function(p){
    [[-250,26],[62,205]].forEach(function(seg){
      var m=new THREE.Mesh(new THREE.PlaneGeometry(seg[1]-seg[0],0.18),lineMatY);
      m.rotation.x=-Math.PI/2;m.position.set((seg[0]+seg[1])/2,0.085,p[0]);add(m);
    });
  });
  // 中山路双黄线（环岛区断开）
  [[43.55],[44.45]].forEach(function(p){
    [[-250,-6],[30,250]].forEach(function(seg){
      var m=new THREE.Mesh(new THREE.PlaneGeometry(0.18,seg[1]-seg[0]),lineMatY);
      m.rotation.x=-Math.PI/2;m.position.set(p[0],0.085,(seg[0]+seg[1])/2);add(m);
    });
  });
  // 白色车道虚线
  dashLine(ROAD.x1-ROAD.x0,0.22,(ROAD.x0+ROAD.x1)/2,6,0,5,4,lineMatW);
  dashLine(ROAD.x1-ROAD.x0,0.22,(ROAD.x0+ROAD.x1)/2,18,0,5,4,lineMatW);
  dashLine(480,0.22,38.5,0,Math.PI/2,5,4,lineMatW);  // 中山路
  dashLine(480,0.22,49.5,0,Math.PI/2,5,4,lineMatW);
  dashLine(430,0.22,35,91.5,0,5,4,lineMatW);         // 淮海路
  dashLine(430,0.22,35,98.5,0,5,4,lineMatW);
  dashLine(430,0.22,35,-57.5,0,5,4,lineMatW);        // 石鼓路
  dashLine(430,0.22,35,-66.5,0,5,4,lineMatW);
  dashLine(430,0.22,35,167,0,5,4,lineMatW);          // 户部街
  dashLine(430,0.22,35,173,0,5,4,lineMatW);
  dashLine(320,0.22,-85.5,0,Math.PI/2,5,4,lineMatW); // 太平南路
  dashLine(320,0.22,-94.5,0,Math.PI/2,5,4,lineMatW);
  dashLine(320,0.22,144.5,0,Math.PI/2,5,4,lineMatW); // 洪武北路
  dashLine(320,0.22,155.5,0,Math.PI/2,5,4,lineMatW);
  dashLine(240,0.22,-166,10,Math.PI/2,5,4,lineMatW); // 王府大街
  dashLine(240,0.22,-174,10,Math.PI/2,5,4,lineMatW);
  // 中山东路边线
  [0.9,23.1].forEach(function(zz){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(ROAD.x1-ROAD.x0,0.16),lineMatW);
    m.rotation.x=-Math.PI/2;m.position.set((ROAD.x0+ROAD.x1)/2,0.085,zz);add(m);
  });
  // 中山路边线
  [[34.9,0.18,500],[53.1,0.18,500]].forEach(function(p){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(p[1],p[2]),lineMatW);
    m.rotation.x=-Math.PI/2;m.position.set(p[0],0.085,0);add(m);
  });

  /* 斑马线 + 停止线（新街口路口四向，InstancedMesh 合批） */
  (function(){
    var m4=new THREE.Matrix4(),one=new THREE.Vector3(1,1,1);
    var qz=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0));
    // 横穿中山东路（环岛西 x≈20 / 东 x≈70）
    var zGeo=new THREE.PlaneGeometry(0.7,21);
    var spans=[[16.5,23.5],[66.5,73.5]];
    var n1=0;spans.forEach(function(s){n1+=Math.ceil((s[1]-s[0])/1.5)+1;});
    var im1=new THREE.InstancedMesh(zGeo,lineMatW,n1);
    var i=0;
    spans.forEach(function(span){
      for(var x=span[0];x<=span[1]&&i<n1;x+=1.5){
        m4.compose(new THREE.Vector3(x,0.088,12),qz,one);
        im1.setMatrixAt(i++,m4);
      }
    });
    im1.count=i;im1.instanceMatrix.needsUpdate=true;add(im1);
    // 横穿中山路（环岛北 / 南）
    var zGeo2=new THREE.PlaneGeometry(20,0.7);
    var spans2=[[-13.5,-9.5],[33.5,37.5]];
    var n2=0;spans2.forEach(function(s){n2+=Math.ceil((s[1]-s[0])/1.5)+1;});
    var im2=new THREE.InstancedMesh(zGeo2,lineMatW,n2);
    i=0;
    spans2.forEach(function(span){
      for(var z=span[0];z<=span[1]&&i<n2;z+=1.5){
        m4.compose(new THREE.Vector3(44,0.088,z),qz,one);
        im2.setMatrixAt(i++,m4);
      }
    });
    im2.count=i;im2.instanceMatrix.needsUpdate=true;add(im2);
    // 停止线
    var sGeo=new THREE.PlaneGeometry(0.5,11);
    [[14,17.9],[74,6.1]].forEach(function(p){
      var sl=new THREE.Mesh(sGeo,lineMatW);
      sl.rotation.x=-Math.PI/2;sl.position.set(p[0],0.088,p[1]);add(sl);
    });
    var sGeo2=new THREE.PlaneGeometry(11,0.5);
    [[44,-16],[44,40]].forEach(function(p){
      var sl2=new THREE.Mesh(sGeo2,lineMatW);
      sl2.rotation.x=-Math.PI/2;sl2.position.set(p[0],0.088,p[1]);add(sl2);
    });
  })();

  /* ---------- 人行道 / 路缘石 / 盲道 ---------- */
  function sidewalk(x0,x1,z0,z1){
    var w=x1-x0,d=z1-z0;
    var m=new THREE.MeshStandardMaterial({map:mkTex(texP,w/6,d/6),color:0xffffff,roughness:0.9,metalness:0.02});
    var p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);
    p.rotation.x=-Math.PI/2;p.position.set((x0+x1)/2,0.17,(z0+z1)/2);
    p.receiveShadow=true;add(p);
    snowables.push({m:m,c:new THREE.Color(0xb9bec1)});wetMats.push(m);
  }
  sidewalk(-250,340,24,32);            // 中山东路北侧
  sidewalk(-250,340,-8,0);             // 中山东路南侧
  sidewalk(57,61,-130,205);            // 中山路东侧
  sidewalk(27,31,-130,205);            // 中山路西侧
  sidewalk(-180,250,103,107);          // 淮海路两侧
  sidewalk(-180,250,83,87);
  sidewalk(-180,250,-54,-50);          // 石鼓路两侧
  sidewalk(-180,250,-74,-70);
  sidewalk(-102,-98,-130,205);         // 太平南路两侧
  sidewalk(-86,-82,-130,205);
  sidewalk(142,146,-130,205);          // 洪武北路两侧
  sidewalk(154,158,-130,205);
  sidewalk(-181,-177,-120,140);        // 王府大街两侧
  sidewalk(-163,-159,-120,140);
  /* 路缘石 */
  var curbMat=new THREE.MeshStandardMaterial({map:mkTex(texP,28,1),color:0xd8dcde,roughness:0.85});
  function curb(x0,x1,z){
    var m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,0.17,0.5),curbMat);
    m.position.set((x0+x1)/2,0.085,z);m.castShadow=false;m.receiveShadow=true;add(m);
  }
  curb(-250,340,24);curb(-250,340,0);curb(33,55,0);curb(33,55,24);
  /* 盲道 */
  [[27.6],[-3.6]].forEach(function(p){
    var m=new THREE.MeshStandardMaterial({map:mkTex(texT,140,0.6),color:0xffffff,roughness:0.85});
    var b=new THREE.Mesh(new THREE.PlaneGeometry(590,0.62),m);
    b.rotation.x=-Math.PI/2;b.position.set(45,0.181,p[0]);add(b);
  });

  /* 中央绿化隔离带（中山东路） */
  (function(){
    var hedgeMat=new THREE.MeshStandardMaterial({color:0x2f5134,roughness:1});
    [[-240,-104],[-76,-24],[58,205]].forEach(function(seg){
      var w=seg[1]-seg[0];
      var base=new THREE.Mesh(new THREE.BoxGeometry(w,0.3,1.6),new THREE.MeshStandardMaterial({color:0x9a9e9c,roughness:0.9}));
      base.position.set((seg[0]+seg[1])/2,0.15,12);base.receiveShadow=true;add(base);
      var hg=new THREE.Mesh(new THREE.BoxGeometry(w-1,0.85,1.3),hedgeMat);
      hg.position.set((seg[0]+seg[1])/2,0.72,12);hg.castShadow=true;add(hg);
    });
    var railMat=new THREE.MeshStandardMaterial({color:0xdfe3e2,roughness:0.5,metalness:0.3});
    for(var x=-238;x<-22;x+=4){
      if(x>-104&&x<-76)continue;
      var p=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.75,0.1),railMat);
      p.position.set(x,1.5,12);add(p);
    }
    for(var x2=22;x2<205;x2+=4){
      if(x2>23&&x2<59)continue;
      var p2=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.75,0.1),railMat);
      p2.position.set(x2,1.5,12);add(p2);
    }
  })();

  /* ================= 新街口环岛 + 孙中山铜像 ================= */
  (function(){
    var plazaMat=new THREE.MeshStandardMaterial({map:mkTex(texP,10,10),color:0xd4d4cc,roughness:0.9});
    var plaza=new THREE.Mesh(new THREE.CircleGeometry(18,48),plazaMat);
    plaza.rotation.x=-Math.PI/2;plaza.position.set(44,0.075,12);plaza.receiveShadow=true;add(plaza);
    var ringGeo=new THREE.TorusGeometry(12.5,0.12,6,64);
    var ring=new THREE.Mesh(ringGeo,lineMatW);
    ring.rotation.x=-Math.PI/2;ring.position.set(44,0.09,12);add(ring);
    var islBase=new THREE.Mesh(new THREE.CylinderGeometry(6.6,7.2,0.9,32),
      new THREE.MeshStandardMaterial({color:0xb8b6ac,roughness:0.9}));
    islBase.position.set(44,0.45,12);islBase.castShadow=true;islBase.receiveShadow=true;add(islBase);
    var islGrass=new THREE.Mesh(new THREE.CylinderGeometry(6.1,6.6,0.3,32),
      new THREE.MeshStandardMaterial({color:0x3f6b3a,roughness:1}));
    islGrass.position.set(44,1.0,12);add(islGrass);
    var flowerMat=new THREE.MeshStandardMaterial({color:0xc04a68,roughness:0.95,flatShading:true});
    for(var fi=0;fi<10;fi++){
      var ang=fi/10*Math.PI*2;
      var f=new THREE.Mesh(new THREE.IcosahedronGeometry(0.4,0),flowerMat);
      f.position.set(44+Math.cos(ang)*4.6,1.3,12+Math.sin(ang)*4.6);add(f);
    }
    // 孙中山铜像：石基座 + 青铜立像
    var stoneM=new THREE.MeshStandardMaterial({map:mkTex(texP,3,3),color:0xcfcabc,roughness:0.9});
    var step1=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.5,4.6),stoneM);step1.position.set(44,1.35,12);add(step1);
    var step2=new THREE.Mesh(new THREE.BoxGeometry(3.8,0.5,3.8),stoneM);step2.position.set(44,1.85,12);add(step2);
    var ped=new THREE.Mesh(new THREE.BoxGeometry(3.0,3.4,3.0),stoneM);
    ped.position.set(44,3.8,12);ped.castShadow=true;add(ped);
    // 底座正面竖排鎏金刻字「孙中山先生」
    (function(){
      var c=cv(160,560),g2=c.getContext("2d");
      g2.fillStyle="#cfcabc";g2.fillRect(0,0,160,560);
      g2.textAlign="center";g2.textBaseline="middle";
      g2.fillStyle="#8a6d28";
      g2.font="bold 92px 'Microsoft YaHei','PingFang SC','KaiTi',serif";
      var chars="孙中山先生";
      for(var ci=0;ci<chars.length;ci++){
        g2.fillText(chars[ci],80,80+ci*102);
      }
      var t=new THREE.CanvasTexture(c);
      t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=MAXA;
      var plate=new THREE.Mesh(new THREE.PlaneGeometry(1.35,4.0),
        new THREE.MeshStandardMaterial({map:t,roughness:0.85}));
      plate.position.set(44,3.8,13.53);add(plate);
    })();
    var bronze=new THREE.MeshStandardMaterial({color:0x4a4136,metalness:0.72,roughness:0.45});
    var fig=new THREE.Group();
    // 鞋
    [[-0.13],[0.13]].forEach(function(sx){
      var shoe=new THREE.Mesh(new THREE.BoxGeometry(0.17,0.1,0.34),bronze);
      shoe.position.set(sx[0],0.05,0.05);fig.add(shoe);
    });
    // 腿（大衣下摆之下脚踝部分）
    [[-0.12],[0.12]].forEach(function(sx){
      var lg=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.34,0.2),bronze);
      lg.position.set(sx[0],0.3,0);fig.add(lg);
    });
    // 长大衣下摆（过膝，微展）
    var skirt=new THREE.Mesh(new THREE.CylinderGeometry(0.37,0.47,1.0,10),bronze);
    skirt.position.y=1.02;skirt.castShadow=true;fig.add(skirt);
    // 大衣上身（挺直）
    var torso=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.38,0.85,10),bronze);
    torso.position.y=1.92;torso.castShadow=true;fig.add(torso);
    // 肩与衣领
    var shoul=new THREE.Mesh(new THREE.BoxGeometry(0.66,0.16,0.3),bronze);
    shoul.position.y=2.36;shoul.castShadow=true;fig.add(shoul);
    var collar=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.17,0.13,8),bronze);
    collar.position.y=2.45;fig.add(collar);
    // 头 + 浓发 + 八字胡
    var head=new THREE.Mesh(new THREE.SphereGeometry(0.185,14,12),bronze);
    head.position.y=2.63;head.scale.set(0.92,1.08,0.98);head.castShadow=true;fig.add(head);
    var hair=new THREE.Mesh(new THREE.SphereGeometry(0.19,12,10,0,6.3,0,1.4),bronze);
    hair.position.y=2.67;hair.scale.set(0.95,1,1);fig.add(hair);
    var mus=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.035,0.03),bronze);
    mus.position.set(0,2.55,0.16);fig.add(mus);
    // 左臂自然下垂贴身
    var armL=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.8,0.14),bronze);
    armL.position.set(-0.37,1.96,0.02);armL.rotation.z=0.1;armL.castShadow=true;fig.add(armL);
    // 右臂屈肘，手扶杖顶
    var armRU=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.45,0.14),bronze);
    armRU.position.set(0.36,2.1,0.06);armRU.rotation.z=-0.25;armRU.castShadow=true;fig.add(armRU);
    var armRF=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.42,0.12),bronze);
    armRF.position.set(0.47,1.72,0.16);armRF.rotation.x=-0.55;fig.add(armRF);
    var handR=new THREE.Mesh(new THREE.SphereGeometry(0.075,8,8),bronze);
    handR.position.set(0.5,1.52,0.26);fig.add(handR);
    // 手杖（右手拄地）
    var cane=new THREE.Mesh(new THREE.CylinderGeometry(0.032,0.05,1.62,8),bronze);
    cane.position.set(0.52,0.81,0.27);cane.rotation.x=0.05;cane.castShadow=true;fig.add(cane);
    // 大衣前中缝搭门
    var seam=new THREE.Mesh(new THREE.BoxGeometry(0.03,1.1,0.03),bronze);
    seam.position.set(0,1.9,0.35);fig.add(seam);
    fig.position.set(44,5.5,12);fig.rotation.y=Math.PI;add(fig);
    COLLIDERS.push({x:44,z:12,r:7.6});
  })();

  /* ---------- 接触阴影贴片（伪 AO，降低"漂浮感"） ---------- */
  var aoMat=new THREE.MeshBasicMaterial({map:texAOMap,transparent:true,depthWrite:false,opacity:0.55});
  function aoDecal(x,z,r){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),aoMat);
    m.rotation.x=-Math.PI/2;m.position.set(x,0.075,z);add(m);
  }

  /* ================= 建筑体系 ================= */
  var roofMatCon=new THREE.MeshStandardMaterial({color:0x5f666b,roughness:0.95});
  var roofMatCon2=new THREE.MeshStandardMaterial({color:0x6e726e,roughness:0.95});
  var parapetMat=new THREE.MeshStandardMaterial({color:0x9aa0a4,roughness:0.9});
  snowables.push({m:roofMatCon},{m:roofMatCon2},{m:parapetMat});

  /* 立面纹理：按开间/层数现生成（每栋独立） */
  function facadeCanvas(bays,floors,opt,seed){
    var W=Math.min(1024,Math.max(128,bays*72)),H=Math.min(1024,Math.max(128,floors*64));
    var c=cv(W,H),g=c.getContext("2d");
    var ce=cv(W,H),ge=ce.getContext("2d");
    ge.fillStyle="#000000";ge.fillRect(0,0,W,H);
    g.fillStyle=Array.isArray(opt.wall)?opt.wall[seed%opt.wall.length]:opt.wall;
    g.fillRect(0,0,W,H);
    for(var i=0;i<26;i++){
      g.globalAlpha=rr(0.02,0.07);g.fillStyle=R()<0.5?"#000000":"#ffffff";
      g.beginPath();g.ellipse(rr(0,W),rr(0,H),rr(20,90),rr(20,70),0,0,7);g.fill();
    }
    g.globalAlpha=1;
    var cw=W/bays,ch=H/floors;
    for(var f=0;f<floors;f++){
      var isGround=(f===floors-1)&&opt.shop;
      for(var b=0;b<bays;b++){
        var x=b*cw,y=f*ch;
        if(isGround){
          // 底层商铺：橱窗玻璃
          g.fillStyle="#1e272e";g.fillRect(x+cw*0.06,y+ch*0.28,cw*0.88,ch*0.68);
          var lg=g.createLinearGradient(x,y,x+cw,y+ch);
          lg.addColorStop(0,"#b8d4e2");lg.addColorStop(0.5,"#7fa2b8");lg.addColorStop(1,"#48688a");
          g.fillStyle=lg;g.fillRect(x+cw*0.08,y+ch*0.34,cw*0.84,ch*0.58);
          g.fillStyle="rgba(20,30,40,.5)";
          g.fillRect(x+cw*0.08,y+ch*0.62,cw*0.84,2);
          // 门头广告底板
          g.fillStyle=pick(["#8a2a22","#1e4a70","#20603e","#7a4a18"]);
          g.fillRect(x+cw*0.06,y+ch*0.08,cw*0.88,ch*0.2);
          g.fillStyle="rgba(255,255,255,.75)";
          g.font="bold "+Math.max(7,ch*0.12)+"px sans-serif";
          g.textAlign="center";
          g.fillText(pick(["金铺","服饰","餐饮","数码","美妆","影城"]),x+cw*0.5,y+ch*0.2);
          if(R()<0.8){
            ge.fillStyle="#ffcf90";ge.globalAlpha=0.85;
            ge.fillRect(x+cw*0.08,y+ch*0.34,cw*0.84,ch*0.58);ge.globalAlpha=1;
          }
          continue;
        }
        var ww,wh,wx,wy;
        if(opt.glass){
          // 玻璃幕墙开间：大玻璃 + 细深框
          ww=cw*0.8;wh=ch*0.72;wx=x+cw*0.1;wy=y+ch*0.14;
          g.fillStyle="rgba(16,24,30,.7)";g.fillRect(wx-2,wy-2,ww+4,wh+4);
          var gl=g.createLinearGradient(wx,wy,wx+ww,wy+wh);
          var tint=pick(["#5a7c94","#6b8ca4","#4e7086","#7d9ab0"]);
          gl.addColorStop(0,tint);gl.addColorStop(0.55,"#3e5870");gl.addColorStop(1,"#2a3e52");
          g.fillStyle=gl;g.fillRect(wx,wy,ww,wh);
          g.globalAlpha=0.3;g.fillStyle="#e4f1fb";
          g.beginPath();g.moveTo(wx,wy+wh);g.lineTo(wx+ww*0.45,wy);g.lineTo(wx+ww*0.68,wy);g.lineTo(wx+ww*0.18,wy+wh);g.closePath();g.fill();
          g.globalAlpha=1;
          g.strokeStyle=opt.frame||"#2e3840";g.lineWidth=Math.max(1.6,cw*0.03);
          g.strokeRect(wx,wy,ww,wh);
        }else{
          // 普通窗
          ww=cw*0.52;wh=ch*0.5;wx=x+(cw-ww)/2;wy=y+ch*0.2;
          g.fillStyle="rgba(25,28,34,.5)";g.fillRect(wx-2,wy-2,ww+4,wh+4);
          var gl2=g.createLinearGradient(wx,wy,wx+ww,wy+wh);
          var tint2=pick(["#3d4c5a","#46586a","#37474f","#5a6b78"]);
          gl2.addColorStop(0,tint2);gl2.addColorStop(0.55,"#26313c");gl2.addColorStop(1,"#151c24");
          g.fillStyle=gl2;g.fillRect(wx,wy,ww,wh);
          g.globalAlpha=0.18;g.fillStyle="#cfe0ee";
          g.beginPath();g.moveTo(wx,wy+wh);g.lineTo(wx+ww*0.5,wy);g.lineTo(wx+ww*0.72,wy);g.lineTo(wx+ww*0.2,wy+wh);g.closePath();g.fill();
          g.globalAlpha=1;
          g.strokeStyle=opt.frame||"#e6e3da";g.lineWidth=Math.max(1.4,cw*0.026);
          g.strokeRect(wx,wy,ww,wh);
          g.beginPath();g.moveTo(wx+ww/2,wy);g.lineTo(wx+ww/2,wy+wh);g.stroke();
          g.fillStyle=opt.frame||"#e6e3da";g.fillRect(wx-3,wy+wh,ww+6,Math.max(2,ch*0.045));
          if(opt.ac&&R()<0.42){
            g.fillStyle="#c9ccc8";g.fillRect(wx+ww*0.52,wy+wh*0.55,ww*0.4,wh*0.32);
          }
          if(R()<0.3){
            g.fillStyle=pick(["#c9c0ae","#a8b3a0","#b89e94"]);
            g.globalAlpha=0.75;g.fillRect(wx+1,wy+1,ww*0.34,wh-2);g.globalAlpha=1;
          }
        }
        // 夜间亮灯
        if(R()<opt.litProb){
          ge.fillStyle=pick(["#ffcd80","#ffdca0","#ffbf6a","#e8f0ff"]);
          ge.globalAlpha=rr(0.55,1);
          ge.fillRect(wx,wy,ww,wh);ge.globalAlpha=1;
        }
      }
      if(opt.band&&f<floors-1){
        g.fillStyle="rgba(255,255,255,.13)";g.fillRect(0,y+ch-2,W,2);
      }
    }
    g.fillStyle="rgba(255,255,255,.1)";g.fillRect(0,0,W,3);
    for(var s=0;s<18;s++){
      g.globalAlpha=rr(0.03,0.08);g.fillStyle="#2a2f36";
      g.fillRect(rr(0,W),0,rr(2,7),rr(H*0.2,H*0.8));
    }
    g.globalAlpha=1;
    var t1=new THREE.CanvasTexture(c),t2=new THREE.CanvasTexture(ce);
    t1.colorSpace=t2.colorSpace=THREE.SRGBColorSpace;
    t1.anisotropy=t2.anisotropy=MAXA;
    return {map:t1,emi:t2};
  }

  var STYLES={
    resid:{wall:["#d6ccb6","#c9c2b2","#d9cfae","#c2b6a4","#c4c8c2"],frame:"#e8e5dc",ac:true,litProb:0.3,band:true},
    office:{wall:["#8d959c","#9aa4ae","#a2a89e"],frame:"#c8ccd0",ac:false,litProb:0.42,band:false},
    glass:{wall:["#9aa6b0","#a4aeba","#9ea8b2"],frame:"#2e3840",glass:true,ac:false,litProb:0.4,band:true},
    mall:{wall:["#d4cdbc","#ddd7cb","#ccd3d8"],frame:"#e8e5dc",glass:true,ac:false,litProb:0.5,band:true,shop:true}
  };

  function buildingMatSet(w,h,d,styleKey,seed){
    var st=STYLES[styleKey]||STYLES.resid;
    var baysW=Math.max(2,Math.round(w/3.6)),baysD=Math.max(2,Math.round(d/3.6));
    var floors=Math.max(2,Math.round(h/3.5));
    seed=seed===undefined?ri(0,96):seed;
    var s=facadeCanvas(baysD,floors,st,seed+31);
    var f=facadeCanvas(baysW,floors,st,seed);
    function mat(t){
      var m=new THREE.MeshStandardMaterial({
        map:t.map,emissiveMap:t.emi,emissive:0xffc98a,emissiveIntensity:0,
        roughness:st.glass?0.5:0.82,metalness:st.glass?0.22:0.04
      });
      litMats.push(m);return m;
    }
    var mf=mat(f),ms=mat(s);
    return [ms,ms,roofMatCon,roofMatCon,mf,mf];
  }

  /* 楼顶设备（水箱/空调机组/天线）增加层次 */
  function rooftop(x,z,w,d,h){
    var g2=new THREE.Group();
    var n=ri(1,3);
    for(var i=0;i<n;i++){
      var bw=rr(1.2,2.6),bh=rr(0.7,1.6),bd=rr(1.2,2.4);
      var b=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),
        new THREE.MeshStandardMaterial({color:pick([0xb9bdc0,0x8e9498,0xd6d8d6]),roughness:0.85}));
      b.position.set(rr(-w*0.28,w*0.28),h+bh/2,rr(-d*0.28,d*0.28));
      b.castShadow=true;g2.add(b);
    }
    if(R()<0.5){
      var mast=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,rr(3,6),5),
        new THREE.MeshStandardMaterial({color:0x6a7078,metalness:0.6,roughness:0.4}));
      mast.position.set(rr(-w*0.25,w*0.25),h+2,d*0.1);g2.add(mast);
    }
    g2.position.set(x,0,z);add(g2);
  }

  /* 矩形建筑精确碰撞：AABB 供玩家推挤 + 沿长轴布圆兜底 */
  function rectColliders(x,z,w,d){
    BOXES.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
    var longX=w>=d,L=longX?w:d,S=longX?d:w;
    var r=S*0.55+0.8;
    var span=L-2*r;
    var n=Math.max(0,Math.ceil(span/(r*1.4)));
    for(var i=0;i<=n;i++){
      var off=n===0?0:(-span/2+span*i/n);
      if(longX)COLLIDERS.push({x:x+off,z:z,r:r});
      else COLLIDERS.push({x:x,z:z+off,r:r});
    }
  }

  /* 独立建筑：从地面 y=0 直接升起 */
  function addBuilding(x,z,w,h,d,styleKey,opts){
    opts=opts||{};
    var mats=buildingMatSet(w,h,d,styleKey);
    mats[2]=mats[3]=R()<0.5?roofMatCon:roofMatCon2;
    var b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);
    b.position.set(x,h/2,z);b.castShadow=true;b.receiveShadow=true;add(b);
    var pf=new THREE.Mesh(new THREE.BoxGeometry(w+0.3,0.7,d+0.3),parapetMat);
    pf.position.set(x,h+0.1,z);pf.castShadow=true;add(pf);
    rooftop(x,z,w,d,h+0.4);
    aoDecal(x,z,Math.max(w,d)*0.62);
    if(!opts.noCollide)rectColliders(x,z,w,d);
    return b;
  }

  /* 塔楼：坐在裙楼之上（baseH 为裙楼顶标高），与地面间接但明确连接 */
  function towerOn(x,z,baseH,w,d,h,styleKey){
    var mats=buildingMatSet(w,h,d,styleKey);
    mats[2]=mats[3]=R()<0.5?roofMatCon:roofMatCon2;
    var b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);
    b.position.set(x,baseH+h/2,z);b.castShadow=true;b.receiveShadow=true;add(b);
    var pf=new THREE.Mesh(new THREE.BoxGeometry(w+0.3,0.7,d+0.3),parapetMat);
    pf.position.set(x,baseH+h+0.1,z);pf.castShadow=true;add(pf);
    rooftop(x,z,w,d,baseH+h+0.4);
    return b;
  }

  /* 商场名横牌（夜间发光） */
  function bigSign(text,en,x,y,z,rotY,w,h,bg,fg){
    var st=texSign({w:512,h:112,bg:bg||"#1a2f56",t1:text,t2:en||"",fg:fg||"#f2e2b0",fg2:fg||"#f2e2b0",s1:52,s2:20,border:"#c8a45a"});
    var m=new THREE.MeshStandardMaterial({map:st,emissiveMap:st,emissive:0xffffff,emissiveIntensity:0,roughness:0.55});
    lampMats.push(m);
    var s=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.3),m);
    s.position.set(x,y,z);s.rotation.y=rotY;s.castShadow=true;add(s);
    return s;
  }
  /* LED 广告大屏（日夜常亮） */
  function ledScreen(x,y,z,rotY,w,h,seed){
    var t=texLED(seed);
    var m=new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:0.55,roughness:0.42});
    var s=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);
    s.position.set(x,y,z);s.rotation.y=rotY;add(s);
    var nx=Math.sin(rotY),nz=Math.cos(rotY);
    var fr=new THREE.Mesh(new THREE.BoxGeometry(w+0.6,h+0.6,0.35),
      new THREE.MeshStandardMaterial({color:0x1a1e24,roughness:0.6,metalness:0.4}));
    fr.position.set(x-nx*0.18,y,z-nz*0.18);fr.rotation.y=rotY;add(fr);
  }

  /* 商业综合体：裙楼（落地）+ 顶部塔楼 + 入口雨棚 */
  function complex(x,z,pw,pd,podH,towers,nameOpts){
    nameOpts=nameOpts||{};
    // 裙楼：商业立面，从地面升起
    addBuilding(x,z,pw,podH,pd,"mall",{noCollide:true});
    rectColliders(x,z,pw,pd);
    // 裙楼顶角部空调机组
    [[-1,-1],[1,1],[-1,1]].forEach(function(s){
      var ac=new THREE.Mesh(new THREE.BoxGeometry(3,1.2,2.4),
        new THREE.MeshStandardMaterial({color:0xb9bdc0,roughness:0.85}));
      ac.position.set(x+s[0]*pw*0.4,podH+0.6,z+s[1]*pd*0.36);ac.castShadow=true;add(ac);
    });
    // 入口雨棚 + 台阶（朝向 nameOpts.face: "s"/"n"/"e"/"w"）
    var face=nameOpts.face||"s";
    var fx=x,fz=z,rY=0;
    if(face==="s"){fz=z+pd/2;rY=0;}
    else if(face==="n"){fz=z-pd/2;rY=Math.PI;}
    else if(face==="e"){fx=x+pw/2;rY=Math.PI/2;}
    else {fx=x-pw/2;rY=-Math.PI/2;}
    var canopy=new THREE.Mesh(new THREE.BoxGeometry(Math.min(12,pw*0.3),0.4,2.6),
      new THREE.MeshStandardMaterial({color:0x26313a,roughness:0.4,metalness:0.35}));
    canopy.position.set(fx+Math.sin(rY)*1.4,podH*0.32,fz+Math.cos(rY)*1.4);
    canopy.rotation.y=rY;canopy.castShadow=true;add(canopy);
    var step=new THREE.Mesh(new THREE.BoxGeometry(Math.min(10,pw*0.26),0.18,1.4),
      new THREE.MeshStandardMaterial({color:0xb9bcb8,roughness:0.9}));
    step.position.set(fx+Math.sin(rY)*0.8,0.09,fz+Math.cos(rY)*0.8);
    step.rotation.y=rY;add(step);
    // 塔楼
    (towers||[]).forEach(function(t){
      towerOn(t[0],t[1],podH,t[2],t[3],t[4],t[5]||"office");
    });
    // 招牌与 LED：按裙楼外表面自动定位（贴面外偏 0.42m，杜绝穿墙）
    function facePos(face,along){
      var hw=pw/2,hd=pd/2;
      if(face==="s")return {x:x+along,z:z+hd+0.42,rotY:0,lim:hw};
      if(face==="n")return {x:x+along,z:z-hd-0.42,rotY:Math.PI,lim:hw};
      if(face==="e")return {x:x+hw+0.42,z:z+along,rotY:Math.PI/2,lim:hd};
      return {x:x-hw-0.42,z:z+along,rotY:-Math.PI/2,lim:hd};
    }
    if(nameOpts.sign){
      var sg=nameOpts.sign;
      var fp=facePos(sg.face,sg.along);
      var maxA=fp.lim-sg.w/2-0.8;
      fp=facePos(sg.face,Math.max(-maxA,Math.min(maxA,sg.along)));
      bigSign(sg.t1,sg.en,fp.x,sg.y,fp.z,fp.rotY,sg.w,sg.h,sg.bg,sg.fg);
    }
    (nameOpts.leds||[]).forEach(function(l,i){
      var maxL=facePos(l.face,0).lim-l.w/2-0.8;
      var al=Math.max(-maxL,Math.min(maxL,l.along));
      var fp2=facePos(l.face,al);
      ledScreen(fp2.x,l.y,fp2.z,fp2.rotY,l.w,l.h,(i+(nameOpts.ledSeed||0)));
    });
  }

  /* ============ 新街口核心四角：大型商场综合体 ============ */

  /* 东北角：德基广场（双塔 + 玻璃裙楼），临中山路北面朝路 */
  complex(98,57,76,50,20,
    [[84,57,30,30,118,"glass"],[116,57,26,26,92,"office"]],
    {face:"n",
     sign:{t1:"德基广场",en:"DEJI PLAZA",face:"n",along:-4,y:13.5,w:18,h:3.4,bg:"#12233f",fg:"#e8c860"},
     leds:[{face:"n",along:-29,y:13,w:14,h:7},{face:"n",along:28,y:13,w:14,h:7},
           {face:"w",along:-8,y:14,w:12,h:6.5}],
     ledSeed:0});

  /* 西北角：新街口百货商店（东面朝中山路） */
  complex(-22,57,64,50,24,
    [[-22,57,28,28,78,"office"]],
    {face:"e",
     sign:{t1:"新街口百货",en:"XINJIEKOU STORE",face:"e",along:-5,y:16,w:16,h:3.2,bg:"#7a1f1a",fg:"#f4e6c0"},
     leds:[{face:"e",along:-14,y:13.5,w:13,h:6.6},{face:"s",along:-10,y:13,w:11,h:6}],
     ledSeed:1});

  /* 东南角：中央商场（南面朝中山东路） */
  complex(98,-31,70,40,22,
    [[98,-31,26,26,95,"glass"]],
    {face:"s",
     sign:{t1:"中央商场",en:"CENTRAL EMPORIUM",face:"s",along:-8,y:15,w:17,h:3.3,bg:"#20304e",fg:"#f2e2b0"},
     leds:[{face:"s",along:-26,y:13.5,w:13,h:6.6},{face:"s",along:24,y:13.5,w:13,h:6.6},
           {face:"e",along:-6,y:14,w:12,h:6}],
     ledSeed:2});

  /* 西南角：大洋百货（东面朝中山路） */
  complex(-24,-31,58,40,20,
    [[-24,-31,22,22,70,"office"]],
    {face:"e",
     sign:{t1:"大洋百货",en:"DAYANG DEPT. STORE",face:"e",along:2,y:13.5,w:15,h:3.1,bg:"#2c1e4e",fg:"#e8d8f0"},
     leds:[{face:"e",along:-12,y:11.5,w:12,h:6},{face:"n",along:-8,y:12,w:11,h:5.5}],
     ledSeed:3});

  /* 北侧第二排：金鹰国际商城（淮海路以北，南面朝淮海路） */
  complex(-20,133,60,40,18,
    [[-20,133,24,24,95,"glass"]],
    {face:"n",
     sign:{t1:"金鹰国际",en:"GOLDEN EAGLE",face:"n",along:0,y:11.5,w:16,h:3.2,bg:"#101c30",fg:"#d8b45a"},
     leds:[{face:"n",along:-14,y:10.5,w:12,h:6},{face:"e",along:-10,y:10,w:11,h:5.5}],
     ledSeed:0});

  /* ============ 街区填充：写字楼 / 商住楼（全部落地） ============ */

  /* 东北区（中山路—洪武北路，淮海路—户部街） */
  addBuilding(75,133,24,55,24,"office");
  addBuilding(132,133,20,42,20,"resid");
  /* 西北区（太平南路—中山路，淮海路—户部街） */
  addBuilding(-60,133,26,48,24,"resid");
  addBuilding(18,133,18,36,18,"office");
  /* 东南区（石鼓路以南） */
  addBuilding(78,-95,26,48,26,"office");
  addBuilding(110,-95,24,60,24,"glass");
  addBuilding(134,-95,18,36,18,"resid");
  /* 西南区 */
  addBuilding(-50,-95,28,52,28,"office");
  addBuilding(-14,-95,24,64,24,"glass");
  addBuilding(18,-95,16,34,16,"resid");
  /* 太平南路以西（王府大街以东） */
  addBuilding(-131,55,26,62,30,"glass");
  addBuilding(-131,-28,24,48,26,"office");
  addBuilding(-131,133,22,40,24,"resid");
  addBuilding(-131,-95,24,44,24,"office");
  /* 洪武北路以东 */
  addBuilding(185,55,28,72,26,"office");
  addBuilding(215,55,22,50,22,"resid");
  addBuilding(185,-28,26,58,26,"glass");
  addBuilding(215,-28,20,40,20,"office");
  addBuilding(185,133,24,45,24,"resid");
  addBuilding(185,-95,24,52,24,"office");
  /* 远西（王府大街以西） */
  addBuilding(-210,55,26,40,26,"resid");
  addBuilding(-210,-28,24,36,24,"office");
  addBuilding(-210,133,22,32,22,"resid");
  addBuilding(-210,-95,20,30,20,"office");
  /* 石鼓路与户部街之间的填充 */
  addBuilding(-60,170,24,38,22,"resid");
  addBuilding(75,170,22,44,20,"office");
  addBuilding(-60,-170,26,42,24,"resid");
  addBuilding(110,-170,24,50,22,"office");
  /* 北部居住带（石鼓路以北远景中景） */
  [[-150,-160],[-90,-160],[-20,-165],[60,-160],[120,-165],[190,-160],
   [-150,-200],[-70,-205],[20,-200],[180,-200],[-40,-240],[150,-240]]
  .forEach(function(p,i){
    addBuilding(p[0],p[1],rr(20,28),ri(8,15)*3.5,rr(18,24),i%3===0?"office":"resid");
  });

  /* ============ 紫峰大厦（远景地标，按真实特征：三角弧面/阶梯收分/龙鳞斜纹/桅杆） ============ */
  (function(){
    var c=cv(256,512),g=c.getContext("2d");
    var gr=g.createLinearGradient(0,0,0,512);
    gr.addColorStop(0,"#2b4e5c");gr.addColorStop(0.45,"#39697a");gr.addColorStop(1,"#23505e");
    g.fillStyle=gr;g.fillRect(0,0,256,512);
    g.strokeStyle="rgba(140,205,212,0.9)";g.lineWidth=30;
    g.beginPath();g.moveTo(-60,580);g.bezierCurveTo(90,420,170,220,330,-60);g.stroke();
    g.strokeStyle="rgba(190,235,240,0.55)";g.lineWidth=8;
    g.beginPath();g.moveTo(-80,560);g.bezierCurveTo(80,400,180,200,340,-80);g.stroke();
    g.strokeStyle="rgba(60,110,125,0.5)";g.lineWidth=5;
    g.beginPath();g.moveTo(-20,600);g.bezierCurveTo(130,440,210,240,350,-30);g.stroke();
    g.strokeStyle="rgba(10,25,32,0.35)";g.lineWidth=1.2;
    for(var wy=0;wy<512;wy+=9){g.beginPath();g.moveTo(0,wy);g.lineTo(256,wy);g.stroke();}
    for(var wx=0;wx<256;wx+=14){g.beginPath();g.moveTo(wx,0);g.lineTo(wx,512);g.stroke();}
    var tx=new THREE.CanvasTexture(c);
    tx.wrapS=tx.wrapT=THREE.RepeatWrapping;
    var gl=new THREE.MeshStandardMaterial({map:tx,color:0xffffff,roughness:0.18,metalness:0.62});
    var ledge=new THREE.MeshStandardMaterial({color:0x51626c,metalness:0.4,roughness:0.45});
    var g4=new THREE.Group();
    var tiers=[[21,17.5,14,7],[16.2,13.2,46,14+46/2],[13.2,10.4,42,60+42/2],[10.4,7.6,36,102+36/2]];
    tiers.forEach(function(t2){
      var seg=new THREE.Mesh(new THREE.CylinderGeometry(t2[1],t2[0],t2[2],3),gl);
      seg.position.y=t2[3];seg.castShadow=true;g4.add(seg);
      var ledge2=new THREE.Mesh(new THREE.CylinderGeometry(t2[1]*1.07,t2[1]*1.07,1.6,3),ledge);
      ledge2.position.y=t2[3]+t2[2]/2+0.8;g4.add(ledge2);
    });
    var crown=new THREE.Mesh(new THREE.CylinderGeometry(3.2,7.6,15,3),gl);
    crown.position.y=138+7.5;crown.castShadow=true;g4.add(crown);
    var spire=new THREE.Mesh(new THREE.CylinderGeometry(0.28,1.05,36,8),
      new THREE.MeshStandardMaterial({color:0xc9d4dc,metalness:0.8,roughness:0.22}));
    spire.position.y=153+18;g4.add(spire);
    var tip=new THREE.Mesh(new THREE.SphereGeometry(0.85,10,10),
      new THREE.MeshStandardMaterial({color:0xe04a52,emissive:0xe04a52,emissiveIntensity:0}));
    tip.position.y=171+14;g4.add(tip);
    litMats.push(gl,tip.material);
    g4.rotation.y=0.5;
    g4.position.set(85,0,-235);add(g4);   // 中山路北延线上，鼓楼方向远景
    COLLIDERS.push({x:85,z:-235,r:15});
  })();

  /* ============ 法桐行道树（南京街景标志） ============ */
  var barkMat=new THREE.MeshStandardMaterial({map:mkTex(texB,1,2),roughness:1});
  var leafMats=[
    new THREE.MeshStandardMaterial({color:0x3f6b3a,roughness:0.95,flatShading:true}),
    new THREE.MeshStandardMaterial({color:0x4a7742,roughness:0.95,flatShading:true}),
    new THREE.MeshStandardMaterial({color:0x355c33,roughness:0.95,flatShading:true})
  ];
  snowables.push({m:leafMats[0]},{m:leafMats[1]},{m:leafMats[2]});
  var leafGeoA=new THREE.IcosahedronGeometry(1,0);
  var leafGeoB=new THREE.IcosahedronGeometry(1,1);
  /* 法桐改为实例化收集（CITY.create 末尾统一合批，~160 棵树 → 7 个 InstancedMesh） */
  var TR=[],TRB=[],TRL=[],TRP=[];
  function planeTree(x,z,s,rot){
    TR.push({x:x,z:z,s:s,rot:rot||0});
    for(var i=0;i<3;i++){
      var a=rr(0,6.28);
      TRB.push({px:x+Math.cos(a)*0.5*s,py:0.16+4.5*s,pz:z+Math.sin(a)*0.5*s,
        rx:-Math.sin(a)*0.5,rz:Math.cos(a)*0.5,s:s});
    }
    var n=ri(4,6);
    for(var j=0;j<n;j++){
      var r=rr(1.5,2.4)*s;
      var ang=rr(0,6.28),rad=rr(0.3,1.7)*s;
      TRL.push({m:Math.floor(R()*3),g:R()<0.5?0:1,
        px:x+Math.cos(ang)*rad,py:0.16+rr(5.2,7.0)*s,pz:z+Math.sin(ang)*rad,
        rx:rr(0,3),ry:rr(0,3),rz:rr(0,3),r:r,sh:rr(0.7,1.0)});
    }
    TRP.push({x:x,z:z});
    aoDecal(x,z,2.6);
  }
  function roadClear(x){return Math.abs(x-44)<15||Math.abs(x+90)<13||Math.abs(x-150)<12||Math.abs(x+170)<11;}
  for(var tx=-236;tx<=236;tx+=13){
    if(!roadClear(tx))planeTree(tx,28.4,rr(0.95,1.2),rr(0,6.28));
    if(!roadClear(tx+6.5))planeTree(tx+6.5,-5.4,rr(0.9,1.15),rr(0,6.28));
  }
  /* 淮海路 / 石鼓路行道树 */
  for(var hx=-160;hx<=240;hx+=21){
    if(Math.abs(hx-44)<14||Math.abs(hx+90)<12||Math.abs(hx-150)<12||Math.abs(hx+170)<11)continue;
    planeTree(hx,105.2,rr(0.8,1.0),rr(0,6.28));
    if(R()<0.8)planeTree(hx+8,84.8,rr(0.8,1.0),rr(0,6.28));
    planeTree(hx,-51.6,rr(0.8,1.0),rr(0,6.28));
    if(R()<0.8)planeTree(hx+8,-72.4,rr(0.8,1.0),rr(0,6.28));
  }

  /* ================= 街具 ================= */
  var poleMat=new THREE.MeshStandardMaterial({color:0x3f454c,roughness:0.55,metalness:0.45});
  var poolMat=new THREE.MeshBasicMaterial({color:0xffcf8a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
  var poolGeo=new THREE.CircleGeometry(4.6,20);
  function streetLamp(x,z,flip){
    var g=new THREE.Group();
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.2,8,8),poleMat);
    pole.position.y=4;pole.castShadow=true;g.add(pole);
    var base=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.4,0.7,8),poleMat);
    base.position.y=0.35;g.add(base);
    [-1,1].forEach(function(s){
      var arm=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,1.5,6),poleMat);
      arm.rotation.z=Math.PI/2*s*0.82;
      arm.position.set(s*0.62,7.6,0);g.add(arm);
      var head=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.46,0.8,6),
        new THREE.MeshStandardMaterial({color:0xfff3d0,emissive:0xffcf7a,emissiveIntensity:0,roughness:0.4}));
      head.position.set(s*1.24,7.86,0);g.add(head);
      lampMats.push(head.material);
    });
    g.position.set(x,0.17,z);g.rotation.y=flip?Math.PI:0;add(g);
    var pool=new THREE.Mesh(poolGeo,poolMat);
    pool.rotation.x=-Math.PI/2;pool.position.set(x,0.2,z);add(pool);
  }
  for(var lx=-232;lx<=232;lx+=32){
    if(Math.abs(lx)<14||Math.abs(lx+90)<14||Math.abs(lx-44)<14)continue;
    streetLamp(lx,30.6,false);
    if(Math.abs(lx+16)<14||Math.abs(lx+16+90)<14||Math.abs(lx+16-44)<14)continue;
    streetLamp(lx+16,-1.4,true);
  }

  /* 公交站台（新街口站） */
  (function(){
    var x=90,z=30.2;
    var g=new THREE.Group();
    var postMat=new THREE.MeshStandardMaterial({color:0x5a6167,metalness:0.5,roughness:0.5});
    [[-3.4,0],[3.4,0]].forEach(function(p){
      var post=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,3,8),postMat);
      post.position.set(p[0],1.5,p[1]);post.castShadow=true;g.add(post);
    });
    var roof=new THREE.Mesh(new THREE.BoxGeometry(8,0.16,2.6),
      new THREE.MeshStandardMaterial({color:0x26313a,roughness:0.5,metalness:0.3}));
    roof.position.y=3.05;roof.castShadow=true;g.add(roof);
    var glass=new THREE.Mesh(new THREE.BoxGeometry(7.6,2.2,0.08),
      new THREE.MeshStandardMaterial({color:0xa8c4d4,transparent:true,opacity:0.35,roughness:0.1,metalness:0.3}));
    glass.position.set(0,1.7,-1.1);g.add(glass);
    var bench=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.1,0.5),
      new THREE.MeshStandardMaterial({color:0x7a5f42,roughness:0.8}));
    bench.position.set(0,0.62,-0.9);g.add(bench);
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,3.2,8),postMat);
    pole.position.set(4.4,1.6,0);g.add(pole);
    var signMat=new THREE.MeshStandardMaterial({
      map:texSign({w:256,h:320,bg:"#f4f4f0",border:"#2a5b9a",t1:"新街口",fg:"#16406e",s1:44,t2:"XINJIEKOU",fg2:"#3a4a5c",s2:20}),
      roughness:0.6});
    var sign=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.9,0.08),signMat);
    sign.position.set(4.4,2.4,0);g.add(sign);
    g.position.set(x,0.17,z);g.rotation.y=Math.PI;add(g);
    for(var i=0;i<3;i++)PEND.push([x-2+i*1.9+rr(-0.3,0.3),z-1.4,{still:true,face:Math.PI}]);
  })();

  /* 报刊亭 */
  (function(){
    var g=new THREE.Group();
    var body=new THREE.Mesh(new THREE.BoxGeometry(3,3,2.2),
      new THREE.MeshStandardMaterial({color:0x2f6a4f,roughness:0.8}));
    body.position.y=1.5;body.castShadow=true;g.add(body);
    var win=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4),
      new THREE.MeshStandardMaterial({color:0xf0d9a8,emissive:0xffc46a,emissiveIntensity:0,roughness:0.5}));
    win.position.set(0,1.7,1.11);g.add(win);litMats.push(win.material);
    var roof=new THREE.Mesh(new THREE.BoxGeometry(3.4,0.2,2.6),
      new THREE.MeshStandardMaterial({color:0x1f4234,roughness:0.8}));
    roof.position.y=3.05;g.add(roof);
    var sign=new THREE.Mesh(new THREE.PlaneGeometry(2.6,0.55),
      new THREE.MeshStandardMaterial({map:texSign({w:384,h:80,bg:"#2f6a4f",t1:"报刊 · 冷饮 · 雨伞",fg:"#f8f4e8",s1:38}),roughness:0.7}));
    sign.position.set(0,2.72,1.12);g.add(sign);
    g.position.set(-70,0.17,30.4);g.rotation.y=Math.PI;add(g);
    COLLIDERS.push({x:-70,z:30.4,r:2.6});
  })();

  /* 交通信号灯（可编程动态灯组：g="ew" 控东西向 / "ns" 控南北向） */
  var sigNS=[],sigEW=[];
  (function(){
    function signal(x,z,rY,axis){
      var grp=new THREE.Group();
      var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.18,6.5,8),poleMat);
      pole.position.y=3.25;pole.castShadow=true;grp.add(pole);
      var arm=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,5,6),poleMat);
      arm.rotation.z=Math.PI/2;arm.position.set(2.5,6.3,0);grp.add(arm);
      var boxM=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.5,0.4),
        new THREE.MeshStandardMaterial({color:0x24282c,roughness:0.7}));
      boxM.position.set(4.6,5.8,0);grp.add(boxM);
      var mats=[];
      [[0.45,0xff3b30],[0,0xffc13b],[-0.45,0x34c759]].forEach(function(l){
        var lamp=new THREE.Mesh(new THREE.CircleGeometry(0.14,10),
          new THREE.MeshStandardMaterial({color:l[1],emissive:l[1],emissiveIntensity:0.06}));
        lamp.position.set(4.6,5.8+l[0],0.21);grp.add(lamp);
        mats.push(lamp.material);
      });
      grp.position.set(x,0.17,z);grp.rotation.y=rY;add(grp);
      (axis==="ns"?sigNS:sigEW).push(mats);
    }
    signal(12,25.6,0,"ew");signal(76,-2.6,Math.PI,"ew");
    signal(33.4,-13.4,Math.PI/2,"ns");signal(54.6,37.4,-Math.PI/2,"ns");
  })();
  /* 蓝色路名牌 */
  (function(){
    function np(x,z,rot,t1,t2){
      var m2=new THREE.MeshStandardMaterial({
        map:texSign({w:512,h:160,bg:"#1a4a86",border:"#ffffff",t1:t1,t2:t2,fg:"#ffffff",fg2:"#d8e6f4",s1:64,s2:26}),roughness:0.6});
      var g9=new THREE.Group();
      var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.14,3.4,8),poleMat);
      pole.position.y=1.7;g9.add(pole);
      var sgn=new THREE.Mesh(new THREE.BoxGeometry(5,1.55,0.1),m2);
      sgn.position.y=3.3;sgn.castShadow=true;g9.add(sgn);
      g9.position.set(x,0.17,z);g9.rotation.y=rot;add(g9);
    }
    np(-14,26.4,0,"中山东路","ZHONGSHAN EAST RD");
    np(80,-3.4,Math.PI,"中山东路","ZHONGSHAN EAST RD");
    np(62,28.6,Math.PI,"中山路","ZHONGSHAN RD");
    np(-104,28.6,0,"太平南路","TAIPING SOUTH RD");
    np(62,106.6,Math.PI,"淮海路","HUAIHAI RD");
    np(62,-52.6,0,"石鼓路","SHIGU RD");
    np(163,28.6,Math.PI/2,"洪武北路","HONGWU NORTH RD");
  })();

  /* ================= 南京知名商铺招牌（贴建筑外墙，零穿墙） ================= */
  (function(){
    var awnMats=[0xa83a32,0x2a5b8a,0x2f6a4f,0x8a5a2a].map(function(c){
      return new THREE.MeshStandardMaterial({color:c,roughness:0.8});
    });
    function shopSign(t1,en,x,y,z,rotY,w,h,bg,fg,awn){
      bigSign(t1,en,x,y,z,rotY,w,h,bg,fg);
      if(awn){
        var aw=new THREE.Mesh(new THREE.BoxGeometry(w*0.9,0.14,1.7),awnMats[ri(0,3)]);
        aw.position.set(x+Math.sin(rotY)*1.0,y-h/2-0.55,z+Math.cos(rotY)*1.0);
        aw.rotation.y=rotY;aw.castShadow=true;add(aw);
      }
    }
    shopSign("绿柳居","LV LIU JU",-117.55,5.2,55,Math.PI/2,10,2.4,"#2f6a4f","#f2e2b0",true);
    shopSign("先锋书店","LIBRAIRIE",-118.55,5.2,-28,Math.PI/2,11,2.4,"#3a4a5c","#e8e2d0",true);
    shopSign("苏果超市","SUGO",-196.45,5.2,55,Math.PI/2,11,2.5,"#c23a2f","#fff2d8",true);
    shopSign("金陵糕点","NANJING CAKE",-119.55,5.0,133,Math.PI/2,10,2.3,"#8a5a2a","#f6e8c8",true);
    shopSign("蒋有记锅贴","JIANG'S POTSTICKER",75,5.6,121.45,0,12,2.5,"#a83a32","#ffefd0",true);
    shopSign("李记清真馆","LIJI HALAL",132,5.4,123.45,0,11,2.4,"#2a5b3a","#f2e6c0",true);
    shopSign("南京云锦","NANJING BROCADE",-60,5.4,121.45,0,11,2.4,"#1a3a6a","#d8e8ff",true);
    shopSign("韩复兴板鸭","HAN'S DUCK",78,5.4,-82.45,Math.PI,11,2.4,"#7a2a20","#ffe8c8",true);
    shopSign("小郑酥烧饼","XIAOZHENG BING",-50,5.2,-81.45,Math.PI,10,2.3,"#a8722a","#fff0d0",true);
    shopSign("鸭血粉丝汤","DUCK SOUP NOODLE",18,5.4,-87.45,Math.PI,12,2.4,"#2a4a7a","#ffe2b0",true);
    shopSign("金味栗子","GOLDEN CHESTNUT",170.55,5.6,55,-Math.PI/2,10,2.3,"#8a4a1a","#ffe8c0",true);
    shopSign("刘长兴面馆","LIU CHANG XING",171.55,5.4,-28,-Math.PI/2,11,2.4,"#3a6a4a","#f0e8c8",true);
  })();

  /* 共享单车一排 */
  (function(){
    var frameMat=new THREE.MeshStandardMaterial({color:0xe8b33a,roughness:0.5,metalness:0.4});
    var tyreMat=new THREE.MeshStandardMaterial({color:0x1c2024,roughness:0.9});
    var wheelG=new THREE.TorusGeometry(0.33,0.045,6,12);
    for(var i=0;i<7;i++){
      var g=new THREE.Group();
      [-0.55,0.55].forEach(function(dx){
        var w=new THREE.Mesh(wheelG,tyreMat);
        w.position.set(dx,0.34,0);g.add(w);
      });
      var bar=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.07,0.07),frameMat);
      bar.position.set(0,0.6,0);bar.rotation.z=0.12;g.add(bar);
      var seat=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.08,0.18),tyreMat);
      seat.position.set(-0.4,0.85,0);g.add(seat);
      var handle=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.5,0.4),frameMat);
      handle.position.set(0.5,0.78,0);g.add(handle);
      g.position.set(28+i*0.95,0.17,30.9);g.rotation.y=1.3;add(g);
    }
  })();

  /* ================= 行人 ================= */
  var peds=[];
  var skinMats=[0xd8ab8a,0xc99a76,0xe0b896].map(function(c){return new THREE.MeshStandardMaterial({color:c,roughness:0.75});});
  var hairMats=[0x1c1a19,0x2b2320,0x3a2e26].map(function(c){return new THREE.MeshStandardMaterial({color:c,roughness:0.85});});
  var jacketMats=[0x2f3d4c,0x5d3a38,0x3a4a42,0x7a6a52,0xc9c3b6,0x35506b,0x8e5a4a,0x445566].map(function(c){return new THREE.MeshStandardMaterial({color:c,roughness:0.9});});
  var pantsMats=[0x2a2f38,0x40403c,0x546878,0x23282e].map(function(c){return new THREE.MeshStandardMaterial({color:c,roughness:0.95});});

  function person(x,z,opt){
    opt=opt||{};
    var g=new THREE.Group();
    var jm=pick(jacketMats),pm=pick(pantsMats),sm=pick(skinMats),hm=pick(hairMats);
    var scale=rr(0.92,1.06);
    function leg(sx){
      var pv=new THREE.Group();pv.position.set(sx*0.11,0.86,0);
      var l=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.84,0.17),pm);
      l.position.y=-0.42;l.castShadow=true;pv.add(l);
      g.add(pv);return pv;
    }
    var legL=leg(-1),legR=leg(1);
    var torso=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.62,0.24),jm);
    torso.position.y=1.19;torso.castShadow=true;g.add(torso);
    function arm(sx){
      var pv=new THREE.Group();pv.position.set(sx*0.27,1.44,0);
      var a=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.56,0.14),jm);
      a.position.y=-0.28;a.castShadow=true;pv.add(a);
      var hand=new THREE.Mesh(new THREE.SphereGeometry(0.065,6,6),sm);
      hand.position.y=-0.58;pv.add(hand);
      g.add(pv);return pv;
    }
    var armL=arm(-1),armR=arm(1);
    var head=new THREE.Mesh(new THREE.SphereGeometry(0.135,10,9),sm);
    head.position.y=1.6;head.scale.set(1,1.12,1);head.castShadow=true;g.add(head);
    var hair=new THREE.Mesh(new THREE.SphereGeometry(0.14,10,8,0,6.3,0,1.5),hm);
    hair.position.y=1.64;g.add(hair);
    if(R()<0.35){
      var bag=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.32,0.14),pick(pantsMats));
      bag.position.set(0,1.2,-0.2);g.add(bag);
    }
    g.scale.setScalar(scale);
    g.position.set(x,0.17,z);
    g.rotation.y=opt.face!==undefined?opt.face:rr(0,6.28);
    g.traverse(function(o){if(o.isMesh)o.castShadow=false;}); // 行人投影由 AO/规模弥补
    add(g);
    var p={g:g,legL:legL,legR:legR,armL:armL,armR:armR,
      phase:rr(0,6.28),still:!!opt.still,
      speed:opt.speed||rr(0.9,1.5),
      dir:opt.dir||1,axis:opt.axis||"x",lane:opt.lane||0,
      z:z,x:x,baseY:0.17};
    if(!opt.noReg)peds.push(p);
    return p;
  }
  CITY._person=person;

  PEND.forEach(function(p){person(p[0],p[1],p[2]);});

  /* 中山东路两侧人行道：通勤人流 */
  for(var i=0;i<20;i++){
    var px=rr(-200,220);
    if(Math.abs(px-44)<16)continue;
    person(px,rr(25.6,30.8),{dir:R()<0.5?1:-1,lane:1});
  }
  for(var i2=0;i2<16;i2++){
    var px2=rr(-200,220);
    if(Math.abs(px2-44)<16)continue;
    person(px2,rr(-6.6,-1.4),{dir:R()<0.5?1:-1,lane:-1});
  }
  /* 商场门口聚集 / 等红灯 / 打电话 */
  (function(){
    var spots=[[-50,29.5],[26,28.8],[64,29.6],[120,29.2],[-30,-4.6],[90,-4.8],[170,29.8],[-140,-4.4]];
    spots.forEach(function(s){
      person(s[0],s[1],{still:true,face:rr(0,6.28)});
      if(R()<0.6)person(s[0]+rr(-2,2),s[1]+rr(-1,1),{still:true,face:rr(0,6.28)});
    });
    // 斑马线口等待的人群
    [[13,22],[25,22.6],[65,22.2],[75,-5.5],[36,-15],[52,-15],[36,40],[52,40.5]].forEach(function(s){
      person(s[0],s[1],{still:true,face:R()<0.5?1.57:-1.57});
    });
  })();
  /* 成群结队的行人（同速同向结伴而行） */
  [[27.4,1,-60,5],[28.9,1,-52,3],[-3.4,-1,90,4],[-4.9,-1,150,3],
   [105.6,1,10,4],[-4.4,-1,-130,3],[29.8,-1,140,4],[-3.2,1,-110,5]].forEach(function(gp){
    var spd=rr(0.95,1.25);
    for(var gi=0;gi<gp[3];gi++){
      person(gp[2]+gi*rr(1.1,2.0),gp[0]+rr(-0.7,0.7),{dir:gp[1],lane:gp[1],speed:spd});
    }
  });
  /* 过街行人：沿斑马线行走、遵守信号灯（红灯停/绿灯行/黄灯等待） */
  function pxOutX(){                    // 出生点避开南北向道路路面
    var v2=rr(-160,220);
    while(Math.abs(v2-44)<15.5||Math.abs(v2+94.5)<12.5||Math.abs(v2-150)<12.5)v2=rr(-160,220);
    return v2;
  }
  function pzOutZ(){                    // 出生点避开东西向道路路面
    var v2=rr(-180,210);
    while(Math.abs(v2-12)<15.5||Math.abs(v2-95)<12||Math.abs(v2+62)<12||Math.abs(v2-170)<12)v2=rr(-180,210);
    return v2;
  }
  for(var ic=0;ic<9;ic++){
    person(pxOutX(),35.5+rr(-1.1,1.1),{dir:R()<0.5?1:-1,lane:1});   // 南斑马线横穿中山路
  }
  for(var ic2=0;ic2<6;ic2++){
    person(pxOutX(),-11.5+rr(-1.1,1.1),{dir:R()<0.5?1:-1,lane:-1}); // 北斑马线
  }
  for(var ic3=0;ic3<9;ic3++){
    person(20+rr(-1.1,1.1),pzOutZ(),{dir:R()<0.5?1:-1,axis:"z"});   // 西斑马线横穿中山东路
  }
  for(var ic4=0;ic4<7;ic4++){
    person(70+rr(-1.1,1.1),pzOutZ(),{dir:R()<0.5?1:-1,axis:"z"});   // 东斑马线
  }
  /* 早点摊（蒸笼 + 遮阳伞） */
  (function(){
    var g=new THREE.Group();
    var cart=new THREE.Mesh(new THREE.BoxGeometry(2.4,1,1.2),
      new THREE.MeshStandardMaterial({color:0xc8ccce,metalness:0.5,roughness:0.45}));
    cart.position.y=0.6;cart.castShadow=true;g.add(cart);
    function glowTexSoft(){
      var S=64,c=cv(S,S),g=c.getContext("2d");
      var gr=g.createRadialGradient(S/2,S/2,2,S/2,S/2,S/2);
      gr.addColorStop(0,"rgba(255,255,255,.8)");gr.addColorStop(1,"rgba(255,255,255,0)");
      g.fillStyle=gr;g.fillRect(0,0,S,S);
      return new THREE.CanvasTexture(c);
    }
    var steamer=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.55,12),
      new THREE.MeshStandardMaterial({color:0xd8bb86,roughness:0.85}));
    steamer.position.set(-0.5,1.4,0);g.add(steamer);
    var steamMat=new THREE.SpriteMaterial({map:glowTexSoft(),transparent:true,opacity:0.35,depthWrite:false,color:0xffffff});
    for(var i=0;i<4;i++){
      var s=new THREE.Sprite(steamMat);
      s.position.set(-0.5+rr(-0.2,0.2),1.9+i*0.35,0);
      s.scale.setScalar(rr(0.5,0.9));g.add(s);
    }
    var umb=new THREE.Mesh(new THREE.ConeGeometry(1.9,0.7,12),
      new THREE.MeshStandardMaterial({color:0xb8352e,roughness:0.8}));
    umb.position.set(0,2.6,0);umb.castShadow=true;g.add(umb);
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.4,6),poleMat);
    pole.position.set(0,1.5,0);g.add(pole);
    g.position.set(30,0.17,30.6);add(g);
    COLLIDERS.push({x:30,z:30.6,r:2.2});
    person(31.4,30.8,{still:true,face:-1.6});
  })();

  /* 长椅 + 垃圾桶 */
  (function(){
    var woodMat=new THREE.MeshStandardMaterial({color:0x6b5540,roughness:0.85});
    var ironMat=new THREE.MeshStandardMaterial({color:0x33383c,roughness:0.6,metalness:0.4});
    [-120,-70,110,160].forEach(function(x){
      var g=new THREE.Group();
      var seat=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.09,0.55),woodMat);
      seat.position.y=0.5;seat.castShadow=true;g.add(seat);
      var back=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.5,0.08),woodMat);
      back.position.set(0,0.78,-0.24);back.castShadow=true;g.add(back);
      [-0.9,0.9].forEach(function(dx){
        var l=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.5,0.5),ironMat);
        l.position.set(dx,0.25,0);g.add(l);
      });
      g.position.set(x,0.17,31.0);g.rotation.y=Math.PI;add(g);
    });
    [-96,40,96,140].forEach(function(x){
      var bin=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.28,0.9,10),
        new THREE.MeshStandardMaterial({color:0x2f5c46,roughness:0.7,metalness:0.2}));
      bin.position.set(x,0.62,31.1);bin.castShadow=true;add(bin);
      var lid=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.08,10),
        new THREE.MeshStandardMaterial({color:0x243f33,roughness:0.6}));
      lid.position.set(x,1.1,31.1);add(lid);
    });
  })();

  /* ================= 车流 ================= */
  function makeCar(color,simple){
    var g=new THREE.Group();
    var bodyMat=new THREE.MeshStandardMaterial({color:color,roughness:0.28,metalness:0.65});
    var body=new THREE.Mesh(new THREE.BoxGeometry(2.05,0.72,4.5),bodyMat);
    body.position.y=0.72;body.castShadow=true;g.add(body);
    var skirt=new THREE.Mesh(new THREE.BoxGeometry(1.95,0.34,4.2),
      new THREE.MeshStandardMaterial({color:0x1d2228,roughness:0.7}));
    skirt.position.y=0.42;g.add(skirt);
    var cab=new THREE.Mesh(new THREE.BoxGeometry(1.82,0.64,2.3),
      new THREE.MeshStandardMaterial({color:0x18222c,roughness:0.12,metalness:0.55}));
    cab.position.set(0,1.36,-0.1);cab.castShadow=true;g.add(cab);
    var glass=new THREE.Mesh(new THREE.BoxGeometry(1.84,0.5,2.32),
      new THREE.MeshStandardMaterial({color:0x8fb4cc,transparent:true,opacity:0.22,roughness:0.05,metalness:0.6}));
    glass.position.set(0,1.4,-0.1);g.add(glass);
    var wheelG=new THREE.CylinderGeometry(0.44,0.44,0.34,14);
    var wheelM=new THREE.MeshStandardMaterial({color:0x15181c,roughness:0.95});
    var wheels=[];
    [[1.0,1.5],[-1.0,1.5],[1.0,-1.5],[-1.0,-1.5]].forEach(function(p){
      var w=new THREE.Mesh(wheelG,wheelM);
      w.rotation.z=Math.PI/2;w.position.set(p[0],0.44,p[1]);g.add(w);wheels.push(w);
      var hub=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.36,10),
        new THREE.MeshStandardMaterial({color:0xa8adb2,metalness:0.8,roughness:0.35}));
      hub.rotation.z=Math.PI/2;hub.position.set(p[0],0.44,p[1]);g.add(hub);
    });
    if(!simple){
      var hlM=new THREE.MeshStandardMaterial({color:0xfff6da,emissive:0xffefc0,emissiveIntensity:0,roughness:0.3});
      var tlM=new THREE.MeshStandardMaterial({color:0xd83a2a,emissive:0xff2a18,emissiveIntensity:0.2,roughness:0.4});
      [0.65,-0.65].forEach(function(dx){
        var l=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.2,0.08),hlM);
        l.position.set(dx,0.82,2.26);g.add(l);
        var t=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.18,0.08),tlM);
        t.position.set(dx,0.86,-2.26);g.add(t);
      });
      g.userData.hl=hlM;g.userData.tl=tlM;
      lampMats.push(hlM);
      var plate=new THREE.Mesh(new THREE.PlaneGeometry(0.62,0.16),
        new THREE.MeshStandardMaterial({map:texSign({w:192,h:56,bg:"#1a4a86",t1:"苏A·",t2:"",fg:"#ffffff",s1:34}),roughness:0.6}));
      plate.position.set(0,0.6,2.27);g.add(plate);
    }
    return {g:g,wheels:wheels};
  }
  CITY._makeCar=makeCar;

  /* 停放车辆（沿路缘） */
  [[-120,21.2,0x2b3f52],[-58,21.2,0xb8bcc0],[110,21.2,0x3d3a36],[180,21.2,0x6b2f2f],
   [-30,3.2,0xd8d4c8],[76,3.2,0x24384a],[-160,3.2,0x5a4a6a],[200,3.2,0x8a8f94]].forEach(function(p){
    var c=makeCar(p[2],true);
    c.g.position.set(p[0],0.06,p[1]);
    c.g.rotation.y=p[1]>12?Math.PI/2:-Math.PI/2;
    add(c.g);
  });

  /* 行驶中的车
     ax: "x"东西向 / "z"南北向；rt: 经新街口环岛绕行（不停灯）
     stopBase: 所穿主干道交叉口轴线位置（红灯时在停止线前停车等待） */
  var traffic=[];
  function addTraffic(ax,lat,pos,dir,sp,color,bounds,rt,stopBase){
    var c=makeCar(color,false);
    add(c.g);
    traffic.push({g:c.g,wheels:c.wheels,ax:ax,lat:lat,pos:pos,dir:dir,sp:sp,v:sp,
      min:bounds[0],max:bounds[1],rt:!!rt,stopBase:stopBase||null,zs:lat,
      rot:dir>0?(ax==="x"?Math.PI/2:0):(ax==="x"?-Math.PI/2:Math.PI)});
  }
  // 中山东路（主轴，环岛绕行）
  addTraffic("x",15,-180,1,10,0x303a44,[-250,332],true);
  addTraffic("x",15,-60,1,11,0x8e2f2f,[-250,332],true);
  addTraffic("x",15,120,1,9,0x2c3e50,[-250,332],true);
  addTraffic("x",8,180,-1,10,0x445a6b,[-250,332],true);
  addTraffic("x",8,20,-1,9,0xb0b4b8,[-250,332],true);
  addTraffic("x",8,-120,-1,8,0x3a4a3e,[-250,332],true);
  // 中山路（经新街口环岛绕行）
  addTraffic("z",50.5,120,-1,9,0x2c3e50,[-6,166],true);
  addTraffic("z",37.5,30,1,9,0x8e2f2f,[-6,166],true);
  addTraffic("z",37.5,150,1,8,0x3a4a3e,[-6,166],true);
  // 太平南路（修正：车道在 x=-94.5/-85.5，红灯停靠中山东路口）
  addTraffic("z",-94.5,100,-1,9,0x303a44,[-120,196],false,12);
  addTraffic("z",-85.5,0,1,8,0xb0b4b8,[-120,196],false,12);
  // 洪武北路
  addTraffic("z",155.5,80,-1,9,0x445a6b,[-120,196],false,12);
  addTraffic("z",144.5,-60,1,8,0x2c3e50,[-120,196],false,12);
  // 淮海路（穿中山路口灯控）
  addTraffic("x",91.5,80,1,9,0x445a6b,[-176,244],false,44);
  addTraffic("x",98.5,-100,-1,8,0x2c3e50,[-176,244],false,44);
  // 石鼓路
  addTraffic("x",-57.5,-120,1,8,0x303a44,[-176,244],false,44);
  addTraffic("x",-66.5,60,-1,8,0xb0b4b8,[-176,244],false,44);

  /* ================= 骑行人群（自行车 / 电动车，同样受信号灯管控） ================= */
  function makeRide(type){
    var g=new THREE.Group();
    var frameMat=new THREE.MeshStandardMaterial({
      color:type==="bike"?pick([0x2f7a4f,0x3560a0,0xc26a2a]):pick([0xd8302f,0x2a2e34,0x3a6ab0]),
      roughness:0.45,metalness:0.35});
    var tyreMat=new THREE.MeshStandardMaterial({color:0x1c2024,roughness:0.9});
    var wg=new THREE.TorusGeometry(0.34,0.05,6,14);
    var spokeMat=new THREE.MeshStandardMaterial({color:0x9aa2a8,roughness:0.5,metalness:0.5});
    var wheels=[];
    [[0,0.58],[0,-0.58]].forEach(function(p){
      var w=new THREE.Mesh(wg,tyreMat);
      w.rotation.y=Math.PI/2;          // 轮面立起：轮轴沿 x，滚动绕轮轴行进
      w.position.set(0,0.34,p[1]);
      // 辐条（随轮转动，滚动可见）+ 轮毂
      var sp1=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.62,0.03),spokeMat);w.add(sp1);
      var sp2=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.62,0.03),spokeMat);
      sp2.rotation.z=Math.PI/2;w.add(sp2);
      var hub=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.09,8),spokeMat);
      hub.rotation.z=Math.PI/2;w.add(hub);
      g.add(w);wheels.push(w);
    });
    if(type==="ebike"){
      var body=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.3,1.3),frameMat);
      body.position.set(0,0.55,0);body.castShadow=true;g.add(body);
    }else{
      var bar1=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,1.0),frameMat);
      bar1.position.set(0,0.62,0.15);bar1.rotation.x=0.25;g.add(bar1);
      var bar2=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.9),frameMat);
      bar2.position.set(0,0.6,-0.35);bar2.rotation.x=-0.2;g.add(bar2);
    }
    var handle=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.06),frameMat);
    handle.position.set(0,0.95,0.62);g.add(handle);
    var seat=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.06,0.3),tyreMat);
    seat.position.set(0,0.92,-0.32);g.add(seat);
    // 骑手
    var jm=pick(jacketMats),pm=pick(pantsMats),sm=pick(skinMats);
    var torso=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.55,0.24),jm);
    torso.position.set(0,1.25,-0.1);torso.rotation.x=0.35;torso.castShadow=true;g.add(torso);
    var head=new THREE.Mesh(new THREE.SphereGeometry(0.14,10,9),sm);
    head.position.set(0,1.62,0.02);g.add(head);
    if(type==="ebike"){
      var helmet=new THREE.Mesh(new THREE.SphereGeometry(0.165,10,8,0,6.3,0,1.6),pick(hairMats));
      helmet.position.set(0,1.64,0.02);g.add(helmet);
    }else{
      var hair2=new THREE.Mesh(new THREE.SphereGeometry(0.145,10,8,0,6.3,0,1.5),pick(hairMats));
      hair2.position.set(0,1.66,0.0);g.add(hair2);
    }
    var armL=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.5,0.12),jm);
    armL.position.set(-0.22,1.3,0.18);armL.rotation.x=-0.9;g.add(armL);
    var armR=armL.clone();armR.position.x=0.22;g.add(armR);
    var legL=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.5,0.15),pm);
    legL.position.set(-0.12,0.72,-0.12);legL.rotation.x=0.5;g.add(legL);
    var legR=legL.clone();legR.position.x=0.12;legR.rotation.x=-0.3;g.add(legR);
    g.traverse(function(o){if(o.isMesh)o.castShadow=false;});
    return {g:g,wheels:wheels,legL:legL,legR:legR};
  }
  CITY._makeRide=makeRide;
  CITY._peds=peds;
  CITY._traffic=traffic;
  var riders=[];
  function addRider(type,ax,lat,pos,dir,sp,bounds,stopBase){
    var r=makeRide(type);
    add(r.g);
    riders.push({g:r.g,wheels:r.wheels,legL:r.legL,legR:r.legR,type:type,ax:ax,lat:lat,
      pos:pos,dir:dir,sp:sp,v:sp,ph:rr(0,6.28),
      min:bounds[0],max:bounds[1],stopBase:stopBase||null,
      rot:dir>0?(ax==="x"?Math.PI/2:0):(ax==="x"?-Math.PI/2:Math.PI)});
  }
  // 中山东路两侧非机动车道（南北向车流穿新街口灯控口）
  addRider("bike","x",25.5,-120,1,5,[-240,330],44);
  addRider("bike","x",25.5,40,1,4.6,[-240,330],44);
  addRider("bike","x",25.5,180,1,5.4,[-240,330],44);
  addRider("ebike","x",25.5,-40,1,11,[-240,330],44);
  addRider("bike","x",-1.5,150,-1,4.8,[-240,330],44);
  addRider("ebike","x",-1.5,-20,-1,10,[-240,330],44);
  addRider("ebike","x",-1.5,120,-1,11.5,[-240,330],44);
  // 中山路两侧
  addRider("bike","z",52,100,-1,4.6,[-100,180],12);
  addRider("ebike","z",52,-30,-1,10.5,[-100,180],12);
  addRider("bike","z",36,20,1,5,[-100,180],12);
  addRider("ebike","z",36,120,1,10,[-100,180],12);
  // 淮海路 / 石鼓路
  addRider("ebike","x",101.5,60,1,10,[-176,240],44);
  addRider("bike","x",88.5,-60,-1,4.4,[-176,240],44);
  addRider("bike","x",-55.5,40,1,4.6,[-176,240],44);
  addRider("ebike","x",-68.5,-100,-1,10,[-176,240],44);

  /* ================= 远景城市天际线（360° 环布，现代都市） ================= */
  (function(){
    var m=new THREE.MeshStandardMaterial({color:0x8a94a0,roughness:1});
    for(var i=0;i<72;i++){
      var a=rr(0,6.28),rad=rr(300,450);
      var x=Math.cos(a)*rad,z=Math.sin(a)*rad;
      if(Math.abs(z-12)<26&&x>240)continue;        // 让开中山东路东延
      if(Math.abs(x-44)<24&&z<-252)continue;       // 让开中山路北延（紫峰方向）
      if(x>300&&x<680&&z>-240&&z<160)continue;     // 让开紫金山索道走廊
      if(Math.hypot(x-540,z+70)<270)continue;      // 让开紫金山
      if(Math.hypot(x-120,z+480)<270)continue;     // 让开玄武湖
      if(Math.hypot(x+40,z+718)<230)continue;      // 让开长江
      var w=rr(14,34),h=rr(16,72),d=rr(14,30);
      var b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
      b.position.set(x,h/2,z);add(b);
    }
    // 远景超高层地标群（高度严格低于紫峰 ~190m，紫峰全城第一高）
    var skyM=new THREE.MeshStandardMaterial({color:0x7e8ea0,roughness:0.55,metalness:0.25});
    [[-260,120,158,120,26],[-190,-260,148,100,24],[260,-180,165,110,28],[330,120,152,96,26],
     [180,300,138,90,24],[-320,40,145,100,26]]
    .forEach(function(p){
      var t=new THREE.Mesh(new THREE.BoxGeometry(p[3],p[2],p[4]),skyM);
      t.position.set(p[0],p[2]/2,p[1]);add(t);
      var cap=new THREE.Mesh(new THREE.BoxGeometry(p[3]*0.4,10,p[4]*0.4),m);
      cap.position.set(p[0],p[2]+5,p[1]);add(cap);
    });
  })();

  /* ================= 远郊景区带（CBD 之外：江/河/湖/山/寺） ================= */
  var waterMat=new THREE.MeshStandardMaterial({color:0x2e6a8e,roughness:0.16,metalness:0.55});
  function water(x,z,w,d,rot){
    var p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),waterMat);
    p.rotation.x=-Math.PI/2;p.rotation.z=rot||0;p.position.set(x,0.12,z);add(p);
    return p;
  }
  /* 秦淮河：城南蜿蜒而过 + 石拱桥 */
  (function(){
    [[-300,288,-0.10],[-140,296,0.12],[30,282,-0.08],[190,292,0.10],[330,272,-0.14]]
    .forEach(function(s){water(s[0],s[1],200,44,s[2]);});
    // 石拱桥（中山路南延线上）
    var stoneM=new THREE.MeshStandardMaterial({color:0x9a9488,roughness:0.9});
    var deck=new THREE.Mesh(new THREE.BoxGeometry(7,1.1,52),stoneM);
    deck.position.set(44,3.4,284);deck.castShadow=true;add(deck);
    var arch=new THREE.Mesh(new THREE.CylinderGeometry(6.5,6.5,7,20,1,false,0,Math.PI),stoneM);
    arch.rotation.z=Math.PI/2;arch.rotation.y=Math.PI/2;
    arch.position.set(44,0.4,284);add(arch);
    for(var i=-2;i<=2;i++){
      var rail=new THREE.Mesh(new THREE.BoxGeometry(0.3,1.0,52),
        new THREE.MeshStandardMaterial({color:0xb2aca0,roughness:0.85}));
      rail.position.set(44+i*3.4,4.4,284);add(rail);
    }
    COLLIDERS.push({x:44,z:284,r:5});
  })();
  /* 长江：远郊北面横陈 + 南京长江大桥 */
  (function(){
    water(-40,-718,660,175,0);
    // 大桥（双层钢桁架，公路在上）
    var steel=new THREE.MeshStandardMaterial({color:0x8a9098,roughness:0.5,metalness:0.55});
    var deck=new THREE.Mesh(new THREE.BoxGeometry(18,1.6,200),steel);
    deck.position.set(-240,15,-718);deck.castShadow=true;add(deck);
    // 引桥（南北两端下坡）
    [[-623,1],[-813,-1]].forEach(function(e){
      var ramp=new THREE.Mesh(new THREE.BoxGeometry(18,1.2,60),steel);
      ramp.position.set(-240,8,e[0]);ramp.rotation.x=e[1]*0.22;add(ramp);
    });
    for(var pz=-645;pz>=-795;pz-=30){
      var pier=new THREE.Mesh(new THREE.CylinderGeometry(2.4,3,14,10),
        new THREE.MeshStandardMaterial({color:0x9aa0a4,roughness:0.9}));
      pier.position.set(-240,7,pz);add(pier);
    }
    // 钢桁架拱
    for(var az=-665;az>=-775;az-=55){
      var arc=new THREE.Mesh(new THREE.TorusGeometry(12,0.5,6,16,Math.PI),steel);
      arc.position.set(-240,15.8,az+27);arc.rotation.y=Math.PI/2;add(arc);
    }
    // 桥头堡（三面红旗雕塑意象）
    [[-625],[-811]].forEach(function(e){
      var t=new THREE.Mesh(new THREE.BoxGeometry(6,12,6),
        new THREE.MeshStandardMaterial({color:0xc9c4b8,roughness:0.85}));
      t.position.set(-240,9,e[0]);t.castShadow=true;add(t);
      for(var f=0;f<3;f++){
        var flag=new THREE.Mesh(new THREE.BoxGeometry(1.2,7,0.5),
          new THREE.MeshStandardMaterial({color:0xc23a2f,roughness:0.7}));
        flag.position.set(-243+f*3,17,e[0]);flag.rotation.y=0.15*(f-1);add(flag);
      }
    });
    // 江面货轮一艘
    var ship=new THREE.Group();
    var hull=new THREE.Mesh(new THREE.BoxGeometry(14,3,42),
      new THREE.MeshStandardMaterial({color:0x3a4a56,roughness:0.7}));
    hull.position.y=1.2;ship.add(hull);
    var cab=new THREE.Mesh(new THREE.BoxGeometry(8,5,8),
      new THREE.MeshStandardMaterial({color:0xe8e4d8,roughness:0.6}));
    cab.position.set(0,5,-14);ship.add(cab);
    ship.position.set(-140,0.2,-690);ship.rotation.y=0.4;add(ship);
    COLLIDERS.push({x:-40,z:-718,r:110});
  })();
  /* 玄武湖：开阔湖面 + 洲链（梁洲/环洲/樱洲/翠洲）+ 拱桥 + 游船码头
     原有小洲（含湖心亭）轮廓/位置完整保留，按导览图格局局部加密 */
  (function(){
    var LAKE={cx:120,cz:-480,rx:222,rz:147};
    var islMats=[];
    var grassI=new THREE.MeshStandardMaterial({color:0x4a7a42,roughness:1});
    var shoreI=new THREE.MeshStandardMaterial({color:0xc9bfa8,roughness:0.95});
    snowables.push({m:grassI,c:new THREE.Color(0x4a7a42)},{m:shoreI,c:new THREE.Color(0xc9bfa8)});
    function landmass(x,z,rx,rz,label){
      var isl=new THREE.Mesh(new THREE.CircleGeometry(1,28),grassI);
      isl.rotation.x=-Math.PI/2;isl.scale.set(rx,rz,1);
      isl.position.set(x,0.18,z);isl.receiveShadow=true;add(isl);
      var rim=new THREE.Mesh(new THREE.RingGeometry(0.9,1,28),shoreI);
      rim.rotation.x=-Math.PI/2;rim.scale.set(rx+2.2,rz+2.2,1);
      rim.position.set(x,0.165,z);add(rim);
      if(label){ // 洲名石碑（竖排）
        var c=cv(96,288),g2=c.getContext("2d");
        g2.fillStyle="#8a9284";g2.fillRect(0,0,96,288);
        g2.strokeStyle="#6a7262";g2.lineWidth=6;g2.strokeRect(6,6,84,276);
        g2.textAlign="center";g2.textBaseline="middle";
        g2.fillStyle="#f2ede0";
        g2.font="bold 62px 'Microsoft YaHei','KaiTi',serif";
        for(var ci2=0;ci2<label.length;ci2++)g2.fillText(label[ci2],48,58+ci2*86);
        var t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=MAXA;
        var stele=new THREE.Mesh(new THREE.BoxGeometry(2.0,2.6,0.4),
          new THREE.MeshStandardMaterial({color:0x8a9284,roughness:0.9}));
        stele.position.set(x+rx*0.45,1.5,z+rz*0.45);stele.castShadow=true;add(stele);
        var face=new THREE.Mesh(new THREE.PlaneGeometry(1.7,2.3),
          new THREE.MeshStandardMaterial({map:t,roughness:0.85}));
        face.position.set(x+rx*0.45,1.5,z+rz*0.45+0.22);face.rotation.y=Math.PI/2;add(face);
      }
      return isl;
    }
    function islandTrees(x,z,rx,rz,n){
      for(var t=0;t<n;t++){
        planeTree(x+rr(-rx*0.6,rx*0.6),z+rr(-rz*0.55,rz*0.55),rr(0.8,1.1),rr(0,6.28));
      }
    }
    /* 拱桥（石平桥 + 双拱洞 + 栏杆），连接各洲 */
    var bridgeStone=new THREE.MeshStandardMaterial({color:0x9a9488,roughness:0.9});
    var bridgeRail=new THREE.MeshStandardMaterial({color:0xb2aca0,roughness:0.85});
    function footBridge(x1,z1,x2,z2,wid){
      var dx=x2-x1,dz=z2-z1;
      var len=Math.hypot(dx,dz),ang=Math.atan2(dx,dz);
      var g=new THREE.Group();
      var deck=new THREE.Mesh(new THREE.BoxGeometry(wid,0.5,len+4),bridgeStone);
      deck.position.y=1.35;deck.castShadow=true;deck.receiveShadow=true;g.add(deck);
      // 拱洞两个（半圆筒开口向下，净空可过小船）
      var archLen=Math.max(3,len*0.34);
      [-(len*0.24),len*0.24].forEach(function(off){
        var arch=new THREE.Mesh(new THREE.CylinderGeometry(wid*0.62,wid*0.62,archLen,12,1,true,0,Math.PI),
          new THREE.MeshStandardMaterial({color:0x8a8478,roughness:0.9,side:THREE.DoubleSide}));
        arch.rotation.x=Math.PI/2;
        arch.position.set(0,1.05,off);g.add(arch);
      });
      [-1,1].forEach(function(s2){
        var rail=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.7,len+4),bridgeRail);
        rail.position.set(s2*wid*0.46,1.95,0);g.add(rail);
        var posts=Math.max(3,Math.round(len/6));
        for(var p2=0;p2<=posts;p2++){
          var post=new THREE.Mesh(new THREE.BoxGeometry(0.2,1.1,0.2),bridgeRail);
          post.position.set(s2*wid*0.46,1.8,-len/2+len*p2/posts);g.add(post);
        }
      });
      g.position.set((x1+x2)/2,0.18,(z1+z2)/2);
      g.rotation.y=ang;add(g);
    }
    /* 游船码头（木质平台 + 桩柱 + 顶棚） */
    function dock(x,z,rotY){
      var wood=new THREE.MeshStandardMaterial({color:0x8a6a4a,roughness:0.85});
      var wood2=new THREE.MeshStandardMaterial({color:0x6e523a,roughness:0.9});
      var g=new THREE.Group();
      var plat=new THREE.Mesh(new THREE.BoxGeometry(6,0.5,14),wood);
      plat.position.y=0.6;plat.castShadow=true;plat.receiveShadow=true;g.add(plat);
      for(var px2=-2;px2<=2;px2+=2){
        for(var pz2=-5;pz2<=5;pz2+=5){
          var pile=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.26,2.2,8),wood2);
          pile.position.set(px2,-0.35,pz2);g.add(pile);
        }
      }
      for(var cx2=-1.8;cx2<=1.8;cx2+=3.6){
        for(var cz2=-5;cz2<=5;cz2+=10){
          var col=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,2.8,6),wood2);
          col.position.set(cx2,2.2,cz2);g.add(col);
        }
      }
      var roof=new THREE.Mesh(new THREE.BoxGeometry(5,0.22,13),wood);
      roof.position.set(0,3.7,0);roof.castShadow=true;g.add(roof);
      g.position.set(x,0.15,z);g.rotation.y=rotY;add(g);
      return g;
    }
    /* 画舫游船 */
    var boatHullM=new THREE.MeshStandardMaterial({color:0x7a3a28,roughness:0.6});
    var boatTrimM=new THREE.MeshStandardMaterial({color:0xd8b03a,metalness:0.4,roughness:0.4});
    var boatCanM=new THREE.MeshStandardMaterial({color:0xb8352e,roughness:0.75,side:THREE.DoubleSide});
    var boatPoleM=new THREE.MeshStandardMaterial({color:0x8a3a30,roughness:0.7});
    function makeBoat(){
      var g=new THREE.Group();
      var hull=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.7,6.4),boatHullM);
      hull.position.y=0.35;hull.castShadow=true;g.add(hull);
      [[0,3.1],[0,-3.1]].forEach(function(p2){
        var tip=new THREE.Mesh(new THREE.SphereGeometry(1.3,10,8),boatHullM);
        tip.scale.set(1,0.5,0.85);tip.position.set(p2[0],0.38,p2[1]);g.add(tip);
      });
      var trim=new THREE.Mesh(new THREE.BoxGeometry(2.9,0.16,6.8),boatTrimM);
      trim.position.y=0.76;g.add(trim);
      // 红棚（半筒拱顶，拱截面竖直、沿船长）+ 端封板
      var can=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.35,5,10,1,true,0,Math.PI),boatCanM);
      can.rotation.set(0,Math.PI/2,Math.PI/2);
      can.position.set(0,0.85,0);can.castShadow=true;g.add(can);
      [2.5,-2.5].forEach(function(z2){
        var cap=new THREE.Mesh(new THREE.CircleGeometry(1.35,10,0,Math.PI),boatCanM);
        cap.position.set(0,0.85,z2);
        if(z2<0)cap.rotation.y=Math.PI;
        g.add(cap);
      });
      // 座位两排
      var seatM=new THREE.MeshStandardMaterial({color:0xa87848,roughness:0.8});
      [1.1,-1.1].forEach(function(z2){
        var seat=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.3,0.7),seatM);
        seat.position.set(0,0.95,z2);g.add(seat);
      });
      // 乘客（简易坐姿，第三人称可见）
      var rider=new THREE.Group();
      var rTorso=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.55,0.26),
        new THREE.MeshStandardMaterial({color:0x35506b,roughness:0.9}));
      rTorso.position.y=1.28;rider.add(rTorso);
      var rHead=new THREE.Mesh(new THREE.SphereGeometry(0.15,10,9),
        new THREE.MeshStandardMaterial({color:0xd8ab8a,roughness:0.75}));
      rHead.position.y=1.68;rider.add(rHead);
      g.add(rider);g.userData.rider=rider;
      return {g:g};
    }
    CITY._makeBoat=makeBoat;

    /* 湖面 + 岸线（原有主体不动） */
    var lake=new THREE.Mesh(new THREE.CircleGeometry(1,48),waterMat);
    lake.rotation.x=-Math.PI/2;lake.scale.set(215,140,1);
    lake.position.set(120,0.14,-480);add(lake);
    var shore=new THREE.Mesh(new THREE.RingGeometry(0.86,1,48),shoreI);
    shore.rotation.x=-Math.PI/2;shore.scale.set(225,148,1);
    shore.position.set(120,0.16,-480);add(shore);

    /* ---- 原有小洲（轮廓/位置/湖心亭完整保留） ---- */
    [[70,-460,42,26],[165,-505,50,30]].forEach(function(p){
      landmass(p[0],p[1],p[2]/2,p[3]/2,null);
      islandTrees(p[0],p[1],p[2]/2,p[3]/2,4);
      var pav=new THREE.Group();
      var pm2=new THREE.MeshStandardMaterial({color:0xc0392b,roughness:0.7});
      var roof=new THREE.Mesh(new THREE.ConeGeometry(4,2.6,6),pm2);
      roof.position.y=5.2;roof.castShadow=true;pav.add(roof);
      for(var c=0;c<6;c++){
        var col=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,3.6,6),
          new THREE.MeshStandardMaterial({color:0x8a3a30,roughness:0.7}));
        col.position.set(Math.cos(c/6*6.28)*3,1.8,Math.sin(c/6*6.28)*3);pav.add(col);
      }
      var base2=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.8,0.7,6),
        new THREE.MeshStandardMaterial({color:0xd8d2c4,roughness:0.9}));
      base2.position.y=0.35;pav.add(base2);
      pav.position.set(p[0],0.2,p[1]);add(pav);
    });

    /* ---- 按导览图格局加密洲链（不改变既有地物） ---- */
    landmass(118,-470,13,55,"环洲");       // 纵贯湖心的长洲
    islandTrees(118,-470,11,50,7);
    landmass(35,-505,22,12,"梁洲");        // 西侧
    islandTrees(35,-505,19,10,4);
    landmass(118,-396,23,10,"樱洲");       // 环洲之南
    islandTrees(118,-396,20,8,4);
    landmass(225,-455,21,12,"翠洲");       // 东侧
    islandTrees(225,-455,18,10,4);
    /* 桥：梁洲—(原岛1)—环洲—(原岛2)—翠洲，环洲—樱洲 */
    footBridge(50,-494,58,-468,3.4);       // 梁洲 ↔ 原岛1
    footBridge(91,-460,105,-462,3.4);      // 原岛1 ↔ 环洲
    footBridge(129,-506,141,-506,3.4);     // 环洲 ↔ 原岛2
    footBridge(190,-500,206,-468,3.4);     // 原岛2 ↔ 翠洲
    footBridge(118,-413,118,-405,3.2);     // 环洲 ↔ 樱洲

    /* ---- 游船码头 + 泊船 ---- */
    dock(150,-368,0);                       // 东南岸码头（玩家登船处）
    dock(28,-442,Math.PI/2);                // 西岸码头
    var moored1=makeBoat();moored1.g.position.set(150,0.24,-377);moored1.g.rotation.y=Math.PI;add(moored1.g);
    var moored2=makeBoat();moored2.g.position.set(148,0.24,-380);moored2.g.rotation.y=Math.PI+0.06;add(moored2.g);
    var moored3=makeBoat();moored3.g.position.set(21,0.24,-446);moored3.g.rotation.y=Math.PI/2;add(moored3.g);
    /* 巡游画舫两艘（开阔水域小回环） */
    var cruise=[];
    [[95,-545,30,0.035],[205,-408,26,0.045]].forEach(function(p2,i2){
      var b2=makeBoat();add(b2.g);
      cruise.push({g:b2.g,cx:p2[0],cz:p2[1],r:p2[2],sp:p2[3],ph:i2*2.3});
    });
    CITY._boats=cruise;
    /* 水域判定：湖椭圆内 且 不在任何洲/岛椭圆内（游船模式用） */
    var LANDS=[[70,-460,21,13],[165,-505,25,15],[118,-470,13,55],[35,-505,22,12],
               [118,-396,23,10],[225,-455,21,12]];
    CITY.lakeWater=function(x,z){
      var nx=(x-LAKE.cx)/LAKE.rx,nz=(z-LAKE.cz)/LAKE.rz;
      if(nx*nx+nz*nz>0.94)return false;
      for(var i2=0;i2<LANDS.length;i2++){
        var L=LANDS[i2];
        var lx=(x-L[0])/(L[2]+2.6),lz=(z-L[1])/(L[3]+2.6);
        if(lx*lx+lz*lz<1)return false;
      }
      return true;
    };

    COLLIDERS.push({x:120,z:-480,r:200});
  })();
  /* 鸡鸣寺：黄墙伽蓝 + 药师佛塔 */
  (function(){
    var wallM=new THREE.MeshStandardMaterial({color:0xd8b23a,roughness:0.9});
    var wall=new THREE.Mesh(new THREE.BoxGeometry(44,4,32),wallM);
    wall.position.set(200,2,-320);wall.castShadow=true;add(wall);
    var gate=new THREE.Mesh(new THREE.BoxGeometry(6,5.5,2),
      new THREE.MeshStandardMaterial({color:0x8a3a2a,roughness:0.8}));
    gate.position.set(200,2.75,-303.5);add(gate);
    // 佛塔（七层八面收分）
    var pagoda=new THREE.Group();
    var bodyM=new THREE.MeshStandardMaterial({color:0xd8c89a,roughness:0.85});
    var roofM=new THREE.MeshStandardMaterial({color:0x2a3a2e,roughness:0.75});
    var w0=7;
    for(var f=0;f<7;f++){
      var w2=w0*(1-f*0.09);
      var body=new THREE.Mesh(new THREE.CylinderGeometry(w2*0.62,w2*0.72,3.4,8),bodyM);
      body.position.y=f*3.9+1.7;body.castShadow=true;pagoda.add(body);
      var roof2=new THREE.Mesh(new THREE.ConeGeometry(w2*0.85,1.6,8),roofM);
      roof2.position.y=f*3.9+4.1;pagoda.add(roof2);
    }
    var tip2=new THREE.Mesh(new THREE.SphereGeometry(0.7,8,8),
      new THREE.MeshStandardMaterial({color:0xd8b03a,metalness:0.6,roughness:0.3}));
    tip2.position.y=27.6;pagoda.add(tip2);
    pagoda.position.set(200,2,-326);add(pagoda);
    for(var t3=0;t3<5;t3++)planeTree(178+t3*11,-296,rr(0.8,1.0),rr(0,6.28));
    COLLIDERS.push({x:200,z:-322,r:20});
  })();
  /* 紫金山：主峰群 + 中山陵 + 明孝陵 + 观景台 + 索道缆车 */
  var CABLE={A:new THREE.Vector3(388,15,72),B:new THREE.Vector3(520,141,-56),up:[],down:[],t:0};
  (function(){
    var matM=new THREE.MeshStandardMaterial({color:0x3d6b3a,roughness:1,flatShading:true});
    var matM2=new THREE.MeshStandardMaterial({color:0x4a7a42,roughness:1,flatShading:true});
    snowables.push({m:matM,c:new THREE.Color(0x3d6b3a)},{m:matM2,c:new THREE.Color(0x4a7a42)});
    var peaks=[[540,-70,150,190],[462,14,108,140],[608,-160,118,150],[640,26,84,110]];
    peaks.forEach(function(p,i){
      var cone=new THREE.Mesh(new THREE.ConeGeometry(p[3],p[2],9),i%2?matM2:matM);
      cone.position.set(p[0],p[2]/2,p[1]);cone.castShadow=true;add(cone);
      if(i===0)COLLIDERS.push({x:p[0],z:p[1],r:p[3]*0.92});
    });
    /* ---- 中山陵（东南坡：白台阶 + 蓝顶祭堂） ---- */
    (function(){
      var white=new THREE.MeshStandardMaterial({color:0xe8e6e0,roughness:0.85});
      var blue=new THREE.MeshStandardMaterial({color:0x1e4a7a,roughness:0.6});
      var bx=462,bz=70;
      for(var s=0;s<8;s++){
        var st=new THREE.Mesh(new THREE.BoxGeometry(30-s*1.8,1.6,6),white);
        st.position.set(bx,3+s*3.4,bz+s*8);st.castShadow=true;add(st);
      }
      var hall=new THREE.Mesh(new THREE.BoxGeometry(16,10,12),white);
      hall.position.set(bx,34,bz+66);hall.castShadow=true;add(hall);
      var roof=new THREE.Mesh(new THREE.ConeGeometry(12,7,4),blue);
      roof.position.set(bx,42.5,bz+66);roof.rotation.y=Math.PI/4;add(roof);
      var arch=new THREE.Mesh(new THREE.BoxGeometry(6,8,2),white);
      arch.position.set(bx,5,bz-6);add(arch);
      COLLIDERS.push({x:bx,z:bz+66,r:14});
      var sg=texSign({w:384,h:96,bg:"#1e4a7a",t1:"中山陵",t2:"SUN YAT-SEN MAUSOLEUM",fg:"#ffffff",fg2:"#d8e6f4",s1:44,s2:16});
      var sign=new THREE.Mesh(new THREE.PlaneGeometry(12,3),
        new THREE.MeshStandardMaterial({map:sg,emissive:0xffffff,emissiveMap:sg,emissiveIntensity:0,roughness:0.6}));
      sign.position.set(bx,7.5,bz-7.1);sign.rotation.y=Math.PI;add(sign);
      lampMats.push(sign.material);
    })();
    /* ---- 明孝陵（西坡：红门 + 黄墙享殿 + 石像路） ---- */
    (function(){
      var red=new THREE.MeshStandardMaterial({color:0xa8352a,roughness:0.8});
      var yellow=new THREE.MeshStandardMaterial({color:0xd8a83a,roughness:0.85});
      var mx=600,mz=-96;
      var gate=new THREE.Mesh(new THREE.BoxGeometry(12,7,3),red);
      gate.position.set(mx,6,mz-14);gate.castShadow=true;add(gate);
      var hall=new THREE.Mesh(new THREE.BoxGeometry(18,9,14),yellow);
      hall.position.set(mx,8,mz+8);hall.castShadow=true;add(hall);
      var roof=new THREE.Mesh(new THREE.ConeGeometry(13,6,4),
        new THREE.MeshStandardMaterial({color:0x3a5a3e,roughness:0.7}));
      roof.position.set(mx,15.5,mz+8);roof.rotation.y=Math.PI/4;add(roof);
      for(var a=0;a<6;a++){
        var an=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,6),
          new THREE.MeshStandardMaterial({color:0x9a948a,roughness:0.95}));
        an.position.set(mx-10-a*10,2.6,mz-4+((a%2)?3:-3));an.castShadow=true;add(an);
        var pl=new THREE.Mesh(new THREE.BoxGeometry(2.4,2,3.4),
          new THREE.MeshStandardMaterial({color:0x8a847a,roughness:0.95}));
        pl.position.set(mx-10-a*10,1,mz-4+((a%2)?3:-3));add(pl);
      }
      COLLIDERS.push({x:mx,z:mz+8,r:14});
    })();
    /* ---- 观景台（主峰顶，可俯瞰全城） ---- */
    (function(){
      var px=540,pz=-70,py=150;
      var deck=new THREE.Mesh(new THREE.CylinderGeometry(9,10,1.2,24),
        new THREE.MeshStandardMaterial({color:0xc9c4b8,roughness:0.85}));
      deck.position.set(px,py+0.6,pz);deck.castShadow=true;add(deck);
      var rail=new THREE.Mesh(new THREE.TorusGeometry(8.6,0.14,6,32),
        new THREE.MeshStandardMaterial({color:0x8a9098,metalness:0.5,roughness:0.4}));
      rail.rotation.x=Math.PI/2;rail.position.set(px,py+2.2,pz);add(rail);
      var scope=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,2.4,10),
        new THREE.MeshStandardMaterial({color:0x3a4a56,metalness:0.6,roughness:0.35}));
      scope.position.set(px,py+2.6,pz-3);scope.rotation.x=0.5;add(scope);
      var sg=texSign({w:384,h:96,bg:"#2a5b3a",t1:"紫金山观景台",t2:"PANORAMA TERRACE · 448M",fg:"#ffffff",fg2:"#d0e8d8",s1:40,s2:15});
      var sign=new THREE.Mesh(new THREE.PlaneGeometry(10,2.6),
        new THREE.MeshStandardMaterial({map:sg,emissive:0xffffff,emissiveMap:sg,emissiveIntensity:0,roughness:0.6}));
      sign.position.set(px,py+4.4,pz+8.4);add(sign);
      lampMats.push(sign.material);
    })();
    /* ---- 紫金山索道（缆车） ---- */
    (function(){
      // 山下站
      var stM=new THREE.MeshStandardMaterial({color:0xd8d2c4,roughness:0.85});
      var bs=new THREE.Mesh(new THREE.BoxGeometry(12,6,10),stM);
      bs.position.set(388,3,76);bs.castShadow=true;add(bs);
      var bsRoof=new THREE.Mesh(new THREE.BoxGeometry(14,0.6,12),
        new THREE.MeshStandardMaterial({color:0x8a3a2a,roughness:0.75}));
      bsRoof.position.set(388,6.4,76);add(bsRoof);
      var sg=texSign({w:384,h:96,bg:"#8a3a2a",t1:"紫金山索道",t2:"PURPLE MOUNTAIN CABLEWAY",fg:"#ffe8c0",fg2:"#f4d8b0",s1:42,s2:15});
      var sign=new THREE.Mesh(new THREE.PlaneGeometry(11,2.8),
        new THREE.MeshStandardMaterial({map:sg,emissive:0xffffff,emissiveMap:sg,emissiveIntensity:0,roughness:0.6}));
      sign.position.set(388,4.8,70.9);sign.rotation.y=Math.PI;add(sign);
      lampMats.push(sign.material);
      COLLIDERS.push({x:388,z:76,r:8});
      // 缆索（两条钢缆）
      var cableMat=new THREE.MeshStandardMaterial({color:0x5a6068,metalness:0.7,roughness:0.35});
      var dir=CABLE.B.clone().sub(CABLE.A);
      var len=dir.length();
      [-1.1,1.1].forEach(function(off){
        var line=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,len,6),cableMat);
        var mid=CABLE.A.clone().add(CABLE.B).multiplyScalar(0.5);
        var side=new THREE.Vector3().crossVectors(dir.clone().normalize(),new THREE.Vector3(0,1,0)).multiplyScalar(off);
        line.position.copy(mid).add(side);
        line.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());
        add(line);
      });
      // 支架
      for(var pt=0.22;pt<0.9;pt+=0.24){
        var pp=CABLE.A.clone().lerp(CABLE.B,pt);
        var gh=Math.max(0,150*(1-Math.hypot(pp.x-540,pp.z+70)/190));
        var py2=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.42,pp.y-gh+2,8),cableMat);
        py2.position.set(pp.x,(pp.y-gh+2)/2+gh,pp.z);py2.castShadow=true;add(py2);
      }
      // 轿厢：3 上行 + 3 下行
      var cabBody=new THREE.MeshStandardMaterial({color:0xd84848,roughness:0.5});
      var cabWin=new THREE.MeshStandardMaterial({color:0x2a3440,roughness:0.25,metalness:0.4});
      for(var ci=0;ci<3;ci++){
        ["up","down"].forEach(function(k){
          var g2=new THREE.Group();
          var hang=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.6,0.12),
            new THREE.MeshStandardMaterial({color:0x3a4048,metalness:0.6,roughness:0.4}));
          hang.position.y=-0.8;g2.add(hang);
          var body=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.1,1.9),cabBody);
          body.position.y=-2.6;body.castShadow=true;g2.add(body);
          var win=new THREE.Mesh(new THREE.BoxGeometry(2.24,0.8,1.94),cabWin);
          win.position.y=-2.2;g2.add(win);
          var o={g:g2,p:0};CABLE[k].push(o);add(g2);
        });
      }
    })();
    CITY._cable=CABLE;
  })();

  /* ================= 每帧更新 ================= */
  var signal={ns:"green",ew:"red",t:0};
  CITY.signal=signal;
  CITY.update=function(dt,ctx){
    // 路灯地面光斑
    poolMat.opacity=Math.min(1,ctx.nightF*1.1)*0.2*(1-ctx.env.snow*0.5);

    // 信号周期：南北绿12s → 黄2.5s → 东西绿12s → 黄2.5s
    signal.t+=dt;
    var cyc=signal.t%29;
    if(cyc<12){signal.ns="green";signal.ew="red";}
    else if(cyc<14.5){signal.ns="yellow";signal.ew="red";}
    else if(cyc<26.5){signal.ns="red";signal.ew="green";}
    else{signal.ns="red";signal.ew="yellow";}
    var blink=Math.sin(signal.t*9)>0;
    [[sigNS,signal.ns],[sigEW,signal.ew]].forEach(function(pair){
      pair[0].forEach(function(mats){
        mats[0].emissiveIntensity=pair[1]==="red"?1.7:0.06;
        mats[1].emissiveIntensity=pair[1]==="yellow"?(blink?1.7:0.35):0.06;
        mats[2].emissiveIntensity=pair[1]==="green"?1.7:0.06;
      });
    });

    // 行人（遵守信号灯：红灯停、绿灯行、黄灯等待；只在斑马线过街）
    var CWZ1=35.5,CWZ2=-11.5,CWX1=20,CWX2=70;
    for(var i=0;i<peds.length;i++){
      var p=peds[i];
      if(p.still){p.phase+=dt*0.6;p.g.position.y=p.baseY+Math.sin(p.phase)*0.008;continue;}
      p.phase+=dt*p.speed*2.6;
      var step=p.dir*p.speed*dt;
      if(p.axis==="z"){
        // 南北向行走：在斑马线（x≈20/70）横穿中山东路，ew 信号管控
        var pz2=p.g.position.z,nz=pz2+step;
        if(Math.abs(p.g.position.x-CWX1)<3.4||Math.abs(p.g.position.x-CWX2)<3.4){
          var inRoadZ=Math.abs(nz-12)<13.4;
          if(inRoadZ&&Math.abs(pz2-12)>=13.4&&signal.ew!=="red"){
            var stopZ=p.dir>0?-2.2:26.2;      // 路缘等待线
            nz=((p.dir>0&&pz2<=stopZ)||(p.dir<0&&pz2>=stopZ))?stopZ:pz2;
          }
        }else{
          // 不在斑马线：到东西向路缘折返（淮海路/石鼓路/户部街）
          [[95,11],[-62,11],[170,11]].forEach(function(rd){
            if(Math.abs(nz-rd[0])<rd[1]&&Math.abs(pz2-rd[0])>=rd[1]){p.dir*=-1;nz=pz2;}
          });
        }
        if(nz>240)nz=-220;if(nz<-220)nz=240;
        p.g.position.z=nz;
        p.g.rotation.y=p.dir>0?0:Math.PI;
      }else{
        // 东西向行走：在斑马线（z≈35.5/-11.5）横穿中山路，ns 信号管控
        var px3=p.g.position.x,nx=px3+step;
        var cw=Math.abs(p.g.position.z-CWZ1)<3.4||Math.abs(p.g.position.z-CWZ2)<3.4;
        if(cw){
          var inRoadX=Math.abs(nx-44)<13.4;
          if(inRoadX&&Math.abs(px3-44)>=13.4&&signal.ns!=="red"){
            var stopX=p.dir>0?30.4:57.6;      // 路缘等待线
            nx=((p.dir>0&&px3<=stopX)||(p.dir<0&&px3>=stopX))?stopX:px3;
          }
        }else if(Math.abs(nx-44)<13.4&&Math.abs(px3-44)>=13.4){
          p.dir*=-1;nx=px3;                    // 不走斑马线：中山路缘折返
        }
        // 太平南路/洪武北路（无斑马线）：路缘折返
        [[-94.5,11.5],[150,11.5]].forEach(function(rd){
          if(Math.abs(nx-rd[0])<rd[1]&&Math.abs(px3-rd[0])>=rd[1]){p.dir*=-1;nx=px3;}
        });
        if(nx>240)nx=-220;if(nx<-220)nx=240;
        p.g.position.x=nx;
        p.g.rotation.y=p.dir>0?Math.PI/2:-Math.PI/2;
      }
      p.g.position.y=p.baseY+Math.abs(Math.sin(p.phase))*0.035;
      var sw=Math.sin(p.phase)*0.55;
      p.legL.rotation.x=sw;p.legR.rotation.x=-sw;
      p.armL.rotation.x=-sw*0.7;p.armR.rotation.x=sw*0.7;
    }

    // 通用车辆推进（跟车 + 红灯 + 位移定向）
    function stepVehicle(v,gapMin,brake,acc,stopGap,dt,ride){
      var tgt=v.sp;
      if(v.rt){
        // 环岛转弯段限速（进入路口范围减速至巡航的 45%），转向更从容自然
        var tcx=v.ax==="x"?44:12;
        if(Math.abs(v.pos-tcx)<22)tgt=Math.min(tgt,v.sp*0.45);
      }
      if(v._ahead){
        var g2=(v._ahead.pos-v.pos)*v.dir-gapMin;
        if(g2<gapMin*1.6)tgt=Math.min(tgt,g2<gapMin*0.5?0:v._ahead.v*0.85);
      }
      if(v.stopBase!=null){
        var st=v.stopBase-stopGap*v.dir;
        var dp=(st-v.pos)*v.dir;
        var ph=v.ax==="x"?signal.ew:signal.ns;
        if(ph!=="green"&&dp>-1&&dp<32){
          tgt=Math.min(tgt,Math.max(0,(dp-1.5)*0.55));
        }
      }
      v.v+=Math.max(-brake*dt,Math.min(acc*dt,tgt-v.v));
      if(v.v<0.02&&tgt<0.5)v.v=0;
      v.pos+=v.dir*v.v*dt;
      if(v.pos>v.max)v.pos=v.min;if(v.pos<v.min)v.pos=v.max;
      return tgt;
    }
    function orient(v,dt,px,pz,ride){
      var nx3,nz3;
      if(v.ax==="x"){
        if(v.rt){
          var tz=(Math.abs(v.pos-44)<19)?(v.lat<12?2.4:21.6):v.lat;
          v.zs+=(tz-v.zs)*Math.min(1,dt*2.4);
          nx3=v.pos;nz3=v.zs;
        }else{nx3=v.pos;nz3=v.lat;}
      }else{
        if(v.rt){
          var tx2=(Math.abs(v.pos-12)<19)?(v.lat<44?34.6:53.4):v.lat;
          v.zs+=(tx2-v.zs)*Math.min(1,dt*2.4);
          nx3=v.zs;nz3=v.pos;
        }else{nx3=v.lat;nz3=v.pos;}
      }
      v.g.position.set(nx3,ride?0.05:0.06,nz3);
      var mvx=nx3-px,mvz=nz3-pz;
      if(mvx*mvx+mvz*mvz>1e-8){
        var tr=Math.atan2(mvx,mvz);
        var d3=tr-v.rot;
        while(d3>Math.PI)d3-=2*Math.PI;while(d3<-Math.PI)d3+=2*Math.PI;
        v.rot+=d3*Math.min(1,dt*6);
        v.g.rotation.y=v.rot;
      }
    }

    // 车流（按车道分组排序 → 前车引用）
    var lanes={};
    for(var j=0;j<traffic.length;j++){
      var c=traffic[j];
      var k=c.ax+"_"+c.lat;
      (lanes[k]||(lanes[k]=[])).push(c);
    }
    for(var k2 in lanes){
      var arr=lanes[k2];
      arr.sort(function(a,b){return (b.pos-a.pos)*arr[0].dir;});
      for(var j2=0;j2<arr.length;j2++){
        var c2=arr[j2];
        c2._ahead=j2>0?arr[j2-1]:null;
        var px=c2.g.position.x,pz=c2.g.position.z;
        stepVehicle(c2,4.6,13,7,15,dt,false);
        c2.wheels.forEach(function(w){w.rotation.x+=c2.v*dt*2;});
        orient(c2,dt,px,pz);
        if(c2.g.userData.hl)c2.g.userData.hl.emissiveIntensity=ctx.nightF*1.8;
      }
    }

    // 骑行人群
    var rlanes={};
    for(var rj=0;rj<riders.length;rj++){
      var rd=riders[rj];
      var rk=rd.ax+"_"+rd.lat;
      (rlanes[rk]||(rlanes[rk]=[])).push(rd);
    }
    for(var rk2 in rlanes){
      var rarr=rlanes[rk2];
      rarr.sort(function(a,b){return (b.pos-a.pos)*rarr[0].dir;});
      for(var rj2=0;rj2<rarr.length;rj2++){
        var rd2=rarr[rj2];
        rd2._ahead=rj2>0?rarr[rj2-1]:null;
        var px2=rd2.g.position.x,pz2=rd2.g.position.z;
        stepVehicle(rd2,2.4,11,5,16,dt,true);
        rd2.ph+=rd2.v*dt*2.4;
        var kick=Math.sin(rd2.ph)*0.5;
        rd2.legL.rotation.x=0.5+kick;rd2.legR.rotation.x=-0.3-kick;
        rd2.wheels.forEach(function(w){w.rotation.x+=rd2.v*dt*3;});
        orient(rd2,dt,px2,pz2,true);
      }
    }

    // 缆车轿厢（上行/下行循环）
    if(CITY._cable){
      var cb=CITY._cable;
      cb.t+=dt*0.016;
      for(var ci3=0;ci3<3;ci3++){
        var pu=(cb.t+ci3/3)%1;
        cb.up[ci3].p=pu;
        cb.up[ci3].g.position.lerpVectors(cb.A,cb.B,pu);
        var pdn=1-pu;
        cb.down[ci3].p=pdn;
        cb.down[ci3].g.position.lerpVectors(cb.A,cb.B,pdn);
      }
    }

    // 玄武湖巡游画舫（开阔水域小回环 + 随浪轻摇）
    if(CITY._boats){
      CITY._boats.forEach(function(b3){
        b3.ph+=b3.sp*dt;
        var bx2=b3.cx+Math.cos(b3.ph)*b3.r,bz2=b3.cz+Math.sin(b3.ph)*b3.r;
        b3.g.position.set(bx2,0.24+Math.sin(b3.ph*3.1)*0.03,bz2);
        b3.g.rotation.y=-b3.ph+Math.PI/2;
        b3.g.rotation.z=Math.sin(b3.ph*2.6)*0.022;
      });
    }
  };

  /* ============ 法桐合批收尾（实例化） ============ */
  (function(){
    var m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),
        v=new THREE.Vector3(),sc=new THREE.Vector3();
    function mk(geo,mat,arr,fn){
      if(!arr.length)return;
      var im=new THREE.InstancedMesh(geo,mat,arr.length);
      for(var i=0;i<arr.length;i++){
        fn(arr[i]);
        m4.compose(v,q,sc);
        im.setMatrixAt(i,m4);
      }
      im.instanceMatrix.needsUpdate=true;add(im);
    }
    mk(new THREE.CylinderGeometry(0.26,0.42,3.6,7),barkMat,TR,function(t){
      v.set(t.x,0.16+1.8*t.s,t.z);e.set(0,t.rot,0);q.setFromEuler(e);sc.set(t.s,t.s,t.s);
    });
    mk(new THREE.CylinderGeometry(0.1,0.17,2.2,5),barkMat,TRB,function(b){
      v.set(b.px,b.py,b.pz);e.set(b.rx,0,b.rz);q.setFromEuler(e);sc.set(b.s,b.s,b.s);
    });
    var groups={};
    TRL.forEach(function(l){var k=l.m+"_"+l.g;(groups[k]||(groups[k]=[])).push(l);});
    Object.keys(groups).forEach(function(k2){
      var parts=k2.split("_");var mi=+parts[0],gi=+parts[1];
      mk(gi?leafGeoB:leafGeoA,leafMats[mi],groups[k2],function(l){
        v.set(l.px,l.py,l.pz);e.set(l.rx,l.ry,l.rz);q.setFromEuler(e);
        sc.set(l.r,l.r*l.sh,l.r);
      });
    });
    var pitMat=new THREE.MeshStandardMaterial({color:0x3a3630,roughness:1});
    var ringMat=new THREE.MeshStandardMaterial({color:0x8f9498,roughness:0.9});
    var qp=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0));
    if(TRP.length){
      var imP=new THREE.InstancedMesh(new THREE.PlaneGeometry(2.4,2.4),pitMat,TRP.length);
      var imR=new THREE.InstancedMesh(new THREE.BoxGeometry(2.6,0.12,2.6),ringMat,TRP.length);
      for(var i=0;i<TRP.length;i++){
        m4.compose(v.set(TRP[i].x,0.178,TRP[i].z),qp,sc.set(1,1,1));
        imP.setMatrixAt(i,m4);
        m4.compose(v.set(TRP[i].x,0.19,TRP[i].z),q.setFromEuler(new THREE.Euler(0,0,0)),sc.set(1,1,1));
        imR.setMatrixAt(i,m4);
      }
      imP.instanceMatrix.needsUpdate=true;imR.instanceMatrix.needsUpdate=true;
      add(imP);add(imR);
    }
  })();

  CITY.mats={lit:litMats,lamp:lampMats,sign:signMats,snow:snowables,wet:wetMats};
  CITY.colliders=COLLIDERS;
  CITY.boxes=BOXES;
  CITY.road=ROAD;
  return CITY;
};
window.CITY=CITY;
})();
