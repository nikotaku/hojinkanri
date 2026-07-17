import { listContacts } from "@/lib/data";
import { createContactAction, deleteContactAction } from "@/app/actions";
import { PageHeader } from "@/components/PageHeader";
import { Field, TextInput, TextArea, SubmitButton } from "@/components/Form";

export const dynamic = "force-dynamic";

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteContactAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600"
        aria-label="削除"
      >
        削除
      </button>
    </form>
  );
}

export default async function ContactsPage() {
  const contacts = await listContacts();

  return (
    <div>
      <PageHeader
        title="連絡先一覧"
        description={`電話番号タップで発信、メールタップで作成｜全 ${contacts.length} 件`}
      />

      {/* 追加フォーム */}
      <form
        action={createContactAction}
        className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="名前" required>
            <TextInput name="name" required placeholder="山田 太郎" />
          </Field>
          <Field label="所属（会社・部署など）">
            <TextInput name="affiliation" placeholder="株式会社サンプル" />
          </Field>
          <Field label="電話番号">
            <TextInput type="tel" name="phone" placeholder="090-1234-5678" />
          </Field>
          <Field label="メールアドレス">
            <TextInput type="email" name="email" placeholder="info@example.com" />
          </Field>
        </div>
        <Field label="メモ">
          <TextArea name="notes" rows={2} placeholder="補足情報など" />
        </Field>
        <SubmitButton>追加する</SubmitButton>
      </form>

      {contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ連絡先がありません。上のフォームから追加してください。
        </div>
      ) : (
        <>
          {/* モバイル: カード表示 */}
          <ul className="space-y-3 sm:hidden">
            {contacts.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    {c.affiliation && (
                      <p className="text-xs text-gray-500">{c.affiliation}</p>
                    )}
                  </div>
                  <DeleteButton id={c.id} />
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  {c.phone && (
                    <p>
                      <a
                        href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                        className="text-brand-600 hover:underline"
                      >
                        📞 {c.phone}
                      </a>
                    </p>
                  )}
                  {c.email && (
                    <p>
                      <a
                        href={`mailto:${c.email}`}
                        className="break-all text-brand-600 hover:underline"
                      >
                        ✉️ {c.email}
                      </a>
                    </p>
                  )}
                  {c.notes && (
                    <p className="whitespace-pre-wrap text-xs text-gray-500">
                      {c.notes}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* デスクトップ: テーブル表示 */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    名前
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    所属
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    電話番号
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    メール
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    メモ
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {c.affiliation ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {c.phone ? (
                        <a
                          href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                          className="text-brand-600 hover:underline"
                        >
                          {c.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className="text-brand-600 hover:underline"
                        >
                          {c.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="whitespace-pre-wrap">{c.notes ?? "—"}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <DeleteButton id={c.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
