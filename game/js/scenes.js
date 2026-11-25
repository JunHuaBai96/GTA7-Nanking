/* ============ 景点 SVG 场景库（全部手绘矢量，无外部素材） ============ */
/* 场景统一 viewBox="0 0 1600 900"，SCENES[id].svg 为画面，target 为取景目标区，hint 为拍摄提示 */
(function(){
"use strict";

/* ---------- 公用小件 ---------- */
function clouds(x,y,s,fill){var o="";
  o+='<g fill="'+fill+'" opacity=".8"><ellipse cx="'+x+'" cy="'+y+'" rx="'+70*s+'" ry="'+18*s+'"/><ellipse cx="'+(x+50*s)+'" cy="'+(y-14*s)+'" rx="'+50*s+'" ry="'+14*s+'"/><ellipse cx="'+(x-55*s)+'" cy="'+(y-8*s)+'" rx="'+40*s+'" ry="'+12*s+'"/></g>';
  return o;}
function birds(x,y,s,fill){return '<g stroke="'+fill+'" stroke-width="'+(2.5*s)+'" fill="none" opacity=".7"><path d="M'+x+' '+y+' q'+(10*s)+' -'+(9*s)+' '+(20*s)+' 0 q'+(10*s)+' -'+(9*s)+' '+(20*s)+' 0"/><path d="M'+(x+46*s)+' '+(y+10*s)+' q'+(8*s)+' -'+(7*s)+' '+(16*s)+' 0 q'+(8*s)+' -'+(7*s)+' '+(16*s)+' 0"/></g>';}
function pine(x,y,h,leaf,trunk){var w=h*0.5,o='<g><rect x="'+(x-w*0.06)+'" y="'+(y-h*0.35)+'" width="'+(w*0.12)+'" height="'+(h*0.36)+'" fill="'+trunk+'"/>';
  var t=['M'+x+' '+(y-h)+' L'+(x-w*0.36)+' '+(y-h*0.42)+' L'+(x+w*0.36)+' '+(y-h*0.42)+' Z',
         'M'+x+' '+(y-h*0.82)+' L'+(x-w*0.46)+' '+(y-h*0.16)+' L'+(x+w*0.46)+' '+(y-h*0.16)+' Z'];
  t.forEach(function(d){o+='<path d="'+d+'" fill="'+leaf+'"/>';});
  o+='</g>';return o;}
function ginkgo(x,y,h,leaf,trunk){var r=h*0.34;
  return '<g><rect x="'+(x-h*0.05)+'" y="'+(y-h*0.4)+'" width="'+(h*0.1)+'" height="'+(h*0.42)+'" fill="'+trunk+'"/><circle cx="'+x+'" cy="'+(y-h*0.62)+'" r="'+r+'" fill="'+leaf+'"/><circle cx="'+(x-r*0.75)+'" cy="'+(y-h*0.5)+'" r="'+(r*0.7)+'" fill="'+leaf+'" opacity=".9"/><circle cx="'+(x+r*0.75)+'" cy="'+(y-h*0.5)+'" r="'+(r*0.7)+'" fill="'+leaf+'" opacity=".9"/></g>';}

/* ---------- 1 玄武湖 ---------- */
function xuanwulake(){
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">';
 o+='<defs><linearGradient id="xw-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aee1e6"/><stop offset=".6" stop-color="#e6f3e9"/><stop offset="1" stop-color="#fdf2d8"/></linearGradient>'
  +'<linearGradient id="xw-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fc4cc"/><stop offset="1" stop-color="#3f8fa0"/></linearGradient></defs>';
 o+='<rect width="1600" height="560" fill="url(#xw-sky)"/>';
 o+='<circle cx="1180" cy="170" r="72" fill="#ffe9a8" opacity=".95"/><circle cx="1180" cy="170" r="95" fill="#ffe9a8" opacity=".25"/>';
 o+=clouds(300,150,1.2,'#ffffff')+clouds(760,110,0.9,'#ffffff')+clouds(1350,240,1,'#f2f7f0');
 /* 远山（紫金山剪影） */
 o+='<path d="M900 560 Q1050 430 1200 520 Q1300 460 1450 545 L1600 520 L1600 560 Z" fill="#5f8f7c" opacity=".7"/>';
 /* 鸡鸣寺塔剪影 */
 o+='<g opacity=".85" fill="#4a6f75"><rect x="1385" y="430" width="26" height="130"/><path d="M1372 430 L1398 392 L1424 430 Z"/><rect x="1396" y="352" width="6" height="40"/></g>';
 /* 明城墙 */
 o+='<g><rect x="980" y="470" width="620" height="90" fill="#8a8378"/><rect x="980" y="460" width="620" height="14" fill="#77706a"/>';
 for(var i=0;i<31;i++){o+='<rect x="'+(990+i*20)+'" y="452" width="12" height="10" fill="#77706a"/>';}
 o+='<rect x="980" y="470" width="620" height="90" fill="none" stroke="#6e675f" stroke-width="3"/>';
 for(var j=0;j<12;j++){o+='<rect x="'+(1010+j*50)+'" y="'+(500+(j%2)*22)+'" width="26" height="14" rx="2" fill="#9c948a"/>';}
 o+='</g>';
 /* 湖面 */
 o+='<rect y="560" width="1600" height="340" fill="url(#xw-w)"/>';
 o+='<g fill="#ffffff" opacity=".35"><ellipse cx="420" cy="620" rx="180" ry="8"/><ellipse cx="900" cy="700" rx="240" ry="9"/><ellipse cx="1250" cy="640" rx="150" ry="7"/></g>';
 /* 五洲绿岛 */
 o+='<g><path d="M60 660 Q220 600 420 650 Q560 620 700 668 L700 720 L60 720 Z" fill="#5da47a"/><path d="M60 720 Q260 680 480 712 Q620 690 760 718 L760 780 L60 780 Z" fill="#4f9468" opacity=".9"/></g>';
 o+=pine(180,640,90,'#3e7f57','#5b4632')+pine(300,650,110,'#3e7f57','#5b4632')+pine(430,655,80,'#468a60','#5b4632')+pine(560,645,100,'#3e7f57','#5b4632');
 /* 荷叶莲花 */
 o+='<g><ellipse cx="1080" cy="790" rx="52" ry="16" fill="#4f9468"/><ellipse cx="1180" cy="820" rx="62" ry="18" fill="#5da47a"/><ellipse cx="1265" cy="785" rx="46" ry="14" fill="#4f9468"/>';
 o+='<path d="M1160 812 q6 -34 0 -46 q-6 12 0 46" stroke="#4f9468" stroke-width="5" fill="none"/><circle cx="1160" cy="758" r="15" fill="#f7b6c8"/><circle cx="1160" cy="758" r="6" fill="#fde08a"/>';
 o+='<path d="M1262 778 q5 -26 0 -36 q-5 10 0 36" stroke="#4f9468" stroke-width="4" fill="none"/><circle cx="1262" cy="736" r="12" fill="#fbe3ec"/></g>';
 /* 画舫 */
 o+='<g><path d="M760 770 q110 34 220 0 l-16 34 q-94 26 -188 0 Z" fill="#a34e3c"/><rect x="800" y="712" width="140" height="56" rx="8" fill="#c96f4a"/><path d="M788 712 q84 -44 164 0 Z" fill="#e8c476"/><rect x="836" y="726" width="22" height="34" fill="#7a3b2c"/><rect x="882" y="726" width="22" height="34" fill="#7a3b2c"/><path d="M700 806 q180 14 350 0" stroke="#2e6b7c" stroke-width="6" opacity=".5" fill="none"/></g>';
 o+=birds(500,200,1,'#5f8f7c')+birds(640,240,0.7,'#5f8f7c');
 o+='</svg>';return o;}

/* ---------- 2 鸡鸣寺 ---------- */
function jimingsi(){
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">';
 o+='<defs><linearGradient id="jm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde3ec"/><stop offset=".55" stop-color="#fdf2d8"/><stop offset="1" stop-color="#f9d9a7"/></linearGradient></defs>';
 o+='<rect width="1600" height="620" fill="url(#jm-sky)"/>';
 o+='<circle cx="260" cy="180" r="70" fill="#fff3d6" opacity=".9"/>';
 o+=clouds(900,140,1.1,'#ffeef2')+clouds(1350,220,0.9,'#ffffff');
 /* 远山与城墙 */
 o+='<path d="M0 600 Q220 470 460 560 Q640 500 840 590 L840 620 L0 620 Z" fill="#7f9e8b" opacity=".6"/>';
 o+='<rect x="820" y="540" width="780" height="80" fill="#8a8378"/>';
 for(var i=0;i<38;i++){o+='<rect x="'+(830+i*20)+'" y="532" width="12" height="10" fill="#77706a"/>';}
 /* 药师佛塔（主角） */
 var tiers=[["520",150],["430",128],["340",106],["250",86],["170",64],["100",48]];
 o+='<g>';
 tiers.forEach(function(t,i){var y=+t[0],w=+t[1],up=-8*i;
  o+='<path d="M'+(800-w/2-14)+' '+y+' L'+(800-w/2+22)+' '+(y-26)+' L'+(800+w/2-22)+' '+(y-26)+' L'+(800+w/2+14)+' '+y+' Z" fill="#e0a94e"/>';
  o+='<rect x="'+(800-w/2)+'" y="'+(y-96)+'" width="'+w+'" height="'+(w*0.62)+'" fill="#f6d878"/>';
  o+='<path d="M'+(800-w/2-16)+' '+(y-96)+' Q800 '+(y-96-26)+' '+(800+w/2+16)+' '+(y-96)+' L'+(800+w/2+10)+' '+(y-86)+' Q800 '+(y-96-16)+' '+(800+w/2-10)+' '+(y-86)+' Z" fill="#c96f4a"/>';
  o+='<rect x="'+(800-w/2+18)+'" y="'+(y-78)+'" width="'+Math.max(2,w-36)+'" height="'+(w*0.32)+'" fill="#7a4f2e"/>';
  o+='<rect x="'+(800-w/2+30)+'" y="'+(y-70)+'" width="'+Math.max(2,w-60)+'" height="'+(w*0.16)+'" fill="#5c3a22"/>';
 });
 o+='<path d="M776 130 Q800 96 824 130 Z" fill="#c96f4a"/><rect x="796" y="52" width="8" height="60" fill="#7a4f2e"/><circle cx="800" cy="44" r="9" fill="#e8c476"/></g>';
 /* 黄墙大殿 */
 o+='<g><rect x="330" y="470" width="300" height="150" fill="#f6d878"/><path d="M300 470 Q480 400 660 470 L640 486 Q480 428 320 486 Z" fill="#c96f4a"/><rect x="440" y="520" width="80" height="100" fill="#7a4f2e"/><rect x="360" y="500" width="40" height="60" fill="#8a5c38"/><rect x="560" y="500" width="40" height="60" fill="#8a5c38"/></g>';
 /* 寺墙 */
 o+='<rect x="980" y="560" width="330" height="60" fill="#f0cf76"/><rect x="980" y="552" width="330" height="10" fill="#c96f4a"/><rect x="1120" y="540" width="70" height="24" rx="4" fill="#c96f4a"/>';
 /* 樱花前景 */
 o+='<rect y="620" width="1600" height="280" fill="#e8b4c4"/>';
 o+='<rect y="620" width="1600" height="24" fill="#d79fb2"/>';
 /* 樱花树 */
 function sakura(x,s){var r=60*s;
  return '<g><rect x="'+(x-6*s)+'" y="'+(620-70*s)+'" width="'+(12*s)+'" height="'+(70*s)+'" fill="#5b4632"/><circle cx="'+x+'" cy="'+(560*s/ s*0+575)+'" r="0" fill="none"/><circle cx="'+x+'" cy="'+(610-90*s)+'" r="'+r+'" fill="#fbd9e4"/><circle cx="'+(x-r*0.8)+'" cy="'+(596-70*s)+'" r="'+(r*0.72)+'" fill="#f8c8d8"/><circle cx="'+(x+r*0.8)+'" cy="'+(596-70*s)+'" r="'+(r*0.72)+'" fill="#fbe7ef"/><circle cx="'+x+'" cy="'+(575-80*s)+'" r="'+(r*0.6)+'" fill="#f8c8d8"/></g>';}
 o+=sakura(120,1.1)+sakura(320,0.85)+sakura(1450,1.2)+sakura(1270,0.9);
 o+='<g fill="#fbd9e4" opacity=".9"><circle cx="500" cy="660" r="6"/><circle cx="560" cy="700" r="5"/><circle cx="430" cy="730" r="4"/><circle cx="1100" cy="680" r="5"/><circle cx="1020" cy="720" r="4"/></g>';
 o+=birds(680,200,0.9,'#b98b9b');
 o+='</svg>';return o;}

/* ---------- 3 中山陵 ---------- */
function zhongshanling(){
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">';
 o+='<defs><linearGradient id="zs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd9f0"/><stop offset="1" stop-color="#eef5ea"/></linearGradient></defs>';
 o+='<rect width="1600" height="640" fill="url(#zs-sky)"/>';
 o+=clouds(280,130,1.1,'#ffffff')+clouds(1240,170,1.3,'#ffffff');
 /* 紫金山体 */
 o+='<path d="M0 900 L0 700 Q300 520 620 640 Q900 480 1250 620 Q1450 560 1600 660 L1600 900 Z" fill="#5c8f68"/>';
 o+='<path d="M0 900 L0 780 Q400 620 800 720 Q1200 600 1600 740 L1600 900 Z" fill="#4c7f57"/>';
 /* 台阶 392 级（梯道） */
 o+='<g><path d="M800 900 L560 260 L1040 260 Z" fill="#cfc4ac"/>';
 var steps='';for(var i=0;i<13;i++){var yy=860-i*46;var hw=226-i*17;
  steps+='<path d="M'+(800-hw)+' '+yy+' L'+(800+hw)+' '+yy+'" stroke="#b3a68c" stroke-width="10"/>';
  steps+='<path d="M'+(800-hw)+' '+(yy-46)+' L'+(800+hw)+' '+(yy-46)+'" stroke="#e2d8c2" stroke-width="6"/>';}
 o+=steps;
 /* 中央绿带 */
 o+='<path d="M800 880 L790 300 L810 300 Z" fill="#4c7f57"/>';
 o+='</g>';
 /* 平台 + 建筑：碑亭、祭堂（蓝顶） */
 o+='<rect x="470" y="240" width="660" height="34" fill="#d8cdb4"/>';
 /* 碑亭（小，路中） */
 o+='<g><rect x="770" y="150" width="60" height="46" fill="#dfe4e8"/><path d="M756 150 Q800 118 844 150 L836 160 Q800 132 764 160 Z" fill="#3a6fb5"/><rect x="792" y="102" width="16" height="26" fill="#3a6fb5"/></g>';
 /* 祭堂主体 */
 o+='<g><rect x="640" y="130" width="320" height="110" fill="#e9edf1"/>';
 o+='<path d="M610 130 Q800 52 990 130 L962 146 Q800 84 638 146 Z" fill="#2e5fa8"/>';
 o+='<path d="M600 136 Q800 44 1000 136 L1000 150 Q800 62 600 150 Z" fill="#24497f"/>';
 o+='<rect x="612" y="136" width="376" height="14" fill="#1f3a66"/>';
 o+='<rect x="774" y="168" width="52" height="72" fill="#33475e"/>';
 o+='<rect x="680" y="176" width="30" height="46" fill="#7fa3c9"/><rect x="890" y="176" width="30" height="46" fill="#7fa3c9"/>';
 o+='<rect x="700" y="60" width="200" height="0" fill="none"/>';
 o+='<text x="800" y="118" text-anchor="middle" font-family="serif" font-size="26" fill="#1f3a66" letter-spacing="6">天下为公</text>';
 o+='</g>';
 /* 博爱坊（前景牌坊） */
 o+='<g><rect x="150" y="640" width="34" height="240" fill="#c9cfd6"/><rect x="430" y="640" width="34" height="240" fill="#c9cfd6"/>';
 o+='<path d="M118 640 Q307 560 496 640 L480 662 Q307 592 134 662 Z" fill="#2e5fa8"/>';
 o+='<rect x="128" y="610" width="358" height="34" fill="#24497f"/><rect x="262" y="622" width="92" height="26" rx="4" fill="#0e1526" opacity=".25"/>';
 o+='<text x="307" y="632" text-anchor="middle" font-family="serif" font-size="24" fill="#e8f0fa" letter-spacing="8">博爱</text>';
 o+='</g>';
 /* 松树 */
 o+=pine(620,760,150,'#2e6b45','#4a3a2a')+pine(1000,780,170,'#2e6b45','#4a3a2a')+pine(560,860,120,'#27593a','#4a3a2a')+pine(1060,870,140,'#27593a','#4a3a2a')+pine(1300,760,110,'#2e6b45','#4a3a2a')+pine(380,820,130,'#2e6b45','#4a3a2a');
 o+=birds(1150,180,1,'#5c8f68')+birds(1020,220,0.7,'#5c8f68');
 o+='</svg>';return o;}

/* ---------- 4 明孝陵 ---------- */
function mingxiaoling(){
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">';
 o+='<defs><linearGradient id="mx-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e3c0"/><stop offset=".6" stop-color="#f2c98d"/><stop offset="1" stop-color="#e9a86a"/></linearGradient></defs>';
 o+='<rect width="1600" height="620" fill="url(#mx-sky)"/>';
 o+='<circle cx="1250" cy="200" r="86" fill="#ffdf9e"/><circle cx="1250" cy="200" r="118" fill="#ffdf9e" opacity=".3"/>';
 o+=clouds(360,150,1.2,'#fff3e0')+clouds(900,110,0.8,'#fff8ec');
 o+='<path d="M0 620 Q260 480 560 560 Q900 440 1240 560 Q1440 500 1600 590 L1600 620 Z" fill="#8f6b45" opacity=".5"/>';
 /* 远处方城明楼 */
 o+='<g opacity=".9"><rect x="1150" y="380" width="200" height="240" fill="#7d6b52"/><rect x="1130" y="360" width="240" height="26" fill="#63553f"/><path d="M1120 360 Q1250 316 1380 360 L1362 376 Q1250 340 1138 376 Z" fill="#5a4c39"/><rect x="1220" y="440" width="60" height="100" fill="#4a3d2c"/></g>';
 /* 石象路（神道） */
 o+='<path d="M300 900 L760 380 L900 380 L1360 900 Z" fill="#b39a72"/>';
 o+='<path d="M420 900 L790 380 L870 380 L1240 900 Z" fill="#c4ab82"/>';
 /* 石象（一对） */
 function elephant(x,y,s){return '<g fill="#9b9484"><ellipse cx="'+x+'" cy="'+(y-46*s)+'" rx="'+70*s+'" ry="'+44*s+'"/><path d="M'+(x-40*s)+' '+(y-84*s)+' q'+(-26*s)+' -'+(40*s)+' '+(6*s)+' -'+(46*s)+' q'+(30*s)+' -'+(2*s)+' '+(40*s)+' '+(22*s)+' Z"/><rect x="'+(x-56*s)+'" y="'+(y-20*s)+'" width="'+(16*s)+'" height="'+(46*s)+'" rx="7"/><rect x="'+(x-24*s)+'" y="'+(y-16*s)+'" width="'+(16*s)+'" height="'+(42*s)+'" rx="7"/><rect x="'+(x+16*s)+'" y="'+(y-16*s)+'" width="'+(16*s)+'" height="'+(42*s)+'" rx="7"/><rect x="'+(x+44*s)+'" y="'+(y-20*s)+'" width="'+(16*s)+'" height="'+(46*s)+'" rx="7"/><path d="M'+(x+64*s)+' '+(y-58*s)+' q'+(20*s)+' '+(30*s)+' '+(6*s)+' '+(52*s)+'" stroke="#9b9484" stroke-width="'+(12*s)+'" fill="none" stroke-linecap="round"/><circle cx="'+(x+30*s)+'" cy="'+(y-92*s)+'" r="'+(6*s)+'" fill="#6e6759"/></g>';}
 o+=elephant(560,700,1)+elephant(1070,700,1);
 /* 站姿石象更高 */
 function elephantTall(x,y,s){return '<g fill="#8f887a"><ellipse cx="'+x+'" cy="'+(y-110*s)+'" rx="'+62*s+'" ry="'+46*s+'"/><path d="M'+(x-34*s)+' '+(y-152*s)+' q'+(-22*s)+' -'+(36*s)+' '+(4*s)+' -'+(42*s)+' q'+(28*s)+' -'+(2*s)+' '+(38*s)+' '+(20*s)+' Z"/><rect x="'+(x-48*s)+'" y="'+(y-74*s)+'" width="'+(15*s)+'" height="'+(74*s)+'" rx="7"/><rect x="'+(x-18*s)+'" y="'+(y-74*s)+'" width="'+(15*s)+'" height="'+(74*s)+'" rx="7"/><rect x="'+(x+14*s)+'" y="'+(y-74*s)+'" width="'+(15*s)+'" height="'+(74*s)+'" rx="7"/><rect x="'+(x+42*s)+'" y="'+(y-74*s)+'" width="'+(15*s)+'" height="'+(74*s)+'" rx="7"/><path d="M'+(x+56*s)+' '+(y-128*s)+' q'+(18*s)+' '+(44*s)+' '+(2*s)+' '+(72*s)+'" stroke="#8f887a" stroke-width="'+(11*s)+'" fill="none" stroke-linecap="round"/><circle cx="'+(x+26*s)+'" cy="'+(y-160*s)+'" r="'+(5.5*s)+'" fill="#635c50"/></g>';}
 o+=elephantTall(640,560,1)+elephantTall(1000,560,1);
 /* 秋树两列 */
 o+=ginkgo(180,760,200,'#e8a13c','#5b4632')+ginkgo(390,640,150,'#d9772f','#5b4632')+ginkgo(1450,760,210,'#e8a13c','#5b4632')+ginkgo(1240,640,150,'#c96a2e','#5b4632');
 o+=pine(80,880,160,'#b0602e','#5b4632')+pine(1540,880,170,'#b0602e','#5b4632');
 /* 落叶 */
 o+='<g fill="#e8a13c" opacity=".85"><circle cx="620" cy="820" r="7"/><circle cx="700" cy="860" r="5"/><circle cx="950" cy="840" r="6"/><circle cx="1020" cy="880" r="5"/><circle cx="480" cy="880" r="6"/><ellipse cx="820" cy="890" rx="9" ry="4"/><ellipse cx="760" cy="870" rx="8" ry="3.5"/></g>';
 o+=birds(400,220,1,'#8f6b45');
 o+='</svg>';return o;}

/* ---------- 5 夫子庙 ---------- */
function fuzimiao(){
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">';
 o+='<defs><linearGradient id="fz-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2447"/><stop offset=".7" stop-color="#3a3f6b"/><stop offset="1" stop-color="#6b4f7e"/></linearGradient>'
  +'<linearGradient id="fz-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2f56"/><stop offset="1" stop-color="#171a36"/></linearGradient></defs>';
 o+='<rect width="1600" height="620" fill="url(#fz-sky)"/>';
 o+='<circle cx="1180" cy="150" r="60" fill="#fdf3d0"/><circle cx="1180" cy="150" r="84" fill="#fdf3d0" opacity=".2"/>';
 o+='<g fill="#e8e6f5" opacity=".8"><circle cx="240" cy="120" r="3"/><circle cx="420" cy="80" r="2"/><circle cx="760" cy="110" r="2.5"/><circle cx="980" cy="70" r="2"/><circle cx="1420" cy="100" r="3"/><circle cx="1520" cy="220" r="2"/></g>';
 /* 照壁 */
 o+='<rect x="1050" y="260" width="520" height="360" fill="#243030" stroke="#3e5a4e" stroke-width="6"/>';
 o+='<path d="M1030 260 L1310 190 L1590 260 Z" fill="#3e5a4e"/>';
 o+='<rect x="1050" y="260" width="520" height="360" fill="none" stroke="#5a7a68" stroke-width="2"/>';
 o+='<circle cx="1310" cy="430" r="90" fill="#2e4a3c"/><circle cx="1310" cy="430" r="86" fill="none" stroke="#c9a24e" stroke-width="4"/>';
 /* 天下文枢牌坊（主角） */
 o+='<g><rect x="120" y="270" width="40" height="360" fill="#8a3a2c"/><rect x="560" y="270" width="40" height="360" fill="#8a3a2c"/><rect x="300" y="300" width="34" height="330" fill="#7a3226"/>';
 o+='<path d="M90 270 Q360 160 630 270 L600 300 Q360 208 120 300 Z" fill="#a34e3c"/>';
 o+='<path d="M76 280 Q360 150 644 280 L644 302 Q360 176 76 302 Z" fill="#7a3226"/>';
 /* 翘角 */
 o+='<path d="M90 270 Q60 250 54 218 Q84 244 110 258 Z" fill="#a34e3c"/><path d="M630 270 Q660 250 666 218 Q636 244 610 258 Z" fill="#a34e3c"/>';
 o+='<rect x="96" y="236" width="528" height="40" fill="#7a3226"/>';
 o+='<text x="360" y="264" text-anchor="middle" font-family="serif" font-size="30" fill="#f5e6c8" letter-spacing="14" font-weight="700">天下文枢</text>';
 /* 中门拱 */
 o+='<path d="M322 630 L322 480 Q360 430 398 480 L398 630 Z" fill="#1b2447"/><path d="M240 630 L240 500 Q270 462 300 500 L300 630 Z" fill="#1b2447"/><path d="M420 630 L420 500 Q450 462 480 500 L480 630 Z" fill="#1b2447"/>';
 o+='</g>';
 /* 灯串 */
 o+='<g>';
 for(var i=0;i<7;i++){var lx=150+i*70,ly=360+Math.sin(i)*14;
  o+='<path d="M100 340 Q360 420 620 340" stroke="#5a4a3a" stroke-width="3" fill="none"/>';
  o+='<path d="M'+lx+' '+ly+' q10 26 0 34 q-10 -8 0 -34" stroke="#7a5c3a" stroke-width="2" fill="none"/>';
  o+='<ellipse cx="'+lx+'" cy="'+(ly+42)+'" rx="16" ry="20" fill="#e05a3c"/><rect x="'+(lx-7)+'" y="'+(ly+24)+'" width="14" height="8" fill="#c9a24e"/><rect x="'+(lx-7)+'" y="'+(ly+58)+'" width="14" height="6" fill="#c9a24e"/><ellipse cx="'+lx+'" cy="'+(ly+42)+'" rx="6" ry="16" fill="#f7b076" opacity=".8"/>';}
 o+='</g>';
 /* 秦淮河水面 */
 o+='<rect y="620" width="1600" height="280" fill="url(#fz-w)"/>';
 o+='<g opacity=".8"><ellipse cx="360" cy="700" rx="200" ry="6" fill="#e05a3c" opacity=".5"/><ellipse cx="360" cy="740" rx="150" ry="5" fill="#e05a3c" opacity=".35"/><ellipse cx="1310" cy="700" rx="220" ry="6" fill="#c9a24e" opacity=".4"/><ellipse cx="1310" cy="745" rx="170" ry="5" fill="#c9a24e" opacity=".3"/></g>';
 /* 画舫 */
 o+='<g><path d="M880 700 q100 28 200 0 l-14 28 q-86 22 -172 0 Z" fill="#8a3a2c"/><rect x="916" y="654" width="118" height="44" rx="6" fill="#a34e3c"/><path d="M906 654 q70 -36 138 0 Z" fill="#e8c476"/><circle cx="946" cy="672" r="9" fill="#f7d976"/><circle cx="946" cy="672" r="18" fill="#f7d976" opacity=".25"/><circle cx="1006" cy="672" r="9" fill="#f7d976"/><circle cx="1006" cy="672" r="18" fill="#f7d976" opacity=".25"/></g>';
 o+='<g fill="#f7d976"><circle cx="700" cy="780" r="4"/><circle cx="760" cy="820" r="3"/><circle cx="560" cy="800" r="3"/></g>';
 o+='</svg>';return o;}

/* ---------- 6 总统府 ---------- */
function zongtongfu(){
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">';
 o+='<defs><linearGradient id="zt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa8bd"/><stop offset="1" stop-color="#dfe6e2"/></linearGradient></defs>';
 o+='<rect width="1600" height="640" fill="url(#zt-sky)"/>';
 o+=clouds(300,140,1.2,'#ffffff')+clouds(1150,190,1.4,'#f4f7f5');
 /* 门楼（主角） */
 o+='<g>';
 o+='<rect x="480" y="180" width="640" height="400" fill="#c9b98a"/>';
 /* 三拱门 */
 o+='<path d="M560 580 L560 380 Q620 300 680 380 L680 580 Z" fill="#4a3a28"/>';
 o+='<path d="M770 580 L770 350 Q800 310 830 350 L830 580 Z" fill="#3a2d1f"/>';
 o+='<path d="M920 580 L920 380 Q980 300 1040 380 L1040 580 Z" fill="#4a3a28"/>';
 /* 二层柱廊 */
 o+='<rect x="480" y="180" width="640" height="24" fill="#8a7a54"/>';
 for(var i=0;i<9;i++){o+='<rect x="'+(520+i*66)+'" y="204" width="22" height="140" fill="#a3946a"/>';}
 o+='<rect x="500" y="204" width="600" height="144" fill="#b8a87e" opacity="0"/>';
 o+='<rect x="510" y="204" width="580" height="140" fill="#00000022"/>';
 /* 檐口与匾额 */
 o+='<rect x="460" y="150" width="680" height="34" fill="#7a6a48"/>';
 o+='<rect x="690" y="300" width="220" height="62" rx="4" fill="#15324f"/>';
 o+='<text x="800" y="344" text-anchor="middle" font-family="serif" font-size="40" fill="#f0e8d0" letter-spacing="18" font-weight="700">总统府</text>';
 /* 两侧门柱 */
 o+='<rect x="380" y="420" width="100" height="160" fill="#b8a87e"/><rect x="1120" y="420" width="100" height="160" fill="#b8a87e"/>';
 o+='</g>';
 /* 前广场地砖 */
 o+='<rect y="580" width="1600" height="320" fill="#9aa0a8"/>';
 o+='<path d="M480 580 L380 900 L120 900 L360 580 Z" fill="#8a9098"/>';
 o+='<path d="M1120 580 L1240 900 L1480 900 L1240 580 Z" fill="#8a9098"/>';
 o+='<g stroke="#8a9098" stroke-width="2" opacity=".7">';
 for(var r=0;r<6;r++){var yy=610+r*48;var s=1+r*0.16;o+='<path d="M'+(800-330*s)+' '+yy+' L'+(800+330*s)+' '+yy+'"/>';}
 o+='</g>';
 /* 银杏与梧桐 */
 o+=ginkgo(120,700,190,'#d9a832','#5b4632')+ginkgo(260,660,150,'#c9b23c','#5b4632')+ginkgo(1490,700,190,'#d9a832','#5b4632')+ginkgo(1350,660,150,'#c9b23c','#5b4632');
 o+='<rect y="580" width="1600" height="10" fill="#7a8088"/>';
 o+=birds(1050,120,0.9,'#6a8296');
 o+='</svg>';return o;}

/* ---------- 7 长江大桥 ---------- */
function bridge(){
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">';
 o+='<defs><linearGradient id="cq-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7b267"/><stop offset=".55" stop-color="#f79077"/><stop offset="1" stop-color="#e86a8a"/></linearGradient></defs>';
 o+='<rect width="1600" height="560" fill="url(#cq-sky)"/>';
 o+='<circle cx="420" cy="240" r="95" fill="#ffe3a0"/><circle cx="420" cy="240" r="132" fill="#ffe3a0" opacity=".25"/>';
 o+=clouds(1150,150,1.3,'#ffd9c2')+clouds(760,100,0.9,'#fff0dc');
 o+='<path d="M0 560 Q240 470 480 545 Q760 480 1040 550 Q1320 495 1600 555 L1600 560 Z" fill="#7d5a72" opacity=".55"/>';
 /* 江面 */
 o+='<rect y="560" width="1600" height="340" fill="#b3566e"/>';
 o+='<g fill="#ffcf9e" opacity=".5"><ellipse cx="420" cy="600" rx="200" ry="8"/><ellipse cx="420" cy="640" rx="150" ry="6"/><ellipse cx="420" cy="690" rx="110" ry="5"/></g>';
 o+='<g fill="#ffffff" opacity=".2"><ellipse cx="1000" cy="660" rx="260" ry="8"/><ellipse cx="1300" cy="740" rx="200" ry="7"/></g>';
 /* 桥墩 */
 o+='<g fill="#5d5468">';
 [[240,660],[520,660],[800,660],[1080,660],[1360,660]].forEach(function(p){
  o+='<path d="M'+(p[0]-46)+' 900 L'+(p[0]-34)+' 560 L'+(p[0]+34)+' 560 L'+(p[0]+46)+' 900 Z"/>';});
 o+='</g>';
 /* 下层铁路 + 上层公路 双层梁 */
 o+='<rect x="0" y="500" width="1600" height="34" fill="#4a4258"/>';
 o+='<rect x="0" y="534" width="1600" height="12" fill="#3a3448"/>';
 o+='<rect x="0" y="400" width="1600" height="30" fill="#5d5468"/>';
 o+='<rect x="0" y="430" width="1600" height="16" fill="#4a4258"/>';
 /* 栏杆 */
 o+='<g stroke="#3a3448" stroke-width="3">';
 for(var i=0;i<80;i++){o+='<path d="M'+(i*20)+' 398 L'+(i*20)+' 372"/>';}
 o+='<path d="M0 372 L1600 372" stroke-width="6" stroke="#4a4258"/>';
 o+='</g>';
 /* 玉兰花灯柱 */
 o+='<g>';
 for(var k=0;k<8;k++){var lx=140+k*190;
  o+='<rect x="'+(lx-4)+'" y="300" width="8" height="100" fill="#3a3448"/>';
  o+='<circle cx="'+lx+'" cy="290" r="16" fill="#fff3d0"/><circle cx="'+lx+'" cy="290" r="26" fill="#fff3d0" opacity=".25"/>';}
 o+='</g>';
 /* 车流 */
 o+='<g><rect x="220" y="382" width="60" height="16" rx="6" fill="#e05a3c"/><rect x="420" y="382" width="52" height="16" rx="6" fill="#e8c476"/><rect x="700" y="382" width="58" height="16" rx="6" fill="#3f9e8f"/><rect x="980" y="382" width="54" height="16" rx="6" fill="#f0f0f0"/><rect x="1240" y="382" width="60" height="16" rx="6" fill="#5d8fc9"/></g>';
 /* 火车 */
 o+='<g><rect x="900" y="506" width="200" height="24" rx="4" fill="#2e5fa8"/><rect x="1120" y="506" width="130" height="24" rx="4" fill="#4a78b8"/><rect x="910" y="510" width="24" height="14" fill="#dfe6ee"/><rect x="1140" y="510" width="20" height="14" fill="#dfe6ee"/><circle cx="940" cy="532" r="7" fill="#2a2536"/><circle cx="1010" cy="532" r="7" fill="#2a2536"/><circle cx="1160" cy="532" r="7" fill="#2a2536"/></g>';
 /* 前景货船 */
 o+='<g><path d="M640 780 q180 40 360 0 l-20 44 q-160 32 -320 0 Z" fill="#3a3448"/><rect x="740" y="716" width="160" height="60" fill="#5d5468"/><rect x="780" y="680" width="40" height="40" fill="#4a4258"/><rect x="796" y="640" width="8" height="44" fill="#3a3448"/><circle cx="800" cy="632" r="8" fill="#e05a3c"/></g>';
 o+='<path d="M540 830 q220 20 440 0" stroke="#8a4a60" stroke-width="7" fill="none" opacity=".6"/>';
 o+=birds(880,260,1.1,'#7d5a72')+birds(1020,300,0.8,'#7d5a72');
 o+='</svg>';return o;}

/* ---------- 8 大报恩寺 ---------- */
function dabaotaensi(){
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">';
 o+='<defs><linearGradient id="db-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131a3d"/><stop offset=".6" stop-color="#2b2a5e"/><stop offset="1" stop-color="#4a2e5e"/></linearGradient>'
  +'<radialGradient id="db-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>';
 o+='<rect width="1600" height="640" fill="url(#db-sky)"/>';
 o+='<circle cx="330" cy="160" r="58" fill="#f5ecce"/><circle cx="330" cy="160" r="80" fill="#f5ecce" opacity=".15"/>';
 o+='<g fill="#e8e6f5" opacity=".9"><circle cx="150" cy="90" r="3"/><circle cx="520" cy="70" r="2"/><circle cx="820" cy="110" r="2.5"/><circle cx="1120" cy="60" r="2"/><circle cx="1440" cy="120" r="3"/><circle cx="1560" cy="260" r="2"/><circle cx="90" cy="300" r="2"/></g>';
 o+='<path d="M0 640 Q300 520 640 600 Q980 500 1300 610 Q1480 570 1600 630 L1600 640 Z" fill="#1c2450"/>';
 /* 琉璃塔（主角，发光） */
 var cx=800;
 o+='<ellipse cx="'+cx+'" cy="430" rx="330" ry="300" fill="url(#db-glow)"/>';
 var tiers=[["560",180],["462",150],["368",122],["280",98],["198",78],["126",60],["64",44]];
 o+='<g>';
 tiers.forEach(function(t){var y=+t[0],w=+t[1];
  o+='<path d="M'+(cx-w/2-16)+' '+y+' L'+(cx-w/2+24)+' '+(y-30)+' L'+(cx+w/2-24)+' '+(y-30)+' L'+(cx+w/2+16)+' '+y+' Z" fill="#8a5c2e"/>';
  o+='<rect x="'+(cx-w/2)+'" y="'+(y-118)+'" width="'+w+'" height="'+(w*0.72)+'" fill="#f2d68a"/>';
  o+='<path d="M'+(cx-w/2-18)+' '+(y-118)+' Q'+cx+' '+(y-118-30)+' '+(cx+w/2+18)+' '+(y-118)+' L'+(cx+w/2+12)+' '+(y-108)+' Q'+cx+' '+(y-118-20)+' '+(cx+w/2-12)+' '+(y-108)+' Z" fill="#c96f4a"/>';
  /* 发光窗 */
  o+='<rect x="'+(cx-w/2+22)+'" y="'+(y-104)+'" width="'+Math.max(2,w-44)+'" height="'+(w*0.4)+'" rx="4" fill="#5a3c1e"/>';
  o+='<rect x="'+(cx-w/2+30)+'" y="'+(y-98)+'" width="'+Math.max(2,w-60)+'" height="'+(w*0.3)+'" rx="3" fill="#ffdf8e"/>';
 });
 o+='<path d="M'+(cx-26)+' 64 Q'+cx+' 22 '+(cx+26)+' 64 Z" fill="#c96f4a"/><rect x="'+(cx-4)+'" y="0" width="8" height="40" fill="#e8c476"/><circle cx="'+cx+'" cy="-2" r="10" fill="#ffe9a8"/>';
 o+='</g>';
 /* 塔身灯带 */
 o+='<g fill="#ffb84e">';
 [[520],[470],[420],[370],[320],[275],[230],[190],[150],[115],[85]].forEach(function(p,i){
  o+='<rect x="'+(cx-70)+'" y="'+(p[0]-24+i*0)+'" width="140" height="5" rx="2" opacity=".5"/>';});
 o+='</g>';
 /* 展馆群 */
 o+='<g><rect x="1080" y="500" width="300" height="140" fill="#2a2a52"/><rect x="1080" y="470" width="300" height="34" fill="#3a3a6a"/>';
 for(var i=0;i<8;i++){o+='<rect x="'+(1100+i*36)+'" y="510" width="20" height="60" fill="#ffdf8e" opacity=".85"/>';}
 o+='<rect x="240" y="540" width="220" height="100" fill="#242448"/><rect x="240" y="518" width="220" height="26" fill="#33335e"/>';
 for(var j=0;j<6;j++){o+='<rect x="'+(258+j*34)+'" y="548" width="18" height="52" fill="#f2d68a" opacity=".8"/>';}
 o+='</g>';
 /* 河面倒影 */
 o+='<rect y="640" width="1600" height="260" fill="#141a3a"/>';
 o+='<g opacity=".75"><rect x="'+(cx-60)+'" y="650" width="120" height="180" fill="#f2d68a" opacity=".22"/>';
 for(var r=0;r<9;r++){o+='<ellipse cx="'+cx+'" cy="'+(670+r*22)+'" rx="'+(90-r*7)+'" ry="4" fill="#f2d68a" opacity="'+(0.3-r*0.025)+'"/>';}
 o+='<ellipse cx="1230" cy="700" rx="130" ry="5" fill="#ffdf8e" opacity=".2"/><ellipse cx="350" cy="720" rx="110" ry="5" fill="#f2d68a" opacity=".18"/>';
 o+='<ellipse cx="820" cy="860" rx="200" ry="7" fill="#f2d68a" opacity=".1"/></g>';
 /* 河灯 */
 o+='<g><circle cx="600" cy="800" r="10" fill="#ffdf8e"/><circle cx="600" cy="800" r="20" fill="#ffdf8e" opacity=".25"/><circle cx="1040" cy="830" r="9" fill="#ffb84e"/><circle cx="1040" cy="830" r="18" fill="#ffb84e" opacity=".25"/><circle cx="720" cy="860" r="7" fill="#f2d68a"/><circle cx="960" cy="760" r="8" fill="#ffdf8e"/><circle cx="960" cy="760" r="17" fill="#ffdf8e" opacity=".22"/></g>';
 o+='</svg>';return o;}

/* ---------- 封面 ---------- */
function cover(){
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">';
 o+='<defs><linearGradient id="cv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17204a"/><stop offset=".55" stop-color="#2b2a5e"/><stop offset="1" stop-color="#5a3a68"/></linearGradient></defs>';
 o+='<rect width="1600" height="900" fill="url(#cv-sky)"/>';
 o+='<circle cx="1250" cy="180" r="70" fill="#f5ecce"/><circle cx="1250" cy="180" r="100" fill="#f5ecce" opacity=".15"/>';
 o+='<g fill="#e8e6f5" opacity=".8"><circle cx="200" cy="110" r="3"/><circle cx="480" cy="70" r="2"/><circle cx="760" cy="130" r="2.5"/><circle cx="1050" cy="90" r="2"/><circle cx="1450" cy="300" r="2"/><circle cx="150" cy="280" r="2"/></g>';
 o+='<path d="M0 900 L0 620 Q400 480 800 560 Q1200 460 1600 580 L1600 900 Z" fill="#101736"/>';
 /* 大报恩寺塔剪影（金线） */
 o+='<g fill="#221a3a" stroke="#e8c476" stroke-width="2">';
 var ts=[[640,190],[560,160],[486,134],[420,112],[362,94],[312,78],[268,64]];
 ts.forEach(function(t){var y=t[0],w=t[1];o+='<rect x="'+(800-w/2)+'" y="'+(y-64)+'" width="'+w+'" height="'+64+'" /><path d="M'+(800-w/2-10)+' '+y+' L'+(800-w/2+20)+' '+(y-22)+' L'+(800+w/2-20)+' '+(y-22)+' L'+(800+w/2+10)+' '+y+' Z"/>';});
 o+='<path d="M782 268 L800 226 L818 268 Z"/><rect x="798" y="196" width="4" height="32"/>';
 o+='</g>';
 /* 中山陵轮廓 */
 o+='<g fill="#221a3a" stroke="#e8c476" stroke-width="2"><rect x="380" y="620" width="240" height="70"/><path d="M360 620 Q500 556 640 620 Z"/><path d="M200 900 L330 690 L470 690 L600 900 Z" fill="none"/></g>';
 /* 长江大桥剪影 */
 o+='<g stroke="#e8c476" stroke-width="3" fill="#221a3a"><rect x="950" y="740" width="640" height="20"/><rect x="950" y="800" width="640" height="14"/><path d="M1040 740 L1040 900" fill="none"/><path d="M1240 740 L1240 900" fill="none"/><path d="M1440 740 L1440 900" fill="none"/><rect x="1080" y="708" width="10" height="32"/><circle cx="1085" cy="700" r="8" fill="#e8c476"/></g>';
 /* 湖水 */
 o+='<rect y="812" width="1600" height="88" fill="#0d1330"/>';
 o+='<g fill="#e8c476" opacity=".5"><ellipse cx="1085" cy="830" rx="180" ry="4"/><ellipse cx="500" cy="850" rx="140" ry="4"/><ellipse cx="800" cy="875" rx="220" ry="5" opacity=".3"/></g>';
 o+='<g><circle cx="640" cy="845" r="8" fill="#ffdf8e"/><circle cx="640" cy="845" r="16" fill="#ffdf8e" opacity=".3"/><circle cx="1180" cy="865" r="7" fill="#ffb84e"/><circle cx="1180" cy="865" r="14" fill="#ffb84e" opacity=".3"/></g>';
 o+='</svg>';return o;}

/* ---------- 南京地图 ---------- */
function map(){
 var L=window.LANDMARKS;
 var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">';
 o+='<defs><linearGradient id="mp-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15203e"/><stop offset="1" stop-color="#0e1526"/></linearGradient></defs>';
 o+='<rect width="1200" height="800" fill="url(#mp-bg)"/>';
 /* 网格纹理 */
 o+='<g stroke="#ffffff" opacity=".04">';
 for(var i=1;i<12;i++){o+='<path d="M'+(i*100)+' 0 L'+(i*100)+' 800"/>';}
 for(var j=1;j<8;j++){o+='<path d="M0 '+(j*100)+' L1200 '+(j*100)+'"/>';}
 o+='</g>';
 /* 长江 */
 o+='<path d="M-20 100 Q200 140 340 190 Q520 240 700 250 Q950 260 1220 210" stroke="#2e6b9c" stroke-width="86" fill="none" stroke-linecap="round" opacity=".9"/>';
 o+='<path d="M-20 100 Q200 140 340 190 Q520 240 700 250 Q950 260 1220 210" stroke="#3f8fc9" stroke-width="70" fill="none" stroke-linecap="round" opacity=".35"/>';
 o+='<text x="180" y="118" font-size="17" fill="#7fb3d8" letter-spacing="10" opacity=".9">长 江</text>';
 /* 紫金山 */
 o+='<path d="M700 260 Q820 220 960 260 Q1060 280 1120 330 Q1080 400 940 410 Q780 420 700 380 Q660 310 700 260 Z" fill="#1e3a2e"/>';
 o+='<path d="M730 280 Q830 245 950 275 Q1040 295 1090 330 Q1050 380 935 388 Q790 396 725 360 Q695 315 730 280 Z" fill="#26503a" opacity=".7"/>';
 o+='<text x="865" y="330" font-size="16" fill="#7fc49a" letter-spacing="6" opacity=".9">紫金山</text>';
 /* 玄武湖（湖面） */
 o+='<ellipse cx="590" cy="300" rx="90" ry="58" fill="#1c4a6e"/>';
 o+='<ellipse cx="590" cy="300" rx="78" ry="48" fill="#26608e"/>';
 o+='<text x="590" y="300" font-size="14" fill="#9fd4e8" letter-spacing="3" text-anchor="middle">玄武湖</text>';
 /* 明城墙示意 */
 o+='<path d="M470 350 Q490 420 540 460 Q620 520 660 600 Q680 640 660 680 Q600 700 540 680 Q480 640 470 560 Q460 460 470 350 Z" stroke="#8a8378" stroke-width="10" fill="none" opacity=".8" stroke-dasharray="14 6"/>';
 /* 城区肌理 */
 o+='<g fill="#ffffff" opacity=".05">';
 [[400,420,180,90],[300,500,160,100],[500,470,180,80],[600,470,120,110],[520,580,160,90],[660,560,100,80],[340,600,140,80],[420,300,110,50],[660,320,60,60]].forEach(function(b){
  o+='<rect x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+b[3]+'" rx="6"/>';});
 o+='</g>';
 /* 秦淮河 */
 o+='<path d="M560 640 Q640 610 700 640 Q760 670 830 650" stroke="#2a4a7e" stroke-width="18" fill="none" stroke-linecap="round" opacity=".9"/>';
 /* 路网虚线（打卡线路） */
 o+='<path id="route" d="M270 195 Q430 240 590 300 Q560 330 555 352 Q600 380 680 390 Q780 370 855 330 Q810 370 810 400 Q700 430 620 470 Q560 500 510 470 Q570 520 590 560 Q640 570 660 590" stroke="#e8c476" stroke-width="3" fill="none" stroke-dasharray="10 10" opacity=".4"/>';
 /* 指北针 */
 o+='<g transform="translate(1120,700)"><circle r="34" fill="none" stroke="#a99e85" stroke-width="2" opacity=".7"/><path d="M0 -26 L8 6 L0 0 L-8 6 Z" fill="#e8c476"/><text y="30" font-size="14" fill="#a99e85" text-anchor="middle" letter-spacing="2">北</text></g>';
 /* 图例 */
 o+='<g transform="translate(30,720)" font-size="13" fill="#a99e85"><circle cx="10" cy="-4" r="9" fill="#e05a3c"/><text x="28" y="0">待打卡</text><circle cx="120" cy="-4" r="9" fill="#3f9e8f"/><text x="138" y="0">已完成</text><rect x="222" y="-13" width="18" height="18" rx="4" fill="none" stroke="#a99e85"/><text x="250" y="0">未解锁</text></g>';
 /* 地标 pin */
 L.forEach(function(l){
  var st=l.state||'locked';
  var cls='mk'+(st==='done'?' done':st==='current'?' current':' locked');
  var cx=l.x,cy=l.y;
  o+='<g class="'+cls+'" data-id="'+l.id+'" transform="translate('+cx+','+cy+')">';
  o+='<ellipse cy="6" rx="26" ry="8" fill="#000" opacity=".35"/>';
  o+='<path class="pin" d="M0 -34 C-14 -34 -22 -22 -22 -12 C-22 2 0 12 0 12 C0 12 22 2 22 -12 C22 -22 14 -34 0 -34 Z" fill="'+(st==='done'?'#3f9e8f':'#e05a3c')+'" stroke="#f5efe3" stroke-width="2.5"/>';
  o+='<circle cy="-15" r="9" fill="#f5efe3" opacity=".9"/>';
  if(st==='locked'){o+='<rect x="-11" y="-27" width="22" height="22" rx="5" fill="#131c33" stroke="#a99e85" stroke-width="2"/><path d="M-5 -27 v-5 a5 5 0 0 1 10 0 v5" stroke="#a99e85" stroke-width="2.5" fill="none"/>';}
  else{var idx=String(l.idx+1);o+='<text y="-10.5" text-anchor="middle" font-size="12" font-weight="700" fill="#0e1526">'+idx+'</text>';}
  o+='<rect x="-52" y="16" width="104" height="30" rx="8" fill="#131c33dd" stroke="#e8c47655"/>';
  o+='<text y="36" text-anchor="middle" font-size="15" fill="#f5efe3" letter-spacing="2">'+l.name+'</text>';
  o+='</g>';
 });
 o+='</svg>';
 return o;}

/* 防止多实例同屏时 SVG 渐变 id 冲突：每次调用生成唯一后缀 */
var UID=0;
function uniq(svg){var u="u"+(UID++);
 return svg.replace(/ id="([^"]+)"/g,' id="$1-'+u+'"').replace(/url\(#([A-Za-z0-9_-]+)\)/g,'url(#$1-'+u+')');}

window.SCENES={
 xuanwulake:function(){return uniq(xuanwulake());},
 jimingsi:function(){return uniq(jimingsi());},
 zhongshanling:function(){return uniq(zhongshanling());},
 mingxiaoling:function(){return uniq(mingxiaoling());},
 fuzimiao:function(){return uniq(fuzimiao());},
 zongtongfu:function(){return uniq(zongtongfu());},
 bridge:function(){return uniq(bridge());},
 dabaotaensi:function(){return uniq(dabaotaensi());},
 cover:function(){return uniq(cover());},
 map:function(){return uniq(map());}
};
})();
