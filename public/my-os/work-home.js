import {api,day,focusItems,reminders,prefId} from './work-common.js';
const labels={recent:'最近得た学び',principle:'今日意識する行動原則',upcoming:'予定の事前確認',review:'振り返りが必要な仕事'};
export async function start(){
 const entries=await api('list');let pref=entries.find(e=>e.id===prefId)||{id:prefId,kind:'settings',revision:0,data:{title:'ホーム表示'}};
 const f=await api('focus').then(focusItems).catch(()=>[]);
 const root=document.querySelector('#work-summary'),settings=document.querySelector('#work-preferences');
 if(!root||!settings)return;
 const principles=entries.filter(e=>e.kind==='principle'&&e.data.status!=='アーカイブ').sort((a,b)=>a.id.localeCompare(b.id));
 const p=principles[Math.floor(Date.parse(day())/86400000)%principles.length];
 const learn=entries.find(e=>e.kind==='learning'),reminder=reminders(f,entries).sort((a,b)=>a.offset-b.offset)[0],next=reminder?.advice||reminder?.f;
 const past=f.filter(e=>e.id.startsWith('focus:event:')&&e.end>=day(-7)&&e.end<day()&&!entries.some(x=>x.kind==='review'&&x.data.links?.includes(e.id))).sort((a,b)=>b.end.localeCompare(a.end))[0];
 const picks={recent:learn,principle:p,upcoming:next,review:past};
 function render(){root.replaceChildren();settings.replaceChildren();for(const [k,title] of Object.entries(labels)){
 const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=pref.data[k]??(k==='recent'||k==='upcoming');label.append(input,' '+title+' ');settings.append(label);
 input.onchange=async()=>{settings.inert=true;try{pref=await api('save',{...pref,data:{...pref.data,[k]:input.checked}});}catch(err){alert(err.message);}finally{settings.inert=false;render();}};
 if(input.checked&&picks[k]){const p=document.createElement('p'),a=document.createElement('a');a.href='/my-os/work.html#'+encodeURIComponent(picks[k].id);a.textContent=k==='upcoming'&&reminder?.advice?reminder.f.title+' · '+reminder.advice.data.action.split('\n')[0]:picks[k].data?.title||picks[k].title;p.append(title+'　',a);root.append(p);}
 }}render();
}

