import type { ReactNode } from "react";
import {
  Banknote,
  CalendarClock,
  CircleAlert,
  LockKeyhole,
  ReceiptText,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

export type HouCommissionPolicyRow = {
  id: string;
  policy_code: string;
  policy_name: string;
  station_code: string;
  effective_from: string;
  effective_to: string | null;
  payment_day_of_month: number;
  settlement_cutoff_rule: string;
  tax_withholding_percent: number | null;
  dropout_risk_rule: string | null;
  breakeven_rule: string | null;
  status: string;
};

export type HouCommissionPolicyLineRow = {
  id: string;
  policy_id: string;
  classification: string;
  component_code: string;
  component_name: string;
  receiver_type: string;
  payer_source: string;
  gross_amount_vnd: number;
  tax_withholding_percent: number | null;
  is_taxable: boolean;
  condition_note: string | null;
  sort_order: number;
  status: string;
};

export type HouCommissionEligibilityRuleRow = {
  id: string;
  policy_id: string;
  rule_code: string;
  rule_name: string;
  rule_description: string;
  blocking_level: string;
  sort_order: number;
  status: string;
};

export type HouCommissionCycleRow = {
  id: string;
  cycle_code: string;
  cycle_name: string;
  period_start: string;
  period_end: string;
  payment_due_date: string | null;
  status: string;
};

export type HouTuitionCreditRateRow = {
  id: string;
  rate_code: string;
  rate_name: string;
  tuition_per_credit_vnd: number;
  effective_from: string;
  effective_to: string | null;
  status: string;
};

export type HouRevenueShareVersionRow = {
  id: string;
  share_code: string;
  share_name: string;
  heu_share_percent: number;
  hou_share_percent: number;
  effective_from: string;
  effective_to: string | null;
  source_document: string | null;
  status: string;
};

type HouCommissionSettingsProps = {
  canViewHouCommission: boolean;
  canViewStrategicFinance: boolean;
  policies: HouCommissionPolicyRow[];
  lines: HouCommissionPolicyLineRow[];
  rules: HouCommissionEligibilityRuleRow[];
  cycles: HouCommissionCycleRow[];
  tuitionRates: HouTuitionCreditRateRow[];
  revenueShares: HouRevenueShareVersionRow[];
  loadError?: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN").format(
    new Date(`${value}T00:00:00`),
  );
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Chưa có";
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function Pill({
  tone,
  children,
}: {
  tone: "blue" | "green" | "amber" | "red" | "zinc";
  children: ReactNode;
}) {
  const toneClass = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    zinc: "border-zinc-200 bg-zinc-50 text-zinc-600",
  }[tone];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

function Metric({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

export function HouCommissionSettings({
  canViewHouCommission,
  canViewStrategicFinance,
  policies,
  lines,
  rules,
  cycles,
  tuitionRates,
  revenueShares,
  loadError,
}: HouCommissionSettingsProps) {
  if (!canViewHouCommission) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Cơ chế COM HOU là dữ liệu tài chính nhạy cảm.</p>
            <p className="mt-1">
              Chỉ Admin, Ban giám hiệu, Trưởng phòng tuyển sinh và Kế toán được
              xem phần thanh toán COM. Tỷ lệ hợp tác và điểm hòa vốn chỉ hiển thị
              cho nhóm quản trị được phép.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Chưa đọc được nền dữ liệu COM HOU. Hãy chạy file SQL{" "}
        <span className="font-mono">database/step35d_hou_commission_foundation.sql</span>{" "}
        trong Supabase SQL Editor rồi tải lại trang. Chi tiết: {loadError}
      </section>
    );
  }

  const activePolicies = policies.filter((policy) => policy.status === "ACTIVE");
  const activePolicy = activePolicies[0];
  const activeLines = activePolicy
    ? lines
        .filter((line) => line.policy_id === activePolicy.id && line.status === "ACTIVE")
        .sort((a, b) => a.sort_order - b.sort_order)
    : [];
  const activeRules = activePolicy
    ? rules
        .filter((rule) => rule.policy_id === activePolicy.id && rule.status === "ACTIVE")
        .sort((a, b) => a.sort_order - b.sort_order)
    : [];
  const blockRules = activeRules.filter((rule) => rule.blocking_level === "BLOCK");
  const warnRules = activeRules.filter((rule) => rule.blocking_level === "WARN");
  const activeShare = revenueShares.find((share) => share.status === "ACTIVE");

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <WalletCards className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Cơ chế COM HOU</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Theo dõi chính sách COM theo thời điểm hiệu lực, hồ sơ đủ điều kiện,
              công nợ, chi trả kế toán, chống chi trùng và cảnh báo rủi ro bỏ học.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-zinc-200 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Chính sách"
          value={activePolicies.length}
          description="Phiên bản COM còn hiệu lực"
        />
        <Metric
          label="Dòng COM"
          value={activeLines.length}
          description="COM1/COM2 theo L8A, L8B"
        />
        <Metric
          label="Luật chặn"
          value={blockRules.length}
          description="Không đủ điều kiện thì không chi"
        />
        <Metric
          label="Luật cảnh báo"
          value={warnRules.length}
          description="Rủi ro bỏ học, hòa vốn, rà soát"
        />
      </div>

      <div className="grid gap-5 border-b border-zinc-200 p-5 xl:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Chính sách đang dùng</h3>
          </div>
          {activePolicy ? (
            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p className="font-medium text-zinc-950">{activePolicy.policy_name}</p>
              <p>
                Mã: <span className="font-mono">{activePolicy.policy_code}</span>
              </p>
              <p>
                Hiệu lực: {formatDate(activePolicy.effective_from)} -{" "}
                {formatDate(activePolicy.effective_to)}
              </p>
              <p>Ngày thanh toán dự kiến hằng tháng: ngày {activePolicy.payment_day_of_month}</p>
              <p>{activePolicy.settlement_cutoff_rule}</p>
              <p>
                Khấu trừ thuế mặc định:{" "}
                {activePolicy.tax_withholding_percent ?? "Chưa cấu hình"}%
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Chưa có chính sách COM HOU active.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Kiểm soát kế toán</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm text-zinc-600">
            <p>
              Mỗi học viên, chính sách và thành phần COM chỉ có một claim/payment
              còn hiệu lực để tránh chi COM hai lần.
            </p>
            <p>
              Hỗ trợ nhiều hình thức chi: chuyển khoản, tiền mặt, bù trừ công nợ,
              chuyển nội bộ hoặc hình thức khác có chứng từ.
            </p>
            <p>
              Claim có trường công nợ/bù trừ và batch thanh toán có số chứng từ kế
              toán để đối soát sau này.
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <Banknote className="size-4 text-zinc-500" />
          <h3 className="text-sm font-semibold">Mức COM theo phân loại</h3>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Thành phần</th>
                <th className="px-4 py-3">Người nhận</th>
                <th className="px-4 py-3">Nguồn chi</th>
                <th className="px-4 py-3">Số tiền gross</th>
                <th className="px-4 py-3">Thuế</th>
                <th className="px-4 py-3">Điều kiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {activeLines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3">
                    <Pill tone={line.classification === "L8A" ? "blue" : "green"}>
                      {line.classification}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-950">{line.component_name}</p>
                    <p className="font-mono text-xs text-zinc-500">{line.component_code}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{line.receiver_type}</td>
                  <td className="px-4 py-3 text-zinc-600">{line.payer_source}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-950">
                    {formatCurrency(line.gross_amount_vnd)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {line.is_taxable ? `${line.tax_withholding_percent ?? 0}%` : "Không"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{line.condition_note}</td>
                </tr>
              ))}
              {activeLines.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-zinc-500" colSpan={7}>
                    Chưa có dòng COM active.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-5 border-b border-zinc-200 p-5 xl:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <CircleAlert className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Điều kiện chi COM</h3>
          </div>
          <div className="mt-4 space-y-2">
            {activeRules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-zinc-200 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={rule.blocking_level === "BLOCK" ? "red" : "amber"}>
                    {rule.blocking_level}
                  </Pill>
                  <span className="font-medium text-zinc-950">{rule.rule_name}</span>
                </div>
                <p className="mt-2 text-zinc-600">{rule.rule_description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Học phí tín chỉ và hòa vốn</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg border border-zinc-200 p-4">
              <p className="font-medium text-zinc-950">
                Đơn giá học phí theo tín chỉ
              </p>
              <p className="mt-2 text-zinc-600">
                Đã có {tuitionRates.filter((rate) => rate.status === "ACTIVE").length} mức
                học phí active. Khi HOU ban hành mức mới, tạo dòng mới với ngày
                hiệu lực mới, không sửa đè lịch sử.
              </p>
            </div>

            {canViewStrategicFinance ? (
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="font-medium text-zinc-950">
                  Tỷ lệ hợp tác HEU/HOU nhạy cảm
                </p>
                {activeShare ? (
                  <div className="mt-2 space-y-1 text-zinc-600">
                    <p>
                      HEU {activeShare.heu_share_percent}% / HOU{" "}
                      {activeShare.hou_share_percent}%
                    </p>
                    <p>
                      Hiệu lực: {formatDate(activeShare.effective_from)} -{" "}
                      {formatDate(activeShare.effective_to)}
                    </p>
                    <p>{activeShare.source_document}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-zinc-500">
                    Chưa có tỷ lệ hợp tác active.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                Tỷ lệ hợp tác HEU/HOU và điểm hòa vốn chi tiết đã được ẩn theo
                phân quyền quản trị.
              </div>
            )}

            <div className="rounded-lg border border-zinc-200 p-4">
              <p className="font-medium text-zinc-950">
                Kỳ thanh toán và chứng từ
              </p>
              <p className="mt-2 text-zinc-600">
                Đã có {cycles.length} kỳ thanh toán. Khi chuyển sang phần nhập
                nghiệp vụ, mỗi kỳ sẽ gắn danh sách học viên, chứng từ, duyệt và
                trạng thái thanh toán.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <ReceiptText className="mt-0.5 size-5 shrink-0" />
          <p>
            Bước này mới tạo nền kiểm soát. Chưa tự động sinh phiếu chi COM cho
            đến khi có màn hình nhập claim, đối soát học phí, công nợ và phê duyệt
            kế toán ở các bước sau.
          </p>
        </div>
      </div>
    </section>
  );
}
