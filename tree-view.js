/* Shared viewport controls for technology and character trees. */
window.WIKI_TREE_VIEW=(()=>{
 const modes={tech:100,skill:100};
 const clamp=n=>Math.min(200,Math.max(5,n));
 function parts(kind){return {box:document.querySelector(`.${kind}-scroll`),canvas:document.querySelector(`.${kind}-canvas`),stage:document.querySelector(`.${kind}-stage`)};}
 function controls(kind){return `<div class="tree-zoom-controls" role="group" aria-label="${kind==='tech'?'科技树':'技能树'}缩放"><button type="button" class="button zoom-step" data-tree-view="${kind}" data-zoom-action="out" aria-label="缩小">−</button><input type="range" min="5" max="200" step="1" value="100" data-zoom-range="${kind}" aria-label="${kind==='tech'?'科技树':'技能树'}缩放比例"><button type="button" class="button zoom-step" data-tree-view="${kind}" data-zoom-action="in" aria-label="放大">＋</button><output data-zoom-label="${kind}" aria-live="polite">100%</output><button type="button" class="button" data-tree-view="${kind}" data-zoom-action="reset">原始比例</button><button type="button" class="button" data-tree-view="${kind}" data-zoom-action="fit">查看全树</button></div>`;}
 function fit(kind,anchor){
  const {box,canvas,stage}=parts(kind);if(!box||!canvas||!stage)return;
  const w=Number(canvas.dataset.width),h=Number(canvas.dataset.height),old=Number(canvas.dataset.scale)||1;
  box.style.maxHeight=Math.max(360,innerHeight-310)+'px';box.style.height=Math.max(360,innerHeight-310)+'px';
  const point=anchor||{x:box.clientWidth/2,y:box.clientHeight/2};
  const x=(box.scrollLeft+point.x)/old,y=(box.scrollTop+point.y)/old;
  const scale=modes[kind]==='fit'?Math.max(.05,Math.min(1,(box.clientWidth-12)/w,(box.clientHeight-12)/h)):clamp(modes[kind])/100;
  canvas.style.transform=`scale(${scale})`;canvas.dataset.scale=scale;
  stage.style.width=w*scale+'px';stage.style.height=h*scale+'px';
  if(modes[kind]==='fit'){box.scrollLeft=0;box.scrollTop=0;}
  else if(anchor){box.scrollLeft=x*scale-point.x;box.scrollTop=y*scale-point.y;}
  document.querySelectorAll(`[data-zoom-label="${kind}"]`).forEach(el=>el.textContent=Math.round(scale*100)+'%');
  document.querySelectorAll(`[data-zoom-range="${kind}"]`).forEach(el=>{el.value=String(Math.round(scale*100));el.setAttribute('aria-valuetext',Math.round(scale*100)+'%');});
  document.querySelectorAll(`[data-tree-view="${kind}"][data-zoom-action]`).forEach(el=>{el.disabled=el.dataset.zoomAction==='out'?scale<=.05:el.dataset.zoomAction==='in'?scale>=2:false;});
 }
 function change(kind,action,value,anchor){
  const {box,canvas}=parts(kind);if(!box)return;
  const percent=Number(canvas.dataset.scale)*100||100;
  modes[kind]=action==='fit'?'fit':action==='reset'?100:action==='range'?clamp(value):clamp(Math.round(percent/5)*5+(action==='in'?10:-10));
  fit(kind,anchor||{x:box.clientWidth/2,y:box.clientHeight/2});
 }
 document.addEventListener('click',event=>{const b=event.target.closest('[data-tree-view]');if(b)change(b.dataset.treeView,b.dataset.zoomAction);});
 document.addEventListener('input',event=>{const b=event.target.closest('[data-zoom-range]');if(b)change(b.dataset.zoomRange,'range',Number(b.value));});
 document.addEventListener('input',event=>{
  if(!event.target.matches('[data-technology-search]'))return;
  const directory=event.target.closest('.technology-directory'),query=event.target.value.trim().toLocaleLowerCase('zh-CN');
  const entries=[...directory.querySelectorAll('[data-technology-entry]')];
  entries.forEach(el=>el.hidden=!el.textContent.toLocaleLowerCase('zh-CN').includes(query));
  directory.querySelector('[data-technology-empty]').hidden=entries.some(el=>!el.hidden);
 });
 document.addEventListener('wheel',event=>{
  const box=event.target.closest('.tech-scroll,.skill-scroll');if(!box||!(event.ctrlKey||event.metaKey)||!event.deltaY)return;
  event.preventDefault();const rect=box.getBoundingClientRect();
  change(box.classList.contains('tech-scroll')?'tech':'skill',event.deltaY<0?'in':'out',null,{x:event.clientX-rect.left,y:event.clientY-rect.top});
 },{passive:false});
 document.addEventListener('keydown',event=>{
  const box=event.target.closest('.tech-scroll,.skill-scroll');if(!box||event.target!==box)return;
  const action={'+':'in','=':'in','-':'out','0':'reset'}[event.key];if(!action)return;
  event.preventDefault();change(box.classList.contains('tech-scroll')?'tech':'skill',action);
 });
 return {controls,fit};
})();
