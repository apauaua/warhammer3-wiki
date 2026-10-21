(()=>{
 const data=()=>window.WIKI_MECHANICS;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const link=r=>`<button class="name-button" data-open="mechanic" data-id="${esc(r.id)}">${esc(r.title)}</button>`;
 const paragraphs=text=>(Array.isArray(text)?text:text?[text]:[]).map(p=>`<p>${esc(p)}</p>`).join('');
 const evidence=r=>`<div class="mechanics-meta">${(r.evidence||[]).map(e=>`<span class="tag">${esc(e)}</span>`).join('')}<span>${esc(r.version||'按条目来源版本')}</span></div>`;
 function table(t){return t?.rows?.length?`<div class="table-wrap mechanics-table"><table><thead><tr>${t.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';}
 function catalog(query='',category=''){
  const m=data(),q=query.trim().toLowerCase();
  const rows=m.articles.filter(r=>(!category||r.category===category)&&(!q||JSON.stringify([r.title,r.summary,r.keywords,r.sections]).toLowerCase().includes(q)));
  if(!rows.length)return '<p class="note neutral">未找到相关机制。可尝试搜索“信誉”“自动分”“合邦”或切换分类。</p>';
  return `<p class="mechanics-catalog-note">${rows.length} 篇 · 核对日期 ${esc(m.meta.checked)}。官方说明、游戏参数与社区资料分别标注。<a href="外交与自动战斗机制研究.md" download>下载外交与自动战斗研究文档</a></p>`+m.categories.filter(c=>rows.some(r=>r.category===c.id)).map(c=>`<section class="mechanics-category"><h2>${esc(c.label)}</h2><p class="muted">${esc(c.description)}</p><div class="mechanics-index">${rows.filter(r=>r.category===c.id).map(r=>`<article class="mechanics-index-entry"><h3>${link(r)}</h3><p>${esc(r.summary)}</p>${evidence(r)}</article>`).join('')}</div></section>`).join('');
 }
 function article(id){
  const m=data(),r=m.articles.find(r=>r.id===id);if(!r)return '<p>未找到此机制条目。</p>';
  return `<div class="mechanics-article">${evidence(r)}<p class="intro">${esc(r.summary)}</p>${r.scope?`<p class="muted">适用范围：${esc(r.scope)}</p>`:''}${r.sections.map(s=>`<section><h3>${esc(s.title)}</h3>${paragraphs(s.text)}${s.bullets?.length?`<ul>${s.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}${table(s.table)}</section>`).join('')}${r.cautions?.length?`<section><h3>适用条件与限制</h3>${paragraphs(r.cautions)}</section>`:''}<section><h3>资料来源</h3><ol class="mechanics-sources">${r.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.kind?` <span class="tag">${esc(s.kind)}</span>`:''}${s.note?`<p>${esc(s.note)}</p>`:''}</li>`).join('')}</ol><p class="source-line">核对日期：${esc(m.meta.checked)}。${esc(r.sourceNote||'数据库记录说明可见参数；未公开的引擎计算不据此反推为完整公式。')}</p></section>${r.related?.some(id=>m.articles.some(a=>a.id===id))?`<section><h3>相关机制</h3><div class="mechanics-related">${r.related.map(id=>m.articles.find(a=>a.id===id)).filter(Boolean).map(link).join('')}</div></section>`:''}</div>`;
 }
 function links(category,race){
  const rows=data().articles.filter(r=>r.category===category&&r.featured&&(!r.races?.length||r.races.includes(race))).sort((a,b)=>Number(!!b.races?.length)-Number(!!a.races?.length)).slice(0,4);
  return rows.length?`<section class="mechanics-inline"><h3>${category==='diplomacy'?'外交与合作规则':'自动战斗规则'}</h3><div class="mechanics-related">${rows.map(link).join('')}</div></section>`:'';
 }
 function unit(id){
  const m=data(),r=m.units?.[id],overview=m.articles.find(a=>a.id==='ar-score-boundary')||m.articles.find(a=>a.category==='autoresolve');
  if(!overview)return '';
  const sources=(m.meta.sources||[]).filter(s=>r?.fields?.some(f=>s.url.includes('/'+f.table+'_tables/')));
  return `<section class="unit-auto-reference"><h3>自动战斗相关参数</h3><p>这些记录用于核对游戏数据，不是可相加的“自动分”，也不随本页科技与事务官估算同步变化。</p>${r?.fields?.length?`<dl class="auto-parameter-grid">${r.fields.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl><details><summary>参数原始字段与来源 · ${esc(m.meta.snapshot)}</summary>${table({columns:['字段','原值','关联记录'],rows:r.fields.map(f=>[f.key,f.raw??f.value,f.record||id])})}<ul class="mechanics-sources">${sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul></details>`:'<p class="muted">当前资料未匹配此单位的自动战斗专用记录。</p>'}<div class="mechanics-related">${link(overview)}</div></section>`;
 }
 window.WIKI_MECHANICS_VIEW={catalog,article,links,unit,table};
})();
