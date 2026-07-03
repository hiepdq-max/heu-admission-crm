import Link from "next/link";
import {
  ArrowRightLeft,
  BookOpenCheck,
  ClipboardCheck,
  FileWarning,
  GraduationCap,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";

const controlRows = [
  {
    code: "KHOA-GV-01",
    label: "Scope and owner map",
    owner: "DAO_TAO + Khoa owner + IT_DATA",
    gate: "Faculty/bo mon owner, program scope and class-delivery boundary are named.",
  },
  {
    code: "KHOA-GV-02",
    label: "Teacher profile boundary",
    owner: "Khoa owner + HR + PHAP_CHE",
    gate: "Teacher identity, contract/privacy class and allowed display fields are approved.",
  },
  {
    code: "KHOA-GV-03",
    label: "Class delivery assignment",
    owner: "DAO_TAO + Khoa owner",
    gate: "Class, subject/module, teacher and substitution route are controlled.",
  },
  {
    code: "KHOA-GV-04",
    label: "Teaching session evidence",
    owner: "DAO_TAO + Audit",
    gate: "Session date, attendance/evidence class, completion status and exception route are present.",
  },
  {
    code: "KHOA-GV-05",
    label: "Teaching completion review",
    owner: "Khoa owner + DAO_TAO + Audit",
    gate: "Completion, make-up class, substitute teaching and dispute handling are reviewed.",
  },
  {
    code: "KHOA-GV-06",
    label: "Payment/payroll stop rule",
    owner: "KHTC + HR + Audit",
    gate: "No teaching payment, allowance or payroll entry is trusted without signed policy and UAT.",
  },
  {
    code: "KHOA-GV-07",
    label: "Report view signoff",
    owner: "BGH + Audit + Khoa owner",
    gate: "RV_KHOA_GIANG_VIEN_DELIVERY has source map, DQ result and owner signoff.",
  },
  {
    code: "KHOA-GV-08",
    label: "Production stop rule",
    owner: "IT_DATA + Audit",
    gate: "No production timetable, attendance lock, payroll, report reliance or owner GO from PASS_LOCAL.",
  },
];

const quickAccessRows = [
  {
    code: "KHOA-GV-01..08",
    label: "Control gates",
    owner: "DAO_TAO + Khoa owner",
    href: "#khoa-control-table",
    summary: "Review faculty scope, teacher profile, class delivery and stop rules.",
  },
  {
    code: "KHOA-SIGN-01..06",
    label: "Owner signoff",
    owner: "Process owners + Audit",
    href: "#khoa-owner-signoff",
    summary: "Check pending owner decisions before any M08 reliance claim.",
  },
  {
    code: "KHOA-PRIV-01..06",
    label: "Profile privacy",
    owner: "HR + PHAP_CHE",
    href: "#khoa-teacher-profile-privacy",
    summary: "Review allowed teacher profile display fields and stop rules.",
  },
  {
    code: "KHOA-NEG-01..08",
    label: "Negative access",
    owner: "IT_DATA + Audit",
    href: "#khoa-negative-access",
    summary: "Prepare role denial proof before teacher profile reliance.",
  },
  {
    code: "KHOA-EVID-01..08",
    label: "Evidence trace",
    owner: "IT_DATA + Audit",
    href: "#khoa-evidence-trace",
    summary: "Tie source reconciliation, DQ and controlled evidence refs before reliance.",
  },
  {
    code: "KHOA-UAT-LEDGER",
    label: "UAT result ledger",
    owner: "Audit + IT_DATA",
    href: "#khoa-uat-result-ledger",
    summary: "Use KHOA-UAT-LEDGER-01 through 08 before signed UAT statements.",
  },
  {
    code: "KHOA-SRC-01..08",
    label: "Delivery source map",
    owner: "IT_DATA + Audit",
    href: "#khoa-delivery-source-map",
    summary: "Open RV_KHOA_GIANG_VIEN_DELIVERY source and DQ controls.",
  },
];

const reviewRows = [
  {
    code: "KHOA-REV-01",
    owner: "DAO_TAO + Khoa owner",
    review: "Faculty/class-delivery scope",
    proof: "Owner map, program scope and class-delivery boundary.",
    stop: "Scope is guessed from file names or user labels only.",
  },
  {
    code: "KHOA-REV-02",
    owner: "HR + PHAP_CHE",
    review: "Teacher profile privacy",
    proof: "Allowed fields, privacy class and contract/evidence route.",
    stop: "Raw teacher personal data enters Git/Codex/chat.",
  },
  {
    code: "KHOA-REV-03",
    owner: "DAO_TAO + Audit",
    review: "Teaching assignment and session evidence",
    proof: "Class, subject/module, assigned teacher, substitute route and evidence ref.",
    stop: "Teaching completion can be marked without trace.",
  },
  {
    code: "KHOA-REV-04",
    owner: "KHTC + HR",
    review: "Payment/payroll boundary",
    proof: "Formula version, finance owner and blocked-payment proof.",
    stop: "System calculates or pays before policy signoff.",
  },
  {
    code: "KHOA-REV-05",
    owner: "BGH + Audit",
    review: "Report-view reliance",
    proof: "RV_KHOA_GIANG_VIEN_DELIVERY source map, DQ status and signoff route.",
    stop: "Dashboard is trusted before report-view owner signoff.",
  },
  {
    code: "KHOA-REV-06",
    owner: "IT_DATA + Audit",
    review: "Final UAT trace",
    proof:
      "Actor, route, evidence ref, reviewer, KHOA-NEG-01 through KHOA-NEG-08 negative-access result and owner decision.",
    stop: "PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner GO.",
  },
];

const ownerSignoffRows = [
  {
    code: "KHOA-SIGN-01",
    owner: "DAO_TAO + Khoa owner",
    decision: "Faculty/bo mon scope and class-delivery owner map.",
    evidence: "KHOA-REV-01 plus KHOA-UAT-01 evidence ref.",
    stop: "Owner is missing, signer authority is unclear or PASS_LOCAL is treated as owner acceptance.",
  },
  {
    code: "KHOA-SIGN-02",
    owner: "HR + PHAP_CHE",
    decision: "Teacher profile privacy class and allowed display fields.",
    evidence: "KHOA-REV-02 plus KHOA-UAT-02 evidence ref.",
    stop: "raw teacher personal data, CCCD, bank, phone, payroll or private contract data enters Git/Codex/chat.",
  },
  {
    code: "KHOA-SIGN-03",
    owner: "DAO_TAO + Audit",
    decision: "Teaching assignment, substitution and completion evidence route.",
    evidence: "KHOA-REV-03 plus KHOA-UAT-03/04 evidence ref.",
    stop: "Teaching assignment or completion can be changed without trace.",
  },
  {
    code: "KHOA-SIGN-04",
    owner: "KHTC + HR",
    decision: "Teaching payment/payroll boundary and formula stop rule.",
    evidence: "KHOA-REV-04 plus KHOA-UAT-05 evidence ref.",
    stop: "System calculates, approves or pays teaching allowance/payroll before signed policy and UAT.",
  },
  {
    code: "KHOA-SIGN-05",
    owner: "BGH + Audit + Khoa owner",
    decision: "RV_KHOA_GIANG_VIEN_DELIVERY reliance decision.",
    evidence: "KHOA-REV-05, KHOA-DQ-01 through KHOA-DQ-08 and KHOA-UAT-06 evidence ref.",
    stop: "Dashboard or owner report is relied on before report-view owner signoff.",
  },
  {
    code: "KHOA-SIGN-06",
    owner: "IT_DATA + Audit",
    decision: "Final M08 UAT trace and access-scope check.",
    evidence: "KHOA-REV-06 plus KHOA-UAT-07/08 evidence ref.",
    stop: "Any required owner, signed UAT run, access-scope denial proof or blocker closure is missing.",
  },
];

const teacherProfilePrivacyRows = [
  {
    code: "KHOA-PRIV-01",
    lane: "Teacher display label",
    allowed: "Redacted teacher label, display name or approved alias only.",
    proof: "HR + PHAP_CHE approval reference tied to KHOA-REV-02 and KHOA-SIGN-02.",
    stop: "raw teacher personal data, CCCD, date of birth, home address or private identifier enters Git/Codex/chat.",
  },
  {
    code: "KHOA-PRIV-02",
    lane: "Faculty/bo mon affiliation",
    allowed: "Faculty, bo mon, program scope and owner lane for class-delivery review.",
    proof: "DAO_TAO + Khoa owner scope reference tied to KHOA-REV-01.",
    stop: "Faculty or bo mon ownership is guessed from user labels, filenames or workbook names.",
  },
  {
    code: "KHOA-PRIV-03",
    lane: "Teaching eligibility status",
    allowed: "Coarse eligibility state such as pending review, allowed for UAT review, or blocked.",
    proof: "HR + PHAP_CHE policy/evidence route, with no private contract term in Git/Codex/chat.",
    stop: "Contract terms, salary, allowance, bank or payroll data is exposed.",
  },
  {
    code: "KHOA-PRIV-04",
    lane: "Institutional contact route",
    allowed: "Role-based institutional contact channel or owner lane, not personal contact data.",
    proof: "HR-approved contact-display rule and PHAP_CHE privacy class.",
    stop: "Personal phone, personal email, home address or messaging handle is displayed without signed approval.",
  },
  {
    code: "KHOA-PRIV-05",
    lane: "Controlled evidence route",
    allowed: "Redacted evidence reference ID for teacher profile review, not raw files or Drive URLs.",
    proof: "Controlled evidence location, reviewer lane and redaction reviewer outside Git/Codex/chat.",
    stop: "Raw contract, unredacted screenshot, raw Drive URL, payroll file, voucher or bank file enters Git/Codex/chat.",
  },
  {
    code: "KHOA-PRIV-06",
    lane: "Negative access proof",
    allowed: "Evidence that out-of-scope users cannot see restricted teacher profile fields.",
    proof:
      "docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md, KHOA-NEG-01 through KHOA-NEG-08 and KHOA-UAT-07 evidence ref.",
    stop: "Out-of-scope staff can see teacher private data, payroll, bank data or restricted class evidence.",
  },
];

const negativeAccessRows = [
  {
    code: "KHOA-NEG-01",
    control: "Route access boundary",
    proof:
      "/khoa remains a PASS_LOCAL control surface and does not expose real teacher/private data to anonymous or out-of-scope users.",
    stop: "Anonymous or out-of-scope user can read teacher private data.",
  },
  {
    code: "KHOA-NEG-02",
    control: "Teacher profile allowed-field scope",
    proof:
      "HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703 maps KHOA-PRIV-01 through KHOA-PRIV-06 before display reliance.",
    stop: "A teacher field is displayed without HR/PHAP_CHE privacy approval.",
  },
  {
    code: "KHOA-NEG-03",
    control: "DAO_TAO + Khoa owner scope lane",
    proof:
      "Faculty/bo mon and class-delivery ownership are scoped to KHOA-REV-01 and KHOA-SIGN-01.",
    stop: "DAO_TAO or Khoa owner scope is guessed from file names, workbook labels or user labels.",
  },
  {
    code: "KHOA-NEG-04",
    control: "HR + PHAP_CHE privacy lane",
    proof:
      "HR/PHAP_CHE approve only redacted display-field lanes and controlled evidence refs outside Git/Codex/chat.",
    stop: "raw teacher personal data, private contract, salary, allowance, phone or personal email is exposed.",
  },
  {
    code: "KHOA-NEG-05",
    control: "KHTC/accounting payment boundary",
    proof:
      "KHTC/accounting sees only payment/payroll stop-rule status, not bank, payroll, voucher or private contract files.",
    stop: "Payment, payroll, voucher or bank data is visible or trusted before signed policy and UAT.",
  },
  {
    code: "KHOA-NEG-06",
    control: "OUT_OF_SCOPE_NEGATIVE_USER denial",
    proof:
      "Negative account cannot read restricted teacher profile fields, controlled evidence refs, private contracts, payroll, bank data or restricted class evidence.",
    stop: "Negative account can view teacher private data, payroll, bank data or restricted class evidence.",
  },
  {
    code: "KHOA-NEG-07",
    control: "Controlled evidence redaction",
    proof:
      "IT_DATA/Audit record controlled redacted evidence refs, account label, route, result and blocker state.",
    stop: "Raw evidence, unredacted screenshot, raw Drive URL, password, OTP, invite/reset link or service-role key enters Git/Codex/chat.",
  },
  {
    code: "KHOA-NEG-08",
    control: "UAT/owner trace closure",
    proof:
      "KHOA-UAT-07, KHOA-PRIV-06 and KHOA-SIGN-06 reference the negative access result before owner reliance.",
    stop: "PASS_LOCAL, Codex or AI output is treated as signed role UAT, evidence acceptance or owner GO.",
  },
];

const evidenceTraceRows = [
  {
    code: "KHOA-EVID-01",
    control: "Faculty source owner",
    proof:
      "KHOA-SRC-01 and KHOA-RV-EVID-01 have owner map, program scope and controlled evidence ref.",
    stop: "Faculty scope is ownerless, guessed from labels or missing controlled evidence.",
  },
  {
    code: "KHOA-EVID-02",
    control: "Teacher privacy packet",
    proof:
      "KHOA-PRIV-01 through KHOA-PRIV-06 have privacy class, redaction reviewer and HR/PHAP_CHE route.",
    stop: "raw teacher personal data, private contract, salary, allowance, phone, bank or payroll data enters Git/Codex/chat.",
  },
  {
    code: "KHOA-EVID-03",
    control: "Class assignment trace",
    proof:
      "KHOA-SRC-03, KHOA-DQ-03 and KHOA-RV-EVID-03 prove class/module assignment and substitute route.",
    stop: "Assignment or timetable is relied on without trace.",
  },
  {
    code: "KHOA-EVID-04",
    control: "Teaching evidence route",
    proof:
      "KHOA-SRC-04/05 and KHOA-RV-EVID-04 use redacted evidence refs for session and completion review.",
    stop: "Teaching completion, attendance lock or make-up class is trusted without controlled evidence.",
  },
  {
    code: "KHOA-EVID-05",
    control: "Payment/payroll boundary",
    proof:
      "KHOA-SRC-06, KHOA-SIGN-04 and KHOA-RV-EVID-05 keep formula, policy and blocked-payment proof separate.",
    stop: "Teaching payment, allowance, payroll, voucher or bank data is calculated, approved or exposed.",
  },
  {
    code: "KHOA-EVID-06",
    control: "Report-view source reconciliation",
    proof:
      "KHOA-SRC-07, KHOA-DQ-07, DQ-RV-09 and RV-EVID-07 record the source reconciliation result.",
    stop: "Dashboard or owner report is used before signed source reconciliation and owner decision.",
  },
  {
    code: "KHOA-EVID-07",
    control: "Negative access evidence",
    proof:
      "KHOA-NEG-01 through KHOA-NEG-08 have account label, route, result and denial proof.",
    stop: "OUT_OF_SCOPE_NEGATIVE_USER can view teacher private data, payroll, bank data or restricted class evidence.",
  },
  {
    code: "KHOA-EVID-08",
    control: "UAT and owner closure",
    proof:
      "KHOA-UAT-LEDGER-01 through KHOA-UAT-LEDGER-08 and KHOA-SIGN-01 through KHOA-SIGN-06 are linked.",
    stop: "PASS_LOCAL, Codex or AI output is treated as signed UAT, evidence acceptance or owner GO.",
  },
];

const uatRows = [
  {
    code: "KHOA-UAT-LEDGER-01",
    uat: "KHOA-UAT-01",
    review: "KHOA-REV-01",
    signoff: "KHOA-SIGN-01",
    evidence: "Faculty/bo mon scope, owner map and route/user label.",
    stop: "Scope is guessed or unsigned.",
  },
  {
    code: "KHOA-UAT-LEDGER-02",
    uat: "KHOA-UAT-02",
    review: "KHOA-REV-02",
    signoff: "KHOA-SIGN-02",
    evidence: "Teacher profile privacy class and allowed display fields.",
    stop: "Raw teacher personal data enters Git/Codex/chat.",
  },
  {
    code: "KHOA-UAT-LEDGER-03",
    uat: "KHOA-UAT-03",
    review: "KHOA-REV-03",
    signoff: "KHOA-SIGN-03",
    evidence: "Class, subject/module, assigned teacher and substitution route.",
    stop: "Assignment can be changed without trace.",
  },
  {
    code: "KHOA-UAT-LEDGER-04",
    uat: "KHOA-UAT-04",
    review: "KHOA-REV-03",
    signoff: "KHOA-SIGN-03",
    evidence: "Session evidence, attendance/completion status and exception route.",
    stop: "Teaching completion is trusted without evidence.",
  },
  {
    code: "KHOA-UAT-LEDGER-05",
    uat: "KHOA-UAT-05",
    review: "KHOA-REV-04",
    signoff: "KHOA-SIGN-04",
    evidence: "Formula version, finance owner and blocked-payment proof.",
    stop: "System calculates or pays before policy signoff.",
  },
  {
    code: "KHOA-UAT-LEDGER-06",
    uat: "KHOA-UAT-06",
    review: "KHOA-REV-05",
    signoff: "KHOA-SIGN-05",
    evidence: "RV_KHOA_GIANG_VIEN_DELIVERY source map, DQ result and signoff route.",
    stop: "Dashboard is relied on before report-view owner signoff.",
  },
  {
    code: "KHOA-UAT-LEDGER-07",
    uat: "KHOA-UAT-07",
    review: "KHOA-REV-06",
    signoff: "KHOA-SIGN-06",
    evidence: "KHOA-NEG-01 through KHOA-NEG-08 negative route/user evidence ref with scoped result.",
    stop: "Out-of-scope staff see teacher private data, payroll or restricted class evidence.",
  },
  {
    code: "KHOA-UAT-LEDGER-08",
    uat: "KHOA-UAT-08",
    review: "KHOA-REV-06",
    signoff: "KHOA-SIGN-06",
    evidence: "Actor, owner, evidence ref, reviewer and decision trace row.",
    stop: "PASS_LOCAL, Codex or AI output is treated as owner approval.",
  },
];

const sourceMapRows = [
  {
    code: "KHOA-SRC-01",
    lane: "Faculty/bo mon owner map",
    source: "admission_departments, staff/position controls and future owner-signed Khoa register.",
    dq: "KHOA-DQ-01",
    stop: "Faculty scope is guessed or ownerless.",
  },
  {
    code: "KHOA-SRC-02",
    lane: "Teacher profile allowed fields",
    source:
      "docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md plus HR/PHAP_CHE-approved display-field register outside Git/Codex/chat.",
    dq: "KHOA-DQ-02",
    stop: "Raw teacher personal data, CCCD, phone, bank or payroll data enters Git/Codex/chat.",
  },
  {
    code: "KHOA-SRC-03",
    lane: "Class and subject/module assignment",
    source: "DAO_TAO class/program primitives plus future Khoa assignment register.",
    dq: "KHOA-DQ-03",
    stop: "Assignment can change without audit trace.",
  },
  {
    code: "KHOA-SRC-04",
    lane: "Teaching session evidence",
    source: "Controlled evidence reference outside Git/Codex/chat.",
    dq: "KHOA-DQ-04",
    stop: "Teaching completion is trusted without controlled evidence.",
  },
  {
    code: "KHOA-SRC-05",
    lane: "Completion review",
    source: "DAO_TAO + Khoa owner + Audit review queue.",
    dq: "KHOA-DQ-05",
    stop: "Completion status bypasses Khoa owner or Audit.",
  },
  {
    code: "KHOA-SRC-06",
    lane: "Payment/payroll stop rule",
    source: "KHTC + HR policy/signoff route, not an automated formula.",
    dq: "KHOA-DQ-06",
    stop: "System calculates, approves or pays teacher allowance/payroll before signed policy and UAT.",
  },
  {
    code: "KHOA-SRC-07",
    lane: "Report-view signoff",
    source: "RV_KHOA_GIANG_VIEN_DELIVERY in the Report View register and source map.",
    dq: "KHOA-DQ-07",
    stop: "Dashboard is used for reliance before report-view owner signoff.",
  },
  {
    code: "KHOA-SRC-08",
    lane: "Final UAT trace",
    source:
      "KHOA-UAT-LEDGER-01 through KHOA-UAT-LEDGER-08 plus docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md for KHOA-UAT-07.",
    dq: "KHOA-DQ-08",
    stop: "PASS_LOCAL, Codex or AI output is treated as UAT acceptance or owner approval.",
  },
];

const sourceKpiRows = [
  {
    code: "KPI_KHOA_TEACHER_PROFILE_SCOPE_GAP",
    use: "HR/PHAP_CHE review queue only.",
    forbidden: "Does not approve teacher profile display in production.",
  },
  {
    code: "KPI_KHOA_CLASS_ASSIGNMENT_TRACE_GAP",
    use: "DAO_TAO + Khoa owner assignment review.",
    forbidden: "Does not approve timetable or class delivery reliance.",
  },
  {
    code: "KPI_KHOA_DELIVERY_EVIDENCE_TRACE_GAP",
    use: "Audit and UAT preparation.",
    forbidden: "Does not prove teaching completion, attendance lock or evidence acceptance.",
  },
  {
    code: "KPI_KHOA_PAYMENT_BOUNDARY_BLOCKED",
    use: "KHTC + HR risk review.",
    forbidden: "Does not calculate, approve or pay teaching payment/payroll.",
  },
  {
    code: "KPI_KHOA_REPORT_VIEW_SIGNOFF_GAP",
    use: "BGH/Audit report-view readiness review.",
    forbidden: "Does not make the dashboard production-reliable.",
  },
];

function StatusBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-full rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-left text-xs font-medium leading-5 text-amber-700">
      {children}
    </span>
  );
}

export function KhoaGiangVienGapPack() {
  return (
    <section
      data-heu-khoa-giang-vien-gap-pack="P10-01"
      className="rounded-lg border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
              <GraduationCap className="size-5 text-zinc-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">
                  Khoa/Giang vien Gap Pack: PASS_LOCAL only
                </h2>
                <StatusBadge>KHOA_GV_READY / NO_GO / BLOCKED</StatusBadge>
              </div>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
                This surface turns M08 from an early placeholder into a
                controlled review pack for faculty scope, teacher profile
                privacy, class delivery and teaching-evidence reliance. It is
                read-only and does not approve timetable, attendance, teacher
                payment, payroll, UAT, evidence or production.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-700">
              DRAFT_CONTROL
            </span>
            <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-700">
              Production NO-GO
            </span>
          </div>
        </div>
      </div>

      <div
        className="border-b border-zinc-200 p-5"
        data-heu-khoa-quick-access="P10-01_KHOA_QUICK_ACCESS"
        data-heu-khoa-quick-open="P10-01_KHOA_QUICK_OPEN_TOP3"
        data-heu-khoa-quick-access-overflow-guard="P10-01_KHOA_QUICK_ACCESS_NO_OVERFLOW"
      >
        <div className="mb-3 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-zinc-950">
              <ListChecks className="size-4 shrink-0 text-zinc-600" />
              <span className="truncate">Khoa quick access</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Core PASS_LOCAL anchors for M08 review: control gates, owner
              signoff, profile privacy, negative access, evidence trace, UAT
              result ledger and delivery source map.
            </p>
          </div>
          <StatusBadge>READ_ONLY_NAVIGATION / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {quickAccessRows.map((row) => (
            <Link
              key={row.code}
              href={row.href}
              aria-label={`Open ${row.label} for ${row.code}`}
              title={`Open ${row.label}`}
              className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-4 text-left transition hover:border-zinc-300 hover:bg-white"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-zinc-500">
                    {row.code}
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold leading-5 text-zinc-950">
                    {row.label}
                  </p>
                </div>
                <ArrowRightLeft className="mt-0.5 size-4 shrink-0 text-zinc-500" />
              </div>
              <p className="mt-2 break-words text-xs font-medium leading-5 text-zinc-500">
                {row.owner}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                {row.summary}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-4">
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <Users className="size-4" />
            Scope
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            Faculty, bo mon and owner lanes must be confirmed before class
            delivery data can be used outside a draft review.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <ShieldCheck className="size-4" />
            Teacher profile
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            Teacher identity, contract and privacy class need HR and PHAP_CHE
            approval before any production display.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <BookOpenCheck className="size-4" />
            Class delivery
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            Assignment, substitution, session evidence and completion review
            stay UAT-gated until the owner trace exists.
          </p>
        </div>
        <div className="rounded-md bg-zinc-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            <FileWarning className="size-4" />
            Payroll stop
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            No teaching payment, allowance, payroll or report-view reliance is
            approved from this PASS_LOCAL surface.
          </p>
        </div>
      </div>

      <div
        className="grid gap-5 border-t border-zinc-200 p-5 xl:grid-cols-[1.3fr_1fr]"
        id="khoa-control-table"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Gate</th>
                <th className="px-4 py-3">Control</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Required proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {controlRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="px-4 py-4 font-medium text-zinc-950">
                    {row.label}
                  </td>
                  <td className="px-4 py-4 text-zinc-700">{row.owner}</td>
                  <td className="px-4 py-4 text-zinc-600">{row.gate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="space-y-3"
          data-heu-khoa-review-handoff="P10-01_REVIEW_HANDOFF"
          data-heu-khoa-review-decision="KHOA_REVIEW_READY_NO_GO_BLOCKED"
        >
          {reviewRows.map((row) => (
            <div key={row.code} className="rounded-md border border-zinc-200 p-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4 text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-950">
                  {row.code} - {row.review}
                </p>
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-700">
                {row.owner}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {row.proof}
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-amber-700">
                <FileWarning className="mt-0.5 size-4 shrink-0" />
                {row.stop}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        id="khoa-owner-signoff"
        className="border-t border-zinc-200 bg-zinc-50 p-5"
        data-heu-khoa-owner-signoff="P10-01_OWNER_SIGNOFF_MANIFEST"
        data-heu-khoa-owner-signoff-manifest="P10-03_OWNER_SIGNOFF_MANIFEST"
        data-heu-khoa-owner-signoff-doc="HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703"
        data-heu-khoa-owner-decision="KHOA_OWNER_READY_NO_GO_BLOCKED"
        data-heu-khoa-owner-signoff-overflow-guard="P10-03_KHOA_OWNER_SIGNOFF_NO_OVERFLOW"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ShieldCheck className="size-4 text-zinc-600" />
              <span>Khoa owner signoff manifest</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Missing, unsigned, NO_GO or BLOCKED owner decisions keep
              Khoa/Giang vien production locked. Evidence references and
              signatures stay outside Git/Codex/chat. Use
              docs/HEU_KHOA_GIANG_VIEN_OWNER_SIGNOFF_MANIFEST_20260703.md
              before any owner reliance claim.
            </p>
          </div>
          <StatusBadge>KHOA_OWNER_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ownerSignoffRows.map((row) => (
            <article
              key={row.code}
              className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-zinc-500">
                  {row.code}
                </span>
                <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  PENDING_OWNER
                </span>
              </div>
              <p className="mt-3 break-words text-sm font-semibold text-zinc-950">
                {row.owner}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                {row.decision}
              </p>
              <p className="mt-2 break-words text-xs font-medium leading-5 text-zinc-500">
                {row.evidence}
              </p>
              <p className="mt-2 flex items-start gap-2 break-words text-sm leading-6 text-amber-700">
                <FileWarning className="mt-0.5 size-4 shrink-0" />
                {row.stop}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div
        id="khoa-teacher-profile-privacy"
        className="border-t border-zinc-200 p-5"
        data-heu-khoa-teacher-profile-privacy="P10-04_TEACHER_PROFILE_PRIVACY_REGISTER"
        data-heu-khoa-teacher-profile-privacy-doc="HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703"
        data-heu-khoa-teacher-profile-privacy-decision="KHOA_TEACHER_PROFILE_PRIVACY_READY_NO_GO_BLOCKED"
        data-heu-khoa-teacher-profile-privacy-overflow-guard="P10-04_KHOA_TEACHER_PROFILE_PRIVACY_NO_OVERFLOW"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ShieldCheck className="size-4 text-zinc-600" />
              <span>Teacher profile privacy register</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              P10-04 records the allowed teacher profile display-field lanes in
              docs/HEU_KHOA_GIANG_VIEN_TEACHER_PROFILE_PRIVACY_REGISTER_20260703.md.
              The register stays read-only: real teacher data, signer names and
              evidence files remain outside Git/Codex/chat.
            </p>
          </div>
          <StatusBadge>
            KHOA_TEACHER_PROFILE_PRIVACY_READY / NO_GO / BLOCKED
          </StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[13%] px-4 py-3">Privacy case</th>
                <th className="w-[19%] px-4 py-3">Field lane</th>
                <th className="w-[24%] px-4 py-3">Allowed local meaning</th>
                <th className="w-[22%] px-4 py-3">Required owner proof</th>
                <th className="w-[22%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {teacherProfilePrivacyRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.lane}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.allowed}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        id="khoa-negative-access"
        className="border-t border-zinc-200 bg-zinc-50 p-5"
        data-heu-khoa-negative-access="P10-05_NEGATIVE_ACCESS_CHECKLIST"
        data-heu-khoa-negative-access-doc="HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703"
        data-heu-khoa-negative-access-decision="KHOA_NEGATIVE_ACCESS_READY_NO_GO_BLOCKED"
        data-heu-khoa-negative-access-overflow-guard="P10-05_KHOA_NEGATIVE_ACCESS_NO_OVERFLOW"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ShieldAlert className="size-4 text-zinc-600" />
              <span>Khoa negative access checklist</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              P10-05 prepares role denial proof through
              docs/HEU_KHOA_GIANG_VIEN_NEGATIVE_ACCESS_CHECKLIST_20260703.md.
              It connects KHOA-NEG-01 through KHOA-NEG-08 to KHOA-PRIV-06,
              KHOA-UAT-07 and KHOA-SIGN-06 before any teacher profile reliance.
            </p>
          </div>
          <StatusBadge>KHOA_NEGATIVE_ACCESS_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed text-sm">
            <thead className="bg-white text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[13%] px-4 py-3">Case</th>
                <th className="w-[23%] px-4 py-3">Control</th>
                <th className="w-[34%] px-4 py-3">Required local proof</th>
                <th className="w-[30%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {negativeAccessRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.control}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        id="khoa-evidence-trace"
        className="border-t border-zinc-200 p-5"
        data-heu-khoa-evidence-trace="P10-06_EVIDENCE_TRACE_SOURCE_RECONCILIATION"
        data-heu-khoa-evidence-trace-doc="HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703"
        data-heu-khoa-evidence-trace-decision="KHOA_EVIDENCE_TRACE_READY_NO_GO_BLOCKED"
        data-heu-khoa-evidence-trace-overflow-guard="P10-06_KHOA_EVIDENCE_TRACE_NO_OVERFLOW"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ClipboardCheck className="size-4 text-zinc-600" />
              <span>Khoa evidence trace/source reconciliation</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              P10-06 prepares
              docs/HEU_KHOA_GIANG_VIEN_EVIDENCE_TRACE_SOURCE_RECONCILIATION_CHECKLIST_20260703.md.
              KHOA-EVID-01 through KHOA-EVID-08 tie source reconciliation, DQ,
              privacy, negative access, UAT ledger and owner signoff before
              `RV_KHOA_GIANG_VIEN_DELIVERY` reliance.
            </p>
          </div>
          <StatusBadge>KHOA_EVIDENCE_TRACE_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="mb-3 inline-flex max-w-full rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium leading-5 text-amber-700">
          PENDING_EXTERNAL_SOURCE_RECONCILIATION
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[13%] px-4 py-3">Evidence</th>
                <th className="w-[22%] px-4 py-3">Control</th>
                <th className="w-[35%] px-4 py-3">Required trace</th>
                <th className="w-[30%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {evidenceTraceRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.control}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.proof}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 flex items-start gap-2 break-words text-sm leading-6 text-amber-700">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          PASS_LOCAL does not approve report-view reliance, approve dashboard
          reliance, accept DQ evidence, accept source reconciliation, execute
          UAT, accept evidence, approve owner GO/NO-GO or mark production GO.
        </p>
        <p className="mt-2 text-xs font-medium text-zinc-500">
          KHOA_SOURCE_RECONCILIATION_READY / NO_GO / BLOCKED
        </p>
      </div>

      <div
        id="khoa-uat-result-ledger"
        className="border-t border-zinc-200 p-5"
        data-heu-khoa-uat-result-ledger="P10-01_UAT_RESULT_LEDGER"
        data-heu-khoa-uat-result-decision="KHOA_UAT_RESULT_READY_NO_GO_BLOCKED"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ListChecks className="size-4 text-zinc-600" />
              <span>Khoa UAT result ledger</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              Record KHOA-UAT-LEDGER-01 through KHOA-UAT-LEDGER-08 in
              docs/HEU_KHOA_GIANG_VIEN_UAT_RESULT_LEDGER_TEMPLATE_20260703.md.
              Each row needs a controlled evidence ref, reviewer and owner
              decision outside Codex/chat.
            </p>
          </div>
          <StatusBadge>KHOA_UAT_RESULT_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[16%] px-4 py-3">Ledger</th>
                <th className="w-[12%] px-4 py-3">UAT</th>
                <th className="w-[12%] px-4 py-3">Review</th>
                <th className="w-[12%] px-4 py-3">Signoff</th>
                <th className="w-[24%] px-4 py-3">Evidence ref</th>
                <th className="w-[24%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {uatRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.uat}
                  </td>
                  <td className="break-words px-4 py-4 text-zinc-700">
                    {row.review}
                  </td>
                  <td className="break-words px-4 py-4 text-zinc-700">
                    {row.signoff}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.evidence}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        id="khoa-delivery-source-map"
        className="border-t border-zinc-200 p-5"
        data-heu-khoa-delivery-source-map="P10-02_RV_KHOA_GIANG_VIEN_DELIVERY"
        data-heu-khoa-delivery-source-decision="KHOA_DELIVERY_SOURCE_READY_NO_GO_BLOCKED"
        data-heu-khoa-delivery-source-overflow-guard="P10-02_KHOA_SOURCE_MAP_NO_OVERFLOW"
      >
        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
              <ClipboardCheck className="size-4 text-zinc-600" />
              <span>RV_KHOA_GIANG_VIEN_DELIVERY source map</span>
            </div>
            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-zinc-600">
              P10-02 maps faculty scope, teacher profile privacy, class
              assignment, teaching evidence, payment/payroll stop rules and
              report-view signoff before any dashboard reliance.
            </p>
          </div>
          <StatusBadge>KHOA_DELIVERY_SOURCE_READY / NO_GO / BLOCKED</StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="w-[13%] px-4 py-3">Source</th>
                <th className="w-[22%] px-4 py-3">Lane</th>
                <th className="w-[31%] px-4 py-3">Controlled source</th>
                <th className="w-[12%] px-4 py-3">DQ</th>
                <th className="w-[22%] px-4 py-3">Stop condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {sourceMapRows.map((row) => (
                <tr key={row.code} className="align-top">
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.code}
                  </td>
                  <td className="break-words px-4 py-4 font-medium text-zinc-950">
                    {row.lane}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-zinc-600">
                    {row.source}
                  </td>
                  <td className="break-words px-4 py-4 font-mono text-xs text-zinc-500">
                    {row.dq}
                  </td>
                  <td className="whitespace-normal break-words px-4 py-4 text-amber-700">
                    {row.stop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {sourceKpiRows.map((row) => (
            <article
              key={row.code}
              className="min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 p-4"
            >
              <p className="break-words font-mono text-xs text-zinc-500">
                {row.code}
              </p>
              <p className="mt-3 break-words text-sm leading-6 text-zinc-700">
                {row.use}
              </p>
              <p className="mt-2 flex items-start gap-2 break-words text-sm leading-6 text-amber-700">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                {row.forbidden}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-2 text-sm leading-6 text-amber-800">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            PASS_LOCAL does not approve class delivery reliance, teacher profile
            reliance, teaching completion, attendance lock, teaching payment,
            payroll, evidence acceptance, UAT acceptance, owner GO/NO-GO or
            production GO.
          </p>
        </div>
      </div>
    </section>
  );
}
