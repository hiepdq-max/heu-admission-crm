import {
  AlertTriangle,
  CheckSquare,
  ClipboardList,
  GitBranch,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";

const principles = [
  "Một người có thể kiêm nhiều việc.",
  "Một việc chỉ có một người chịu trách nhiệm chính.",
  "Mọi việc chưa xong vẫn phải có owner tận user/position.",
  "Reviewer hỗ trợ kiểm soát, không thay owner chịu trách nhiệm.",
];

const businessSlots = [
  {
    slot: "BUS-IT-01",
    position: "IT_DATA_HEAD",
    role: "IT_DATA_HEAD",
    responsibility: "Auth/profile, permission, scope, backup/restore",
  },
  {
    slot: "BUS-KHTC-01",
    position: "KE_TOAN_TRUONG",
    role: "ACCOUNTING_LEAD",
    responsibility: "Finance Desk, P2-18 dashboard, payment controls",
  },
  {
    slot: "BUS-CTHSSV-01",
    position: "CTHSSV_HEAD",
    role: "CTHSSV_LEAD",
    responsibility: "Student handover, CTHSSV profile readiness",
  },
  {
    slot: "BUS-DAO-TAO-01",
    position: "DAO_TAO_HEAD",
    role: "DAO_TAO_LEAD",
    responsibility: "Training operation and class/program lanes",
  },
  {
    slot: "BUS-NGAN-HAN-01",
    position: "NGAN_HAN_HEAD",
    role: "NGAN_HAN_LEAD",
    responsibility: "Short Course attendance/payment evidence",
  },
  {
    slot: "BUS-KHOA-01",
    position: "KHOA_HEAD",
    role: "KHOA_LEAD",
    responsibility: "Faculty/teacher/class delivery readiness",
  },
  {
    slot: "BUS-PHAP-CHE-01",
    position: "PHAP_CHE_HEAD",
    role: "PHAP_CHE_LEAD",
    responsibility: "Legal, SOP, invoice/chung-tu controls",
  },
  {
    slot: "BUS-AUDIT-01",
    position: "AUDIT_HEAD",
    role: "AUDIT_HEAD",
    responsibility: "Audit evidence, negative tests, cascade closure",
  },
  {
    slot: "BUS-TUYEN-SINH-01",
    position: "TUYEN_SINH_HEAD",
    role: "ADMISSION_HEAD",
    responsibility: "Lead intake, pipeline and handover source quality",
  },  {
    slot: "BUS-TCHC-01",
    position: "TCHC_HEAD",
    role: "TCHC_LEAD",
    responsibility: "TCHC staff, records, assets and admin support",
  },
];

const openAssignments = [
  {
    code: "P0-17",
    work: "User activation and scope baseline",
    accountable: "BUS-IT-01",
    checker: "BUS-AUDIT-01 + process owner",
  },
  {
    code: "P6-04",
    work: "Role/workspace signed UAT",
    accountable: "BUS-IT-01",
    checker: "BUS-AUDIT-01 + process owner",
  },
  {
    code: "P5-03",
    work: "Finance Desk read-only UAT",
    accountable: "BUS-KHTC-01",
    checker: "BUS-PHT-TC-01 + BUS-AUDIT-01",
  },
  {
    code: "P2-18",
    work: "Accounting dashboard UAT",
    accountable: "BUS-KHTC-01",
    checker: "BUS-PHT-TC-01 + BUS-IT-01",
  },
  {
    code: "P0-03",
    work: "Backup/restore and migration order",
    accountable: "BUS-IT-01",
    checker: "BUS-AUDIT-01 + BUS-KHTC-01 + BUS-PHAP-CHE-01",
  },
  {
    code: "P0-19/P4-02",
    work: "Legal, invoice and chung-tu gate",
    accountable: "BUS-PHAP-CHE-01",
    checker: "BUS-KHTC-01 + BUS-AUDIT-01",
  },
  {
    code: "P6-06",
    work: "Hard-delete/cascade closure",
    accountable: "BUS-AUDIT-01",
    checker: "BUS-IT-01 + affected owner",
  },
  {
    code: "P0-09",
    work: "Final owner GO/NO-GO package",
    accountable: "BUS-HT-01",
    checker: "BGH + IT_DATA + KHTC + PHAP_CHE + Audit",
  },
];

export function BusinessUserResponsibilityPanel() {
  return (
    <section
      className="min-w-0 overflow-hidden rounded-lg border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-950 shadow-sm"
      data-heu-business-user-responsibility="P0-17_BUSINESS_USER_RESPONSIBILITY_REGISTER"
      data-heu-business-user-responsibility-status="BUSINESS_USER_RESPONSIBILITY_READY_NO_GO_BLOCKED"
      data-heu-business-user-responsibility-no-overflow="P0-17_BUSINESS_USER_RESPONSIBILITY_NO_OVERFLOW"
    >
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <UserRoundCog className="h-5 w-5 shrink-0 text-sky-700" />
            <h2 className="break-words text-base font-semibold text-sky-950">
              Business user responsibility register
            </h2>
          </div>
          <p className="mt-2 max-w-4xl break-words text-sky-900">
            Current decision: NO_GO until named users are owner-approved,
            created/linked, scoped and browser-tested. This register makes every
            unfinished lane point to exactly one accountable user slot.
          </p>
        </div>
        <div className="min-w-0 rounded-md border border-sky-300 bg-white px-3 py-2 text-xs font-semibold text-sky-900">
          <span className="break-words">
            BUSINESS_USER_RESPONSIBILITY_READY / NO_GO / BLOCKED
          </span>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {principles.map((principle) => (
          <div
            key={principle}
            className="min-w-0 border-l-2 border-sky-300 bg-white px-3 py-3"
          >
            <div className="flex min-w-0 items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
              <p className="break-words text-zinc-800">{principle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 border border-sky-200 bg-white p-4">
          <div className="flex min-w-0 items-center gap-2 font-semibold text-sky-950">
            <GitBranch className="h-4 w-4 shrink-0 text-sky-700" />
            <span className="break-words">User slots to fill when names exist</span>
          </div>
          <div className="mt-3 grid min-w-0 gap-3 lg:grid-cols-2">
            {businessSlots.map((slot) => (
              <article
                key={slot.slot}
                className="min-w-0 border-l-2 border-sky-300 px-3"
              >
                <p className="break-words text-xs font-semibold uppercase text-sky-700">
                  {slot.slot} - {slot.position}
                </p>
                <p className="mt-1 break-words text-xs text-zinc-500">
                  Role: {slot.role}
                </p>
                <p className="mt-2 break-words text-zinc-700">
                  {slot.responsibility}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="min-w-0 border border-amber-200 bg-white p-4">
          <div className="flex min-w-0 items-center gap-2 font-semibold text-amber-950">
            <ClipboardList className="h-4 w-4 shrink-0 text-amber-700" />
            <span className="break-words">Open work assigned to one owner</span>
          </div>
          <div className="mt-3 grid min-w-0 gap-3">
            {openAssignments.map((item) => (
              <article
                key={item.code}
                className="min-w-0 border-l-2 border-amber-300 px-3"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <p className="break-words text-xs font-semibold uppercase text-amber-700">
                    {item.code}
                  </p>
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                </div>
                <p className="mt-1 break-words font-medium text-zinc-950">
                  {item.work}
                </p>
                <p className="mt-1 break-words text-xs text-zinc-600">
                  Accountable: {item.accountable}
                </p>
                <p className="mt-1 break-words text-xs text-zinc-600">
                  Checker: {item.checker}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 min-w-0 rounded-md border border-sky-200 bg-white p-4">
        <div className="flex min-w-0 items-start gap-2">
          <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
          <p className="break-words text-sky-900">
            When a real name/email is approved, create or link the Auth user in
            the secure channel, assign the HEU position by email, then set role,
            department, manager, lead visibility and business scope. This panel
            does not create users, set passwords, send links, approve UAT,
            approve finance reliance or mark production GO.
          </p>
        </div>
      </div>
    </section>
  );
}
