'use strict';
(()=>{
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyph={search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>',arrow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'};
let menu=null,serial=0;const choices=new WeakMap();
function icon(select,value){
 const A=window.ZH?.assets||{},D=window.WIKI;
 if(select.id==='race-filter')return A.races?.[value];
 if(select.id==='resource-filter'){const r=D.resources[Number(value)];return value!==''?(A.remote?.[r?.icon]||window.ZH?.remoteAssets?.[r?.icon]):null;}
 if(select.id==='school-filter')return A.schools?.[value];
 if(select.id==='category-filter'&&location.hash==='#units')return A.categories?.[value];
 if(/(?:tree|tech)-variant/.test(select.id)){const r=D.techVariants.find(v=>v.id===value)||window.WIKI_EXT.trees.find(v=>v.id===value);return A.races?.[r?.race];}
 return null;
}
function optionHTML(select,opt){const src=icon(select,opt.value);return `${src?`<img class="choice-icon" src="${escape(src)}" alt="">`:''}<span>${escape(opt.textContent)}</span>`;}
function close(returnFocus=false){if(!menu)return;const m=menu;menu=null;m.panel.remove();m.button.setAttribute('aria-expanded','false');if(returnFocus)m.button.focus();}
function open(select,button){
 close();const id=select.dataset.choiceId;const panel=document.createElement('div');panel.className='choice-panel';
 const label=select.getAttribute('aria-label')||(select.dataset.support?'技能等级':select.labels?.[0]?.textContent.trim())||'选择选项';
 panel.innerHTML=`<div class="choice-search">${glyph.search}<input type="search" autocomplete="off" aria-label="筛选${escape(label)}" placeholder="输入文字筛选…"></div><div class="choice-list" role="listbox" id="${id}-list" aria-label="${escape(label)}"></div><div class="choice-status" aria-live="polite"></div>`;
 (select.closest('dialog')||document.body).append(panel);button.setAttribute('aria-expanded','true');
 menu={select,button,panel,input:panel.querySelector('input'),list:panel.querySelector('.choice-list'),rows:[],active:0};
 const r=button.getBoundingClientRect(),spaceBelow=innerHeight-r.bottom-12,above=spaceBelow<180&&r.top>spaceBelow;
 panel.style.width=Math.min(Math.max(r.width,250),innerWidth-24)+'px';panel.style.left=Math.max(12,Math.min(r.left,innerWidth-parseFloat(panel.style.width)-12))+'px';
 panel.style.maxHeight=Math.min(360,Math.max(160,above?r.top-16:spaceBelow))+'px';
 if(above)panel.style.bottom=(innerHeight-r.top+6)+'px';else panel.style.top=(r.bottom+6)+'px';
 const draw=()=>{
  if(!menu||menu.panel!==panel)return;
  const q=menu.input.value.trim().toLocaleLowerCase('zh-CN');menu.rows=[...select.options].filter(o=>!o.disabled&&(!q||o.textContent.toLocaleLowerCase('zh-CN').includes(q)));menu.active=Math.max(0,menu.rows.findIndex(o=>o.selected));
  menu.list.innerHTML=menu.rows.map((o,i)=>`<button type="button" role="option" id="${id}-option-${i}" aria-selected="${o.selected}" data-choice-index="${i}">${optionHTML(select,o)}${o.selected?'<span class="choice-check" aria-hidden="true">✓</span>':''}</button>`).join('')||'<p class="choice-empty">没有匹配选项</p>';
  panel.querySelector('.choice-status').textContent=q?`匹配 ${menu.rows.length} 项`:`${menu.rows.length} 个选项 · 可输入筛选`;
  activate(menu.active);menu.list.scrollTop=0;
 };
 menu.input.addEventListener('input',draw);menu.input.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();activate(menu.active+(e.key==='ArrowDown'?1:-1));}
  if(e.key==='Enter'){e.preventDefault();choose(menu.active);}
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}
  if(e.key==='Tab'){e.preventDefault();close(true);}
 });
 menu.list.addEventListener('click',e=>{const b=e.target.closest('[data-choice-index]');if(b)choose(Number(b.dataset.choiceIndex));});
 draw();menu.input.focus();
}
function activate(index){if(!menu)return;const {rows,list,input}=menu;menu.active=rows.length?(index+rows.length)%rows.length:0;list.querySelectorAll('[role=option]').forEach((b,i)=>b.classList.toggle('highlighted',i===menu.active));const active=list.children[menu.active];if(active&&rows.length){input.setAttribute('aria-activedescendant',active.id);active.scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');}
function choose(index){if(!menu||!menu.rows[index])return;const {select,button,rows}=menu;const value=rows[index].value,identity=select.id,support=select.dataset.support;close();select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));const current=identity?document.getElementById(identity):[...document.querySelectorAll('select[data-support]')].find(el=>el.dataset.support===support);(current?.parentElement.querySelector('.choice-trigger')||button).focus();}
function enhance(root=document){
 root.querySelectorAll('select:not([data-choice-id])').forEach(select=>{
  const wrapper=document.createElement('div');wrapper.className='search-choice';select.before(wrapper);wrapper.append(select);select.dataset.choiceId='choice-'+(++serial);select.classList.add('choice-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
  const label=select.getAttribute('aria-label')||(select.dataset.support?'技能等级':select.labels?.[0]?.textContent.trim())||'选择选项';
  const button=document.createElement('button');button.type='button';button.className='choice-trigger';button.setAttribute('role','combobox');button.setAttribute('aria-label',label);button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',select.dataset.choiceId+'-list');wrapper.append(button);
  const sync=()=>{const opt=select.selectedOptions[0];button.innerHTML=(opt?optionHTML(select,opt):'')+glyph.arrow;button.title=opt?.textContent||label;button.disabled=select.disabled||select.options.length<2;};choices.set(select,sync);sync();select.addEventListener('change',sync);
  button.addEventListener('click',()=>menu?.button===button?close():open(select,button));button.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open(select,button);}});
 });
 root.querySelectorAll('[data-sort]').forEach(b=>{b.dataset.tooltip='点击以依照此数据排序';b.removeAttribute('title');b.setAttribute('aria-label',b.textContent.trim()+'，点击以依照此数据排序');const th=b.closest('th');if(th)th.setAttribute('aria-sort',b.textContent.includes('↑')?'ascending':b.textContent.includes('↓')?'descending':'none');});
}
document.addEventListener('pointerdown',e=>{if(menu&&!menu.panel.contains(e.target)&&!menu.button.contains(e.target))close();});
document.addEventListener('keydown',e=>{if(menu&&e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}},true);
window.addEventListener('resize',()=>close());document.addEventListener('scroll',e=>{if(menu&&!menu.panel.contains(e.target))close();},true);document.getElementById('detail').addEventListener('close',()=>close());
let tooltip=null;
function showTip(button){hideTip();tooltip=document.createElement('div');tooltip.className='sort-tooltip';tooltip.id='sort-hint';tooltip.setAttribute('role','tooltip');tooltip.textContent='点击以依照此数据排序';(button.closest('dialog')||document.body).append(tooltip);button.setAttribute('aria-describedby','sort-hint');const r=button.getBoundingClientRect();tooltip.style.top=Math.min(innerHeight-40,r.bottom+7)+'px';tooltip.style.left=Math.max(10,Math.min(innerWidth-tooltip.offsetWidth-10,r.left))+'px';}
function hideTip(){tooltip?.remove();tooltip=null;document.querySelectorAll('[data-sort][aria-describedby="sort-hint"]').forEach(b=>b.removeAttribute('aria-describedby'));}
document.addEventListener('mouseover',e=>{const b=e.target.closest('[data-sort]');if(b&&!b.contains(e.relatedTarget))showTip(b);});document.addEventListener('mouseout',e=>{const b=e.target.closest('[data-sort]');if(b&&!b.contains(e.relatedTarget))hideTip();});document.addEventListener('focusin',e=>{const b=e.target.closest('[data-sort]');if(b)showTip(b);});document.addEventListener('focusout',e=>{if(e.target.closest('[data-sort]'))hideTip();});document.addEventListener('click',hideTip);window.addEventListener('scroll',hideTip,true);
window.WIKI_CONTROLS={enhance,sync:(root=document)=>root.querySelectorAll('select[data-choice-id]').forEach(select=>{const button=select.parentElement.querySelector('.choice-trigger'),opt=select.options[select.selectedIndex];if(button&&opt){button.innerHTML=optionHTML(select,opt)+glyph.arrow;button.title=opt.textContent;button.disabled=select.disabled||select.options.length<2;}}),close:()=>{close();hideTip();}};
})();
