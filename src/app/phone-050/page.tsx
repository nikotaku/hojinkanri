import { get050Data } from "@/lib/phone-050";
import { createPhone050, createIvryApplication, updateIvryApplication, updatePhone050 } from "./actions";
import { PageHeader } from "@/components/PageHeader";

export const dynamic="force-dynamic";
const numberLabels:Record<string,string>={available:"未使用",applying:"申込中",active:"利用中",suspended:"停止中",cancelled:"解約済"};
const applicationLabels:Record<string,string>={draft:"下書き",submitted:"申込済",reviewing:"審査中",approved:"承認",rejected:"否決",activated:"開通済",cancelled:"取消"};
const numberOptions=Object.entries(numberLabels);
const applicationOptions=Object.entries(applicationLabels);
const field="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900";
const btn="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700";
export default async function Phone050Page(){
  const {phones,applications,companies}=await get050Data();
  const names=new Map(companies.map(c=>[c.id,c.name]));
  const counts={total:phones.length,free:phones.filter(p=>p.status==="available").length,applying:phones.filter(p=>p.status==="applying").length,active:phones.filter(p=>p.status==="active").length};
  return <div className="space-y-7">
    <PageHeader title="050番号管理" description="購入番号の在庫・法人・アイブリー申込と開通状況を一元管理" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {([["保有番号",counts.total],["未使用",counts.free],["申込中",counts.applying],["利用中",counts.active]] as const).map(([label,count])=>
        <div key={label} className="rounded-xl border bg-white p-4"><div className="text-xs text-gray-500">{label}</div><div className="text-2xl font-semibold">{count}</div></div>)}
    </div>
    <details className="rounded-xl border bg-white p-5" open={phones.length===0}>
      <summary className="cursor-pointer font-semibold">＋ 購入した050番号を登録</summary>
      <form action={createPhone050} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm">050番号（必須）<input className={field} name="phone_number" placeholder="05012345678" required inputMode="tel" /></label>
        <label className="text-sm">購入先・通信事業者<input className={field} name="provider" placeholder="購入先" /></label>
        <label className="text-sm">購入日<input className={field} name="purchased_on" type="date" /></label>
        <label className="text-sm">月額費用（円）<input className={field} name="monthly_cost" type="number" min="0" step="0.01" /></label>
        <label className="text-sm">契約法人<select className={field} name="contract_company_id"><option value="">未設定</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="text-sm md:col-span-2">メモ<textarea className={field} name="notes" rows={2}/></label>
        <button className={btn}>番号を登録</button>
      </form>
    </details>
    <section className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 font-semibold">保有番号一覧</h2>
      {phones.length===0?<p className="text-sm text-gray-500">登録番号はありません。</p>:
      <div className="space-y-3">{phones.map(p=>{
        const related=applications.filter(a=>a.phone_id===p.id);
        return <details key={p.id} className="rounded-lg border p-3">
          <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">{p.phone_number}</span><span className="text-sm text-gray-600">{numberLabels[p.status]||p.status}｜{p.contract_company_id?names.get(p.contract_company_id)||"法人不明":"法人未設定"}｜申込履歴 {related.length}件</span>
          </summary>
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">購入先：{p.provider||"未登録"} ／ 購入日：{p.purchased_on||"未登録"} ／ 月額：{p.monthly_cost==null?"未登録":Number(p.monthly_cost).toLocaleString()+"円"}</p>
            {p.notes&&<p className="whitespace-pre-wrap text-sm">{p.notes}</p>}
            <form action={updatePhone050} className="flex flex-wrap items-end gap-2"><input name="id" type="hidden" value={p.id}/><label className="text-xs">番号の状態<select name="status" defaultValue={p.status} className={field}>{numberOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><button className={btn}>変更</button></form>
            <h3 className="font-medium">アイブリー申込履歴</h3>
            {related.length===0?<p className="text-sm text-gray-500">申込履歴なし</p>:related.map(a=><div key={a.id} className="rounded-lg bg-gray-50 p-3 text-sm">
              <p>申込日：{a.application_date} ／ 法人：{a.company_id?names.get(a.company_id)||"法人不明":"未設定"} ／ 状態：{applicationLabels[a.status]||a.status}</p>
              <p>アイブリーアカウント：{a.ivry_account||"未登録"} ／ 受付番号：{a.application_reference||"未登録"}</p>
              {a.ivry_management_url&&<a href={a.ivry_management_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">アイブリー管理画面</a>}
              {a.notes&&<p className="whitespace-pre-wrap">{a.notes}</p>}
              <form action={updateIvryApplication} className="mt-2 flex flex-wrap items-end gap-2"><input type="hidden" name="id" value={a.id}/><input type="hidden" name="phone_id" value={p.id}/><label>申込状態<select name="status" className={field} defaultValue={a.status}>{applicationOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><button className={btn}>更新</button></form>
            </div>)}
            <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">＋ この番号をアイブリー申込に紐付け</summary>
              <form action={createIvryApplication} className="mt-3 grid gap-3 md:grid-cols-2"><input type="hidden" name="phone_id" value={p.id}/>
                <label className="text-sm">申込法人<select name="company_id" className={field} defaultValue={p.contract_company_id||""}><option value="">未設定</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                <label className="text-sm">申込日<input name="application_date" type="date" className={field} defaultValue={new Date().toISOString().slice(0,10)}/></label>
                <label className="text-sm">アイブリーのアカウント識別名<input name="ivry_account" className={field}/></label>
                <label className="text-sm">受付番号<input name="application_reference" className={field}/></label>
                <label className="text-sm md:col-span-2">アイブリー管理画面URL<input name="ivry_management_url" type="url" className={field} placeholder="https://..." /></label>
                <label className="text-sm md:col-span-2">申込メモ<textarea name="notes" className={field} rows={2}/></label><button className={btn}>申込を登録</button>
              </form>
            </details>
          </div>
        </details>;
      })}</div>}
    </section>
  </div>;
}
