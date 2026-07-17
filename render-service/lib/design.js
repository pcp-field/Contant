// ===== Fateen "تعرف؟" — warm cream / coral editorial (majed style) =====
const C = { bg:'#F1EBE1', bgAlt:'#ECE3D6', coral:'#C1714E', coralSoft:'#DBA789',
  dark:'#2C2A27', muted:'#9A9186', card:'#E9E0D2', line:'rgba(44,42,39,0.12)', white:'#FFFFFF' };
const arNums = ['١','٢','٣','٤','٥','٦','٧','٨','٩','١٠'];
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function key(text, word){
  text=esc(text); if(!word) return text; const w=esc(word);
  return text.includes(w)? text.replace(w,`<span class="key">${w}</span>`):text;
}
const BOLT = `<svg viewBox="0 0 24 24" fill="${C.coral}"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>`;
const BURST = `<svg viewBox="0 0 24 24" fill="none" stroke="${C.coral}" stroke-width="1.6" stroke-linecap="round">${Array.from({length:12}).map((_,i)=>{const a=i*30*Math.PI/180;const x1=12+4*Math.cos(a),y1=12+4*Math.sin(a),x2=12+10*Math.cos(a),y2=12+10*Math.sin(a);return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`}).join('')}</svg>`;

function realImage(slide){ const u=slide.image_url||slide.visual_url||slide.background_image; return u?String(u):''; }

function chrome(idx, N){
  let segs=''; for(let i=0;i<N;i++) segs+=`<span class="seg ${i<=idx?'on':''}" style="animation-delay:${i*60}ms"></span>`;
  return `<div class="progress">${segs}</div>
    <div class="page">${arNums[idx]||idx+1} / ${arNums[N-1]||N}</div>
    <div class="label"><span class="ic">${BOLT}</span>تعرف؟</div>
    <div class="handle">فطين</div>`;
}

function numbered(arr){
  return `<div class="nlist">${(arr||[]).slice(0,4).map((p,i)=>
    `<div class="ni" style="--d:${0.25+i*0.12}s"><span class="nn">${arNums[i]||i+1}</span><span class="nt">${esc(p)}</span></div>`
  ).join('')}</div>`;
}
function cards(arr){
  return `<div class="cards">${(arr||[]).slice(0,3).map((p,i)=>
    `<div class="cd" style="--d:${0.25+i*0.12}s"><span class="cic">${BOLT}</span><div class="ct">${esc(p)}</div></div>`
  ).join('')}</div>`;
}

function renderBody(slide){
  const t=slide.type; let kick='تعرف؟', head='', sub='', extra='', icon='', center=true;
  if(t==='cover'){
    kick = slide.eyebrow||'تعرف؟ • تحديث جديد';
    const l1=slide.title_line1||'', l2=slide.title_line2_grad||'', l3=slide.title_line3||'';
    head = [l1?esc(l1):'', l2?`<span class="key">${esc(l2)}</span>`:'', l3?esc(l3):''].filter(Boolean).join('<br>');
    if(slide.pill) sub = esc(slide.pill);
    icon = `<div class="hero-ic pop">${BURST}</div>`;
  } else if(t==='stat'){
    kick='';
    icon=`<div class="stat-ic pop">${BOLT}</div>`;
    head=`<span class="big key">${esc(slide.number||'')}</span><span class="stat-lbl">${esc(slide.label||'')}</span>`;
    if(slide.description) sub=esc(slide.description);
  } else if(t==='one_liner'){ kick='الخلاصة'; head=key(slide.text||'', slide.grad_word);
  } else if(t==='why_matters'){ center=false; kick=''; head=esc(slide.title||'ليش هذا قوي؟'); extra=cards(slide.points);
  } else if(t==='how_to'||t==='save'||t==='warning'){
    center=false; kick=''; head=esc(slide.title || (t==='how_to'?'كيف تبدأ؟':t==='save'?'احفظها':'انتبه'));
    extra=numbered(slide.points||slide.steps);
  } else if(t==='comparison'){ center=false; kick=''; head=`<span class="key">${esc(slide.col1_header||'')}</span> · ${esc(slide.col2_header||'')}`;
    extra=`<div class="nlist">${(slide.rows||[]).slice(0,4).map((r,i)=>`<div class="ni" style="animation-delay:${0.25+i*0.12}s"><span class="nt">${esc(r[0])}</span><span class="sep">—</span><span class="nt">${esc(r[1])}</span></div>`).join('')}</div>`;
  } else if(t==='quote'){ kick='قيل'; head=`<span class="qm">”</span>${esc(slide.quote||'')}`; if(slide.author) sub='— '+esc(slide.author)+(slide.role?' · '+esc(slide.role):'');
  } else if(t==='action_prompt'){ const m={save:'احفظ المنشور',share:'شاركه',like:'عجبك؟'}; kick='قبل تكمل'; icon=`<div class="stat-ic pop">${BOLT}</div>`; head=key(slide.headline||m[slide.action]||m.save, slide.action==='save'?'احفظ':slide.action==='share'?'شاركه':'');
  } else if(t==='cta'){ kick=''; head=key(slide.question||'وش رايك؟', slide.grad_phrase); sub='اكتب جوابك بالتعليقات'; }
  else head=esc(slide.type||'');

  const plain=String(head).replace(/<[^>]+>/g,'');
  const hc=plain.length>34?'h-sm':plain.length>18?'h-md':'';
  const coralHead = ['why_matters','how_to','save','warning','comparison'].includes(t) ? 'ch' : '';
  return `<div class="content ${center?'center':'start'}">
    ${icon}
    ${kick?`<div class="kick rise">${esc(kick)}</div>`:''}
    <h1 class="head rise ${hc} ${coralHead}">${head}</h1>
    ${sub?`<div class="sub rise">${sub}</div>`:''}
    ${extra}
  </div>`;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
@keyframes rise{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{opacity:0;transform:scale(.7)}65%{transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes hookpop{0%{opacity:0;transform:scale(.6)}68%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.65}}
.stage{position:relative;width:1080px;height:1350px;overflow:hidden;direction:rtl;
  font-family:'Tajawal',sans-serif;background:${C.bg};color:${C.dark}}
.bg{position:absolute;inset:0;background-size:cover;background-position:center;z-index:0;opacity:.14}
/* chrome */
.progress{position:absolute;top:60px;left:70px;right:70px;z-index:40;display:flex;gap:8px}
.progress .seg{flex:1;height:7px;border-radius:6px;background:rgba(44,42,39,.14);transform-origin:right}
.progress .seg.on{background:${C.coral}}
.page{position:absolute;top:86px;left:70px;z-index:40;font-size:26px;font-weight:700;color:${C.muted};direction:ltr}
.label{position:absolute;top:82px;right:70px;z-index:40;display:flex;align-items:center;gap:10px;font-size:28px;font-weight:800;color:${C.coral}}
.label .ic{width:30px;height:30px;display:inline-block}
.label .ic svg{width:100%;height:100%}
.handle{position:absolute;bottom:88px;left:70px;z-index:40;font-size:28px;font-weight:800;color:${C.muted}}
/* content */
.content{position:absolute;left:96px;right:96px;top:170px;bottom:150px;z-index:30;display:flex;flex-direction:column;justify-content:center;gap:30px}
.content.center{align-items:center;text-align:center}
.content.start{align-items:flex-start;text-align:right}
.hero-ic{width:120px;height:120px;margin-bottom:6px}
.hero-ic svg,.stat-ic svg{width:100%;height:100%}
.stat-ic{width:96px;height:96px}
.kick{font-size:30px;font-weight:700;color:${C.muted};letter-spacing:.3px}
.head{font-size:104px;font-weight:800;line-height:1.28;color:${C.dark};letter-spacing:-1px}
.head.h-md{font-size:80px}
.head.h-sm{font-size:62px}
.head.ch{color:${C.coral}}
.key{color:${C.coral}}
.qm{color:${C.coral};font-weight:800;font-size:1.1em}
.big{display:block;font-size:230px;font-weight:800;line-height:.95;letter-spacing:-6px}
.stat-lbl{display:block;font-size:66px;font-weight:800;color:${C.dark};margin-top:8px}
.sub{font-size:38px;font-weight:500;color:${C.muted};line-height:1.6;max-width:820px}
/* numbered list */
.nlist{display:flex;flex-direction:column;gap:26px;width:100%;margin-top:10px}
.ni{display:flex;align-items:center;gap:26px}
.nn{flex:0 0 62px;width:62px;height:62px;display:grid;place-items:center;border-radius:50%;
  background:${C.coral};color:${C.white};font-size:30px;font-weight:800}
.nt{font-size:46px;font-weight:700;color:${C.dark};line-height:1.35}
.ni .sep{color:${C.coral};font-weight:800}
/* cards */
.cards{display:flex;gap:24px;width:100%;margin-top:10px}
.cd{flex:1;background:${C.card};border-radius:34px;padding:44px 26px;display:flex;flex-direction:column;
  align-items:center;text-align:center;gap:26px;min-height:380px;justify-content:center}
.cic{width:74px;height:74px}
.cic svg{width:100%;height:100%}
.ct{font-size:40px;font-weight:800;color:${C.dark};line-height:1.35}
/* animations only when .animate is on the stage (preview); static export stays fully visible */
.stage.animate .rise{opacity:0;animation:rise .75s cubic-bezier(.22,.61,.36,1) forwards}
.stage.animate .kick.rise{animation-delay:.05s}
.stage.animate .head.rise{animation-delay:.18s}
.stage.animate .sub.rise{animation-delay:.34s}
.stage.animate .pop{opacity:0;animation:pop .7s cubic-bezier(.2,.8,.3,1) forwards}
.stage.animate .ni,.stage.animate .cd{opacity:0;animation:rise .65s cubic-bezier(.22,.61,.36,1) forwards;animation-delay:var(--d)}
.stage.animate .progress .seg.on{transform:scaleX(0);animation:grow .5s ease forwards}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.stage.animate .hero-ic,.stage.animate .stat-ic{animation:pop .7s cubic-bezier(.2,.8,.3,1) forwards, floaty 3.2s ease-in-out 1s infinite}
.stage.animate .key,.stage.animate .brush{display:inline-block;animation:hookpop .55s cubic-bezier(.2,.9,.3,1.15) both;animation-delay:.3s}
.stage.animate .kick .kdot{animation:pulse 1.7s ease-in-out .9s infinite}
.stage.animate .big{animation:hookpop .6s cubic-bezier(.2,.9,.3,1.12) both;animation-delay:.22s;display:inline-block}
`;

function buildStage(slide, idx, N, data, anim){
  const img=realImage(slide);
  const bg = img?`<div class="bg" style="background-image:url('${esc(img)}')"></div>`:'';
  return `<div class="stage ${anim?'animate':''}">${bg}${chrome(idx,N)}${renderBody(slide)}</div>`;
}
function buildSlideDoc(slide, idx, N, data){
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1350"><style>${CSS}</style></head><body style="width:1080px;height:1350px">${buildStage(slide,idx,N,data)}</body></html>`;
}
function buildPreviewDoc(slides, data){
  const stages=slides.map((s,i)=>buildStage(s,i,slides.length,data,true)).join('\n');
  const cap=data.caption?`<div class="capbox"><div class="captitle">الكابشن</div><div class="captext">${esc(data.caption)}</div><div class="caphash">${esc(data.hashtags||'')}</div></div>`:'';
  const pcss=`body{background:#DED3C4;padding:40px 0;display:flex;flex-direction:column;align-items:center;gap:34px}
  .capbox{width:1080px;background:#F1EBE1;border:1px solid rgba(44,42,39,.14);border-radius:20px;padding:34px;direction:rtl;font-family:'Tajawal',sans-serif}
  .captitle{color:#C1714E;font-size:26px;font-weight:800;margin-bottom:14px}.captext{color:#2C2A27;font-size:26px;line-height:1.9;white-space:pre-line}.caphash{color:#9A9186;font-size:24px;margin-top:16px}`;
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${esc(data.topic||'فطين')}</title><style>${CSS}\n${pcss}</style></head><body>${stages}${cap}</body></html>`;
}
function buildReelDoc(slides, data, perSlide){
  const N = slides.length;
  const sd = perSlide || 5;
  const stages = slides.map((s,i)=>`<div class="reel-slide"><div class="reel-frame">${buildStage(s,i,N,data,true)}</div></div>`).join('');
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><style>${CSS}
  html,body{width:1080px;height:1920px;margin:0;overflow:hidden;background:${C.bg}}
  .reel-slide{position:absolute;inset:0;opacity:0;transition:opacity .55s ease;display:flex;align-items:center;justify-content:center}
  .reel-slide.show{opacity:1;z-index:2}
  .reel-frame{width:1080px;height:1350px;position:relative;overflow:hidden;border-radius:10px;box-shadow:0 34px 90px rgba(20,16,10,0.22)}
  .reel-frame .stage{width:1080px;height:1350px;transform-origin:center}
  @keyframes kenburns{from{transform:scale(1.0)}to{transform:scale(1.05)}}
  .reel-slide.show .reel-frame .stage{animation:kenburns ${sd}s ease-out both}
  .reel-brand{position:absolute;left:0;right:0;z-index:5;text-align:center;font-family:'Tajawal',sans-serif;font-weight:800}
  .reel-brand.top{top:130px;font-size:40px;color:${C.dark};letter-spacing:.5px}
  .reel-brand.top b{color:${C.coral}}
  .reel-brand.bot{bottom:130px;font-size:30px;color:${C.coral}}
  </style></head><body>
  <div class="reel-brand top">فطين <b>•</b> تعرف؟</div>
  ${stages}
  <div class="reel-brand bot">تابع للمزيد ↟</div>
  <script>
  var els=[].slice.call(document.querySelectorAll('.reel-slide'));
  function show(i){els.forEach(function(el){el.classList.remove('show');var st=el.querySelector('.stage');if(st){st.classList.remove('animate');void st.offsetWidth;}});var el=els[i];el.classList.add('show');var st=el.querySelector('.stage');if(st){void st.offsetWidth;st.classList.add('animate');}}
  var idx=0;show(0);window.__advance=function(){idx++;if(idx<els.length)show(idx);};
  </script></body></html>`;
}

module.exports = { buildStage, buildSlideDoc, buildPreviewDoc, buildReelDoc, realImage, CSS };
