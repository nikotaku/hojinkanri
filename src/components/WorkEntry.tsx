"use client";
import { useEffect } from "react";
export function WorkEntry() {
  useEffect(() => {
    const source = "/my-os/work-home.js";
    void import(/* webpackIgnore: true */ source).then(m => m.start()).catch(() => {});
  }, []);
  return <section className="my-5 rounded-xl border border-gray-200 bg-white p-5">
    <a className="font-semibold text-brand-700" href="/my-os/work.html">仕事の原則 ↗</a>
    <div id="work-summary" className="mt-2 text-sm" />
    <details className="mt-2 text-xs text-gray-500"><summary>ホームの表示設定</summary>
      <div id="work-preferences"><a href="/my-os/work.html">本人ログイン</a></div>
    </details>
  </section>;
}
