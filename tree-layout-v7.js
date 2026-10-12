/* Functional labels are editorial; positions and prerequisite groups retain game-table keys. */
function skillRowInfo(t,indent,all){
 const labels={basic:['基础行','坐骑、通用解锁与基础能力'],unique:['特殊行','角色专属技能与特殊能力'],personal:['个人线（黄线）','角色自身的战斗能力'],military:['军事线（红线）','军队与兵种强化'],campaign:['内政与战役线（蓝线）','行军、补员、经济与战役行动'],magic:['法术线','施法与魔法能力'],mixed:['混合技能行','包含多类效果，请查看具体作用范围'],hidden:['隐藏与背景记录','不代表可正常学习的技能']};
 const nodes=all.filter(n=>n.indent===indent),scores={unique:0,personal:0,military:0,campaign:0,magic:0};
 let kind='mixed';
 if(indent===0)kind='basic';
 else if(nodes.length&&nodes.every(n=>!n.visible))kind='hidden';
 else if(t.id==='wh_dlc03_skill_node_set_bst_khazrak')kind=({1:'unique',2:'personal',4:'military',5:'campaign'})[indent]||'mixed';
 else {
  for(const n of nodes){const s=window.WIKI_SKILLS.skills[n.key],key=n.key,icon=s.icon.split(/[\\/]/).pop();
   if(/(?:_magic_|_spell_|_lore_)/.test(key)||/^(?:magic_|spell_)/.test(icon))scores.magic+=3;
   else if(/(?:_army_buff_|_army_)/.test(key)||/^battle_/.test(icon))scores.military+=3;
   else if(/_campaign_/.test(key)||/^campaign_/.test(icon))scores.campaign+=3;
   else if(/_(?:unique|special)_/.test(key))scores.unique+=3;
   else if(/_self_/.test(key)||/^character_/.test(icon))scores.personal+=2;
  }
  const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  if(ranked[0][1]>=nodes.length&&ranked[0][1]>=ranked[1][1]*1.35)kind=ranked[0][0];
 }
 const [label,description]=labels[kind];return {kind,label,description,indent};
}
function skillPrerequisiteGroups(t,nodes,nameFn){
 const lookup=new Map(nodes.map(n=>[n.id,n])),candidates=new Map();
 const add=(ids,hint)=>{ids=[...new Set(ids)].filter(id=>lookup.has(id));if(ids.length<2)return;const rows=new Set(ids.map(id=>lookup.get(id).indent));if(rows.size!==1)return;const key=ids.sort().join('|');if(!candidates.has(key))candidates.set(key,{ids,hint});};
 const required=new Map(),subsets=new Map();
 for(const l of t.links){if(l.type==='REQUIRED'){if(!required.has(l.parent))required.set(l.parent,[]);required.get(l.parent).push(l.child);}else if(l.type==='SUBSET_REQUIRED'){if(!subsets.has(l.child))subsets.set(l.child,[]);subsets.get(l.child).push(l.parent);}}
 for(const [child,ids] of subsets)add(ids,'共同解锁：'+nameFn(window.WIKI_SKILLS.nodes[child]?.key));
 for(const [parent,ids] of required)add(ids,'共同前置：'+nameFn(window.WIKI_SKILLS.nodes[parent]?.key));
 const used=new Set(),out=[];
 for(const g of [...candidates.values()].sort((a,b)=>b.ids.length-a.ids.length)){if(g.ids.some(id=>used.has(id)))continue;g.ids.forEach(id=>used.add(id));out.push(g);}
 return out;
}
function skillLayout(t,nodes,nameFn=k=>window.WIKI_SKILLS.skills[k]?.name||'后续技能'){
 const pos=new Map(),rows=[],groups=[],source=skillPrerequisiteGroups(t,nodes,nameFn),indents=[...new Set(nodes.map(n=>n.indent))].sort((a,b)=>a-b);let y=16,width=360;
 const rowNodes=t.nodes.map(id=>window.WIKI_SKILLS.nodes[id]).filter(n=>n.visible&&!window.WIKI_SKILLS.skills[n.key].background||nodes.some(x=>x.id===n.id));
 for(const indent of indents){
  const items=nodes.filter(n=>n.indent===indent).sort((a,b)=>a.tier-b.tier||a.id.localeCompare(b.id)),info=skillRowInfo(t,indent,rowNodes),placed=[];
  const tiers=[...new Set(items.map(n=>n.tier))].sort((a,b)=>a-b);
  for(const n of items){const p={x:28+tiers.indexOf(n.tier)*202,y:y+82};while(placed.some(q=>Math.abs(q.x-p.x)<190&&Math.abs(q.y-p.y)<100))p.y+=110;placed.push(p);pos.set(n.id,p);}
  const bottom=Math.max(y+188,...placed.map(p=>p.y+98));width=Math.max(width,...placed.map(p=>p.x+200));rows.push({...info,y,height:bottom-y});
  let index=0;for(const g of source.filter(g=>nodes.find(n=>n.id===g.ids[0])?.indent===indent)){
   const ps=g.ids.map(id=>pos.get(id)),x=Math.min(...ps.map(p=>p.x))-10,right=Math.max(...ps.map(p=>p.x+184)),top=Math.min(...ps.map(p=>p.y))-34,bottom=Math.max(...ps.map(p=>p.y+94));
   groups.push({kind:info.kind,x,y:top,width:right-x,height:bottom-top,label:(info.kind==='military'?'军队强化':'技能')+' · 第 '+(++index)+' 组',hint:g.hint,ids:g.ids});
  }
  y=bottom+18;
 }
 return {pos,width,height:Math.max(200,y),rows,groups};
}
