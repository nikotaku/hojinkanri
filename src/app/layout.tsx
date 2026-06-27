import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { DemoBanner } from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "法人案件管理",
  description: "法人(顧客)と案件を管理するアプリケーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <DemoBanner />
            <main className="flex-1 p-8">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
