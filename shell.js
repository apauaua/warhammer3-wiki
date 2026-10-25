'use strict';
(() => {
 const paths={races:'M3 21V5l6-2 6 2 6-2v16l-6 2-6-2-6 2M9 3v16M15 5v16',lords:'m3 7 4 3 5-6 5 6 4-3-2 12H5L3 7M7 22h10',heroes:'M12 3 3 7v6c0 4 9 9 9 9s9-5 9-9V7l-9-4M8 12l3 3 5-6',characters:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.8',units:'m4 3 17 17M3 4l3 7 5-5-7-3M14 18l4-4M4 20 20 4M3 21l4-1-3-3-1 4',skills:'M12 3v7M5 21v-7h14v7M12 10v11M9 3h6M2 21h6M9 21h6M16 21h6',console:'m4 6 6 6-6 6M13 18h7',items:'m5 3 16 16M3 5l4 8 6-6-8-4M12 20l8-8M15 22l7-7',regions:'M12 22s8-8 8-13a8 8 0 1 0-16 0c0 5 8 13 8 13M9 9h6M12 6v6',spells:'M13 2 4 14h7l-1 8 10-13h-7l0-7',bonuses:'M12 3v18M3 12h18M5 5l14 14M5 19 19 5',mechanics:'M4 18V6M12 18V6M20 18V6M1 10h6M9 15h6M17 8h6',sources:'M12 21c-4-3-7-3-10-2V4c3-1 6-1 10 2 4-3 7-3 10-2v15c-3-1-6-1-10 2M12 6v15'};
 function icon(key){return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[key]||paths.sources}"/>${key==='characters'?'<circle cx="9" cy="7" r="4"/>':''}</svg>`;}
 function layoutTrees(){
  const view=document.querySelector('#view');
  for(const id of ['tree-inspector','skill-inspector']){
   const inspector=view.querySelector('#'+id);if(!inspector)continue;
   const canvas=id==='tree-inspector'?view.querySelector('#technology-panel'):view.querySelector('.skill-scroll');
   const hint=inspector.previousElementSibling;
   const workspace=document.createElement('div');workspace.className='tree-workspace';canvas.before(workspace);
   const drawing=document.createElement('div');drawing.className='tree-drawing';workspace.append(drawing,inspector);drawing.append(canvas);if(hint?.classList.contains('kbd-hint'))drawing.append(hint);
  }
 }
 function articleOutline(){
  const outline=document.querySelector('#article-outline'),body=document.querySelector('#detail-body');
  const headings=[...body.querySelectorAll('h3')].filter(h=>!h.closest('details,[hidden],.skill-canvas,.tree-inspector'));
  outline.innerHTML=headings.length>2?'<strong>本页内容</strong>'+headings.map((h,i)=>{h.id='section-'+i;return `<a href="#section-${i}" data-outline="${h.id}">${h.textContent}</a>`;}).join(''):'';
 }
 let update={state:'unconfigured',appVersion:'1.0.0',contentVersion:'2026.10.25.1',message:'更新源尚未配置',repository:'',progress:0},opened=false;
 const labels={unconfigured:'更新源尚未配置',ready:'可检查更新',checking:'正在检查更新',available:'发现新版本',downloading:'正在下载',verifying:'正在校验',installing:'正在准备内容',installed:'内容已更新',current:'已经是最新版本',error:'更新未完成',cancelled:'下载已取消',rollback:'已恢复上一版'};
 function bridge(action){if(window.chrome?.webview)window.chrome.webview.postMessage({action});}
 function updateView(){
  const native=!!window.chrome?.webview,busy=['checking','downloading','verifying','installing'].includes(update.state);
  const c=document.querySelector('#update-content');if(!c)return;
  c.innerHTML=`<dl class="version-list"><div><dt>程序版本</dt><dd>${update.appVersion}</dd></div><div><dt>百科内容</dt><dd>${update.contentVersion}</dd></div><div><dt>游戏资料依据</dt><dd>基础资料 9.0.2 / 关联数据 9.0</dd></div><div><dt>更新来源</dt><dd>${update.repository||'未配置'}</dd></div></dl><section class="update-state"><h3>${labels[update.state]||'版本状态'}</h3><p id="update-message"></p>${busy?`<progress max="100" value="${Number(update.progress)||0}" aria-label="更新进度"></progress><span>${Math.round(Number(update.progress)||0)}%</span>`:''}</section><div class="update-actions">${native?`<button class="button primary" data-update="check" ${busy||update.state==='unconfigured'?'disabled':''}>检查更新</button>${update.state==='available'?'<button class="button primary" data-update="download">下载并更新</button>':''}${update.state==='downloading'?'<button class="button" data-update="cancel">取消下载</button>':''}${update.canRollback?`<button class="button" data-update="rollback" ${busy?'disabled':''}>恢复上一版内容</button>`:''}${update.appAvailable?'<button class="button" data-update="app">下载新版程序</button>':''}`:'<p>独立窗口本地版支持 GitHub 更新。网页版由网站发布更新。</p>'}</div>`;
  c.querySelector('#update-message').textContent=update.message||(native?'离线百科可继续使用。':'当前为网页版本。');
 }
 function settings(){opened=true;updateView();document.querySelector('#settings').showModal();bridge('status');}
 document.addEventListener('DOMContentLoaded',()=>{
  if(window.chrome?.webview)window.chrome.webview.addEventListener('message',e=>{if(e.data?.type==='update'){update={...update,...e.data};if(opened)updateView();}});
  document.addEventListener('click',e=>{
   if(e.target.closest('[data-settings]'))settings();
   if(e.target.closest('[data-settings-close]'))document.querySelector('#settings').close();
   const action=e.target.closest('[data-update]');if(action)bridge(action.dataset.update);
   const link=e.target.closest('[data-outline]');if(link){e.preventDefault();document.getElementById(link.dataset.outline)?.scrollIntoView({behavior:'smooth',block:'start'});}
  });
  document.querySelector('#settings').addEventListener('close',()=>opened=false);
  bridge('status');
 });
 window.WIKI_SHELL={icon,layoutTrees,articleOutline};
})();
