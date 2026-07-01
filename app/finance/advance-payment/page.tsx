import { AdvancePaymentWorkflowShell } from "@/components/finance/advance-payment-workflow-shell";
import { AppShell } from "@/components/layout/app-shell";

export default function FinanceAdvancePaymentPage() {
  return (
    <AppShell
      active="finance-advance-payment"
      title="Tam ung / Thanh toan"
      description="Mock workflow doc-only cho SOP tam ung, hoan ung, de nghi thanh toan va thanh toan HEU."
    >
      <AdvancePaymentWorkflowShell />
    </AppShell>
  );
}
