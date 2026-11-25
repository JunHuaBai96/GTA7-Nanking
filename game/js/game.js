/* ============ 南京 · 云游金陵 游戏主逻辑 ============ */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};
var SAVE_KEY="njtour-save-v1";
var SCENE_W=1600,SCENE_H=900;
var state=null;

/* ---------- 存档 ---------- */
function freshState(){
 var s={score:0,unlocked:1,levels:{}};
 window.LANDMARKS.forEach(function(l){s.levels[l.id]={intro:false,photoBest:0,photoStars:0,quizDone:false,quizPts:0,quizCorrect:0};});
 return s;}
function load(){
 try{var raw=localStorage.getItem(SAVE_KEY);
  if(!raw)return null;
  var s=JSON.parse(raw);
  if(!s||!s.levels)return null;
  return s;}catch(e){return null;}}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){}}
function isDone(id){var l=state.levels[id];return l.intro&&l.photoStars>0&&l.quizDone;}

/* ---------- 小工具 ---------- */
function toast(msg){var t=$("toast");t.innerHTML=msg;t.classList.remove("off");
 clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.add("off");},2200);}
function esc(s){return String(s);}
function updateHUD(){$("score-n").textContent=state.score;
 var n=0;window.LANDMARKS.forEach(function(l){if(isDone(l.id))n++;});
 $("stamp-n").textContent=n;}
function countUp(el,from,to){if(from===to)return;var t0=null;
 function step(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/700);
  el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));
  if(p<1)requestAnimationFrame(step);}
 requestAnimationFrame(step);}

/* ---------- 启动 ---------- */
function boot(){
 $("load-art").innerHTML=window.SCENES.cover();
 // 预渲染场景，喂进度条
 var ids=Object.keys(window.SCENES);var done=0;
 var total=ids.length+3;
 function tick(label){done++;
  $("load-fill").style.width=Math.round(done/total*100)+"%";
  $("load-text").textContent=label||("准备素材 "+done+"/"+total);
  if(done>=total){$("load-text").textContent="万事俱备，即刻出发";
   $("start").classList.add("ready");$("start").disabled=false;}}
 ids.forEach(function(k){tick();setTimeout(function(){window.SCENES[k]();},30);});
 tick("校验地图");tick("装订行程单");tick("加盖印章");
 var s=load();
 if(s)noteSave();
}
/* 启动时提示有存档 */
function noteSave(){
 var s=load();if(!s)return;
 var note=document.querySelector("#load-note .zh");
 if(note&&s.score>0){note.textContent="检测到存档：得分 "+s.score+" · 点击开始继续游";}}

/* ---------- 开始 ---------- */
function start(){
 var s=load();
 state=s||freshState();
 $("load").classList.add("off");
 $("app").classList.remove("off");
 renderMap();
 renderTasks();renderStamps();updateHUD();
 if(allDone()){showFinal();}
 else{toast("欢迎来到南京 · 先去 "+window.LANDMARKS[state.unlocked-1].name+" 看看吧");}
}
function allDone(){return window.LANDMARKS.every(function(l){return isDone(l.id);});}

/* ---------- 地图 ---------- */
function renderMap(){
 window.LANDMARKS.forEach(function(l,i){
  var lv=state.levels[l.id];
  var done=isDone(l.id);
  var unlocked=i<state.unlocked;
  l.state=done?"done":(unlocked?"current":"locked");
  l.idx=i;
 });
 var svg=window.SCENES.map();
 var mv=$("map-view");mv.innerHTML=svg;
 var svgEl=mv.querySelector("svg");
 svgEl.querySelectorAll(".mk").forEach(function(g){
  g.addEventListener("click",function(){
   var id=g.getAttribute("data-id");
   var lm=window.LANDMARKS.filter(function(x){return x.id===id;})[0];
   if(lm.idx>=state.unlocked){toast("这一站还没解锁 · 先完成前面 "+(lm.idx-state.unlocked+1)+" 站");return;}
   travelTo(lm);
  });
 });
}
function travelTo(lm){
 var mv=$("map-view");var svgEl=mv.querySelector("svg");
 // 旅程动画
 var prev=window.LANDMARKS[Math.max(0,lm.idx-1)];
 if(lm.idx>0){
  var x1=prev.x,y1=prev.y,x2=lm.x,y2=lm.y;
  var mx=(x1+x2)/2,my=(y1+y2)/2-40;
  var path=document.createElementNS("http://www.w3.org/2000/svg","path");
  path.setAttribute("d","M"+x1+" "+y1+" Q"+mx+" "+my+" "+x2+" "+y2);
  path.setAttribute("id","travel-line");
  path.setAttribute("stroke","#e8c476");path.setAttribute("stroke-width","3.5");
  path.setAttribute("fill","none");path.setAttribute("opacity",".9");
  svgEl.appendChild(path);
  var dot=document.createElementNS("http://www.w3.org/2000/svg","circle");
  dot.setAttribute("r","7");dot.setAttribute("fill","#e8c476");dot.setAttribute("stroke","#0e1526");
  dot.setAttribute("stroke-width","2");svgEl.appendChild(dot);
  var len=path.getTotalLength();var t0=null;var DUR=1100;
  function step(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/DUR);
   var e=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
   var pt=path.getPointAtLength(len*e);
   dot.setAttribute("cx",pt.x);dot.setAttribute("cy",pt.y);
   if(p<1)requestAnimationFrame(step);
   else{path.remove();dot.remove();showCard(lm);}}
  requestAnimationFrame(step);
 }else{showCard(lm);}
}

/* ---------- 景点介绍卡 ---------- */
function showCard(lm){
 var lv=state.levels[lm.id];
 $("card-art").innerHTML=window.SCENES[lm.id]();
 $("card-title").textContent=lm.name;
 $("card-en").textContent=lm.en+" · "+lm.photo.sceneHint;
 $("card-text").innerHTML=lm.intro+'<br><span style="opacity:.6;font-size:12.5px;letter-spacing:.05em">'+lm.introEn+"</span>";
 $("card-facts").innerHTML=lm.facts.map(function(f){return "<i>"+f+"</i>";}).join("");
 var go=$("card-go");
 go.innerHTML=lv.quizDone?"再去拍一张 <span class='en'>Snap again</span>":"进入打卡 <span class='en'>Take a photo</span>";
 go.onclick=function(){$("card").classList.add("off");$("card-art").innerHTML="";openPhoto(lm);};
 $("card").classList.remove("off");
 // 介绍加分（一次性）
 if(!lv.intro){lv.intro=true;var old=state.score;state.score+=10;updateHUD();countUp($("score-n"),old,state.score);save();
  setTimeout(function(){toast("读完介绍 +10 分");},300);}
 renderTasks();
}

/* ---------- 拍照打卡 ---------- */
var ph={lm:null,s:1,tx:0,ty:0,fit:1,dragging:false,lx:0,ly:0};
function openPhoto(lm){
 ph.lm=lm;ph.s=1;ph.tx=0;ph.ty=0;
 $("photo-scene").innerHTML='<div class="scene-wrap">'+window.SCENES[lm.id]()+"</div>";
 var wrap=$("photo-scene").querySelector(".scene-wrap");
 wrap.style.width=SCENE_W+"px";wrap.style.height=SCENE_H+"px";
 wrap.querySelector("svg").setAttribute("width",SCENE_W);
 wrap.querySelector("svg").setAttribute("height",SCENE_H);
 $("vf-hint").textContent=lm.photo.hint;
 $("photo-tip").textContent=lm.photo.sceneHint+" · "+lm.photo.hint+"（拖动画面 / 滚轮缩放 / 圆钮快门）";
 // 取景框形状跟随目标，方便完整构图
 var ar=lm.photo.tw/lm.photo.th;
 var vf=$("viewfinder");
 vf.style.aspectRatio=String(ar);
 vf.style.width="min(60vw, "+Math.round(60*ar)+"vh)";
 $("ph-result").classList.add("off");
 $("photo").classList.remove("off");
 fitPhoto();
 bindPhoto();
}
function fitPhoto(){
 var v=$("photo-scene").getBoundingClientRect();
 ph.fit=Math.min(v.width/SCENE_W,v.height/SCENE_H)*1.15;
 ph.s=ph.fit;
 ph.tx=(v.width-SCENE_W*ph.s)/2;
 ph.ty=(v.height-SCENE_H*ph.s)/2;
 clampPhoto();applyPhoto();}
function clampPhoto(){
 var v=$("photo-scene").getBoundingClientRect();
 var w=SCENE_W*ph.s,h=SCENE_H*ph.s;
 // 场景须始终盖住屏幕中心点：取景框居中，任意构图均可达
 var cx=v.width/2,cy=v.height/2;
 ph.tx=Math.max(cx-w,Math.min(cx,ph.tx));
 ph.ty=Math.max(cy-h,Math.min(cy,ph.ty));}
function applyPhoto(){
 var wrap=$("photo-scene").querySelector(".scene-wrap");
 if(wrap)wrap.style.transform="translate("+ph.tx+"px,"+ph.ty+"px) scale("+ph.s+")";}
function zoomAt(cx,cy,f){
 var ns=Math.max(ph.fit*0.85,Math.min(ph.fit*4,ph.s*f));
 var k=ns/ph.s;
 ph.tx=cx-(cx-ph.tx)*k;ph.ty=cy-(cy-ph.ty)*k;ph.s=ns;
 clampPhoto();applyPhoto();}
function bindPhoto(){
 var sc=$("photo-scene");
 if(sc._bound)return;sc._bound=true;
 sc.addEventListener("pointerdown",function(e){ph.dragging=true;ph.lx=e.clientX;ph.ly=e.clientY;sc.classList.add("dragging");sc.setPointerCapture(e.pointerId);});
 sc.addEventListener("pointermove",function(e){if(!ph.dragging)return;
  ph.tx+=e.clientX-ph.lx;ph.ty+=e.clientY-ph.ly;ph.lx=e.clientX;ph.ly=e.clientY;clampPhoto();applyPhoto();});
 sc.addEventListener("pointerup",function(){ph.dragging=false;sc.classList.remove("dragging");});
 sc.addEventListener("wheel",function(e){e.preventDefault();
  var r=sc.getBoundingClientRect();
  zoomAt(e.clientX-r.left,e.clientY-r.top,e.deltaY<0?1.15:0.87);},{passive:false});
 $("ph-zoom-in").onclick=function(){var r=sc.getBoundingClientRect();zoomAt(r.width/2,r.height/2,1.3);};
 $("ph-zoom-out").onclick=function(){var r=sc.getBoundingClientRect();zoomAt(r.width/2,r.height/2,0.77);};
 $("ph-shutter").onclick=takeShot;
 $("ph-x").onclick=function(){$("photo").classList.add("off");renderMap();};
}
function takeShot(){
 // 取景框（屏幕坐标）→ 场景坐标
 var vf=$("viewfinder").getBoundingClientRect();
 var sc=$("photo-scene").getBoundingClientRect();
 var rx=(vf.left-sc.left-ph.tx)/ph.s, ry=(vf.top-sc.top-ph.ty)/ph.s;
 var rw=vf.width/ph.s, rh=vf.height/ph.s;
 var t=ph.lm.photo;
 // F1 完整度：目标入镜比例 与 取景框命中率 的调和平均
 var ix=Math.max(0,Math.min(rx+rw,t.tx+t.tw)-Math.max(rx,t.tx));
 var iy=Math.max(0,Math.min(ry+rh,t.ty+t.th)-Math.max(ry,t.ty));
 var inter=ix*iy;
 var f1=2*inter/(t.tw*t.th+rw*rh);
 var stars=f1>=0.72?3:f1>=0.45?2:f1>=0.22?1:0;
 var pts=[0,20,40,60][stars];
 // 快门闪光
 var fl=$("flash");fl.classList.add("on");setTimeout(function(){fl.classList.remove("on");},60);
 setTimeout(function(){
  var lv=state.levels[ph.lm.id];
  $("ph-stars").textContent=stars?("★".repeat(stars)+"☆".repeat(3-stars)):"脱靶了…";
  var msg=stars?("构图完整度 "+Math.round(f1*100)+"% · 拍照得分 +"+pts)
               :("没对上机位，把目标框进取景框再按快门");
  var gained=0;
  if(pts>lv.photoBest){gained=pts-lv.photoBest;lv.photoBest=pts;}
  if(stars>lv.photoStars)lv.photoStars=stars;
  if(gained){var old=state.score;state.score+=gained;updateHUD();countUp($("score-n"),old,state.score);save();}
  $("ph-score").textContent=msg;
  $("ph-done").textContent=lv.quizDone?"回地图":"完成打卡";
  $("ph-btns").style.display="flex";
  $("ph-retry").style.display="";
  $("ph-result").classList.remove("off");
  renderTasks();
 },240);
}
$("ph-retry").onclick=function(){$("ph-result").classList.add("off");};
$("ph-done").onclick=function(){
 $("photo").classList.add("off");
 var lm=ph.lm,lv=state.levels[lm.id];
 if(!lv.quizDone){openQuiz(lm);}
 else{renderMap();toast("打卡已全部完成 · 可随时回来重拍");}
};

/* ---------- 知识问答 ---------- */
var qz={lm:null,i:0,correct:0,pts:0};
function openQuiz(lm){
 qz.lm=lm;qz.i=0;qz.correct=0;qz.pts=0;
 $("quiz-loc").textContent=lm.name+" · 知识问答";
 $("quiz").classList.remove("off");
 renderQ();
}
function renderQ(){
 var lm=qz.lm,q=lm.quiz[qz.i];
 $("quiz-num").textContent="第 "+(qz.i+1)+" / "+lm.quiz.length+" 题 · 答对 +20";
 $("quiz-q").textContent=q.q;
 $("quiz-fb").innerHTML="";
 var box=$("quiz-opts");box.innerHTML="";
 q.opts.forEach(function(op,i){
  var b=document.createElement("button");
  b.className="opt";b.textContent=String.fromCharCode(65+i)+". "+op;
  b.onclick=function(){answer(b,i);};
  box.appendChild(b);
 });
}
function answer(btn,i){
 var q=qz.lm.quiz[qz.i];
 var box=$("quiz-opts");
 Array.prototype.forEach.call(box.children,function(c){c.disabled=true;});
 var right=i===q.a;
 if(right){btn.classList.add("right");qz.correct++;qz.pts+=20;
  $("quiz-fb").innerHTML="<b>答对了！</b>"+q.fb;}
 else{btn.classList.add("wrong");
  box.children[q.a].classList.add("right");
  $("quiz-fb").innerHTML="正确答案是 "+String.fromCharCode(65+q.a)+"："+q.opts[q.a]+"。"+q.fb;}
 qz.i++;
 if(qz.i<qz.lm.quiz.length){setTimeout(renderQ,1500);}
 else{setTimeout(finishQuiz,1500);}
}
function finishQuiz(){
 var lm=qz.lm,lv=state.levels[lm.id];
 var first=!lv.quizDone;
 if(first){lv.quizDone=true;lv.quizCorrect=qz.correct;lv.quizPts=qz.pts;
  var old=state.score;state.score+=qz.pts;updateHUD();countUp($("score-n"),old,state.score);}
 $("quiz").classList.add("off");
 save();renderTasks();
 showResult(lm,first?qz.pts:0);
}

/* ---------- 打卡结算 ---------- */
function showResult(lm,quizPts){
 var lv=state.levels[lm.id];
 $("result-stamp").innerHTML="<span>"+lm.name.slice(0,2)+"<br>"+(lm.name.slice(2)||"印")+"</span>";
 // 单字印章：取最后两字更像章
 var chars=lm.name.replace("长江大桥","大桥");
 $("result-stamp").innerHTML="<span>"+chars+"</span>";
 $("result-lines").innerHTML=
  "游览介绍 <i>+10</i><br>拍照打卡 <i>"+("★".repeat(lv.photoStars)||"未拍")+" +"+lv.photoBest+"</i><br>"+
  (lv.quizDone?("知识问答 <i>答对 "+lv.quizCorrect+"/3 · +"+lv.quizPts+"</i>"):"知识问答 <i>跳过</i>");
 $("result-total").textContent="本站累计 +"+(10+lv.photoBest+(lv.quizDone?lv.quizPts:0))+" · 总分 "+state.score;
 var go=$("result-go");
 var remaining=window.LANDMARKS.filter(function(l){return !isDone(l.id);});
 if(allDone()){
  go.textContent="查看通关成绩";
  go.onclick=function(){$("result").classList.add("off");showFinal();};
 }else{
  var next=window.LANDMARKS[Math.min(lm.idx+1,window.LANDMARKS.length-1)];
  var newly=lm.idx+1===state.unlocked-1||lm.idx+1<state.unlocked;
  go.textContent="下一站 · "+(isDone(next.id)?next.name+"（已集章）":next.name);
  go.onclick=function(){$("result").classList.add("off");renderMap();toast("已解锁："+next.name);};
 }
 // 解锁下一站
 if(lm.idx+1>state.unlocked-1&&isDone(lm.id)&&lm.idx+1<window.LANDMARKS.length){
  state.unlocked=lm.idx+2;
 }
 save();renderMap();renderTasks();renderStamps();updateHUD();
 $("result").classList.remove("off");
}

/* ---------- 通关 ---------- */
function showFinal(){
 var totalQuiz=0;
 window.LANDMARKS.forEach(function(l){totalQuiz+=state.levels[l.id].quizCorrect;});
 $("final-lines").innerHTML=
  "印章 "+window.LANDMARKS.length+" / "+window.LANDMARKS.length+" · 全部集齐<br>"+
  "答题全对数累计 <b>"+totalQuiz+" / 24</b> 题<br>"+
  "拍照最高单张 "+Math.max.apply(null,window.LANDMARKS.map(function(l){return state.levels[l.id].photoBest;}))+" 分";
 $("final-total").textContent="最终得分 "+state.score;
 $("final").classList.remove("off");
 save();
}
$("final-again").onclick=function(){
 if(confirm("清空当前成绩，重新开始？")){localStorage.removeItem(SAVE_KEY);location.reload();}
};

/* ---------- 行程单 / 集章册 ---------- */
function renderTasks(){
 var box=$("tasks-list");box.innerHTML="";
 window.LANDMARKS.forEach(function(l,i){
  var lv=state.levels[l.id];
  var done=isDone(l.id);
  var unlocked=i<state.unlocked;
  var st=done?"✓":(unlocked?"●":"🔒");
  var pts=10+lv.photoBest+(lv.quizDone?lv.quizPts:0);
  var d=document.createElement("div");
  d.className="task-item"+(done?" done":unlocked?" cur":" locked");
  d.innerHTML="<span class='st'>"+st+"</span><span class='nm'>"+(i+1)+". "+l.name+(done?"":"")+"</span><span class='pt'>"+(done?"+"+pts:unlocked?"进行中":"未解锁")+"</span>";
  box.appendChild(d);
 });
}
function renderStamps(){
 var box=$("stamps-grid");box.innerHTML="";
 window.LANDMARKS.forEach(function(l){
  var done=isDone(l.id);
  var d=document.createElement("div");
  d.className="stamp-cell"+(done?" got":"");
  d.innerHTML=done?"<span class='seal'>"+l.name+"</span>":"<span>"+(l.idx>=state.unlocked?"未解锁":"待打卡")+"</span>";
  box.appendChild(d);
 });
}
$("btn-tasks").onclick=function(){$("tasks").classList.toggle("off");$("stamps-panel").classList.add("off");};
$("btn-stamps").onclick=function(){$("stamps-panel").classList.toggle("off");$("tasks").classList.add("off");};
document.querySelectorAll(".panel-x").forEach(function(b){
 b.onclick=function(){$(b.getAttribute("data-close")).classList.add("off");};
});
document.addEventListener("keydown",function(e){
 if(e.key==="Escape"){$("tasks").classList.add("off");$("stamps-panel").classList.add("off");}
});
$("reset-save").onclick=function(){
 if(confirm("确认清空存档？")){localStorage.removeItem(SAVE_KEY);location.reload();}
};

/* ---------- 事件绑定 & 启动 ---------- */
$("start").onclick=start;
window.__NJ={ph:ph,clampPhoto:clampPhoto,applyPhoto:applyPhoto}; // 内部调试句柄
boot();noteSave();
})();
