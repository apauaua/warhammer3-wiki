'use strict';
(()=>{
 const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const dictionary={...window.L10N.terms,...window.ZH.text},name=n=>window.ZH.text[n]||window.L10N.names[n]||dictionary[n]||n;
 const race=Object.fromEntries(window.WIKI.races.map(r=>[r.id,r.zh]));let kind='';
 const rows=Object.entries(window.MISSING_IMAGES).flatMap(([kind,entries])=>entries.map(r=>({...r,kind})));
 function render(){const q=$('#q').value.trim().toLowerCase(),visible=rows.filter(r=>(!kind||r.kind===kind)&&JSON.stringify(r).toLowerCase().includes(q));$('#count').textContent=`显示 ${visible.length} / ${rows.length} 个缺失图标`;
  $('#list').innerHTML=visible.map(r=>{const skill=r.kind==='skills',items=skill?r.skills:r.techs,owners=skill?r.characters:r.trees,names=[...new Set(items.map(x=>name(x.name)))],races=[...new Set(owners.map(x=>race[x.race]||x.race))];
   const locations=skill?[...new Set(owners.map(x=>name(x.name)))].join('、'):owners.map(x=>window.L10N.variants[x.id]||`${race[x.race]||x.race} · 科技树`).join('、');
   const ids=items.map(x=>esc(x.id)).join('、');
   return `<article class="record"><div><span class="tag">${skill?'人物技能':'科技'} · ${esc(races.join('、'))}</span><h2>${esc(names.join('；'))}</h2></div><div class="location"><p><strong>${skill?'可截图人物':'所属科技树'}：</strong>${esc(locations)}</p><p>${skill?'打开该人物技能树，按名称找到节点。':'打开该种族对应科技树；派系专属分支需使用对应派系。'}</p></div><div class="ids">图标键：<code>${esc(r.key)}</code><br>条目键：<code>${ids}</code>${skill?'':`<br>科技树键：<code>${owners.map(x=>esc(x.id)).join('、')}</code>`}</div></article>`;
  }).join('')||'<p class="empty">没有匹配的缺图条目。</p>';
 }
 $('#q').addEventListener('input',render);document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{kind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===b));render();}));render();
})();
