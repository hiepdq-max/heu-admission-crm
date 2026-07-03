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
      </div>
    </AppShell>
  );
}
