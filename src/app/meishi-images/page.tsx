import { listCompanies, listMeishiImages } from "@/lib/data";
import type { MeishiImageWithCompany } from "@/lib/types";
import {
  uploadMeishiImageAction,
  deleteMeishiImageAction,
} from "@/app/actions";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Field, TextInput, Select, SubmitButton } from "@/components/Form";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function MeishiImagesPage() {
  const [companies, images] = await Promise.all([
    listCompanies(),
    listMeishiImages(),
  ]);

  // 会社ごとにグループ化（一覧の並び順を維持）
  const grouped = new Map<string, MeishiImageWithCompany[]>();
  for (const img of images) {
    const key = img.company_name;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(img);
  }

  return (
    <div>
      <PageHeader
        title="名刺画像管理"
        description={`会社ごとに名刺画像を保存・閲覧できます｜全 ${images.length} 枚`}
      />

      {/* アップロードフォーム */}
      <form
        action={uploadMeishiImageAction}
        className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="法人" required>
            <Select name="company_id" required defaultValue="">
              <option value="" disabled>
                選択してください
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ラベル（担当者名など）">
            <TextInput name="label" placeholder="山田 太郎" />
          </Field>
          <Field label="名刺画像" required>
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
            />
          </Field>
        </div>
        <SubmitButton>アップロードする</SubmitButton>
        <p className="text-xs text-gray-400">
          名刺作成ページで作った名刺は「この名刺を保存」からもここに登録できます。
        </p>
      </form>

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ名刺画像がありません。上のフォームからアップロードしてください。
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([companyName, imgs]) => (
            <section
              key={companyName}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <h2 className="mb-3 text-base font-semibold text-gray-900">
                {companyName}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {imgs.length} 枚
                </span>
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {imgs.map((img) => (
                  <li
                    key={img.id}
                    className="rounded-lg border border-gray-100 bg-gray-50/60 p-3"
                  >
                    <a
                      href={img.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {/* Storage の任意URLを表示するため img を使用 */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.image_url}
                        alt={img.label ?? "名刺画像"}
                        className="w-full rounded-md border border-gray-200 bg-white shadow-sm"
                      />
                    </a>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {img.label ?? "（ラベルなし）"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(img.created_at)}
                        </p>
                      </div>
                      <DeleteButton
                        id={img.id}
                        action={deleteMeishiImageAction}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
