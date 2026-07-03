import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  ListChecks,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  admissionWorkspaceSegmentIds,
  applyAdmissionSegmentIds,
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

type CthssvPageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
  }>;
};

type CthssvLeadRow = {
  id: string;
  lead_code: string;
  student_name: string;
  status: string;
  priority: string;
  interested_program: string | null;
  interested_major: string | null;
  admission_segment_id: string | null;
  assigned_to: string | null;
  updated_at: string;
};

type CthssvHandoverRow = {
  id: string;
  lead_id: string;
  handover_type: string;
  from_department: string;
  to_department: string;
  handover_status: string;
  requested_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  note: string | null;
  leads: CthssvLeadRow | null;
};

type CthssvDocumentRow = {
  id: string;
  lead_id: string;
  status: string;
};

type ControlItem = {
  code: string;
  title: string;
  evidence: string;
  stop: string;
};

const cthssvHandoverTypes = [
  "ADMISSION_TO_CTHSSV",
  "CTHSSV_TO_ACCOUNTING",
];

const handoverReadyStatuses = [
  "DOCUMENT_SUBMITTED",
  "ELIGIBLE",
  "ENROLLED",
];

const statusLabels: Record<string, string> = {
  DOCUMENT_SUBMITTED: "Da nop ho so",
  ELIGIBLE: "Du dieu kien",
  ENROLLED: "Da nhap hoc",
  REQUESTED: "Cho CTHSSV nhan",
  ACCEPTED: "CTHSSV da nhan",
  REJECTED: "Tra lai/tu choi",
  CANCELLED: "Da huy",
};

const handoverTypeLabels: Record<string, string> = {
  ADMISSION_TO_CTHSSV: "Tuyen sinh -> CTHSSV",
  CTHSSV_TO_ACCOUNTING: "CTHSSV -> Ke toan",
  ADMISSION_TO_ACCOUNTING: "Tuyen sinh -> Ke toan",
};

const moduleBreakdownItems: ControlItem[] = [
  {
    code: "CTHSSV-00",
    title: "Module scope baseline",
    evidence:
      "Inventory, backlog and gap matrix keep M06 as PASS_LOCAL scope before signed owner reliance.",
    stop: "M06 is treated as enrollment, finance, UAT or production approval.",
  },
  {
    code: "CTHSSV-01",
    title: "Workspace and route access",
    evidence:
      "/cthssv opens only for ADMIN/BGH or handover.accept_cthssv with active workspace scope.",
    stop: "Out-of-scope users can open or rely on CTHSSV handover data.",
  },
  {
    code: "CTHSSV-02",
    title: "Handover data foundation",
    evidence:
      "Step38 lead_handovers, ADMISSION_TO_CTHSSV, CTHSSV_TO_ACCOUNTING and audit trigger remain the source.",
    stop: "Handover packets are unscoped, unaudited or detached from source lead identity.",
  },
  {
    code: "CTHSSV-03",
    title: "Profile packet readiness",
    evidence:
      "M06-CTHSSV-01 through M06-CTHSSV-06 cover identity, document state, scope, trace, downstream and redaction.",
    stop: "CTHSSV accepts a profile with unclear packet identity, scope or controlled evidence reference.",
  },
  {
    code: "CTHSSV-04",
    title: "Accept/reject trace",
    evidence:
      "M06-DEC-01 through M06-DEC-03 keep actor, state, reason and reliance decision separate.",
    stop: "Accept/reject action lacks actor, timestamp, state, reason or owner decision.",
  },
  {
    code: "CTHSSV-05",
    title: "Owner signoff manifest",
    evidence:
      "CTHSSV-SIGN-01 through CTHSSV-SIGN-06 route signer authority and final owner quorum.",
    stop: "Owner signoff is missing, delegated without authority or stored only in Codex/chat.",
  },
  {
    code: "CTHSSV-06",
    title: "UAT result ledger",
    evidence:
      "CTHSSV-UAT-01 through CTHSSV-UAT-08 require signer, date, controlled evidence ref and blocker state.",
    stop: "Unsigned browser proof is treated as UAT pass or owner GO/NO-GO.",
  },
  {
    code: "CTHSSV-07",
    title: "Finance gate preservation",
    evidence:
      "CTHSSV_TO_ACCOUNTING remains context only; P0-19, P2-05 and P2-03 stay final finance gates.",
    stop: "CTHSSV action creates receivable, payment, invoice, voucher, payout or revenue state.",
  },
  {
    code: "CTHSSV-08",
    title: "Role and negative access",
    evidence:
      "Role-scope UAT proves CTHSSV users see only scoped packets and negative users cannot read private rows.",
    stop: "In-scope or negative-account proof is missing, indirect or unsigned.",
  },
  {
    code: "CTHSSV-09",
    title: "Audit and evidence trace",
    evidence:
      "Controlled evidence refs and audit traces link UAT ledger rows to owner signoff without raw PII.",
    stop: "Raw evidence enters Git/Codex/chat or audit trace cannot prove actor/time/state.",
  },
  {
    code: "CTHSSV-10",
    title: "Final module closure",
    evidence:
      "Final owner quorum records CTHSSV_MODULE_READY, NO_GO or BLOCKED after every blocker closes.",
    stop: "Any required owner, signed UAT result, role proof, finance gate proof or blocker closure is missing.",
  },
];

const roleNegativeAccessItems: ControlItem[] = [
  {
    code: "CTHSSV-ROLE-01",
    title: "Route access gate",
    evidence:
      "/cthssv requires authenticated ADMIN, BGH or handover.accept_cthssv before any CTHSSV packet is visible.",
    stop: "Anonymous or out-of-scope user opens the CTHSSV cockpit.",
  },
  {
    code: "CTHSSV-ROLE-02",
    title: "Workspace segment scope",
    evidence:
      "Handover and lead queries use the active admission segment filter before rendering rows.",
    stop: "Cross-segment CTHSSV packet is visible.",
  },
  {
    code: "CTHSSV-ROLE-03",
    title: "Source sender lane",
    evidence:
      "Tuyen Sinh can source the packet but cannot sign CTHSSV owner acceptance.",
    stop: "Source sender can mark CTHSSV owner acceptance.",
  },
  {
    code: "CTHSSV-ROLE-04",
    title: "CTHSSV receiver lane",
    evidence:
      "CTHSSV sees only scoped Tuyen Sinh -> CTHSSV and CTHSSV -> KHTC/accounting packets.",
    stop: "CTHSSV sees unrelated private student/profile data.",
  },
  {
    code: "CTHSSV-ROLE-05",
    title: "Dao Tao reliance boundary",
    evidence:
      "Dao Tao review remains enrollment/class reliance only and cannot approve CTHSSV profile acceptance.",
    stop: "Dao Tao or CTHSSV cockpit approves enrollment/class operation.",
  },
  {
    code: "CTHSSV-ROLE-06",
    title: "KHTC/accounting boundary",
    evidence:
      "KHTC/accounting cannot rely on CTHSSV context before P0-19/P2-05/P2-03 finance gates.",
    stop: "CTHSSV action creates receivable, payment, invoice, voucher, payout or revenue state.",
  },
  {
    code: "CTHSSV-ROLE-07",
    title: "Negative user denial",
    evidence:
      "OUT_OF_SCOPE_NEGATIVE_USER cannot read CTHSSV route, handover rows, private profile rows or evidence refs.",
    stop: "Negative account can view CTHSSV private data.",
  },
  {
    code: "CTHSSV-ROLE-08",
    title: "Audit and redaction proof",
    evidence:
      "IT_DATA/Audit record controlled redacted evidence refs, account label, route, result and blocker state.",
    stop: "Raw PII, CCCD, phone, bank data, vouchers, passwords, OTPs, invite/reset links or API keys enter Git/Codex/chat.",
  },
];

const evidenceTraceItems: ControlItem[] = [
  {
    code: "CTHSSV-EVID-01",
    title: "Controlled evidence ID",
    evidence:
      "Every UAT and owner row uses a non-secret controlled evidence reference from the approved evidence location.",
    stop: "Evidence ID is missing, ambiguous or replaced by raw proof.",
  },
  {
    code: "CTHSSV-EVID-02",
    title: "Redaction reviewer",
    evidence:
      "IT_DATA/Audit confirms raw PII, CCCD, phone, bank data, vouchers and secrets are excluded from tracked work.",
    stop: "Reviewer authority is missing or unclear.",
  },
  {
    code: "CTHSSV-EVID-03",
    title: "UAT ledger linkage",
    evidence:
      "CTHSSV-UAT-01 through CTHSSV-UAT-08 each link evidence ref, signer and signed date.",
    stop: "UAT row cannot be tied back to controlled evidence and signer.",
  },
  {
    code: "CTHSSV-EVID-04",
    title: "Owner signoff linkage",
    evidence:
      "CTHSSV-SIGN-01 through CTHSSV-SIGN-06 point to related UAT case, blocker state and evidence ref.",
    stop: "Owner signoff is detached from UAT result or blocker state.",
  },
  {
    code: "CTHSSV-EVID-05",
    title: "Audit event trace",
    evidence:
      "Accept/reject, handover state and evidence-review route can be traced by actor, time, route and result.",
    stop: "Audit trace cannot prove actor, timestamp, state or route.",
  },
  {
    code: "CTHSSV-EVID-06",
    title: "Role proof trace",
    evidence:
      "CTHSSV-ROLE-01 through CTHSSV-ROLE-08 link account label, route, result and blocker state.",
    stop: "Role proof cannot connect account, route, result and blocker.",
  },
  {
    code: "CTHSSV-EVID-07",
    title: "Finance gate trace",
    evidence:
      "CTHSSV_TO_ACCOUNTING stays context only and points back to P0-19, P2-05 and P2-03 gates.",
    stop: "CTHSSV evidence is used as finance approval or posting proof.",
  },
  {
    code: "CTHSSV-EVID-08",
    title: "Forbidden-content stop",
    evidence:
      "P0-10-ACCEPT-02 and P0-10-ACCEPT-05 stay mandatory before any evidence reference enters tracked work.",
    stop: "Raw PII, CCCD, phone, bank data, vouchers, passwords, OTPs, invite/reset links, service-role keys or API keys enter Git/Codex/chat.",
  },
];

const finalClosureItems: ControlItem[] = [
  {
    code: "CTHSSV-CLOSE-01",
    title: "Local slice completeness",
    evidence:
      "CTHSSV-00 through CTHSSV-09 have PASS_LOCAL package evidence before final closure is discussed.",
    stop: "Any local slice remains undocumented or unguarded.",
  },
  {
    code: "CTHSSV-CLOSE-02",
    title: "Signed UAT ledger",
    evidence:
      "CTHSSV-UAT-01 through CTHSSV-UAT-08 require signer, date, result and controlled evidence ref.",
    stop: "Unsigned browser run is treated as UAT pass.",
  },
  {
    code: "CTHSSV-CLOSE-03",
    title: "Owner signoff manifest",
    evidence:
      "CTHSSV-SIGN-01 through CTHSSV-SIGN-06 require named human owners and blocker state.",
    stop: "Owner decision is missing, unauthorized or recorded only in Codex/chat.",
  },
  {
    code: "CTHSSV-CLOSE-04",
    title: "Role proof closed",
    evidence:
      "CTHSSV-ROLE-01 through CTHSSV-ROLE-08 prove scoped access and negative denial.",
    stop: "Role/workspace bypass remains open.",
  },
  {
    code: "CTHSSV-CLOSE-05",
    title: "Evidence trace closed",
    evidence:
      "CTHSSV-EVID-01 through CTHSSV-EVID-08 link evidence ref, audit event, reviewer and blocker.",
    stop: "Raw evidence enters tracked work or audit trace is incomplete.",
  },
  {
    code: "CTHSSV-CLOSE-06",
    title: "Finance gates preserved",
    evidence:
      "P0-19, P2-05 and P2-03 remain required before KHTC/accounting reliance.",
    stop: "CTHSSV cockpit creates receivable, payment, invoice, voucher, payout or revenue state.",
  },
  {
    code: "CTHSSV-CLOSE-07",
    title: "Blocker closure",
    evidence:
      "Every NO_GO or BLOCKED item has owner, due date and closure evidence outside Git/Codex/chat.",
    stop: "A blocker is closed by AI/PASS_LOCAL only.",
  },
  {
    code: "CTHSSV-CLOSE-08",
    title: "Final owner quorum",
    evidence:
      "Final owner quorum records CTHSSV_FINAL_CLOSURE_READY, NO_GO or BLOCKED outside Codex/chat.",
    stop: "Final module decision is inferred from local audit success.",
  },
];

const externalOwnerActionItems: ControlItem[] = [
  {
    code: "CTHSSV-OWNER-ACTION-01",
    title: "Signed CTHSSV owner UAT",
    evidence:
      "CTHSSV and Tuyen Sinh owners sign the browser UAT result outside Git/Codex/chat.",
    stop: "Unsigned browser run is treated as CTHSSV profile acceptance.",
  },
  {
    code: "CTHSSV-OWNER-ACTION-02",
    title: "Signed role and negative access UAT",
    evidence:
      "IT_DATA, TRUONG_PHONG and Audit sign scoped allow/deny proof for CTHSSV users and out-of-scope users.",
    stop: "Role proof is missing, ownerless, uses raw private data or grants broad access.",
  },
  {
    code: "CTHSSV-OWNER-ACTION-03",
    title: "Controlled evidence and audit trace",
    evidence:
      "Audit and CTHSSV store controlled evidence IDs for handover state, accept/reject action, role proof and redaction review.",
    stop: "Raw evidence enters Git/Codex/chat or audit trace cannot prove actor/time/state.",
  },
  {
    code: "CTHSSV-OWNER-ACTION-04",
    title: "Signed final module closure",
    evidence:
      "CTHSSV and BGH sign CTHSSV_FINAL_CLOSURE_READY, NO_GO or BLOCKED outside Git/Codex/chat.",
    stop: "Final closure is inferred from local audit success.",
  },
  {
    code: "CTHSSV-OWNER-ACTION-05",
    title: "Handover reliance decision",
    evidence:
      "Tuyen Sinh, CTHSSV and Dao Tao record CTHSSV_HANDOVER_READY, NO_GO or BLOCKED with signer/date.",
    stop: "Handover is used as enrollment, class or training operation approval.",
  },
  {
    code: "CTHSSV-OWNER-ACTION-06",
    title: "Finance gate preservation proof",
    evidence:
      "KHTC/accounting signs that P0-19, P2-05 and P2-03 remain required before downstream reliance.",
    stop: "CTHSSV action creates receivable, payment, invoice, voucher, payout or revenue state.",
  },
  {
    code: "CTHSSV-OWNER-ACTION-07",
    title: "Blocker register closure",
    evidence:
      "Every CTHSSV NO_GO or BLOCKED row has owner, due date and controlled evidence path.",
    stop: "A blocker is closed by AI/PASS_LOCAL only or has no owner.",
  },
  {
    code: "CTHSSV-OWNER-ACTION-08",
    title: "Final owner quorum GO/NO-GO",
    evidence:
      "BGH, IT_DATA, KHTC, PHAP_CHE, Audit and TRUONG_PHONG record CTHSSV_EXTERNAL_OWNER_ACTION_READY, NO_GO or BLOCKED outside Git/Codex/chat.",
    stop: "Final owner quorum GO/NO-GO is missing, unsigned or inferred from local checks.",
  },
];

const readinessItems: ControlItem[] = [
  {
    code: "M06-CTHSSV-01",
    title: "Packet identity",
    evidence:
      "Lead id/code, segment, status, program/major and controlled evidence reference are present before CTHSSV reliance.",
    stop: "Missing packet identity, scope or evidence reference keeps CTHSSV_PROFILE_READY at NO_GO.",
  },
  {
    code: "M06-CTHSSV-02",
    title: "Document checklist",
    evidence:
      "Document state is visible from lead detail and missing-item reasons stay on the source lead/document workflow.",
    stop: "CTHSSV must not accept a profile when required documents are unclear or only oral.",
  },
  {
    code: "M06-CTHSSV-03",
    title: "Receiver scope",
    evidence:
      "The route reads through existing RLS, workspace segment filters and handover.accept_cthssv permission.",
    stop: "Out-of-scope users can read, accept, reject or rely on the handover.",
  },
  {
    code: "M06-CTHSSV-04",
    title: "Accept/reject trace",
    evidence:
      "Lead detail handover action records actor, timestamp, accepted/rejected state and rejection note.",
    stop: "Decision is missing actor, timestamp, state or rejection reason.",
  },
  {
    code: "M06-CTHSSV-05",
    title: "Downstream boundary",
    evidence:
      "CTHSSV may prepare student/profile context; KHTC still uses P0-19, P2-05 and P2-03 before finance facts.",
    stop: "Handover creates receivable, collects tuition, issues invoice, recognizes revenue or approves payout.",
  },
  {
    code: "M06-CTHSSV-06",
    title: "Evidence redaction",
    evidence:
      "Only synthetic or redacted references are used in local proof; raw private evidence stays outside Git/Codex/chat.",
    stop: "Raw PII, CCCD, phone, bank data, vouchers, passwords, OTPs or credentials enter the repo/chat.",
  },
];

const decisionItems: ControlItem[] = [
  {
    code: "M06-DEC-01",
    title: "Profile readiness decision",
    evidence:
      "CTHSSV owner records CTHSSV_PROFILE_READY, NO_GO or BLOCKED with signer/date outside Codex/chat.",
    stop: "PASS_LOCAL or AI output is treated as signed CTHSSV profile acceptance.",
  },
  {
    code: "M06-DEC-02",
    title: "Handover route decision",
    evidence:
      "Each Tuyen Sinh -> CTHSSV and CTHSSV -> KHTC/accounting route has a controlled result and reason.",
    stop: "Route is relied on without accepted/rejected state and auditable owner decision.",
  },
  {
    code: "M06-DEC-03",
    title: "Student-state reliance decision",
    evidence:
      "Student/profile reliance is separated from enrollment approval, finance posting and production approval.",
    stop: "CTHSSV route becomes an enrollment, finance, UAT or production approval shortcut.",
  },
];

const ownerSignoffItems: ControlItem[] = [
  {
    code: "M06-SIGN-01",
    title: "CTHSSV owner authority",
    evidence:
      "Named CTHSSV owner confirms signer authority and profile-reliance scope in HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703.md.",
    stop: "Owner is missing, signer authority is unclear or PASS_LOCAL is treated as CTHSSV acceptance.",
  },
  {
    code: "M06-SIGN-02",
    title: "Sender accountability",
    evidence:
      "Tuyen Sinh owner signs source packet accountability before CTHSSV relies on the handover.",
    stop: "Source lead packet, document state or sender decision is unsigned or unclear.",
  },
  {
    code: "M06-SIGN-03",
    title: "Enrollment boundary",
    evidence:
      "Dao Tao owner confirms enrollment/class reliance remains outside the CTHSSV cockpit decision.",
    stop: "CTHSSV cockpit is treated as enrollment, class or training operation approval.",
  },
  {
    code: "M06-SIGN-04",
    title: "Finance reliance boundary",
    evidence:
      "KHTC/accounting owner confirms CTHSSV context does not bypass P0-19, P2-05 or P2-03.",
    stop: "CTHSSV action creates receivable, payment, invoice, voucher, payout or revenue state.",
  },
  {
    code: "M06-SIGN-05",
    title: "Role and audit proof",
    evidence:
      "IT_DATA and Audit confirm role scope, workspace denial, audit trace and evidence redaction.",
    stop: "Role bypass, missing audit trail or raw evidence exposure remains open.",
  },
  {
    code: "M06-SIGN-06",
    title: "Final owner quorum",
    evidence:
      "Final owner quorum records CTHSSV_OWNER_READY, NO_GO or BLOCKED with blocker list outside Git/Codex/chat.",
    stop: "Any required owner, signed UAT run or blocker closure is missing.",
  },
];

const uatLedgerItems: ControlItem[] = [
  {
    code: "M06-UAT-01",
    title: "Scoped handover queue",
    evidence:
      "UAT_CTHSSV sees only workspace-scoped handover packets and no unrelated student/profile data.",
    stop: "Any out-of-scope handover or raw evidence appears in the CTHSSV cockpit.",
  },
  {
    code: "M06-UAT-02",
    title: "Accept/reject browser proof",
    evidence:
      "Redacted screenshots prove accept/reject works with required notes and audit rows.",
    stop: "Acceptance can bypass missing documents, role scope or rejection reason.",
  },
  {
    code: "M06-UAT-03",
    title: "Finance gate preservation",
    evidence:
      "KHTC/accounting can use CTHSSV context only after P0-19/P2-05/P2-03 gates are proven.",
    stop: "Any CTHSSV action creates receivable, payment, invoice, voucher or payout state.",
  },
  {
    code: "M06-UAT-04",
    title: "Owner result ledger",
    evidence:
      "CTHSSV, Tuyen Sinh, Dao Tao, KHTC, IT_DATA and Audit sign HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703.md outside Git/Codex/chat.",
    stop: "Unsigned browser run is treated as UAT pass, owner GO/NO-GO or production readiness.",
  },
];

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chua co";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function countBy<T>(rows: T[], getKey: (row: T) => string) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const key = getKey(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function statusTone(status: string) {
  if (status === "ACCEPTED" || status === "ENROLLED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "REJECTED" || status === "CANCELLED") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (status === "REQUESTED" || status === "DOCUMENT_SUBMITTED") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${statusTone(
        status,
      )}`}
    >
      {status === "ACCEPTED" ? (
        <CheckCircle2 className="size-3.5" />
      ) : status === "REJECTED" ? (
        <XCircle className="size-3.5" />
      ) : (
        <Clock3 className="size-3.5" />
      )}
      {statusLabels[status] ?? status}
    </span>
  );
}

function KpiCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-normal text-zinc-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 text-zinc-500">{note}</p>
    </article>
  );
}

function ControlGrid({
  title,
  decision,
  items,
  dataAttribute,
  sourceLabel,
}: {
  title: string;
  decision: string;
  items: ControlItem[];
  dataAttribute: Record<string, string>;
  sourceLabel?: string;
}) {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
      {...dataAttribute}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="size-5 text-zinc-600" />
            <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            PASS_LOCAL only. This prepares controlled CTHSSV review and owner
            evidence routing; it does not accept UAT, approve enrollment,
            approve finance action, accept evidence, sign owner GO/NO-GO or mark
            production GO.
          </p>
          {sourceLabel ? (
            <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs font-semibold text-zinc-700">
              <FileText className="size-4 shrink-0 text-zinc-500" />
              <span className="min-w-0 break-words">{sourceLabel}</span>
            </p>
          ) : null}
        </div>
        <span className="w-fit rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs font-semibold text-zinc-700">
          {decision}
        </span>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.code}
            className="rounded-md border border-zinc-200 bg-zinc-50 p-4"
          >
            <p className="font-mono text-xs font-semibold text-zinc-500">
              {item.code}
            </p>
            <h3 className="mt-2 text-sm font-semibold text-zinc-950">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Evidence: {item.evidence}
            </p>
            <p className="mt-2 text-sm leading-6 text-rose-700">
              Stop: {item.stop}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">
      {text}
    </div>
  );
}

export default async function CthssvPage({ searchParams }: CthssvPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentId,
  );
  const segmentFilterIds = admissionWorkspaceSegmentIds(workspace);
  const scopedHref = (href: string) =>
    withAdmissionSegmentParam(href, workspace.activeSegmentId);

  const [{ data: currentRoleCode }, { data: canAcceptCthssv }] =
    await Promise.all([
      supabase.rpc("current_user_role_code"),
      supabase.rpc("has_permission", {
        permission_name: "handover.accept_cthssv",
      }),
    ]);

  const canOpenCthssv =
    currentRoleCode === "ADMIN" ||
    currentRoleCode === "BGH" ||
    Boolean(canAcceptCthssv);

  let handovers: CthssvHandoverRow[] = [];
  let handoverLoadError: string | null = null;
  let readyLeads: CthssvLeadRow[] = [];
  let readyLeadLoadError: string | null = null;

  if (canOpenCthssv) {
    const handoverResult = await applyAdmissionSegmentIds(
      supabase
        .from("lead_handovers")
        .select(
          "id,lead_id,handover_type,from_department,to_department,handover_status,requested_at,accepted_at,rejected_at,note,leads!inner(id,lead_code,student_name,status,priority,interested_program,interested_major,admission_segment_id,assigned_to,updated_at)",
        )
        .eq("status", "ACTIVE")
        .in("handover_type", cthssvHandoverTypes),
      segmentFilterIds,
      "leads.admission_segment_id",
    )
      .order("requested_at", { ascending: false })
      .limit(200)
      .returns<CthssvHandoverRow[]>();

    handovers = handoverResult.data ?? [];
    handoverLoadError = handoverResult.error?.message ?? null;

    const readyLeadResult = await applyAdmissionSegmentIds(
      supabase
        .from("leads")
        .select(
          "id,lead_code,student_name,status,priority,interested_program,interested_major,admission_segment_id,assigned_to,updated_at",
        )
        .eq("is_deleted", false)
        .in("status", handoverReadyStatuses),
      segmentFilterIds,
    )
      .order("updated_at", { ascending: false })
      .limit(500)
      .returns<CthssvLeadRow[]>();

    readyLeads = readyLeadResult.data ?? [];
    readyLeadLoadError = readyLeadResult.error?.message ?? null;
  }

  const allLeadIds = Array.from(
    new Set([
      ...readyLeads.map((lead) => lead.id),
      ...handovers.map((handover) => handover.lead_id),
    ]),
  );
  let documents: CthssvDocumentRow[] = [];
  let documentLoadError: string | null = null;

  if (canOpenCthssv && allLeadIds.length > 0) {
    const documentResult = await supabase
      .from("lead_documents")
      .select("id,lead_id,status")
      .in("lead_id", allLeadIds)
      .returns<CthssvDocumentRow[]>();

    documents = documentResult.data ?? [];
    documentLoadError = documentResult.error?.message ?? null;
  }

  const documentCountByLead = countBy(documents, (document) => document.lead_id);
  const acceptedAdmissionLeadIds = new Set(
    handovers
      .filter(
        (handover) =>
          handover.handover_type === "ADMISSION_TO_CTHSSV" &&
          ["REQUESTED", "ACCEPTED"].includes(handover.handover_status),
      )
      .map((handover) => handover.lead_id),
  );
  const readyWithoutPacket = readyLeads.filter(
    (lead) => !acceptedAdmissionLeadIds.has(lead.id),
  );
  const cthssvQueue = handovers.filter(
    (handover) => handover.handover_type === "ADMISSION_TO_CTHSSV",
  );
  const requestedQueue = cthssvQueue.filter(
    (handover) => handover.handover_status === "REQUESTED",
  );
  const acceptedQueue = cthssvQueue.filter(
    (handover) => handover.handover_status === "ACCEPTED",
  );
  const rejectedQueue = cthssvQueue.filter(
    (handover) => handover.handover_status === "REJECTED",
  );
  const downstreamQueue = handovers.filter(
    (handover) => handover.handover_type === "CTHSSV_TO_ACCOUNTING",
  );
  const profileFindings = readyLeads
    .map((lead) => {
      const issues: string[] = [];

      if ((documentCountByLead.get(lead.id) ?? 0) === 0) {
        issues.push("no document rows visible");
      }

      if (!lead.interested_program && !lead.interested_major) {
        issues.push("missing program/major hint");
      }

      if (!acceptedAdmissionLeadIds.has(lead.id)) {
        issues.push("no active CTHSSV handover packet");
      }

      return { lead, issues };
    })
    .filter((row) => row.issues.length > 0)
    .slice(0, 25);

  return (
    <AppShell
      active="cthssv"
      title="CTHSSV cockpit"
      description={
        workspace.activeSegment
          ? `Kiem soat ban giao ho so HSSV cho: ${workspace.activeSegment.label}.`
          : "Kiem soat ban giao ho so HSSV, profile readiness va UAT gate M06."
      }
      workspaceSegmentId={workspace.activeSegmentId}
      workspaceReturnTo={scopedHref("/cthssv")}
      actions={
        <Button asChild variant="outline">
          <Link href={scopedHref("/cthssv")}>
            <RefreshCcw className="size-4" />
            Tai lai
          </Link>
        </Button>
      }
    >
      <div className="space-y-6" data-heu-cthssv-module-readiness="M06_CTHSSV">
        {!canOpenCthssv ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-800">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <div>
                <h2 className="font-semibold">
                  Chua co quyen mo cockpit CTHSSV
                </h2>
                <p className="mt-1">
                  Can role ADMIN/BGH hoac permission handover.accept_cthssv.
                  Khong hien queue, profile hay evidence khi gate bi chan.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section
          className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm"
          data-heu-cthssv-boundary="M06_CTHSSV_PASS_LOCAL_ONLY"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5" />
                <h2 className="text-base font-semibold">
                  M06 CTHSSV boundary: PASS_LOCAL only
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6">
                Cockpit nay gom queue ban giao, readiness gap va UAT/result
                ledger cho CTHSSV. No does not approve enrollment, handover
                reliance, evidence acceptance, finance posting, UAT acceptance,
                owner GO/NO-GO or production GO.
              </p>
            </div>
            <span className="w-fit rounded-md border border-amber-300 bg-white px-3 py-2 font-mono text-xs font-semibold">
              CTHSSV_PROFILE_READY / NO_GO / BLOCKED
            </span>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Cho CTHSSV nhan"
            value={requestedQueue.length}
            note="ADMISSION_TO_CTHSSV dang REQUESTED trong pham vi workspace."
          />
          <KpiCard
            label="CTHSSV da nhan"
            value={acceptedQueue.length}
            note="Accepted packet van can signed UAT truoc khi reliance."
          />
          <KpiCard
            label="Tra lai/tu choi"
            value={rejectedQueue.length}
            note="Can ly do va audit trace tren lead detail."
          />
          <KpiCard
            label="Ung vien chua goi packet"
            value={readyWithoutPacket.length}
            note="Lead DOCUMENT_SUBMITTED/ELIGIBLE/ENROLLED chua co active CTHSSV handover."
          />
        </section>

        <section
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          data-heu-cthssv-quick-access="M06_CTHSSV_QUICK_ACCESS"
          data-heu-cthssv-quick-access-overflow-guard="M06_CTHSSV_QUICK_ACCESS_NO_OVERFLOW"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5 text-zinc-600" />
                <h2 className="text-base font-semibold text-zinc-950">
                  CTHSSV daily work links
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Quick links are navigation only; edits still happen on source
                lead/document/handover workflows with RLS and audit logs.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                href: scopedHref("/leads?quick=documents"),
                label: "Lead ho so",
                icon: ListChecks,
              },
              {
                href: scopedHref("/documents"),
                label: "Checklist ho so",
                icon: FileText,
              },
              {
                href: scopedHref("/pipeline#pipeline-document-pending"),
                label: "Pipeline ho so",
                icon: ClipboardCheck,
              },
              {
                href: "/master-control",
                label: "Master Control",
                icon: ShieldCheck,
              },
            ].map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-label={`Mo nhanh CTHSSV: ${link.label}`}
                  title={`Mo nhanh CTHSSV: ${link.label}`}
                  className="group flex min-h-16 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 transition hover:border-zinc-400 hover:bg-white"
                >
                  <span className="flex min-w-0 items-center gap-3 overflow-hidden">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-zinc-700 ring-1 ring-zinc-200">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 truncate text-sm font-semibold">
                      {link.label}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-zinc-300 opacity-0 transition group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </section>

        {handoverLoadError || readyLeadLoadError || documentLoadError ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <p>
                Data load warning. Step38 lead_handovers and lead/document RLS
                must be available. Handover: {handoverLoadError ?? "OK"}. Ready
                leads: {readyLeadLoadError ?? "OK"}. Documents:{" "}
                {documentLoadError ?? "OK"}.
              </p>
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-5 text-zinc-600" />
                <h2 className="text-base font-semibold">
                  CTHSSV handover queue
                </h2>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Queue reads lead_handovers and links back to lead detail for the
                controlled accept/reject action.
              </p>
            </div>
            <div className="divide-y divide-zinc-200">
              {cthssvQueue.length === 0 ? (
                <div className="p-5">
                  <EmptyState text="Chua co handover ADMISSION_TO_CTHSSV trong pham vi hien tai." />
                </div>
              ) : (
                cthssvQueue.slice(0, 30).map((handover) => {
                  const lead = handover.leads;
                  const leadSegmentId =
                    lead?.admission_segment_id ?? workspace.activeSegmentId;

                  return (
                    <article key={handover.id} className="p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={handover.handover_status} />
                            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-xs text-zinc-500">
                              {handoverTypeLabels[handover.handover_type] ??
                                handover.handover_type}
                            </span>
                          </div>
                          <h3 className="mt-3 break-words text-sm font-semibold text-zinc-950">
                            {lead?.student_name ?? "Lead khong doc duoc"} -{" "}
                            {lead?.lead_code ?? handover.lead_id}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-zinc-500">
                            {lead?.interested_program ?? "Chua ro chuong trinh"}{" "}
                            / {lead?.interested_major ?? "Chua ro nganh"}.
                            Requested {formatDateTime(handover.requested_at)}.
                          </p>
                          {handover.note ? (
                            <p className="mt-2 text-sm leading-6 text-zinc-700">
                              {handover.note}
                            </p>
                          ) : null}
                        </div>
                        {lead ? (
                          <Button asChild variant="outline">
                            <Link
                              href={withAdmissionSegmentParam(
                                `/leads/${lead.id}#lead-handover`,
                                leadSegmentId,
                              )}
                            >
                              Mo lead
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-600" />
                <h2 className="text-base font-semibold">Profile gap focus</h2>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Local findings only. Real owner must close these with controlled
                evidence outside Git/Codex/chat.
              </p>
            </div>
            <div className="divide-y divide-zinc-200">
              {profileFindings.length === 0 ? (
                <div className="p-5">
                  <EmptyState text="Chua co gap hien thi tu local query." />
                </div>
              ) : (
                profileFindings.map(({ lead, issues }) => (
                  <article key={lead.id} className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={lead.status} />
                      <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-500">
                        docs {documentCountByLead.get(lead.id) ?? 0}
                      </span>
                    </div>
                    <h3 className="mt-3 break-words text-sm font-semibold text-zinc-950">
                      {lead.student_name} - {lead.lead_code}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {issues.join("; ")}
                    </p>
                    <Button asChild variant="outline" className="mt-3">
                      <Link
                        href={withAdmissionSegmentParam(
                          `/leads/${lead.id}#lead-handover`,
                          lead.admission_segment_id,
                        )}
                      >
                        Kiem packet
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Downstream CTHSSV -> Ke toan"
            value={downstreamQueue.length}
            note="Only context handover; finance still gated by P0-19/P2-05/P2-03."
          />
          <KpiCard
            label="Ready statuses"
            value={readyLeads.length}
            note="DOCUMENT_SUBMITTED, ELIGIBLE and ENROLLED visible in workspace."
          />
          <KpiCard
            label="Visible document rows"
            value={documents.length}
            note="Used only as a local gap signal, not evidence acceptance."
          />
          <KpiCard
            label="Local profile findings"
            value={profileFindings.length}
            note="Findings require external owner closure before reliance."
          />
        </section>

        <ControlGrid
          title="M06 CTHSSV module completion breakdown"
          decision="CTHSSV_MODULE_READY / NO_GO / BLOCKED"
          items={moduleBreakdownItems}
          sourceLabel="HEU_CTHSSV_MODULE_COMPLETION_BREAKDOWN_20260703.md"
          dataAttribute={{
            "data-heu-cthssv-module-completion-breakdown": "M06_CTHSSV",
          }}
        />

        <ControlGrid
          title="M06 CTHSSV role and negative access"
          decision="CTHSSV_ROLE_SCOPE_READY / NO_GO / BLOCKED"
          items={roleNegativeAccessItems}
          sourceLabel="HEU_CTHSSV_ROLE_NEGATIVE_ACCESS_CHECKLIST_20260703.md"
          dataAttribute={{
            "data-heu-cthssv-role-negative-access": "M06_CTHSSV",
          }}
        />

        <ControlGrid
          title="M06 CTHSSV controlled evidence trace"
          decision="CTHSSV_EVIDENCE_TRACE_READY / NO_GO / BLOCKED"
          items={evidenceTraceItems}
          sourceLabel="HEU_CTHSSV_CONTROLLED_EVIDENCE_TRACE_CHECKLIST_20260703.md"
          dataAttribute={{
            "data-heu-cthssv-controlled-evidence-trace": "M06_CTHSSV",
          }}
        />

        <ControlGrid
          title="M06 CTHSSV acceptance matrix"
          decision="CTHSSV_PROFILE_READY / NO_GO / BLOCKED"
          items={readinessItems}
          dataAttribute={{
            "data-heu-cthssv-acceptance-matrix": "M06_CTHSSV",
          }}
        />

        <ControlGrid
          title="M06 CTHSSV decision manifest"
          decision="CTHSSV_HANDOVER_READY / NO_GO / BLOCKED"
          items={decisionItems}
          dataAttribute={{
            "data-heu-cthssv-decision-manifest": "M06_CTHSSV",
          }}
        />

        <ControlGrid
          title="M06 CTHSSV owner signoff manifest"
          decision="CTHSSV_OWNER_READY / NO_GO / BLOCKED"
          items={ownerSignoffItems}
          sourceLabel="HEU_CTHSSV_OWNER_SIGNOFF_MANIFEST_20260703.md"
          dataAttribute={{
            "data-heu-cthssv-owner-signoff-manifest": "M06_CTHSSV",
          }}
        />

        <ControlGrid
          title="M06 CTHSSV UAT result ledger"
          decision="CTHSSV_UAT_RESULT_READY / NO_GO / BLOCKED"
          items={uatLedgerItems}
          sourceLabel="HEU_CTHSSV_UAT_RESULT_LEDGER_TEMPLATE_20260703.md"
          dataAttribute={{
            "data-heu-cthssv-uat-result-ledger": "M06_CTHSSV",
          }}
        />

        <ControlGrid
          title="M06 CTHSSV final module closure"
          decision="CTHSSV_FINAL_CLOSURE_READY / NO_GO / BLOCKED"
          items={finalClosureItems}
          sourceLabel="HEU_CTHSSV_FINAL_MODULE_CLOSURE_GATE_20260703.md"
          dataAttribute={{
            "data-heu-cthssv-final-module-closure": "M06_CTHSSV",
          }}
        />

        <ControlGrid
          title="M06 CTHSSV external owner action queue"
          decision="CTHSSV_EXTERNAL_OWNER_ACTION_READY / NO_GO / BLOCKED"
          items={externalOwnerActionItems}
          sourceLabel="HEU_CTHSSV_EXTERNAL_OWNER_ACTION_QUEUE_20260703.md"
          dataAttribute={{
            "data-heu-cthssv-external-owner-action-queue": "M06_CTHSSV",
          }}
        />
      </div>
    </AppShell>
  );
}
