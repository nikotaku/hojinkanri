"use server";
import { revalidatePath } from "next/cache";
import { phoneDb } from "@/lib/phone-050";

const value = (form:FormData,key:string) => {
  const v=form.get(key);
  return typeof v==="string" && v.trim() ? v.trim():null;
};
const validPhone=(v:string|null):v is string => !!v && /^050\d{8}$/.test(v);
const numberStatuses=["available","applying","active","suspended","cancelled"];
const applicationStatuses=["draft","submitted","reviewing","approved","rejected","activated","cancelled"];
const dateOrNull=(s:string|null)=>s || null;
const money=(s:string|null)=>s===null?null:Number(s);

export async function createPhone050(form:FormData) {
  const phone=(value(form,"phone_number")??"").replace(/[\s-]/g,"");
  if(!validPhone(phone))throw new Error("050番号は11桁の数字で入力してください。");
  const cost=money(value(form,"monthly_cost"));
  if(cost!==null && (!Number.isFinite(cost)||cost<0))throw new Error("月額料金が不正です。");
  const {error}=await phoneDb().from("phone_050_numbers").insert({
    phone_number:phone, provider:value(form,"provider"),
    purchased_on:dateOrNull(value(form,"purchased_on")),
    monthly_cost:cost, contract_company_id:value(form,"contract_company_id"),
    notes:value(form,"notes"),
  });
  if(error)throw new Error(error.code==="23505"?"登録済みの050番号です。":error.message);
  revalidatePath("/phone-050");
}
export async function updatePhone050(form:FormData) {
  const id=value(form,"id");
  const status=value(form,"status");
  if(!id||!status||!numberStatuses.includes(status))throw new Error("番号または状態が不正です。");
  const {error}=await phoneDb().from("phone_050_numbers").update({status,updated_at:new Date().toISOString()}).eq("id",id);
  if(error)throw new Error(error.message);
  revalidatePath("/phone-050");
}
/** 050番号に「使ったサービス」のタグを付け替える */
export async function setPhone050ServiceTagsAction(phoneId:string, tags:string[]) {
  if(!phoneId)throw new Error("番号が不正です。");
  if(!Array.isArray(tags))throw new Error("タグが不正です。");
  const cleaned:string[]=[];
  for(const raw of tags){
    if(typeof raw!=="string")continue;
    const tag=raw.trim().slice(0,40);
    if(!tag||cleaned.includes(tag))continue;
    cleaned.push(tag);
  }
  if(cleaned.length>20)throw new Error("タグは20個までにしてください。");
  const {error}=await phoneDb().from("phone_050_numbers").update({
    service_tags:cleaned,updated_at:new Date().toISOString(),
  }).eq("id",phoneId);
  if(error)throw new Error(error.message);
  revalidatePath("/phone-050");
}
export async function createIvryApplication(form:FormData) {
  const phoneId=value(form,"phone_id");
  if(!phoneId)throw new Error("番号を選択してください。");
  const {error}=await phoneDb().from("phone_050_ivry_applications").insert({
    phone_id:phoneId,company_id:value(form,"company_id"),
    application_date:value(form,"application_date")||new Date().toISOString().slice(0,10),
    status:"submitted",ivry_account:value(form,"ivry_account"),
    application_reference:value(form,"application_reference"),
    ivry_management_url:value(form,"ivry_management_url"),notes:value(form,"notes"),
  });
  if(error)throw new Error(error.code==="23505"?"この番号には進行中の申込があります。":error.message);
  const {error:statusError}=await phoneDb().from("phone_050_numbers").update({status:"applying",updated_at:new Date().toISOString()}).eq("id",phoneId);
  if(statusError)throw new Error(statusError.message);
  revalidatePath("/phone-050");
}
export async function updateIvryApplication(form:FormData) {
  const id=value(form,"id"),status=value(form,"status"),phoneId=value(form,"phone_id");
  if(!id||!phoneId||!status||!applicationStatuses.includes(status))throw new Error("申込情報が不正です。");
  const {error}=await phoneDb().from("phone_050_ivry_applications").update({
    status,activated_on:status==="activated"?new Date().toISOString().slice(0,10):null,
    updated_at:new Date().toISOString(),
  }).eq("id",id).eq("phone_id",phoneId);
  if(error)throw new Error(error.message);
  const numberStatus=status==="activated"?"active":
    ["submitted","reviewing","approved","draft"].includes(status)?"applying":"available";
  const {error:numberError}=await phoneDb().from("phone_050_numbers").update({
    status:numberStatus,updated_at:new Date().toISOString(),
  }).eq("id",phoneId);
  if(numberError)throw new Error(numberError.message);
  revalidatePath("/phone-050");
}
