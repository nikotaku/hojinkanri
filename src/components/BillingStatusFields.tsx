"use client";

import { useState } from "react";
import { ServiceContactInput } from "@/components/ServiceContactInput";
import { ServiceStatusSelect } from "@/components/ServiceStatusSelect";

/** 掛け払いのステータスと、「利用不可」のときの理由をまとめて編集する。 */
export function BillingStatusFields({
  companyId,
  service,
  status,
  unavailableReason,
  options,
}: {
  companyId: string;
  service: string;
  status?: string;
  unavailableReason?: string;
  options: readonly string[];
}) {
  const [currentStatus, setCurrentStatus] = useState(status ?? "");

  return (
    <div className="space-y-1.5">
      <ServiceStatusSelect
        companyId={companyId}
        field="billing"
        service={service}
        value={status}
        options={options}
        onValueChange={setCurrentStatus}
      />
      {currentStatus === "利用不可" && (
        <ServiceContactInput
          companyId={companyId}
          field="billing_unavailable_reason"
          service={service}
          value={unavailableReason}
          placeholder="利用不可の理由"
        />
      )}
    </div>
  );
}
