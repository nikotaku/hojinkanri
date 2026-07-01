import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  children?: ReactNode;
}

export function PageHeader({ title, description, action, children }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {children}
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
