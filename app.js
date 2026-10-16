'use strict';
const C=Caibao, ALL=C.recipes(RAW), $=id=>document.getElementById(id), KEY='caibao-kitchen-v2';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=[],pantry=[...C.DEFAULT_PANTRY],tags=[],tab='ready',expanded=false,storageOK=true,lastFocus=null;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved){if(Array.isArray(saved.selected))selected=[...new Set(saved.selected.filter(x=>typeof x==='string').map(C.normalize))];if(Array.isArray(saved.pantry))pantry=[...new Set(saved.pantry.filter(x=>C.PANTRY.includes(x)))];}}catch(e){storageOK=false;}
const common=['番茄','鸡蛋','米饭','青椒','猪肉','土豆','黄瓜','豆腐','西兰花','大蒜','鸡肉','面条'];
const pool=[...new Set(ALL.flatMap(r=>r.required.concat(r.optional)).filter(x=>!C.PANTRY.includes(x)))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
function save(){try{localStorage.setItem(KEY,JSON.stringify({selected,pantry}));}catch(e){storageOK=false;}$('storage-status').textContent=storageOK?'食材和调料只保存在这台设备的浏览器中。':'浏览器暂时无法保存，当前页面仍可正常使用。';}
function chip(x,active,kind){return `<button type="button" data-kind="${kind}" data-value="${esc(x)}" aria-pressed="${active}" class="chip ${active?'on':''}">${esc(x)}${kind==='remove'?' ×':''}</button>`;}
function renderControls(){
  $('selected').innerHTML=selected.length?selected.map(x=>chip(x,true,'remove')).join(''):'<span class="hint">还没选食材。试试番茄和鸡蛋？</span>';
  $('ingredients').innerHTML=(expanded?[...new Set(common.concat(pool))]:common).map(x=>chip(x,selected.includes(x),'food')).join('');
  $('pantry').innerHTML=C.PANTRY.map(x=>chip(x,pantry.includes(x),'pantry')).join('');
  $('pantry-count').textContent=`已有${pantry.length}种`;
  $('tags').innerHTML=['简餐','素菜','肉菜','汤品','凉拌','低卡','高蛋白'].map(x=>chip(x,tags.includes(x),'tag')).join('');
  $('expand').textContent=expanded?'收起更多食材 −':'展开更多食材 ＋';$('expand').setAttribute('aria-expanded',String(expanded));
}
function photo(r,detail=false){return r.image?`<div class="photo ${detail?'detail-photo':''}"><img src="${r.image}" alt="${esc(r.name)}成品示意" ${detail?'':'loading="lazy"'} width="1254" height="1254"><span class="photo-label">AI成品示意</span></div>`:`<div class="photo placeholder"><span>${esc(r.name)}</span><small>成品图片待补</small></div>`;}
function card(o){const r=o.recipe;return `<button class="dish" data-recipe="${r.id}">${photo(r)}<div class="dish-body"><div class="dish-top"><h3>${esc(r.name)}</h3>${r.minutes?`<span class="time">约${r.minutes}分钟</span>`:''}</div><p class="match ${o.missing.length?'need':'ready'}">${o.missing.length?'还缺：'+o.missing.map(esc).join('、'):'✓ 必需材料已齐'}</p><p class="recipe-ingredients">${r.required.filter(x=>!C.isPantry(x)).map(esc).join(' · ')}</p>${r.optional.length?`<p class="optional">可省略：${r.optional.map(esc).join('、')}</p>`:''}<span class="view">查看做法 <span aria-hidden="true">↗</span></span></div></button>`;}
function renderResults(){
  const groups=C.rank(ALL,selected,pantry,tags),list=groups[tab];
  $('ready-count').textContent=groups.ready.length;$('near-count').textContent=groups.near.length;
  for(const t of ['ready','near']){$('tab-'+t).classList.toggle('active',tab===t);$('tab-'+t).setAttribute('aria-pressed',String(tab===t));}
  $('choose').hidden=tab!=='ready'||!groups.ready.length;
  $('result-title').textContent=!selected.length?'先告诉我，你有什么？':groups.ready.length?`今天有${groups.ready.length}道菜，现在就能做。`:'还差一点，也能吃顿好的。';
  $('result-summary').textContent=selected.length?`已选${selected.length}种食材 · 共${ALL.length}道菜谱 · 常备调料已计入匹配`:`菜谱库共${ALL.length}道，先用番茄＋鸡蛋试一试。`;
  $('group-note').textContent=tab==='ready'?'这里的菜，所列必需食材和调料都已具备。':'只展示用到已有食材、还缺1–2种材料的菜；缺少调料也会计入。';
  $('grid').innerHTML=selected.length?list.map(card).join(''):'';
  $('empty').hidden=selected.length&&list.length>0;
  $('empty').innerHTML=!selected.length?'<span class="empty-illustration">一餐好饭，从冰箱开始。</span><p>不用想菜名，把现有食材告诉我就好。</p><button id="try-example" class="primary">试试：番茄 ＋ 鸡蛋</button>':tab==='ready'?'<span class="empty-illustration">目前还没有材料齐全的菜。</span><p>看看「补买一点」，或补充已有食材和调料。筛选过多时也可以点「重置」。</p>':'<span class="empty-illustration">暂时没有只差1–2样的菜。</span><p>再加一些家里已有的食材，或减少分类筛选。</p>';
}
function render(){renderControls();renderResults();save();}
function toggle(list,x){const i=list.indexOf(x);if(i<0)list.push(x);else list.splice(i,1);}
function addInput(){
  const entered=$('ingredient-input').value.trim();if(!entered)return;
  const parts=entered.split(/[、,，;；\n\s]+/).filter(Boolean),unknown=[],added=[];
  for(const part of parts){const x=C.normalize(part);if(C.PANTRY.includes(x)){if(!pantry.includes(x))pantry.push(x);added.push(x);}else{if(!selected.includes(x))selected.push(x);added.push(x);if(!pool.includes(x))unknown.push(part);}}
  $('ingredient-input').value='';render();$('input-feedback').textContent=unknown.length?`已添加；当前菜谱暂未收录「${unknown.join('、')}」，不会把它误判为其他食材。`:`已添加：${[...new Set(added)].join('、')}`;
}
function openRecipe(id){
  const r=ALL[id];if(!r)return;const o=C.match(r,selected,pantry),have=new Set(selected.concat(pantry));lastFocus=document.activeElement;
  $('detail').innerHTML=photo(r,true)+`<div class="detail-body"><span class="eyebrow">今晚好好吃饭</span><h2 id="dish-title">${esc(r.name)}</h2><p class="detail-meta">${r.servings||'原菜谱未标注份量'}${r.minutes?` · 约${r.minutes}分钟（估算）`:''}</p><p class="match ${o.missing.length?'need':'ready'}">${o.missing.length?'还缺：'+o.missing.map(esc).join('、'):'✓ 必需材料已齐'}</p><h3>必需材料</h3><div class="chips">${r.required.map(x=>`<span class="material ${C.available(x,have)?'have':'lack'}">${C.available(x,have)?'✓ ':''}${esc(x)}</span>`).join('')}</div>${r.amounts?'<p class="amounts">'+r.amounts.map(esc).join('；')+'。</p>':'<p class="hint">用量沿用原菜谱步骤；未标明的份量需自行调整。</p>'}${r.optional.length?`<p class="optional">可以省略：${r.optional.map(esc).join('、')}。做法中相应的配料步骤可跳过。</p>`:''}<h3>跟着做</h3><ol class="steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p class="hint">${r.kcal==null?"本菜谱暂未估算热量。":"热量沿用原版估算：约"+r.kcal+"千卡/份；份量和调料变化会影响结果。"}</p></div>`;
  $('recipe-dialog').showModal();document.body.style.overflow='hidden';$('close-dialog').focus();
}
function closeRecipe(){$('recipe-dialog').close();document.body.style.overflow='';if(lastFocus)lastFocus.focus();}
document.addEventListener('click',e=>{
  const chipTarget=e.target.closest('[data-kind]');if(chipTarget){const x=chipTarget.dataset.value,kind=chipTarget.dataset.kind;if(kind==='remove'||kind==='food')toggle(selected,x);if(kind==='pantry')toggle(pantry,x);if(kind==='tag')toggle(tags,x);render();return;}
  const dish=e.target.closest('[data-recipe]');if(dish){openRecipe(Number(dish.dataset.recipe));return;}
  if(e.target.closest('#try-example')){selected=['番茄','鸡蛋'];render();}
});
$('ingredient-form').addEventListener('submit',e=>{e.preventDefault();addInput();});
$('clear').onclick=()=>{selected=[];$('input-feedback').textContent='';render();};
$('expand').onclick=()=>{expanded=!expanded;renderControls();};
$('reset-tags').onclick=()=>{tags=[];render();};
for(const t of ['ready','near'])$('tab-'+t).onclick=()=>{tab=t;renderResults();};
$('choose').onclick=()=>{const ready=C.rank(ALL,selected,pantry,tags).ready;if(ready.length)openRecipe(ready[Math.floor(Math.random()*ready.length)].recipe.id);};
$('close-dialog').onclick=closeRecipe;
$('recipe-dialog').addEventListener('cancel',e=>{e.preventDefault();closeRecipe();});
$('recipe-dialog').addEventListener('click',e=>{if(e.target===$('recipe-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeRecipe();}});
render();
