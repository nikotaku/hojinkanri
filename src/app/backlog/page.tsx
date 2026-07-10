import { listBacklog } from "@/lib/data";
import { BACKLOG_TAGS } from "@/lib/types";
import { createBacklogAction, deleteBacklogAction } from "@/app/actions";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/Form";

export const dynamic = "force-dynamic";

const tagStyle: Record<string, string> = {
  法人設立: "bg-purple-100 text-purple-700",
  口座: "bg-blue-100 text-blue-700",
  タクシー: "bg-amber-100 text-amber-700",
  契約: "bg-green-100 text-green-700",
  書類: "bg-cyan-100 text-cyan-700",
  審査: "bg-orange-100 text-orange-700",
  連絡: "bg-pink-100 text-pink-700",
  その他: "bg-gray-100 text-gray-600",
};

function TagBadge({ tag }: { tag: string | null }) {
  if (!tag) return <span className="text-gray-300">—</span>;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
        tagStyle[tag] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {tag}
    </span>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteBacklogAction}>
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

export default async function BacklogPage() {
  const entries = await listBacklog();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="バックログ"
        description={`行動の記録（日付・タグ・内容）｜全 ${entries.length} 件`}
      />

      {/* 追加フォーム */}
      <form
        action={createBacklogAction}
        className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="日付" required>
            <TextInput type="date" name="entry_date" defaultValue={today} required />
          </Field>
          <Field label="タグ">
            <Select name="tag" defaultValue="">
              <option value="">（なし）</option>
              {BACKLOG_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="内容" required>
          <TextArea name="content" rows={2} required placeholder="行った内容を記録" />
        </Field>
        <SubmitButton>追加する</SubmitButton>
      </form>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          まだ記録がありません。上のフォームから追加してください。
        </div>
      ) : (
        <>
          {/* モバイル: カード表示 */}
          <ul className="space-y-3 sm:hidden">
            {entries.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {formatDate(e.entry_date)}
                    </span>
                    <TagBadge tag={e.tag} />
                  </div>
                  <DeleteButton id={e.id} />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                  {e.content}
                </p>
              </li>
            ))}
          </ul>

          {/* デスクトップ: テーブル表示 */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    日付
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    タグ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    内容
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(e.entry_date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <TagBadge tag={e.tag} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="whitespace-pre-wrap">{e.content}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <DeleteButton id={e.id} />
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
