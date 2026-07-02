import Link from "next/link";
import {
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  FileWarning,
  ListChecks,
  MailCheck,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import {
  PRODUCTION_BLOCKERS,
  PRODUCTION_EXECUTION_STEPS,
  SAFE_ITERATION_STEPS,
} from "@/lib/production-readiness";

const DAILY_REPORT_LINES = [
  {
    code: "DRY-RUN-REPORT-01",
    title: "Tien do xay dung",
    audience: "BGH + IT_DATA",
    detail:
      "Tom tat lat da PASS_LOCAL, audit/lint/build da chay, file da sua va blocker con lai.",
  },
  {
    code: "DRY-RUN-REPORT-02",
    title: "Nguoi dang dung thu",
    audience: "KHTC + BGH + Audit + Phap Che",
    detail:
      "Chi dung label vai tro/nhom phong ban, cach dang dung thu, trang thai NO_GO/BLOCKED/PASS_LOCAL va viec can xac nhan.",
  },
  {
    code: "DRY-RUN-REPORT-03",
    title: "Chu thich de hieu",
    audience: "All owners",
    detail:
      "Giai thich ngan gon audit, lint, build, evidence, UAT, PASS_LOCAL va NO-GO bang ngon ngu dieu hanh.",
  },
];

const TASK_HANDOFF_LANES = [
  {
    code: "TASK-HANDOFF-01",
    owner: "IT_DATA",
    task: "Chay PASS_LOCAL gate va ghi loi vao blocker neu co buoc FAIL.",
    stop: "Khong chuyen lat tiep theo khi audit/lint/build chua xanh.",
  },
  {
    code: "TASK-HANDOFF-02",
    owner: "KHTC",
    task: "Dung thu Finance Desk o che do read-only theo nhan vai tro da duyet.",
    stop: "Khong nhap mat khau, OTP, invite/reset link, so tai khoan ngan hang hoac du lieu thanh toan tho.",
  },
  {
    code: "TASK-HANDOFF-03",
    owner: "BGH + Audit + Phap Che",
    task: "Xem blocker, evidence reference va viec can ky/xac nhan dung tham quyen.",
    stop: "Khong coi PASS_LOCAL la UAT signed, finance approved, owner GO hoac production GO.",
  },
];

const DEPARTMENT_TASK_HANDOFF_REGISTER = [
  {
    code: "DEPT-TASK-01",
    department: "BGH",
    userLabel: "BGH_READONLY_REVIEWER_LABEL",
    stage: "Daily review",
    task: "Review Master Control blockers and plain-language report.",
    usage:
      "Read NO-GO blockers, ask the right owner for evidence and wait for signed decision.",
    stop: "PASS_LOCAL is treated as approval.",
  },
  {
    code: "DEPT-TASK-02",
    department: "IT_DATA",
    userLabel: "IT_DATA_BUILD_OPERATOR_LABEL",
    stage: "Every build slice",
    task: "Run PASS_LOCAL checks and record the failed gate if any.",
    usage:
      "Check git state, run audit/lint/build, package one small commit and keep production NO-GO.",
    stop: "Dirty scope appears outside the slice or any audit fails.",
  },
  {
    code: "DEPT-TASK-03",
    department: "KHTC",
    userLabel: "KHTC_ACCOUNTING_OPERATOR_LABEL",
    stage: "Finance Day-1 trial",
    task: "Use Finance Desk read-only and record blocker/result.",
    usage:
      "Compare summary views, note mismatches and escalate through the Day-1 result ledger.",
    stop: "Voucher posting, bank transfer or raw bank/payment data is requested.",
  },
  {
    code: "DEPT-TASK-04",
    department: "PHAP_CHE",
    userLabel: "PHAP_CHE_REVIEWER_LABEL",
    stage: "Legal/finance gate",
    task: "Review legal, SOP and evidence blockers.",
    usage:
      "Confirm legal basis, contract/SOP route and unresolved exception owner outside Git/Codex/chat.",
    stop: "Legal conclusion is requested from AI/Codex.",
  },
  {
    code: "DEPT-TASK-05",
    department: "Audit",
    userLabel: "AUDIT_READONLY_REVIEWER_LABEL",
    stage: "Evidence/UAT route",
    task: "Check evidence reference, redaction and audit trace.",
    usage:
      "Verify proof owner, redaction reviewer and audit-log trace before owner signoff.",
    stop: "Raw evidence, PII, bank statement or voucher appears in Git/Codex/chat.",
  },
  {
    code: "DEPT-TASK-06",
    department: "TUYEN_SINH",
    userLabel: "TUYEN_SINH_OPERATOR_LABEL",
    stage: "Lead lifecycle UAT",
    task: "Execute P3-01/P3-02 lead lifecycle checklist when scheduled.",
    usage:
      "Confirm lead status, handover blocker and no finance bypass in signed UAT.",
    stop: "Handover creates finance facts before the required gate.",
  },
  {
    code: "DEPT-TASK-07",
    department: "CTHSSV",
    userLabel: "CTHSSV_HANDOVER_OPERATOR_LABEL",
    stage: "Student handover UAT",
    task: "Review handover packet readiness.",
    usage:
      "Check student-profile readiness and missing documents with redacted evidence references.",
    stop: "Raw PII is pasted into report, email, Git or chat.",
  },
  {
    code: "DEPT-TASK-08",
    department: "DAO_TAO + HR",
    userLabel: "DAO_TAO_REVIEWER_LABEL / HR_REVIEWER_LABEL",
    stage: "Class/payment policy readiness",
    task: "Review Short Course, attendance and allowance/payment blockers.",
    usage:
      "Check class/course dependencies, policy owner route and required proof before signoff.",
    stop: "Attendance/payment period is closed or HR payment is approved from PASS_LOCAL.",
  },
];

export function ProductionReadinessBlockerSummary() {
  return (
    <section
      data-heu-production-blocker-summary="P5-02"
      className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm shadow-sm"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex max-w-5xl items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-rose-700" />
          <div>
            <h2 className="font-semibold text-rose-950">
              P5-02 production blocker summary: PASS_LOCAL only
            </h2>
            <p className="mt-2 leading-6 text-rose-900">
              Read-only BGH/owner view for the TTGDTX production blockers.
              Production remains NO-GO until backup/restore, migration order,
              legal/finance UAT, payout UAT, dashboard UAT, role-scope UAT,
              audit-log UAT, hard-delete conversion/waiver, redaction, P0-14
              intake-ledger evidence binder, P0-15 final handoff summary and
              final owner sign-off are completed outside Codex/chat.
            </p>
          </div>
        </div>
        <div className="grid min-w-72 gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-md border border-rose-200 bg-white px-3 py-2 text-rose-950">
            Current recommendation:
            <span className="mt-1 block font-semibold">NO-GO</span>
          </div>
          <div className="rounded-md border border-rose-200 bg-white px-3 py-2 text-rose-950">
            Tracked blockers:
            <span className="mt-1 block font-semibold">
              {PRODUCTION_BLOCKERS.length}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {PRODUCTION_BLOCKERS.map((blocker) => (
          <article
            key={blocker.code}
            className="border-l-2 border-rose-300 bg-white px-3 py-3"
          >
            <div className="flex items-start gap-2">
              <FileWarning className="mt-0.5 size-4 shrink-0 text-rose-700" />
              <div>
                <p className="text-xs font-semibold uppercase text-rose-700">
                  {blocker.code}
                </p>
                <p className="mt-1 font-medium text-zinc-950">
                  {blocker.title}
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Owner: {blocker.owner}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">
                  {blocker.requiredEvidence}
                </p>
                {blocker.href ? (
                  <Link
                    href={blocker.href}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-rose-700 hover:text-rose-950"
                  >
                    Open source view
                    <ClipboardCheck className="size-3" />
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div
        className="mt-5 rounded-md border border-rose-200 bg-white p-4"
        data-heu-daily-report-task-handoff="P5-02"
      >
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-rose-700" />
          <div>
            <h3 className="font-semibold text-zinc-950">
              Daily report and task handoff: dry-run only
            </h3>
            <p className="mt-1 leading-6 text-zinc-600">
              DAILY_REPORT_DRY_RUN / NO_GO / BLOCKED. This shell shows what a
              daily email summary and in-app task list must contain, but it
              does not send email, create real tasks, store secrets or approve
              any business decision.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          {DAILY_REPORT_LINES.map((line) => (
            <article
              key={line.code}
              className="border-l-2 border-rose-200 bg-rose-50 px-3 py-3"
            >
              <div className="flex items-start gap-2">
                <ListChecks className="mt-0.5 size-4 shrink-0 text-rose-700" />
                <div>
                  <p className="text-xs font-semibold uppercase text-rose-700">
                    {line.code}
                  </p>
                  <p className="mt-1 font-medium text-zinc-950">
                    {line.title}
                  </p>
                  <p className="mt-2 text-xs font-medium text-zinc-500">
                    To: {line.audience}
                  </p>
                  <p className="mt-2 leading-5 text-zinc-700">
                    {line.detail}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          {TASK_HANDOFF_LANES.map((lane) => (
            <article
              key={lane.code}
              className="border-l-2 border-rose-200 bg-rose-50 px-3 py-3"
            >
              <div className="flex items-start gap-2">
                <UsersRound className="mt-0.5 size-4 shrink-0 text-rose-700" />
                <div>
                  <p className="text-xs font-semibold uppercase text-rose-700">
                    {lane.code}
                  </p>
                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Owner: {lane.owner}
                  </p>
                  <p className="mt-2 leading-5 text-zinc-700">{lane.task}</p>
                  <p className="mt-2 leading-5 text-rose-800">
                    Stop: {lane.stop}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div
          className="mt-4 border-t border-rose-200 pt-4"
          data-heu-department-task-handoff-register="P5-02"
        >
          <div className="flex items-start gap-3">
            <UsersRound className="mt-0.5 size-5 shrink-0 text-rose-700" />
            <div>
              <h4 className="font-semibold text-zinc-950">
                Department task handoff register: dry-run only
              </h4>
              <p className="mt-1 leading-6 text-zinc-600">
                DEPT_TASK_REGISTER_READY / NO_GO / BLOCKED. These are
                department lanes and user labels for reports and in-app review;
                no real email, real ticket, account creation, evidence
                acceptance, UAT approval, finance approval or owner GO is
                performed here.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-4">
            {DEPARTMENT_TASK_HANDOFF_REGISTER.map((lane) => (
              <article
                key={lane.code}
                className="border-l-2 border-rose-200 bg-rose-50 px-3 py-3"
              >
                <p className="text-xs font-semibold uppercase text-rose-700">
                  {lane.code}
                </p>
                <p className="mt-1 font-medium text-zinc-950">
                  {lane.department}
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  User: {lane.userLabel}
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-500">
                  Stage: {lane.stage}
                </p>
                <p className="mt-2 leading-5 text-zinc-700">{lane.task}</p>
                <p className="mt-2 leading-5 text-zinc-700">{lane.usage}</p>
                <p className="mt-2 leading-5 text-rose-800">
                  Stop: {lane.stop}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-5 rounded-md border border-rose-200 bg-white p-4"
        data-heu-production-safe-iteration-loop="P5-02"
      >
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 size-5 shrink-0 text-rose-700" />
          <div>
            <h3 className="font-semibold text-zinc-950">
              Safe iteration loop
            </h3>
            <p className="mt-1 leading-6 text-zinc-600">
              Master Control follows the same rhythm as TTGDTX: one blocker,
              one local audit, controlled evidence, then advance only if the
              guard is green.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-4">
          {SAFE_ITERATION_STEPS.map((step) => (
            <article
              key={step.code}
              className="border-l-2 border-rose-200 bg-rose-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-rose-700">
                {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 leading-5 text-zinc-700">{step.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div
        className="mt-5 rounded-md border border-rose-200 bg-white p-4"
        data-heu-production-action-queue="P5-02"
      >
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 size-5 shrink-0 text-rose-700" />
          <div>
            <h3 className="font-semibold text-zinc-950">
              Next controlled actions
            </h3>
            <p className="mt-1 leading-6 text-zinc-600">
              Work through this queue before any owner GO/NO-GO discussion.
              Each item still needs controlled evidence and human sign-off.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          {PRODUCTION_EXECUTION_STEPS.map((step, index) => (
            <article
              key={step.code}
              className="border-l-2 border-rose-200 bg-rose-50 px-3 py-3"
            >
              <p className="text-xs font-semibold uppercase text-rose-700">
                {String(index + 1).padStart(2, "0")} - {step.code}
              </p>
              <p className="mt-1 font-medium text-zinc-950">{step.title}</p>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                Owner: {step.owner}
              </p>
              <p className="mt-2 leading-5 text-zinc-700">{step.proof}</p>
              {step.href ? (
                <Link
                  href={step.href}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase text-rose-700 hover:text-rose-950"
                >
                  Open action source
                  <ClipboardCheck className="size-3" />
                </Link>
              ) : (
                <p className="mt-3 text-xs font-medium uppercase text-rose-700">
                  Signed evidence required
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          No GO button is provided here. PASS_LOCAL does not approve production
          dashboard use, finance actions, production migration, UAT acceptance,
          owner waiver or production GO. Do not paste secrets, passwords,
          temporary passwords, OTPs, password reset links, account
          activation/invite links, service-role keys, bank credentials, raw
          student PII, raw CCCD, raw phone numbers, raw bank account numbers,
          bank statements, vouchers or raw payment data into Git/Codex/chat.
        </p>
      </div>
    </section>
  );
}
