import {
  CASE_STATUS_LABELS,
  COMPANY_STATUS_LABELS,
  CASE_PRIORITY_LABELS,
  type CaseStatus,
  type CompanyStatus,
  type CasePriority,
} from "@/lib/types";

const caseStatusStyle: Record<CaseStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  on_hold: "bg-gray-200 text-gray-700",
  done: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const companyStatusStyle: Record<CompanyStatus, string> = {
  prospect: "bg-purple-100 text-purple-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-200 text-gray-600",
};

const priorityStyle: Record<CasePriority, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

function Badge({ className, label }: { className: string; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return <Badge className={caseStatusStyle[status]} label={CASE_STATUS_LABELS[status]} />;
}

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <Badge className={companyStatusStyle[status]} label={COMPANY_STATUS_LABELS[status]} />
  );
}

export function PriorityBadge({ priority }: { priority: CasePriority }) {
  return <Badge className={priorityStyle[priority]} label={CASE_PRIORITY_LABELS[priority]} />;
}
