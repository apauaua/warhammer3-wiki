'use strict';
window.WIKI_BUILD_MODEL=(()=>{
 const D=window.WIKI,S=window.WIKI_SKILLS,X=window.WIKI_EXT;
 const fields={armour_mod:['armour','add'],melee_attack_mod:['attack','add'],melee_defence_mod:['defence','add'],morale:['leadership','add'],movement_mod:['speed','pct'],mod_land_movement_battle:['speed','pct'],melee_damage_mod_mult:['baseDamage','pct'],melee_damage_ap_mod_mult:['apDamage','pct'],ammo_mod:['ammo','pct'],range_mod:['range','pct'],upkeep_mod:['upkeep','pct'],charge_add:['charge','add'],reload:['reloadReduction','add'],missile_damage_mod_mult:['missileBaseModifier','add'],missile_damage_ap_mod_mult:['missileAPModifier','add'],unit_damage_resistance_missile_mod:['missileResistance','add'],unit_damage_resistance_physical_mod:['physical','add'],unit_damage_resistance_all_mod:['ward','add'],unit_damage_resistance_magic_mod:['spellResistance','add'],unit_damage_resistance_flame_mod:['fireResistance','add']};
 const cache=new Map();
 function options(u){const id=u.race+'|'+u.id;if(cache.has(id))return cache.get(id);const rows=new Map((u.heroSupport||[]).map(h=>[h.id,{...h}]));
  for(const c of D.characters.filter(c=>c.roleType==='hero'&&c.race===u.race)){
   const keys=new Set((S.characters[c.id]||[]).flatMap(id=>S.sets[id].nodes).map(id=>S.nodes[id]).filter(n=>n.visible&&!S.skills[n.key].background&&!/hidden/i.test(S.skills[n.key].name)).map(n=>n.key));
   for(const key of keys){const id=c.id+'|'+key;if(rows.has(id))continue;const effects=[];
    for(const r of S.skills[key].rows){if(!/^(?:agent_to_parent_army_own|character_to_force_own(?:_unseen)?|character_to_faction_own(?:_unseen)?)$/.test(r.scope))continue;
     for(const m of X.effectMaps[r.effect]||[]){if(!(m.unit===u.id||X.sets[m.set]?.includes(u.id)))continue;const f=fields[m.bonus];effects.push({...r,bonus:m.bonus,unitSet:m.set,...(f?{field:f[0],mode:f[1]}:{})});}
    }
    if(effects.length)rows.set(id,{id,hero:c.name,heroId:c.id,skill:S.skills[key].name,skillKey:key,url:c.url,rows:[...new Map(effects.map(r=>[r.level+'|'+r.effect+'|'+r.bonus,r])).values()]});
   }
  }
  const out=[...rows.values()];cache.set(id,out);return out;
 }
 function allowed(t,n,faction,rank){const s=S.skills[n.key];return n.visible&&!s.background&&s.rank<=rank&&(!t.campaign||t.campaign==='wh3_main_combi')&&(!n.campaign||n.campaign==='wh3_main_combi')&&(!t.faction||t.faction===faction)&&(!n.faction||n.faction===faction);}
 function trees(c,faction){const race=D.races.find(r=>r.id===c.race),culture=k=>!k||k.includes('_'+race.code+'_')||k.endsWith('_'+race.code);return (S.characters[c.id]||[]).map(id=>S.sets[id]).filter(t=>culture(t.subculture)&&(!t.faction||t.faction===faction)&&(!t.campaign||t.campaign==='wh3_main_combi')).sort((a,b)=>Number(!!b.faction)-Number(!!a.faction));}
 function plan(c,targets,{faction='',rank=50}={}){
  let best={selected:new Map(),allocated:new Map(),skipped:targets.length,tree:null};
  for(const t of trees(c,faction)){
   const allocated=new Map(),selected=new Map(),budget=Math.max(0,rank-1),nodes=t.nodes.map(id=>S.nodes[id]);
   const race=D.races.find(r=>r.id===c.race);const can=(n,allocation)=>allowed(t,n,faction,rank)&&(!n.subculture||n.subculture.includes('_'+race.code+'_')||n.subculture.endsWith('_'+race.code))&&!n.locks.some(l=>(allocation.get(l.skill)||0)>=l.level)&&!nodes.some(o=>o.locks.some(l=>l.skill===n.key&&(allocation.get(o.key)||0)>0&&S.skills[n.key].levels>=l.level));
   function acquire(n,level,a,visiting=new Set()){
    if(!n||!can(n,a)||visiting.has(n.key))return false;if((a.get(n.key)||0)>=level)return true;visiting=new Set(visiting).add(n.key);
    const parents=t.links.filter(l=>l.child===n.id),required=parents.filter(l=>l.type==='REQUIRED'),subset=parents.filter(l=>l.type!=='REQUIRED');
    for(const l of required){if(!acquire(S.nodes[l.parent],1,a,visiting))return false;}
    if(subset.length){const need=Math.max(1,Number(n.requiredParents)||1);let total=()=>subset.reduce((sum,l)=>sum+(a.get(S.nodes[l.parent]?.key)||0),0);
     for(const l of subset){if(total()>=need)break;const p=S.nodes[l.parent];if(!p)continue;const attempt=new Map(a);if(acquire(p,Math.min(S.skills[p.key].levels,Math.max(1,need-total())),attempt,visiting)){a.clear();attempt.forEach((v,k)=>a.set(k,v));}}
     if(total()<need)return false;
    }
    if(!can(n,a))return false;a.set(n.key,level);return [...a].reduce((sum,[k,v])=>sum+Math.max(0,v-(nodes.find(n=>n.key===k)?.points||0)),0)<=budget;
   }
   for(const h of targets){const n=nodes.find(n=>n.key===h.skillKey&&allowed(t,n,faction,rank));if(!n)continue;const a=new Map(allocated),level=Math.max(...h.rows.map(r=>r.level));if(acquire(n,level,a)){allocated.clear();a.forEach((v,k)=>allocated.set(k,v));selected.set(h.id,level);}}
   if(selected.size>best.selected.size)best={selected,allocated,skipped:targets.length-selected.size,tree:t};
  }
  return best;
 }
 function selectedRows(u,selection,unitRank=9){const out=[];for(const h of options(u)){const level=selection.get(h.id)||0;if(!level)continue;const latest=new Map();for(const r of h.rows.filter(r=>r.level<=level)){const text=r.text||S.skills[h.skillKey]?.rows.find(x=>x.effect===r.effect&&x.level===r.level)?.text||'';const minimum=text.match(/(?:Rank|rank)\s*(\d+)/);if(minimum&&unitRank<Number(minimum[1]))continue;const k=r.effect+'|'+r.bonus;if(!latest.has(k)||r.level>latest.get(k).level)latest.set(k,r);}out.push(...latest.values());}return out;}
 return {options,plan,selectedRows,allowed,trees};
})();
