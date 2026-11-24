export async function api(path,data={}){
 const r=await fetch('/api/work/'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data),cache:'no-store'});
 const v=await r.json();
 if(!r.ok)throw Object.assign(new Error(v.error||'操作できませんでした'),{status:r.status});
 return v;
}
export const day=(offset=0)=>new Date(Date.now()+(9+offset*24)*3600000).toISOString().slice(0,10);
export const prefId='11000000-0000-4000-8000-000000000099';
export const tabs={learning:'学びの記録',principle:'行動原則',review:'振り返り',insight:'AI分析'};
export function focusItems(f={}){
 const tasks=f.tasks||[],byId=new Map(tasks.map(t=>[t.id,t.title]));
 return [...(f.calendar_events||[]).map(e=>({id:'focus:event:'+e.id,title:e.title,date:e.event_date,end:e.end_date||e.event_date})),...tasks.map(t=>({id:'focus:task:'+t.id,title:t.title,date:t.due_date,priority:t.priority})),...(f.focus_slots||[]).map(s=>({id:'focus:slot:'+s.id,title:[s.task_id,s.task_id_2,s.task_id_3].map(id=>byId.get(id)).filter(Boolean).join('・')||'120分フォーカス',date:s.focus_date}))];
}
export function related(event,records){
 return records.filter(e=>['learning','principle'].includes(e.kind)&&e.data.status!=='アーカイブ'&&((e.data.links||[]).includes(event.id)||(e.data.tags||[]).some(t=>t.length>=2&&event.title.includes(t))));
}
export function reminders(focus,records){
 return focus.filter(f=>f.id.startsWith('focus:event:')&&f.date>=day()&&f.date<=day(7)).flatMap(f=>{
 const evidence=related(f,records);
 const offset=Math.round((Date.parse(f.date)-Date.parse(day()))/86400000);
 const advice=records.find(e=>e.kind==='insight'&&e.data.links?.includes(f.id)&&e.data.action);
 const importance=advice?.data.importance||'high';
 const days={high:[7,3,1,0],medium:[3,1,0],low:[1,0]}[importance]||[1,0];
 return (evidence.length||advice)&&days.includes(offset)?[{f,evidence,offset,advice}]:[];
 });
}
