import {fields,vaultFiles,zip} from './work-export.js';
import {api,day,tabs,focusItems,related,reminders} from './work-common.js';
const el=id=>document.getElementById(id);
const node=(tag,value)=>Object.assign(document.createElement(tag),{textContent:value||''});
function button(label,act){const b=node('button',label);b.type='button';b.onclick=()=>Promise.resolve().then(act).catch(err=>report(err));return b;}
let pendingDraft=null;
let entries=[],sources=[],focus=[],tab='learning',editing,controls={},recognition;
const rows=k=>entries.filter(e=>e.kind===k),byId=id=>entries.find(e=>e.id===id)||focus.find(e=>e.id===id)||sources.find(e=>e.id===id);
function report(err){(el('dialog').open?el('error'):el('notice')).textContent=err.message;if(err.status===401){if(el('dialog').open){pendingDraft={...editing,data:values()};el('dialog').close();}el('notice').textContent=err.message;el('login').hidden=false;el('panel').hidden=true;}}
async function refresh(){
 entries=await api('list');el('panel').hidden=false;el('login').hidden=true;el('notice').textContent='';
 try{focus=focusItems(await api('focus'));}catch{focus=[];el('notice').textContent='フォーカスの予定・タスクを取得できませんでした。';}
 try{const r=await api('sources');sources=r.items||[];if(r.unavailable?.length)el('notice').textContent+=' '+r.unavailable.join('・')+'の横断参照は現在利用できません。';}catch{sources=[];el('notice').textContent+=' 日記・思索を取得できませんでした。';}
 draw();
}
el('login').onsubmit=async e=>{e.preventDefault();try{await api('login',{password:e.target.password.value});e.target.reset();await refresh();if(pendingDraft){const draft=pendingDraft;pendingDraft=null;edit(draft);}else openHash();}catch(err){report(err);}};
el('logout').onclick=async()=>{try{await api('logout');location.reload();}catch(err){report(err);}};
function card(title){let a=node('article');a.append(node('h3',title));el('list').append(a);return a;}
function linkButton(id){let row=byId(id);return button(row?.data?.title||row?.title||'参照先を開けません',()=>row&&(row.kind?edit(row):showFocus(row)));}
function showFocus(f){
 if(el('dialog').open)el('dialog').close();
 if(!f.id.startsWith('focus:')){el('actions').replaceChildren();el('list').replaceChildren();const a=card(f.title);a.append(node('p',f.text),button('学びに関連付ける',()=>edit(null,'learning',{links:[f.id]})),button('一覧に戻る',draw));return;}
 el('search').value='';el('actions').replaceChildren();el('list').replaceChildren();const c=card(f.title);c.append(node('small',f.date));
 const matches=related(f,entries);
 for(const e of [...matches,...entries.filter(e=>e.kind==='insight'&&e.data.links?.includes(f.id))])c.append(linkButton(e.id));
 const actions=matches.filter(e=>e.data.action);
 if(actions.length)c.append(button('過去の確認事項を使う',()=>edit(null,'insight',{title:f.title+'の事前確認',action:[...new Set(actions.flatMap(e=>e.data.action.split('\n')))].join('\n'),links:[f.id,...actions.map(e=>e.id)]})));
 c.append(button('予定の事前確認を生成',async()=>{const a=await api('prepare',{input:f.title});edit(null,'insight',{...a,links:[...a.links,f.id]});}),button('振り返りを記録',()=>edit(null,'review',{title:f.title+'の振り返り',links:[f.id]})),button('一覧へ',draw));
}
function draw(){
 el('tabs').replaceChildren(...Object.entries(tabs).map(([k,v])=>{let b=button(v,()=>{tab=k;el('search').value='';draw();});b.setAttribute('aria-pressed',String(tab===k));return b;}));
 el('list').replaceChildren();el('actions').replaceChildren();const q=el('search').value.trim().toLowerCase();
 if(!q&&tab==='principle')el('actions').append(button('カテゴリー管理',()=>{el('list').replaceChildren();el('actions').replaceChildren(button('カテゴリー追加',()=>edit(null,'category')),button('戻る',draw));rows('category').forEach(x=>card(x.data.title).append(button('編集',()=>edit(x))));}));
 if(!q&&tab==='insight'){
 for(const [period,label] of Object.entries({week:'週次',month:'月次',year:'年次'}))el('actions').append(button(label+'分析',async()=>{const now=day(),dt=new Date(now+'T00:00:00Z');if(period==='week')dt.setUTCDate(dt.getUTCDate()-(dt.getUTCDay()+6)%7);else if(period==='month')dt.setUTCDate(1);else dt.setUTCMonth(0,1);
 const from=dt.toISOString().slice(0,10);const d=await api('analyze',{input:label,from,to:now});edit(null,'insight',{...d,period,from,to:now});}));
 }
 if(!q&&tab==='review')for(const {f,offset} of reminders(focus,entries))card(f.title).append(node('p',offset?offset+'日前の確認':'当日の確認'),button('確認事項',()=>showFocus(f)));
 const found=entries.filter(e=>q?e.kind!=='settings'&&JSON.stringify(e.data).toLowerCase().includes(q):e.kind===tab);
 for(const e of found){const a=card(e.data.title);a.append(node('small',[tabs[e.kind]||'カテゴリー',e.data.date,e.data.status].filter(Boolean).join(' · ')),button('開く',()=>edit(e)));
 if(e.kind==='principle'&&e.data.number)a.prepend(node('small','原則'+String(e.data.number).padStart(3,'0')));
 if(e.kind==='principle')a.append(node('p','実践 '+rows('review').filter(r=>r.data.links?.includes(e.id)).length+' 回'));}
 if(q)for(const f of [...focus,...sources].filter(f=>[f.title,f.text,f.book].join(' ').toLowerCase().includes(q)))card(f.title).append(button(f.id.startsWith('focus:')?'予定・タスクを開く':'記録を開く',()=>showFocus(f)));
 if(!el('list').children.length)el('list').append(node('p',q?'一致する記録はありません。':'まだ記録がありません。'));
}
function field(key,label,value,type='textarea',options=null){
 const l=node('label',label),input=document.createElement(options?'select':type==='textarea'?'textarea':'input');if(options){input.multiple=type==='multi';for(const [id,text] of options){const o=node('option',text);o.value=id;o.selected=input.multiple?(value||[]).includes(id):id===value;input.append(o);}}else{if(type!=='textarea')input.type=type;input.value=value||'';}l.append(input);el('inputs').append(l);controls[key]=input;return input;
}
function values(){let v={...editing.data};for(const [k,c] of Object.entries(controls))v[k]=c.multiple?[...c.selectedOptions].map(o=>o.value):c.value;if(typeof v.tags==='string')v.tags=v.tags.split(/[,、\n]/).map(t=>t.trim()).filter(Boolean);return v;}
function edit(row,kind=tab,preset={}){
 editing=row||{id:crypto.randomUUID(),revision:0,kind,data:{date:day(),...preset}};const d=editing.data;kind=editing.kind;controls={};el('error').textContent='';const box=el('inputs');box.replaceChildren(node('h2',tabs[kind]||'カテゴリー'));
 if(kind==='learning'){
 const original=field('original','入力原文',d.original);original.readOnly=!!editing.revision;
 if(!original.readOnly)box.append(button('音声入力',()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)throw Error('キーボードのマイクで音声入力できます。');recognition?.stop();recognition=new R();recognition.lang='ja-JP';recognition.onresult=e=>{original.value+=(original.value?'\n':'')+e.results[0][0].transcript;};recognition.onerror=()=>report(Error('マイクを使用できません。キーボードの音声入力も利用できます。'));recognition.start();}));
 box.append(button('AIで整理',async()=>{const before=values();if(!before.original.trim())throw Error('入力原文を記入してください');const a=await api('organize',{input:before.original});edit({...editing,data:{...before,...a,categories:[...new Set([...(before.categories||[]),...(a.categories||[])])],links:[...new Set([...(before.links||[]),...a.links])]}});}));
 }
 field('title','タイトル',d.title,'text').required=kind!=='learning';
 if(kind!=='category'){
 field('date','記録日',d.date,'date');if(kind==='learning')for(const k of ['event','thought','problem','cause','lesson','principle','action','hypothesis'])field(k,fields[k],d[k]);
 if(kind==='principle'){field('event','原則が生まれた経緯',d.event);field('action','実践する行動',d.action);}
 if(kind==='review')field('result','実践結果・改善点',d.result);
 if(kind==='insight'){if(d.links?.some(id=>id.startsWith('focus:event:')))field('importance','事前確認の重要度',d.importance||'high','single',[['high','高（7日前・3日前・前日・当日）'],['medium','中（3日前・前日・当日）'],['low','低（前日・当日）']]);if(d.unavailable?.length)box.append(node('p','参照できなかった範囲　'+d.unavailable.join('・')));if(d.examined!==undefined)box.append(node('p','参照 '+d.examined+' / 対象 '+d.eligible+' 件'));for(const k of ['lesson','action','hypothesis'])field(k,fields[k],d[k]);}
 if(['learning','principle','review'].includes(kind))field('status','検証状況',d.status||'未検証','single',['未検証','検証中','有効','要改善','アーカイブ'].map(x=>[x,x]));
 field('categories','カテゴリー',d.categories,'multi',rows('category').map(e=>[e.id,e.data.title]));field('tags','タグ（読点区切り）',(d.tags||[]).join('、'),'text');
 const options=new Map([...entries.filter(e=>Object.hasOwn(tabs,e.kind)&&e.id!==editing.id).map(e=>[e.id,(tabs[e.kind]||'')+' · '+e.data.title]),...[...focus,...sources].map(f=>[f.id,(f.date||'')+' '+f.title])]);for(const id of d.links||[])if(!options.has(id))options.set(id,id);
 field('links','関連する記録・予定・タスク',d.links,'multi',[...options]);
 for(const id of d.links||[])if(byId(id))box.append(linkButton(id));
 if(kind==='insight'&&d.action)for(const line of d.action.split('\n').filter(Boolean)){box.append(button('タスク化 · '+line,async()=>{const v=values();if(!editing.revision)throw Error('分析を先に保存してください');const existing=v.tasksCreated?.[line];if(existing)throw Error('すでにタスク化されています');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(editing.id+line));const hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');const id=hex.slice(0,8)+'-'+hex.slice(8,12)+'-4'+hex.slice(13,16)+'-a'+hex.slice(17,20)+'-'+hex.slice(20,32);
 if(!focus.some(f=>f.id==='focus:task:'+id))await api('task',{id,title:line,date:focus.find(f=>v.links.includes(f.id))?.date});
 const saved=await api('save',{...editing,data:{...v,tasksCreated:{...v.tasksCreated,[line]:id},links:[...new Set([...v.links,'focus:task:'+id])]}});await refresh();edit(saved); }));}
 }
 if(row?.revision){
 if(kind==='principle'){box.append(button('実践結果を記録',()=>edit(null,'review',{links:[row.id],title:d.title+'の実践'})),button('変更履歴',async()=>{const ver=await api('history',{id:row.id});const detail=node('pre',ver.map(v=>v.updated_at+'\n'+JSON.stringify(v.data,null,2)).join('\n\n'));box.append(detail);}));}
 if(kind==='learning'){
 const choices=rows('principle').filter(p=>p.data.status!=='アーカイブ');
 if(choices.length){const select=document.createElement('select');select.setAttribute('aria-label','強化する既存原則');
 for(const p of choices.sort((a,b)=>Number((d.links||[]).includes(b.id))-Number((d.links||[]).includes(a.id)))){const o=node('option',p.data.title);o.value=p.id;select.append(o);}box.append(select,button('既存原則を強化',()=>{const p=byId(select.value);edit({...p,data:{...p.data,links:[...new Set([...(p.data.links||[]),row.id])],action:[p.data.action,values().action].filter(Boolean).join('\n')}});}));}}
 if(kind==='learning')box.append(button('原則として登録',()=>edit(null,'principle',{title:values().principle||d.title,links:[row.id],categories:d.categories,event:d.event})));
 if(kind!=='category')box.append(button('削除',async()=>{if(!confirm('この記録を削除しますか？'))return;await api('delete',{id:row.id,kind,revision:row.revision});el('dialog').close();await refresh();}));
 }
 if(!el('dialog').open)el('dialog').showModal();
}
el('editor').onsubmit=async event=>{event.preventDefault();const data=values();if(!data.title&&editing.kind==='learning')data.title=data.original.trim().slice(0,45);if(!data.title?.trim()){report(Error('タイトルまたは入力原文を記入してください'));return;}
 el('save').disabled=true;try{await api('save',{...editing,data});tab=Object.hasOwn(tabs,editing.kind)?editing.kind:'principle';el('dialog').close();await refresh();}catch(err){report(err);}finally{el('save').disabled=false;}};
el('close').onclick=()=>el('dialog').close();el('dialog').onclose=()=>recognition?.stop();el('search').oninput=draw;el('add').onclick=()=>edit(null);
el('export').onclick=async()=>{try{const url=URL.createObjectURL(zip(vaultFiles(await api('backup'))));const a=node('a');a.href=url;a.download='My-OS-Vault-'+day()+'.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}catch(err){report(err);}};
function openHash(){let id=decodeURIComponent(location.hash.slice(1));const e=byId(id);if(e)e.kind?edit(e):showFocus(e);}
refresh().then(openHash).catch(report);
