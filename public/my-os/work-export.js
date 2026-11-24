export const fields={original:'入力原文',event:'発生した出来事',thought:'当時の考え方',problem:'問題点',cause:'根本原因',lesson:'得られた学び',principle:'行動原則',action:'次回の具体策',hypothesis:'AIによる推測',result:'実践結果'};
export function vaultFiles(snapshot){
  const files=new Map(), names=new Map(snapshot.entries.filter(e=>e.kind==='category').map(e=>[e.id,e.data.title]));
  for(const e of snapshot.entries.filter(e=>!e.deleted)){
    const d=e.data,date=/^\d{4}-\d{2}-\d{2}$/.test(d.date)?d.date:e.created_at.slice(0,10);
    const folders={learning:'03_仕事の学び/'+date.slice(0,4),principle:'04_行動原則',review:'05_振り返り/実践',insight:'05_振り返り/'+({'week':'週次','month':'月次','year':'年次'}[d.period]||'分析')};
    if(!folders[e.kind])continue;
    const meta={id:e.id,created:e.created_at,updated:e.updated_at,date,category:(d.categories||[]).map(x=>names.get(x)||x),tags:d.tags||[],related:d.links||[],status:d.status||'',revision:e.revision};
    const front=Object.entries(meta).map(([k,v])=>k+': '+JSON.stringify(v)).join('\n');
    const parts=Object.entries(fields).filter(([k])=>d[k]).map(([k,title])=>'## '+title+'\n'+d[k]);
    const links=(d.links||[]).map(x=>x.startsWith('focus:')?'- '+x:'- [['+x+']]');
    files.set(folders[e.kind]+'/'+e.id+'.md',['---',front,'---','# '+d.title,...parts,links.length?'## 関連記録\n'+links.join('\n'):''].filter(Boolean).join('\n\n').replace('---\n\n','---\n').replace('\n\n---','\n---')+'\n');
  }
  files.set('_backup/work.json',JSON.stringify(snapshot,null,2)+'\n');
  return files;
}
const encoder=new TextEncoder();
function crc32(bytes){let v=-1;for(const n of bytes){v^=n;for(let i=0;i<8;i++)v=(v>>>1)^((v&1)?0xedb88320:0);}return (v^-1)>>>0;}
export function zip(files){
  const local=[],central=[];let offset=0,size=0;
  for(const [path,text] of files){
    const name=encoder.encode('My-OS-Vault/'+path),data=encoder.encode(text),crc=crc32(data);
    const a=new Uint8Array(30+name.length),av=new DataView(a.buffer),b=new Uint8Array(46+name.length),bv=new DataView(b.buffer);
    const u16=(v,i,n)=>v.setUint16(i,n,true),u32=(v,i,n)=>v.setUint32(i,n,true);
    u32(av,0,0x04034b50);u16(av,4,20);u16(av,6,2048);u16(av,12,33);u32(av,14,crc);u32(av,18,data.length);u32(av,22,data.length);u16(av,26,name.length);a.set(name,30);
    u32(bv,0,0x02014b50);u16(bv,4,20);u16(bv,6,20);u16(bv,8,2048);u16(bv,14,33);u32(bv,16,crc);u32(bv,20,data.length);u32(bv,24,data.length);u16(bv,28,name.length);u32(bv,42,offset);b.set(name,46);
    local.push(a,data);central.push(b);offset+=a.length+data.length;size+=b.length;
  }
  const end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.size,true);v.setUint16(10,files.size,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);
  return new Blob([...local,...central,end],{type:'application/zip'});
}
