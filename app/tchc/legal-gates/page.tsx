import { redirect } from "next/navigation";
import { RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import {
  TchcLegalGatesReadonly,
  type TchcLegalGateRow,
} from "@/components/tchc/tchc-legal-gates-readonly";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function TchcLegalGatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("heu_tchc_legal_compliance_status")
    .select(
      "compliance_code,compliance_name,domain_code,owner_position_code,owner_position_name,legal_code,legal_title,legal_control_status,sop_code,sop_name,sop_control_status,report_code,report_name,report_control_status,evidence_class,retention_gate,data_boundary,stop_condition,phap_che_required,audit_required,automation_allowed,ai_allowed,legal_status,legal_gate_decision_status,compliance_readiness_state",
    )
    .order("compliance_code", { ascending: true })
    .returns<TchcLegalGateRow[]>();

  return (
    <AppShell
      active="tchc-legal-gates"
      title="TCHC legal gates"
      description="Read-only legal/SOP gate board for PHAP_CHE, TCHC, BGH and Audit. Production remains NO-GO."
      actions={
        <Button asChild variant="outline" size="sm">
          <a href="/tchc/legal-gates" aria-label="Refresh TCHC legal gates">
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </a>
        </Button>
      }
    >
      <TchcLegalGatesReadonly
        rows={data ?? []}
        loadError={error?.message}
      />
    </AppShell>
  );
}
