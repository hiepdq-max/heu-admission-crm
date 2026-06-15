import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PartnersOverview } from "@/components/partners/partners-overview";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type PartnerData = {
  id: string;
  partner_code: string;
  partner_name: string;
  partner_type: string;
  phone: string | null;
  email: string | null;
  area: string | null;
  owner_user_id: string | null;
  commission_note: string | null;
  contract_status: string | null;
  status: string;
};

type LeadData = {
  id: string;
  partner_id: string | null;
  status: string;
};

function percent(count: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${((count / total) * 100).toFixed(1)}%`;
}

export default async function PartnersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: partners, error }, { data: leads }, { data: users }] =
    await Promise.all([
      supabase
        .from("partners")
        .select(
          "id,partner_code,partner_name,partner_type,phone,email,area,owner_user_id,commission_note,contract_status,status",
        )
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .returns<PartnerData[]>(),
      supabase
        .from("leads")
        .select("id,partner_id,status")
        .eq("is_deleted", false)
        .not("partner_id", "is", null)
        .returns<LeadData[]>(),
      supabase.from("users_profile").select("id,full_name"),
    ]);

  const userMap = new Map(
    (users ?? []).map((row) => [String(row.id), String(row.full_name ?? "")]),
  );

  const partnerRows = (partners ?? []).map((partner) => {
    const partnerLeads = (leads ?? []).filter(
      (lead) => lead.partner_id === partner.id,
    );
    const enrolledCount = partnerLeads.filter(
      (lead) => lead.status === "ENROLLED",
    ).length;

    return {
      ...partner,
      owner_name: partner.owner_user_id
        ? userMap.get(partner.owner_user_id) ?? "Không rõ"
        : "Chưa phân công",
      lead_count: partnerLeads.length,
      enrolled_count: enrolledCount,
      conversion: percent(enrolledCount, partnerLeads.length),
    };
  });

  const totalLeads = partnerRows.reduce((sum, row) => sum + row.lead_count, 0);
  const totalEnrolled = partnerRows.reduce(
    (sum, row) => sum + row.enrolled_count,
    0,
  );

  return (
    <AppShell
      active="partners"
      title="Đối tác / CTV / TTGDTX"
      description="Quản lý nguồn đối tác mang lead về và hiệu quả chuyển đổi."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/partners">
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild>
            <Link href="/partners/new">
              <Plus className="size-4" />
              Tạo đối tác
            </Link>
          </Button>
        </>
      }
    >
      {error ? (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Không đọc được dữ liệu đối tác: {error.message}
        </section>
      ) : (
        <PartnersOverview
          partners={partnerRows}
          summary={{
            totalPartners: partnerRows.length,
            activePartners: partnerRows.filter((row) => row.status === "ACTIVE")
              .length,
            totalLeads,
            totalEnrolled,
            conversion: percent(totalEnrolled, totalLeads),
          }}
        />
      )}
    </AppShell>
  );
}
