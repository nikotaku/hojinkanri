export function CompanyDomainBadge({ domain }: { domain?: string | null }) {
  if (!domain) return null;
  return (
    <span title={`独自ドメイン: ${domain}`} className="inline-flex max-w-full items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">
      <span className="break-all">{domain}</span>
    </span>
  );
}
